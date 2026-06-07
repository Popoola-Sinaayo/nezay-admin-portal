import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adminApi } from '../api/endpoints'
import { extractError } from '../api/client'
import {
  Button,
  Card,
  ErrorState,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '../components/ui'

export function NotificationsPage() {
  const [tab, setTab] = useState<'send' | 'broadcast'>('broadcast')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [channels, setChannels] = useState('email,push')
  const [userId, setUserId] = useState('')
  const [userFilter, setUserFilter] = useState('all')

  const sendMut = useMutation({
    mutationFn: () =>
      adminApi.sendNotification({
        user_id: userId,
        title,
        body,
        channels: channels.split(','),
      }),
  })

  const broadcastMut = useMutation({
    mutationFn: () =>
      adminApi.broadcastNotification({
        title,
        body,
        channels: channels.split(','),
        user_filter: userFilter,
      }),
  })

  const activeMut = tab === 'send' ? sendMut : broadcastMut

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Send email and push notifications" />

      <div className="mb-6 flex gap-2">
        {(['broadcast', 'send'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            {t === 'broadcast' ? 'Broadcast to all' : 'Send to user'}
          </button>
        ))}
      </div>

      <Card className="max-w-xl">
        <div className="space-y-4">
          {tab === 'send' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">User ID</label>
              <Input
                placeholder="UUID of target user"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          )}
          {tab === 'broadcast' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Audience</label>
              <Select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                <option value="all">All active users</option>
                <option value="active_wallet">Users with active wallet</option>
              </Select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Body</label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Channels</label>
            <Select value={channels} onChange={(e) => setChannels(e.target.value)}>
              <option value="email,push">Email + Push</option>
              <option value="email">Email only</option>
              <option value="push">Push only</option>
            </Select>
          </div>
          {activeMut.error && <ErrorState message={extractError(activeMut.error)} />}
          {activeMut.isSuccess && (
            <p className="text-sm text-emerald-600">
              {tab === 'broadcast'
                ? `Broadcast sent to ${broadcastMut.data?.total_users ?? 0} users.`
                : 'Notification sent.'}
            </p>
          )}
          <Button
            onClick={() => (tab === 'send' ? sendMut : broadcastMut).mutate()}
            disabled={activeMut.isPending || !title || !body || (tab === 'send' && !userId)}
          >
            {activeMut.isPending ? 'Sending...' : tab === 'broadcast' ? 'Send broadcast' : 'Send'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
