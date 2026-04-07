import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'

export const NotFoundPage = () => {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="text-8xl">🥬</div>
      <h1 className="mt-4 text-6xl font-extrabold text-brand-700">404</h1>
      <h2 className="mt-2 text-xl font-semibold text-foreground">Page not found</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Looks like this page got harvested already. The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button className="btn-fg" onClick={() => navigate('/')}>🏠 Go Home</Button>
        <Button className="btn-fg-outline" variant="outline" onClick={() => navigate('/')}>Browse Products</Button>
      </div>
    </div>
  )
}


