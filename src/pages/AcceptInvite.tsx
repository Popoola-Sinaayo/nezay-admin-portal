import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { adminApi } from '../api/endpoints'
import { extractError, storeTokens } from '../api/client'
import { Button, Card, ErrorState, Input, PageHeader } from '../components/ui'

export function AcceptInvitePage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) {
      setError('Missing invite token.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.acceptInvite(token, password, firstName, lastName)
      storeTokens(data.access, data.refresh, data.user)
      navigate('/')
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <PageHeader title="Accept invite" subtitle="Set your password to join the admin team" />
        {error && <div className="mb-4"><ErrorState message={error} /></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">First name</label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Last name</label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Accept invite'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
