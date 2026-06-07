import { api, unwrap } from './client'
import type {
  AuthTokens,
  BroadcastNotificationResult,
  CustomerUser,
  DashboardStats,
  OnboardingData,
  Paginated,
  PendingInvite,
  TeamMember,
  Transaction,
} from '../types'

export const adminApi = {
  login: (email: string, password: string) =>
    unwrap<AuthTokens>(api.post('/admin/auth/login/', { email, password })),

  acceptInvite: (token: string, password: string, first_name?: string, last_name?: string) =>
    unwrap<AuthTokens>(
      api.post('/admin/auth/accept-invite/', { token, password, first_name, last_name }),
    ),

  me: () => unwrap(api.get('/admin/auth/me/')),

  dashboardStats: () => unwrap<DashboardStats>(api.get('/admin/dashboard/stats/')),

  listUsers: (params?: Record<string, string>) =>
    unwrap<Paginated<CustomerUser>>(api.get('/admin/users/', { params })),

  getUser: (id: string) => unwrap<CustomerUser>(api.get(`/admin/users/${id}/`)),

  updateUser: (id: string, body: { is_active?: boolean; notes?: string }) =>
    unwrap<CustomerUser>(api.patch(`/admin/users/${id}/`, body)),

  messageUser: (id: string, body: { title: string; body: string; channels: string[] }) =>
    unwrap(api.post(`/admin/users/${id}/message/`, body)),

  getOnboarding: (id: string) => unwrap<OnboardingData>(api.get(`/admin/users/${id}/onboarding/`)),

  listTransactions: (params?: Record<string, string>) =>
    unwrap<Paginated<Transaction>>(api.get('/admin/transactions/', { params })),

  getTransaction: (id: string) => unwrap<Transaction>(api.get(`/admin/transactions/${id}/`)),

  reverseTransaction: (id: string, reason: string) =>
    unwrap(api.post(`/admin/transactions/${id}/reverse/`, { reason })),

  sendNotification: (body: { user_id: string; title: string; body: string; channels: string[] }) =>
    unwrap(api.post('/admin/notifications/send/', body)),

  broadcastNotification: (body: {
    title: string
    body: string
    channels: string[]
    user_filter?: string
  }) => unwrap<BroadcastNotificationResult>(api.post('/admin/notifications/broadcast/', body)),

  getTeam: () =>
    unwrap<{ members: TeamMember[]; pending_invites: PendingInvite[] }>(api.get('/admin/team/')),

  inviteTeam: (email: string, role: string) =>
    unwrap(api.post('/admin/team/invite/', { email, role })),

  revokeInvite: (inviteId: string) => unwrap(api.delete(`/admin/team/invites/${inviteId}/`)),

  updateTeamMember: (userId: string, body: { role?: string; is_active?: boolean }) =>
    unwrap(api.patch(`/admin/team/${userId}/`, body)),
}
