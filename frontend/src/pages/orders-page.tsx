import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, MapPin } from 'lucide-react'
import { api } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { LoadingState } from '../components/common/loading-state'

type BadgeVariant = 'green' | 'orange' | 'blue' | 'red' | 'gray' | 'purple'

const orderStatusVariants: Record<string, BadgeVariant> = {
  DELIVERED: 'green', CONFIRMED: 'blue', PROCESSING: 'blue',
  SHIPPED: 'blue', PACKED: 'purple', CANCELLED: 'red',
  CREATED: 'gray',
}

const paymentStatusVariants: Record<string, BadgeVariant> = {
  PAID: 'green', PENDING: 'orange', FAILED: 'red', REFUNDED: 'blue',
}

const variantClasses: Record<BadgeVariant, string> = {
  green:  'bg-emerald-100 text-emerald-700',
  orange: 'bg-orange-100 text-orange-700',
  blue:   'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  red:    'bg-red-100 text-red-700',
  gray:   'bg-gray-100 text-gray-600',
}

const StatusBadge = ({ label, type }: { label?: string; type: 'order' | 'payment' }) => {
  if (!label) return null
  const map = type === 'order' ? orderStatusVariants : paymentStatusVariants
  const variant = map[label] ?? 'gray'
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${variantClasses[variant]}`}>
      {label.replace('_', ' ')}
    </span>
  )
}

const formatDate = (value?: string) => {
  if (!value) return 'â€”'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const OrdersPage = () => {
  const navigate = useNavigate()
  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getOrders({ page: 0, size: 20, sort: 'createdAt,desc' }),
  })

  if (ordersQuery.isLoading) return <LoadingState label="Loading your ordersâ€¦" />

  const orders = ordersQuery.data?.content ?? []

  if (orders.length === 0) {
    return (
      <div className="empty-state rounded-2xl border border-dashed border-border py-16">
        <div className="text-6xl">ðŸ›ï¸</div>
        <h5 className="mt-4 text-lg font-semibold">No orders yet</h5>
        <p className="mt-1 text-sm text-muted-foreground">Start shopping to see your orders here!</p>
        <Button className="btn-fg mt-5" onClick={() => navigate('/')}>
          Browse Products
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="section-title flex items-center gap-2">
        <ShoppingBag className="h-5 w-5" /> My Orders
      </h1>

      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden border-none shadow-[var(--fg-shadow)] transition hover:shadow-[var(--fg-shadow-hover)]">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold">#{order.orderNumber}</CardTitle>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {order.city}{order.pincode ? ` â€“ ${order.pincode}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-brand-700">â‚¹{order.totalAmount ?? (order as unknown as { grandTotal?: number }).grandTotal}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label={order.status} type="order" />
                <StatusBadge label={order.paymentStatus} type="payment" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

