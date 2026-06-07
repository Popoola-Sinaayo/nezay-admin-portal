export interface ApiEnvelope<T> {
  status: 'success' | 'failed'
  message: string
  data: T
}

export interface AdminUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  is_superuser?: boolean
}

export interface AuthTokens {
  access: string
  refresh: string
  user: AdminUser
}

export interface DashboardStats {
  users: { total: number; active: number; registered_verified: number }
  wallets: { active: number; pending_onboarding: number; failed: number }
  transactions: { today: number; success_today: number; failed_today: number }
  onboarding_funnel: {
    registered_verified: number
    wallet_created: number
    active_wallet: number
    consent_pending: number
    failed: number
  }
}

export interface CustomerUser {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  is_active: boolean
  is_email_verified: boolean
  has_pin: boolean
  created_at: string
  wallet: {
    id: string
    account_number: string
    status: string
    balance: string
    tier_level: number
    bvn: string
    nin: string
  } | null
  wallet_count: number
  active_device_count: number
  notes: string
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Transaction {
  id: string
  transaction_type: string
  reference: string
  provider_reference: string
  amount: string
  status: string
  category: string
  title: string
  subtitle: string
  wallet_account_number: string
  created_at: string
  user_id?: string
  user_email?: string
  has_reversal?: boolean
  channel?: string
  fee?: string
  narration?: string
  request_payload?: Record<string, unknown>
  response_payload?: Record<string, unknown>
}

export interface OnboardingData {
  user_id: string
  email: string
  is_email_verified: boolean
  wallets: Array<{
    id: string
    account_type: string
    status: string
    tier_level: number
    bvn: string
    nin: string
    vfd_kyc_data: Record<string, unknown>
    account_number: string
  }>
}

export interface TeamMember {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
  created_at: string
}

export interface PendingInvite {
  id: string
  email: string
  role: string
  expires_at: string
  created_at: string
  is_used: boolean
}
