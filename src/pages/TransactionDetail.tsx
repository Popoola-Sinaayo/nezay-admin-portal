import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/endpoints'
import { extractError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import {
  Button,
  Card,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusBadge,
  Textarea,
} from '../components/ui'

export function TransactionDetailPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [reason, setReason] = useState('')
  const [showReverse, setShowReverse] = useState(false)

  const canReverse = user?.role === 'finance' || user?.role === 'super_admin' || user?.is_superuser

  const { data: txn, isLoading, error } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => adminApi.getTransaction(id),
    enabled: !!id,
  })

  const reverseMut = useMutation({
    mutationFn: () => adminApi.reverseTransaction(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transaction', id] })
      setShowReverse(false)
      setReason('')
    },
  })

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={(error as Error).message} />
  if (!txn) return null

  return (
    <div>
      <Link to="/transactions" className="text-sm text-indigo-600 hover:underline">
        ← Back to transactions
      </Link>
      <PageHeader title={txn.reference} subtitle={txn.title} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">User</dt><dd>{txn.user_email}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Type</dt><dd className="capitalize">{txn.transaction_type}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Amount</dt><dd>₦{txn.amount}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Fee</dt><dd>₦{txn.fee || '0'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd><StatusBadge status={txn.status} /></dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Provider ref</dt><dd>{txn.provider_reference || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Reversed</dt><dd>{txn.has_reversal ? 'Yes' : 'No'}</dd></div>
          </dl>
          {canReverse && txn.status === 'success' && !txn.has_reversal && (
            <Button
              variant="danger"
              className="mt-4"
              onClick={() => setShowReverse(true)}
            >
              Reverse transaction
            </Button>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Narration</h3>
          <p className="text-sm text-slate-700">{txn.narration || '—'}</p>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-semibold">Request payload</h3>
          <pre className="overflow-auto rounded-lg bg-slate-50 p-3 text-xs">
            {JSON.stringify(txn.request_payload, null, 2)}
          </pre>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-semibold">Response payload</h3>
          <pre className="overflow-auto rounded-lg bg-slate-50 p-3 text-xs">
            {JSON.stringify(txn.response_payload, null, 2)}
          </pre>
        </Card>
      </div>

      {showReverse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <h3 className="mb-4 text-lg font-semibold">Confirm reversal</h3>
            <p className="mb-4 text-sm text-slate-600">
              This sends an intra VFD transfer from the configured pool account back to the user&apos;s wallet, then updates the ledger.
            </p>
            <Textarea
              placeholder="Reason for reversal (required)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            {reverseMut.error && (
              <div className="mt-3"><ErrorState message={extractError(reverseMut.error)} /></div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowReverse(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={reverseMut.isPending || reason.length < 3}
                onClick={() => reverseMut.mutate()}
              >
                {reverseMut.isPending ? 'Reversing...' : 'Confirm reverse'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
