import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/endpoints'
import { extractError } from '../api/client'
import {
  Button,
  Card,
  ErrorState,
  Input,
  LoadingState,
  PageHeader,
  Select,
  StatusBadge,
  Textarea,
} from '../components/ui'

export function UserDetailPage() {
  const { id = '' } = useParams()
  const qc = useQueryClient()
  const [tab, setTab] = useState<'profile' | 'onboarding'>('profile')
  const [msgTitle, setMsgTitle] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [msgChannels, setMsgChannels] = useState(['email', 'push'])
  const [notes, setNotes] = useState('')

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
  })

  const { data: onboarding } = useQuery({
    queryKey: ['onboarding', id],
    queryFn: () => adminApi.getOnboarding(id),
    enabled: !!id && tab === 'onboarding',
  })

  const updateMut = useMutation({
    mutationFn: (body: { is_active?: boolean; notes?: string }) => adminApi.updateUser(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user', id] }),
  })

  const messageMut = useMutation({
    mutationFn: () =>
      adminApi.messageUser(id, { title: msgTitle, body: msgBody, channels: msgChannels }),
  })

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={(error as Error).message} />
  if (!user) return null

  return (
    <div>
      <Link to="/users" className="text-sm text-indigo-600 hover:underline">
        ← Back to users
      </Link>
      <PageHeader title={user.email} subtitle={`${user.first_name} ${user.last_name}`} />

      <div className="mb-6 flex gap-2">
        {(['profile', 'onboarding'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 font-semibold">Profile</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Phone</dt><dd>{user.phone || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Verified</dt><dd>{user.is_email_verified ? 'Yes' : 'No'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">PIN set</dt><dd>{user.has_pin ? 'Yes' : 'No'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Devices</dt><dd>{user.active_device_count}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd><StatusBadge status={user.is_active ? 'active' : 'failed'} /></dd></div>
            </dl>
            <div className="mt-4 flex gap-2">
              <Button
                variant={user.is_active ? 'danger' : 'primary'}
                onClick={() => updateMut.mutate({ is_active: !user.is_active })}
                disabled={updateMut.isPending}
              >
                {user.is_active ? 'Suspend user' : 'Activate user'}
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 font-semibold">Wallet</h3>
            {user.wallet ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Account</dt><dd>{user.wallet.account_number}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Balance</dt><dd>₦{user.wallet.balance}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Tier</dt><dd>{user.wallet.tier_level}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd><StatusBadge status={user.wallet.status} /></dd></div>
              </dl>
            ) : (
              <p className="text-sm text-slate-500">No wallet yet</p>
            )}
          </Card>

          <Card className="lg:col-span-2">
            <h3 className="mb-4 font-semibold">Admin notes</h3>
            <Textarea
              rows={3}
              defaultValue={user.notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes..."
            />
            <Button
              className="mt-2"
              onClick={() => updateMut.mutate({ notes: notes || user.notes })}
              disabled={updateMut.isPending}
            >
              Save notes
            </Button>
          </Card>

          <Card className="lg:col-span-2">
            <h3 className="mb-4 font-semibold">Send message</h3>
            <div className="space-y-3">
              <Input placeholder="Title" value={msgTitle} onChange={(e) => setMsgTitle(e.target.value)} />
              <Textarea placeholder="Message body" value={msgBody} onChange={(e) => setMsgBody(e.target.value)} rows={3} />
              <Select
                value={msgChannels.join(',')}
                onChange={(e) => setMsgChannels(e.target.value.split(','))}
              >
                <option value="email,push">Email + Push</option>
                <option value="email">Email only</option>
                <option value="push">Push only</option>
              </Select>
              {messageMut.error && <ErrorState message={extractError(messageMut.error)} />}
              {messageMut.isSuccess && (
                <p className="text-sm text-emerald-600">Message sent.</p>
              )}
              <Button
                onClick={() => messageMut.mutate()}
                disabled={messageMut.isPending || !msgTitle || !msgBody}
              >
                Send
              </Button>
            </div>
          </Card>
        </div>
      )}

      {tab === 'onboarding' && onboarding && (
        <div className="space-y-4">
          {onboarding.wallets.map((w) => (
            <Card key={w.id}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{w.account_type} wallet</h3>
                <StatusBadge status={w.status} />
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div><span className="text-slate-500">Account:</span> {w.account_number || '—'}</div>
                <div><span className="text-slate-500">Tier:</span> {w.tier_level}</div>
                <div><span className="text-slate-500">BVN:</span> {w.bvn || '—'}</div>
                <div><span className="text-slate-500">NIN:</span> {w.nin || '—'}</div>
              </dl>
              {Object.keys(w.vfd_kyc_data || {}).length > 0 && (
                <pre className="mt-4 overflow-auto rounded-lg bg-slate-50 p-3 text-xs">
                  {JSON.stringify(w.vfd_kyc_data, null, 2)}
                </pre>
              )}
            </Card>
          ))}
          {onboarding.wallets.length === 0 && (
            <p className="text-sm text-slate-500">No onboarding data yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
