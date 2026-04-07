import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ShoppingBag, Settings, CheckCircle2, XCircle, User } from 'lucide-react'
import { api } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { LoadingState } from '../components/common/loading-state'

const RoleBadge = ({ role }: { role?: string }) => {
  const label = (role || 'BUYER').replace('ROLE_', '')
  const isAdmin = label === 'ADMIN'
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${isAdmin ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
      {label}
    </span>
  )
}

const VerifiedIcon = ({ verified, label }: { verified?: boolean; label: string }) => (
  <div className="flex items-center gap-1.5 text-sm">
    {verified
      ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      : <XCircle className="h-4 w-4 text-rose-400" />}
    <span className={verified ? 'text-emerald-700' : 'text-muted-foreground'}>{label}</span>
  </div>
)

const QuickLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link
    to={to}
    className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-brand-100 hover:text-brand-700"
  >
    <span className="flex items-center gap-2">{icon}{label}</span>
    <span className="text-muted-foreground">›</span>
  </Link>
)

export const ProfilePage = () => {
  const userQuery = useQuery({ queryKey: ['me'], queryFn: api.getCurrentUser })
  const user = userQuery.data

  if (userQuery.isLoading) return <LoadingState label="Loading profile…" />

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <h1 className="section-title">My Profile</h1>

      {/* Profile card */}
      <Card className="border-none shadow-[var(--fg-shadow)]">
        <CardContent className="flex flex-col items-center gap-4 py-7 text-center">
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.displayName || 'User'}
              className="h-24 w-24 rounded-full border-4 border-[var(--fg-green-pale)] object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[var(--fg-green-pale)] bg-brand-100 text-4xl font-bold text-brand-700">
              {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-foreground">{user?.displayName || '—'}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{user?.email || '—'}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <RoleBadge role={user?.role} />
              {user?.city && (
                <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  📍 {user.city}{user.pincode ? ` – ${user.pincode}` : ''}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification status */}
      <Card className="border-none shadow-[var(--fg-shadow)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Verification Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <VerifiedIcon verified={user?.emailVerified} label="Email verified" />
          <VerifiedIcon verified={user?.phoneVerified} label="Phone verified" />
        </CardContent>
      </Card>

      {/* Quick links */}
      <Card className="border-none shadow-[var(--fg-shadow)]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" /> Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <QuickLink to="/orders" icon={<ShoppingBag className="h-4 w-4" />} label="My Orders" />
          <QuickLink to="/settings" icon={<Settings className="h-4 w-4" />} label="Account Settings" />
        </CardContent>
      </Card>
    </div>
  )
}

