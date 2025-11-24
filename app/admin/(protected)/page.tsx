import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getLeads, getLeadStats } from '@/app/actions/leads';
import { AdminDashboard } from '@/components/admin-dashboard';

export default async function AdminPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    redirect('/admin/login');
  }

  const [leadsResult, statsResult] = await Promise.all([
    getLeads(),
    getLeadStats(),
  ]);

  const leads = leadsResult.success ? leadsResult.leads : [];
  const stats = statsResult.success ? statsResult.stats : null;

  return <AdminDashboard initialLeads={leads} initialStats={stats} />;
}

