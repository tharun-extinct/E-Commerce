import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import { AppShell } from '../components/layout/app-shell'
import { useAuth } from '../context/auth-context'
import { AdminPage } from '../pages/admin-page'
import { LoginPage } from '../pages/login-page'
import { NotFoundPage } from '../pages/not-found-page'

const RequireAuth = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div className="py-16 text-center text-sm text-muted-foreground">Checking session...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

const RequireAdmin = ({ children }: { children: ReactElement }) => {
  const { user } = useAuth()
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }
  return children
}

export const adminRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <RequireAuth><RequireAdmin><AdminPage /></RequireAdmin></RequireAuth> },
      { path: 'login', element: <LoginPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
