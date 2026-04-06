import { useEffect, useState } from 'react'
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { toast } from 'sonner'
import { ShieldCheck, Loader2, AlertTriangle } from 'lucide-react'
import { getFirebaseAuth } from '@shared/lib/firebase'
import { http } from '@shared/lib/http'
import type { ApiResponse, User } from '@shared/types/api'

const googleProvider = new GoogleAuthProvider()
const githubProvider = new GithubAuthProvider()

type LoginState = 'idle' | 'google' | 'github' | 'redirect-pending'

type Props = {
  onSuccess: () => void
}

export const AdminLogin = ({ onSuccess }: Props) => {
  const [state, setState] = useState<LoginState>('idle')
  const [error, setError] = useState<string | null>(null)

  // Resume Firebase redirect flow if the user was sent through signInWithRedirect
  useEffect(() => {
    let cancelled = false

    const resumeRedirect = async () => {
      setState('redirect-pending')
      try {
        const auth = getFirebaseAuth()
        const result = await getRedirectResult(auth)
        if (cancelled) return

        if (result?.user) {
          const idToken = await result.user.getIdToken(true)
          await exchangeTokenAndVerify(idToken)
        }
      } catch {
        // No pending redirect — normal startup, ignore.
      } finally {
        if (!cancelled) setState('idle')
      }
    }

    resumeRedirect()
    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const exchangeTokenAndVerify = async (idToken: string) => {
    const response = await http.post<ApiResponse<User>>('/api/auth/login', { idToken })
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Login failed')
    }

    const user = response.data.data
    if (user.role !== 'ADMIN') {
      // Clean up — sign out both Firebase and backend session
      try {
        await signOut(getFirebaseAuth())
        await http.post('/api/auth/logout')
      } catch {
        // Best-effort cleanup
      }
      throw new Error('Your account does not have admin privileges. Contact the platform administrator.')
    }

    toast.success(`Welcome back, ${user.displayName || user.email}!`)
    onSuccess()
  }

  const handleSignIn = async (provider: 'google' | 'github') => {
    setError(null)
    setState(provider)

    try {
      const auth = getFirebaseAuth()
      const firebaseProvider = provider === 'google' ? googleProvider : githubProvider

      let idToken: string
      try {
        const credential = await signInWithPopup(auth, firebaseProvider)
        idToken = await credential.user.getIdToken(true)
      } catch (popupError: unknown) {
        const code =
          typeof popupError === 'object' && popupError !== null && 'code' in popupError
            ? String((popupError as { code: unknown }).code)
            : ''

        if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
          // Fall back to redirect — page will reload and useEffect resumes the flow
          await signInWithRedirect(auth, firebaseProvider)
          return
        }

        throw popupError
      }

      await exchangeTokenAndVerify(idToken)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(message)
    } finally {
      setState((prev) => (prev === provider ? 'idle' : prev))
    }
  }

  const isBusy = state !== 'idle'

  return (
    <main className="admin-login-page">
      <div className="admin-login-box">
        {/* Header */}
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="admin-login-title">Fresh Greens</h1>
          <p className="admin-login-subtitle">Admin Console</p>
        </div>

        {/* Body */}
        <div className="admin-login-body">
          {state === 'redirect-pending' ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
              <p className="text-sm text-muted-foreground">Completing sign-in…</p>
            </div>
          ) : (
            <>
              <p className="admin-login-hint">
                Sign in with an admin account to manage operations.
              </p>

              {error && (
                <div className="admin-login-error">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google */}
              <button
                className="admin-social-btn"
                disabled={isBusy}
                onClick={() => void handleSignIn('google')}
              >
                {state === 'google' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </button>

              {/* GitHub */}
              <button
                className="admin-social-btn admin-social-btn--github"
                disabled={isBusy}
                onClick={() => void handleSignIn('github')}
              >
                {state === 'github' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <GithubIcon />
                )}
                Continue with GitHub
              </button>

              <p className="admin-login-footer">
                Only accounts with admin privileges can access this console.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

/* ── Inline brand icons ──────────────────────────────────────────────────── */

const GoogleIcon = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

const GithubIcon = () => (
  <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)
