import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, ArrowUpDown, ShoppingCart } from 'lucide-react'
import { api } from '../lib/api'
import { Button } from '../components/ui/button'
import { LoadingState } from '../components/common/loading-state'
import { useLocation } from '../context/location-context'

type SortOrder = 'default' | 'price-asc' | 'price-desc'

export const HomePage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { location } = useLocation()
  const [page, setPage] = useState(0)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('default')
  const [sortMenuOpen, setSortMenuOpen] = useState(false)

  const keyword = (searchParams.get('q') || '').trim()
  const hasLocationFilter = location.city !== 'All Cities' || Boolean(location.pincode)

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  })

  const productsQuery = useQuery({
    queryKey: ['products', page, categoryId, keyword, location.city, location.pincode],
    queryFn: () =>
      keyword
        ? api.searchProducts({ q: keyword, city: location.city !== 'All Cities' ? location.city : undefined, pincode: location.pincode || undefined, page, size: 12 })
        : categoryId
          ? api.getProductsByCategory(categoryId, { page, size: 12 })
          : hasLocationFilter
            ? api.searchProducts({ city: location.city !== 'All Cities' ? location.city : undefined, pincode: location.pincode || undefined, page, size: 12 })
            : api.getProducts({ page, size: 12 }),
  })

  const filteredProducts = useMemo(() => {
    const list = productsQuery.data?.content ?? []
    const filtered = hasLocationFilter
      ? list.filter((item) => {
          const cityMatches = location.city === 'All Cities' || item.city?.toLowerCase() === location.city.toLowerCase()
          const pincodeMatches = !location.pincode || item.pincode === location.pincode
          return cityMatches && pincodeMatches
        })
      : list
    if (sortOrder === 'price-asc') return [...filtered].sort((a, b) => Number(a.price) - Number(b.price))
    if (sortOrder === 'price-desc') return [...filtered].sort((a, b) => Number(b.price) - Number(a.price))
    return filtered
  }, [productsQuery.data, hasLocationFilter, location, sortOrder])

  const sortLabel = sortOrder === 'price-asc' ? 'Price: Low to High' : sortOrder === 'price-desc' ? 'Price: High to Low' : 'Sort by'

  if (productsQuery.isLoading && page === 0) return <LoadingState label="Loading fresh productsâ€¦" />

  return (
    <section className="space-y-6">
      {/* Hero */}
      <div className="hero-section rounded-3xl p-7 md:p-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="hero-title">Fresh from the Farm,<br />Straight to Your Door ðŸŒ±</h1>
            <p className="hero-subtitle mt-2">
              Discover locally grown fruits, vegetables, and organic produce from trusted farmers near you.
            </p>
            {hasLocationFilter && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-brand-700">
                <MapPin className="h-3.5 w-3.5 text-[var(--fg-accent)]" />
                Showing produce for {location.city}{location.pincode ? ` â€“ ${location.pincode}` : ''}
              </p>
            )}
            <div className="mt-4">
              <a href="#products" className="btn-fg inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white no-underline">
                Explore Products â†“
              </a>
            </div>
          </div>
          <div className="hidden text-[7rem] leading-none md:block">ðŸ¥—</div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="section-title mb-3">Shop by Category</h2>
        <div className="category-chips">
          <button
            type="button"
            className={`category-chip px-4 py-2 text-sm font-semibold ${categoryId === null ? 'btn-fg' : 'btn-fg-outline'}`}
            onClick={() => { setPage(0); setCategoryId(null) }}
          >
            All
          </button>
          {categoriesQuery.data?.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`category-chip flex items-center gap-1.5 px-4 py-2 text-sm font-semibold ${categoryId === item.id ? 'btn-fg' : 'btn-fg-outline'}`}
              onClick={() => { setPage(0); setCategoryId(item.id) }}
            >
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="h-5 w-5 rounded-full object-cover" />
              )}
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products header + sort */}
      <div id="products" className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title mb-0">
          {keyword ? `Results for "${keyword}"` : hasLocationFilter ? `Fresh Picks near ${location.city}` : 'Fresh Picks Near You'}
        </h2>
        <div className="relative">
          <button
            type="button"
            className="btn-fg-outline flex items-center gap-1.5 rounded-full px-4 py-2 text-sm"
            onClick={() => setSortMenuOpen((v) => !v)}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortLabel}
          </button>
          {sortMenuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-border bg-white py-1 shadow-[var(--fg-shadow-hover)]">
              {(['default', 'price-asc', 'price-desc'] as SortOrder[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-brand-100 ${sortOrder === opt ? 'font-semibold text-brand-700' : 'text-foreground'}`}
                  onClick={() => { setSortOrder(opt); setSortMenuOpen(false) }}
                >
                  {opt === 'default' ? 'Default' : opt === 'price-asc' ? 'Price: Low to High' : 'Price: High to Low'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <article
            key={product.id}
            className="product-card cursor-pointer overflow-hidden"
            onClick={() => navigate(`/products/${product.id}`)}
          >
            <div className="relative">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=640'}
                alt={product.title}
                className="card-img-top h-44 w-full object-cover"
                loading="lazy"
              />
              {product.categoryName && (
                <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-brand-700 shadow-sm">
                  {product.categoryName}
                </span>
              )}
            </div>
            <div className="card-body p-3">
              <p className="product-title line-clamp-1 text-base">{product.title}</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="product-price">â‚¹{product.price}</span>
                <span className="text-xs text-muted-foreground">/ {product.unit}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="product-location text-xs">
                  <MapPin className="h-3 w-3" />
                  {product.city || 'India'}
                </span>
                <Button
                  size="sm"
                  className="btn-fg flex items-center gap-1 rounded-full px-3 py-1.5 text-xs h-7"
                  onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`) }}
                >
                  <ShoppingCart className="h-3 w-3" />
                  View
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty state */}
      {filteredProducts.length === 0 && !productsQuery.isLoading && (
        <div className="empty-state">
          <div className="text-5xl">ðŸ§º</div>
          <h5 className="mt-3 text-base font-semibold">No products found</h5>
          <p className="text-sm text-muted-foreground">
            {keyword ? `No results for "${keyword}". Try a different keyword.` : 'Try adjusting your search or location.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3">
        {page > 0 && (
          <Button variant="outline" className="btn-fg-outline" onClick={() => setPage((p) => Math.max(0, p - 1))}>
            â† Previous
          </Button>
        )}
        {!productsQuery.data?.last && filteredProducts.length > 0 && (
          <Button className="btn-fg" onClick={() => setPage((p) => p + 1)} disabled={productsQuery.isLoading}>
            {productsQuery.isLoading ? 'Loadingâ€¦' : 'Load More'}
          </Button>
        )}
        {page > 0 && <span className="text-sm text-muted-foreground">Page {page + 1}</span>}
      </div>
    </section>
  )
}

