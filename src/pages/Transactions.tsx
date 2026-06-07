import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/endpoints'
import { ErrorState, Input, LoadingState, PageHeader, StatusBadge } from '../components/ui'

export function TransactionsPage() {
  const [reference, setReference] = useState('')
  const [email, setEmail] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})

  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => adminApi.listTransactions(filters),
  })

  return (
    <div>
      <PageHeader title="Transactions" subtitle="View and manage all transactions" />
      <form
        className="mb-6 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const f: Record<string, string> = {}
          if (reference) f.reference = reference
          if (email) f.email = email
          setFilters(f)
        }}
      >
        <Input
          placeholder="Reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="max-w-xs"
        />
        <Input
          placeholder="User email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="max-w-xs"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Filter
        </button>
      </form>
      {isLoading && <LoadingState />}
      {error && <ErrorState message={(error as Error).message} />}
      {data && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Reference</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">User</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.results.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/transactions/${txn.id}`}
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      {txn.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{txn.user_email}</td>
                  <td className="px-4 py-3 capitalize">{txn.transaction_type}</td>
                  <td className="px-4 py-3">₦{txn.amount}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={txn.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(txn.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
            {data.count} transactions
          </p>
        </div>
      )}
    </div>
  )
}
