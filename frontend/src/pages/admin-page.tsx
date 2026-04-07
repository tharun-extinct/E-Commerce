import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Users, Package, ShoppingBag, IndianRupee, RefreshCw } from 'lucide-react'
import { api } from '../lib/api'
import { queryClient } from '../lib/query-client'
import type { AdminOrder, AdminUser, Product } from '../types/api'
import { LoadingState } from '../components/common/loading-state'

const PAGE_SIZE = 15

type AdminTab = 'users' | 'products' | 'orders'

const toINR = (value: number) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

const formatDate = (value?: string) => {
  if (!value) return '—'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

type BadgeVariant = 'green' | 'orange' | 'blue' | 'purple' | 'red' | 'gray'

const variantClasses: Record<BadgeVariant, string> = {
  green:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  blue:   'bg-blue-100 text-blue-700 border-blue-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  red:    'bg-red-100 text-red-700 border-red-200',
  gray:   'bg-gray-100 text-gray-600 border-gray-200',
}

const Pill = ({ label, variant = 'gray' }: { label?: string; variant?: BadgeVariant }) => (
  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${variantClasses[variant]}`}>
    {label || '—'}
  </span>
)

const getRoleVariant = (role?: string): BadgeVariant => {
  if (role === 'ADMIN') return 'red'
  if (role === 'SELLER') return 'orange'
  return 'blue'
}

const getProductStatusVariant = (s?: string): BadgeVariant => {
  if (s === 'ACTIVE') return 'green'
  if (s === 'SOLD_OUT') return 'orange'
  if (s === 'REMOVED') return 'red'
  return 'gray'
}

const getPaymentVariant = (s?: string): BadgeVariant => {
  if (s === 'PAID') return 'green'
  if (s === 'PENDING') return 'orange'
  if (s === 'FAILED') return 'red'
  if (s === 'REFUNDED') return 'blue'
  return 'gray'
}

const getOrderStatusVariant = (s?: string): BadgeVariant => {
  if (s === 'DELIVERED') return 'green'
  if (s === 'SHIPPED' || s === 'CONFIRMED' || s === 'PROCESSING') return 'blue'
  if (s === 'PACKED') return 'purple'
  if (s === 'CANCELLED') return 'red'
  return 'gray'
}

// Stat Card
const StatCard = ({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string
  value: React.ReactNode
  sub?: string
  icon: React.ReactNode
  accent: string
}) => (
  <div className={`admin-stat-card border-l-4 ${accent}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="admin-stat-label">{label}</p>
        <p className="admin-stat-value">{value}</p>
        {sub && <p className="admin-stat-sub">{sub}</p>}
      </div>
      <span className="admin-stat-icon">{icon}</span>
    </div>
  </div>
)

// Main component
export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users')
  const [usersPage, setUsersPage] = useState(0)
  const [productsPage, setProductsPage] = useState(0)
  const [ordersPage, setOrdersPage] = useState(0)
  const [lastRefreshed] = useState(() => new Date().toLocaleTimeString())

  const statsQuery = useQuery({ queryKey: ['admin-stats'], queryFn: api.getAdminStats })

  const usersQuery = useQuery({
    queryKey: ['admin-users', usersPage],
    queryFn: () => api.getAdminUsers({ page: usersPage, size: PAGE_SIZE }),
    enabled: activeTab === 'users',
  })
  const productsQuery = useQuery({
    queryKey: ['admin-products', productsPage],
    queryFn: () => api.getAdminProducts({ page: productsPage, size: PAGE_SIZE }),
    enabled: activeTab === 'products',
  })
  const ordersQuery = useQuery({
    queryKey: ['admin-orders', ordersPage],
    queryFn: () => api.getAdminOrders({ page: ordersPage, size: PAGE_SIZE }),
    enabled: activeTab === 'orders',
  })

  const userRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: 'BUYER' | 'ADMIN' }) => api.updateAdminUserRole(id, role),
    onSuccess: () => { toast.success('Role updated'); void queryClient.invalidateQueries({ queryKey: ['admin-users'] }); void queryClient.invalidateQueries({ queryKey: ['admin-stats'] }) },
    onError: () => toast.error('Unable to update role'),
  })

  const userStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => api.updateAdminUserStatus(id, active),
    onSuccess: (_, { active }) => { toast.success(`User ${active ? 'activated' : 'deactivated'}`); void queryClient.invalidateQueries({ queryKey: ['admin-users'] }) },
    onError: () => toast.error('Unable to update status'),
  })

  const productStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'ACTIVE' | 'SOLD_OUT' | 'EXPIRED' | 'REMOVED' }) =>
      api.updateAdminProductStatus(id, status),
    onSuccess: (_, { status }) => { toast.success(`Product set to ${status.replace('_', ' ')}`); void queryClient.invalidateQueries({ queryKey: ['admin-products'] }); void queryClient.invalidateQueries({ queryKey: ['admin-stats'] }) },
    onError: () => toast.error('Unable to update product status'),
  })

  const orderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'CREATED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' }) =>
      api.updateAdminOrderStatus(id, status),
    onSuccess: (_, { status }) => { toast.success(`Order status → ${status}`); void queryClient.invalidateQueries({ queryKey: ['admin-orders'] }) },
    onError: () => toast.error('Unable to update order status'),
  })

  if (statsQuery.isLoading) return <LoadingState label="Loading admin dashboard…" />
  const stats = statsQuery.data

  // Pagination helpers
  const currentPage   = activeTab === 'users' ? usersPage    : activeTab === 'products' ? productsPage    : ordersPage
  const currentQuery  = activeTab === 'users' ? usersQuery   : activeTab === 'products' ? productsQuery   : ordersQuery
  const canPrev = currentPage > 0
  const canNext = Boolean(currentQuery.data && !currentQuery.data.last)
  const totalElements = currentQuery.data?.totalElements ?? 0
  const totalPages    = currentQuery.data?.totalPages ?? 1

  const onPrev = () => {
    if (activeTab === 'users')    setUsersPage((p) => Math.max(0, p - 1))
    if (activeTab === 'products') setProductsPage((p) => Math.max(0, p - 1))
    if (activeTab === 'orders')   setOrdersPage((p) => Math.max(0, p - 1))
  }
  const onNext = () => {
    if (activeTab === 'users')    setUsersPage((p) => p + 1)
    if (activeTab === 'products') setProductsPage((p) => p + 1)
    if (activeTab === 'orders')   setOrdersPage((p) => p + 1)
  }

  // Table renderers
  const renderUsersTable = (users: AdminUser[]) => {
    if (!users.length) return <p className="py-10 text-center text-sm text-muted-foreground">No users found.</p>
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="admin-table-head">
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Verified</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#f8faf9] transition-colors">
                <td className="p-3">
                  <p className="font-semibold">{u.displayName || '—'}</p>
                  <p className="text-xs text-muted-foreground">#{u.id}</p>
                </td>
                <td className="p-3 text-xs">{u.email || '?'}</td>
                <td className="p-3 text-xs">{u.phone || '—'}</td>
                <td className="p-3"><Pill label={u.role} variant={getRoleVariant(u.role)} /></td>
                <td className="p-3">
                  <Pill label={u.active ? 'Active' : 'Inactive'} variant={u.active ? 'green' : 'red'} />
                </td>
                <td className="p-3">
                  <span title={u.phoneVerified ? 'Phone verified' : 'Phone not verified'} className={`mr-1 text-base ${u.phoneVerified ? 'text-emerald-600' : 'text-gray-300'}`}>📱</span>
                  <span title={u.emailVerified ? 'Email verified' : 'Email not verified'} className={`text-base ${u.emailVerified ? 'text-emerald-600' : 'text-gray-300'}`}>✉️</span>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                <td className="p-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <select
                      className="admin-select"
                      value={u.role}
                      title="Update role"
                      aria-label={`Role for ${u.displayName || u.email}`}
                      onChange={(e) => userRoleMutation.mutate({ id: u.id, role: e.target.value as 'BUYER' | 'ADMIN' })}
                      disabled={userRoleMutation.isPending}
                    >
                      <option value="BUYER">Buyer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button
                      type="button"
                      className={`admin-action-btn ${u.active ? 'admin-action-btn-danger' : 'admin-action-btn-success'}`}
                      onClick={() => userStatusMutation.mutate({ id: u.id, active: !u.active })}
                      disabled={userStatusMutation.isPending}
                    >
                      {u.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderProductsTable = (products: Product[]) => {
    if (!products.length) return <p className="py-10 text-center text-sm text-muted-foreground">No products found.</p>
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="admin-table-head">
              <th className="p-3">Product</th>
              <th className="p-3">Seller</th>
              <th className="p-3">Price</th>
              <th className="p-3">Category</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-[#f8faf9] transition-colors">
                <td className="p-3">
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-xs text-muted-foreground">#{p.id} – {p.city || '—'}</p>
                </td>
                <td className="p-3 text-xs">{(p as unknown as { sellerName?: string }).sellerName || '—'}</td>
                <td className="p-3 font-bold text-emerald-700">{toINR(Number(p.price))}</td>
                <td className="p-3 text-xs">{p.categoryName || '—'}</td>
                <td className="p-3">{p.stockQuantity}</td>
                <td className="p-3"><Pill label={p.status?.replace('_', ' ')} variant={getProductStatusVariant(p.status)} /></td>
                <td className="p-3 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
                <td className="p-3">
                  <select
                    className="admin-select w-[130px]"
                    value={p.status || 'ACTIVE'}
                    title="Update status"
                    aria-label={`Status for ${p.title}`}
                    onChange={(e) => productStatusMutation.mutate({ id: p.id, status: e.target.value as 'ACTIVE' | 'SOLD_OUT' | 'EXPIRED' | 'REMOVED' })}
                    disabled={productStatusMutation.isPending}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SOLD_OUT">Sold Out</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="REMOVED">Removed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderOrdersTable = (orders: AdminOrder[]) => {
    if (!orders.length) return <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className="admin-table-head">
              <th className="p-3">Order #</th>
              <th className="p-3">Buyer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">City</th>
              <th className="p-3">Date</th>
              <th className="p-3">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.orderId} className="hover:bg-[#f8faf9] transition-colors">
                <td className="p-3 font-bold">#{o.orderNumber}</td>
                <td className="p-3">
                  <p className="font-semibold">{o.buyerName || '—'}</p>
                  <p className="text-xs text-muted-foreground">{o.buyerEmail || '—'}</p>
                </td>
                <td className="p-3 font-bold text-emerald-700">{toINR(o.grandTotal)}</td>
                <td className="p-3"><Pill label={o.paymentStatus} variant={getPaymentVariant(o.paymentStatus)} /></td>
                <td className="p-3"><Pill label={o.orderStatus} variant={getOrderStatusVariant(o.orderStatus)} /></td>
                <td className="p-3 text-xs">{o.city || '—'}</td>
                <td className="p-3 text-xs text-muted-foreground">{formatDate(o.createdAt)}</td>
                <td className="p-3">
                  <select
                    className="admin-select w-[130px]"
                    value={o.orderStatus}
                    title="Update order status"
                    aria-label={`Status for order ${o.orderNumber}`}
                    onChange={(e) =>
                      orderStatusMutation.mutate({ id: o.orderId, status: e.target.value as 'CREATED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' })
                    }
                    disabled={orderStatusMutation.isPending}
                  >
                    <option value="CREATED">Created</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="PACKED">Packed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Render
  return (
    <div>
      {/* Admin Header Banner */}
      <div className="admin-hero-header">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
                🛠️ Admin Dashboard
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold tracking-wide">ADMIN</span>
              </h1>
              <p className="mt-1 text-sm text-white/80">Manage users, products, and orders across the platform.</p>
            </div>
            <div className="text-right text-xs text-white/60">
              <RefreshCw className="mb-0.5 mr-1 inline h-3 w-3" />
              Last refreshed: {lastRefreshed}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-6 pb-12 md:px-6">

        {/* Stat Cards */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              accent="border-l-emerald-500"
              label="Total Users"
              value={stats.totalUsers.toLocaleString()}
              sub={`${stats.totalSellers?.toLocaleString() ?? '—'} sellers`}
              icon={<Users className="h-6 w-6 text-emerald-500" />}
            />
            <StatCard
              accent="border-l-orange-400"
              label="Products"
              value={stats.totalProducts.toLocaleString()}
              sub={`${stats.activeProducts.toLocaleString()} active`}
              icon={<Package className="h-6 w-6 text-orange-400" />}
            />
            <StatCard
              accent="border-l-blue-500"
              label="Orders"
              value={stats.totalOrders.toLocaleString()}
              sub={`${stats.pendingOrders.toLocaleString()} pending payment`}
              icon={<ShoppingBag className="h-6 w-6 text-blue-500" />}
            />
            <StatCard
              accent="border-l-purple-500"
              label="Revenue"
              value={toINR(Number(stats.totalRevenue || 0))}
              sub="Total paid orders"
              icon={<IndianRupee className="h-6 w-6 text-purple-500" />}
            />
          </div>
        )}

        {/* Tabs + Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-[var(--fg-shadow)]">
          {/* Tab strip */}
          <div className="flex border-b border-border">
            {(['users', 'products', 'orders'] as AdminTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`admin-tab ${activeTab === tab ? 'admin-tab-active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'users' && <Users className="mr-1.5 inline h-4 w-4" />}
                {tab === 'products' && <Package className="mr-1.5 inline h-4 w-4" />}
                {tab === 'orders' && <ShoppingBag className="mr-1.5 inline h-4 w-4" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Table content */}
          <div className="p-0">
            {activeTab === 'users' && (
              usersQuery.isLoading
                ? <div className="py-12 text-center"><LoadingState label="Loading users…" /></div>
                : renderUsersTable(usersQuery.data?.content || [])
            )}
            {activeTab === 'products' && (
              productsQuery.isLoading
                ? <div className="py-12 text-center"><LoadingState label="Loading products…" /></div>
                : renderProductsTable(productsQuery.data?.content || [])
            )}
            {activeTab === 'orders' && (
              ordersQuery.isLoading
                ? <div className="py-12 text-center"><LoadingState label="Loading orders…" /></div>
                : renderOrdersTable(ordersQuery.data?.content || [])
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <button
              type="button"
              className="admin-action-btn admin-action-btn-default disabled:opacity-40"
              onClick={onPrev}
              disabled={!canPrev}
            >
              ← Previous
            </button>
            <p className="text-xs text-muted-foreground">
              Page {currentPage + 1} of {totalPages} — {totalElements.toLocaleString()} total
            </p>
            <button
              type="button"
              className="admin-action-btn admin-action-btn-default disabled:opacity-40"
              onClick={onNext}
              disabled={!canNext}
            >
              Next →
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
