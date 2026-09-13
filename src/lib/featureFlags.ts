import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export type ModuleAccessLevel = 'ALL' | 'ADMIN_ONLY' | 'MAINTENANCE';

export interface ModuleConfig {
  id: string;
  name: string;
  path: string;
  iconName: string;
  access: ModuleAccessLevel;
  isSidebarVisible: boolean;
  requiredPlan?: string[];
  maintenanceMessage?: string;
  description: string;
  category: 'core' | 'intelligence' | 'admin';
}

export const DEFAULT_MODULE_CONFIGS: ModuleConfig[] = [
  {
    id: 'finder',
    name: 'Finder',
    path: '/agent',
    iconName: 'Search',
    access: 'ALL',
    isSidebarVisible: true,
    description: 'AI Sourcing Copilot & technical materials matchmaking engine',
    category: 'intelligence'
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    path: '/dashboard/marketplace',
    iconName: 'Store',
    access: 'ALL',
    isSidebarVisible: true,
    description: 'Industrial RFQ, bids, listings and buyer-supplier trade board',
    category: 'core'
  },
  {
    id: 'products',
    name: 'Products Master',
    path: '/products',
    iconName: 'Database',
    access: 'ADMIN_ONLY', // Internal platform master database - locked to Admins by default
    isSidebarVisible: true,
    description: 'Master 160+ industrial product catalog database (Internal Platform DB)',
    category: 'admin'
  },
  {
    id: 'business_plan',
    name: 'Business Plan (5-Year Plan)',
    path: '/dashboard/business-plan',
    iconName: 'TrendingUp',
    access: 'ALL',
    isSidebarVisible: true,
    requiredPlan: ['ENTERPRISE'],
    maintenanceMessage: 'The 5-Year Strategic Business Plan generator is currently undergoing scheduled updates. Please check back shortly.',
    description: '5-Year strategic roadmap & comprehensive market valuation model',
    category: 'intelligence'
  },
  {
    id: 'equity_funding',
    name: 'Equity & IPO',
    path: '/dashboard/equity-funding',
    iconName: 'Landmark',
    access: 'ALL',
    isSidebarVisible: true,
    requiredPlan: ['ENTERPRISE'],
    description: 'Investor readiness, cap table modeling & IPO capital advisor',
    category: 'intelligence'
  },
  {
    id: 'settings',
    name: 'Settings',
    path: '/dashboard/settings',
    iconName: 'Settings',
    access: 'ALL',
    isSidebarVisible: true,
    description: 'Workspace configuration, team profiles, billing & subscriptions',
    category: 'core'
  },
  {
    id: 'admin_console',
    name: 'Admin Console',
    path: '/admin',
    iconName: 'ShieldCheck',
    access: 'ADMIN_ONLY',
    isSidebarVisible: true,
    description: 'Platform governance, moderation, KYC queues & feature toggles',
    category: 'admin'
  },
  {
    id: 'customer_care',
    name: 'Customer Care',
    path: '/admin/support',
    iconName: 'Headset',
    access: 'ADMIN_ONLY',
    isSidebarVisible: true,
    description: 'Live customer support ticketing & enterprise inquiries',
    category: 'admin'
  }
];

// In-memory cache with fallback file store
let inMemoryConfigs: ModuleConfig[] = [...DEFAULT_MODULE_CONFIGS];
const LOCAL_STORE_PATH = path.join(process.cwd(), '.system_module_flags.json');

// Initialize from file store if present
try {
  if (fs.existsSync(LOCAL_STORE_PATH)) {
    const raw = fs.readFileSync(LOCAL_STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      inMemoryConfigs = DEFAULT_MODULE_CONFIGS.map(def => {
        const found = parsed.find((p: any) => p.id === def.id);
        return found ? { ...def, ...found } : def;
      });
    }
  }
} catch (err) {
  console.warn('[FeatureFlags] Local cache read notice:', err);
}

/**
 * Retrieve current active configurations for all modules
 */
export async function getModuleConfigurations(): Promise<ModuleConfig[]> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'module_feature_flags' }
    });

    if (setting && Array.isArray(setting.value)) {
      const stored = setting.value as unknown as ModuleConfig[];
      const merged = DEFAULT_MODULE_CONFIGS.map(def => {
        const found = stored.find(s => s.id === def.id);
        return found ? { ...def, ...found } : def;
      });
      inMemoryConfigs = merged;
      return merged;
    }
  } catch (err) {
    // Database might not have table yet or unreachable; use memory/file fallback
  }

  return inMemoryConfigs;
}

/**
 * Update configuration for a specific module or all modules
 */
export async function updateModuleConfiguration(
  moduleId: string, 
  updates: Partial<ModuleConfig>
): Promise<ModuleConfig[]> {
  const current = await getModuleConfigurations();
  const updated = current.map(m => {
    if (m.id === moduleId) {
      return { ...m, ...updates };
    }
    return m;
  });

  inMemoryConfigs = updated;

  // Persist to local JSON fallback file
  try {
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(updated, null, 2), 'utf8');
  } catch (fileErr) {
    console.warn('[FeatureFlags] Local file save notice:', fileErr);
  }

  // Persist to DB if available
  try {
    await prisma.systemSetting.upsert({
      where: { key: 'module_feature_flags' },
      update: { value: updated as any },
      create: {
        key: 'module_feature_flags',
        value: updated as any
      }
    });
  } catch (dbErr) {
    console.warn('[FeatureFlags] Database save notice:', dbErr);
  }

  return updated;
}

/**
 * Batch update multiple modules at once
 */
export async function batchUpdateModuleConfigurations(
  newConfigs: ModuleConfig[]
): Promise<ModuleConfig[]> {
  inMemoryConfigs = newConfigs;

  try {
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(newConfigs, null, 2), 'utf8');
  } catch {}

  try {
    await prisma.systemSetting.upsert({
      where: { key: 'module_feature_flags' },
      update: { value: newConfigs as any },
      create: {
        key: 'module_feature_flags',
        value: newConfigs as any
      }
    });
  } catch {}

  return newConfigs;
}

/**
 * Check if a given user role has access to a specific route path
 */
export function checkRouteAccess(
  pathname: string, 
  userRole: string = 'USER',
  configs: ModuleConfig[] = inMemoryConfigs
): { allowed: boolean; isMaintenance: boolean; module?: ModuleConfig; reason?: string } {
  const isAdmin = userRole === 'ADMIN';

  // Find corresponding module config
  const module = configs.find(m => {
    if (pathname === m.path) return true;
    if (m.path !== '/' && pathname.startsWith(m.path)) return true;
    return false;
  });

  // If no matching module (e.g., /dashboard hub or unknown page), allow by default
  if (!module) {
    return { allowed: true, isMaintenance: false };
  }

  // Admins always have access to test and debug
  if (isAdmin) {
    return { allowed: true, isMaintenance: false, module };
  }

  // Check access level for regular users
  if (module.access === 'ADMIN_ONLY') {
    return { 
      allowed: false, 
      isMaintenance: false, 
      module, 
      reason: `Access to ${module.name} is restricted to system administrators.` 
    };
  }

  if (module.access === 'MAINTENANCE') {
    return { 
      allowed: false, 
      isMaintenance: true, 
      module, 
      reason: module.maintenanceMessage || `${module.name} is temporarily under maintenance.` 
    };
  }

  return { allowed: true, isMaintenance: false, module };
}
