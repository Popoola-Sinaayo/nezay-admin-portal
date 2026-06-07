import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/endpoints'
import { ErrorState, LoadingState, PageHeader, StatCard } from '../components/ui'

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: adminApi.dashboardStats,
  })

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={(error as Error).message} />
  if (!data) return null

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of users, wallets, and transactions" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={data.users.total} sub={`${data.users.active} active`} />
        <StatCard label="Active wallets" value={data.wallets.active} sub={`${data.wallets.pending_onboarding} pending`} />
        <StatCard label="Transactions today" value={data.transactions.today} sub={`${data.transactions.success_today} success`} />
        <StatCard label="Failed today" value={data.transactions.failed_today} />
      </div>
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Onboarding funnel</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Verified" value={data.onboarding_funnel.registered_verified} />
          <StatCard label="Wallet created" value={data.onboarding_funnel.wallet_created} />
          <StatCard label="Active wallet" value={data.onboarding_funnel.active_wallet} />
          <StatCard label="Consent pending" value={data.onboarding_funnel.consent_pending} />
          <StatCard label="Failed" value={data.onboarding_funnel.failed} />
        </div>
      </div>
    </div>
  )
}
