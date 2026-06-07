import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Bell,
  UserCog,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/team', label: 'Team', icon: UserCog },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-lg font-bold text-indigo-600">Nezay Admin</p>
          <p className="text-xs text-slate-500">Management Portal</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <p className="truncate text-sm font-medium text-slate-900">{user?.email}</p>
          <p className="text-xs capitalize text-slate-500">{user?.role?.replace('_', ' ')}</p>
          <Button
            variant="ghost"
            className="mt-3 w-full justify-start gap-2 px-2"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            <LogOut size={16} />
            Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <LoadingFallback />
  if (!user) {
    window.location.href = '/login'
    return null
  }
  return <>{children}</>
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center text-slate-500">Loading...</div>
  )
}
