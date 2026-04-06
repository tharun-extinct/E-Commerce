import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../context/auth-context'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

type LoginPageProps = {
  requireAdmin?: boolean
}

export const LoginPage = ({ requireAdmin = false }: LoginPageProps) => {
  const navigate = useNavigate()
  const { user, isAuthenticated, loginWithGithub, loginWithGoogle, isLoading, logout } = useAuth()

  const isNonAdminAuthenticated = requireAdmin && isAuthenticated && user?.role !== 'ADMIN'

  useEffect(() => {
    if (isAuthenticated && (!requireAdmin || user?.role === 'ADMIN')) {
      navigate('/')
    }
  }, [isAuthenticated, requireAdmin, user?.role, navigate])

  return (
    <div className="login-container rounded-2xl">
      <Card className="login-card border-none">
        <CardHeader className="pb-2 text-center">
          <div className="brand-logo">🥬</div>
          <CardTitle className="text-center text-2xl text-brand-700">
            {requireAdmin ? 'Fresh Greens Admin Console' : 'Welcome to Fresh Greens'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {requireAdmin ? 'Sign in with an admin account to manage operations.' : 'Continue with your account to order fresh produce.'}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {isNonAdminAuthenticated ? (
            <>
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                You are signed in, but your account does not have admin access.
              </p>
              <Button className="btn-fg w-full" onClick={() => navigate('/')}>
                Go to dashboard
              </Button>
              <Button variant="outline" className="w-full" onClick={() => void logout()}>
                Sign out and switch account
              </Button>
            </>
          ) : (
            <>
              <Button className="social-btn w-full" onClick={() => void loginWithGoogle()} disabled={isLoading}>
                Continue with Google
              </Button>
              <Button className="social-btn github-btn w-full" variant="outline" onClick={() => void loginWithGithub()} disabled={isLoading}>
                Continue with GitHub
              </Button>
              <p className="text-center text-xs text-muted-foreground">Secure login powered by Firebase Authentication.</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
