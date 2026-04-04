import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '../context/auth-context'
import { LocationProvider } from '../context/location-context'
import { queryClient } from '../lib/query-client'
import { adminRouter } from '../router/admin-router'

export const AdminApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocationProvider>
          <RouterProvider router={adminRouter} />
        </LocationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
