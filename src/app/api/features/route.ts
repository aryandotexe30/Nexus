import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getModuleConfigurations } from '@/lib/featureFlags';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role || 'USER';
    const configs = await getModuleConfigurations();

    // Map module list with client flags
    const modules = configs.map(m => {
      const isAdminOnly = m.access === 'ADMIN_ONLY';
      const isMaintenance = m.access === 'MAINTENANCE';
      const isVisible = userRole === 'ADMIN' ? m.isSidebarVisible : (m.isSidebarVisible && !isAdminOnly && !isMaintenance);

      return {
        id: m.id,
        name: m.name,
        path: m.path,
        iconName: m.iconName,
        access: m.access,
        isSidebarVisible: isVisible,
        requiredPlan: m.requiredPlan,
        maintenanceMessage: m.maintenanceMessage,
        category: m.category,
        description: m.description,
        isLockedForUser: userRole !== 'ADMIN' && (isAdminOnly || isMaintenance)
      };
    });

    return NextResponse.json({
      success: true,
      userRole,
      modules
    });
  } catch (error: any) {
    console.error('[API features] Error fetching feature flags:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
