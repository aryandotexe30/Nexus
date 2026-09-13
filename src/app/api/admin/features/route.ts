import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { 
  getModuleConfigurations, 
  updateModuleConfiguration, 
  batchUpdateModuleConfigurations,
  DEFAULT_MODULE_CONFIGS,
  ModuleConfig,
  ModuleAccessLevel 
} from '@/lib/featureFlags';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const configs = await getModuleConfigurations();

    return NextResponse.json({
      success: true,
      modules: configs
    });
  } catch (error: any) {
    console.error('[API admin/features] GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { action, moduleId, access, maintenanceMessage, isSidebarVisible, batchConfigs } = body;

    // Reset to system defaults action
    if (action === 'RESET_DEFAULTS') {
      const reset = await batchUpdateModuleConfigurations(DEFAULT_MODULE_CONFIGS);
      return NextResponse.json({
        success: true,
        message: 'Module configurations reset to system defaults',
        modules: reset
      });
    }

    // Batch update action
    if (action === 'BATCH_UPDATE' && Array.isArray(batchConfigs)) {
      const updated = await batchUpdateModuleConfigurations(batchConfigs);
      return NextResponse.json({
        success: true,
        message: 'Module configurations updated successfully',
        modules: updated
      });
    }

    // Single module update
    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
    }

    const updates: Partial<ModuleConfig> = {};
    if (access && ['ALL', 'ADMIN_ONLY', 'MAINTENANCE'].includes(access)) {
      updates.access = access as ModuleAccessLevel;
    }
    if (maintenanceMessage !== undefined) {
      updates.maintenanceMessage = maintenanceMessage;
    }
    if (isSidebarVisible !== undefined) {
      updates.isSidebarVisible = Boolean(isSidebarVisible);
    }

    const updatedList = await updateModuleConfiguration(moduleId, updates);

    return NextResponse.json({
      success: true,
      message: `Updated module "${moduleId}"`,
      modules: updatedList
    });
  } catch (error: any) {
    console.error('[API admin/features] POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
