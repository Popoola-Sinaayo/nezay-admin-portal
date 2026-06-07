import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/endpoints'
import { extractError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import {
  Button,
  Card,
  ErrorState,
  Input,
  LoadingState,
  PageHeader,
  Select,
  StatusBadge,
} from '../components/ui'

export function TeamPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('support')
  const isSuperAdmin = user?.role === 'super_admin' || user?.is_superuser

  const { data, isLoading, error } = useQuery({
    queryKey: ['team'],
    queryFn: adminApi.getTeam,
  })

  const inviteMut = useMutation({
    mutationFn: () => adminApi.inviteTeam(email, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] })
      setEmail('')
    },
  })

  const revokeMut = useMutation({
    mutationFn: (id: string) => adminApi.revokeInvite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] }),
  })

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={(error as Error).message} />

  return (
    <div>
      <PageHeader title="Team" subtitle="Manage admin users and invites" />

      {isSuperAdmin && (
        <Card className="mb-8 max-w-xl">
          <h3 className="mb-4 font-semibold">Invite admin</h3>
          <div className="flex flex-wrap gap-2">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={role} onChange={(e) => setRole(e.target.value)} className="w-40">
              <option value="support">Support</option>
              <option value="finance">Finance</option>
              <option value="super_admin">Super Admin</option>
            </Select>
            <Button
              onClick={() => inviteMut.mutate()}
              disabled={inviteMut.isPending || !email}
            >
              Send invite
            </Button>
          </div>
          {inviteMut.error && <div className="mt-3"><ErrorState message={extractError(inviteMut.error)} /></div>}
          {inviteMut.isSuccess && <p className="mt-2 text-sm text-emerald-600">Invite sent.</p>}
        </Card>
      )}

      <h3 className="mb-3 font-semibold">Team members</h3>
      <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Role</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.members.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3">{m.email}</td>
                <td className="px-4 py-3 capitalize">{m.role.replace('_', ' ')}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={m.is_active ? 'active' : 'failed'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-3 font-semibold">Pending invites</h3>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Role</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Expires</th>
              {isSuperAdmin && <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.pending_invites.map((inv) => (
              <tr key={inv.id}>
                <td className="px-4 py-3">{inv.email}</td>
                <td className="px-4 py-3 capitalize">{inv.role.replace('_', ' ')}</td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(inv.expires_at).toLocaleDateString()}
                </td>
                {isSuperAdmin && (
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      onClick={() => revokeMut.mutate(inv.id)}
                      disabled={revokeMut.isPending}
                    >
                      Revoke
                    </Button>
                  </td>
                )}
              </tr>
            ))}
            {data?.pending_invites.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No pending invites
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
