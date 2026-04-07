import { Link } from 'react-router-dom'

export const AppFooter = () => {
  return (
    <footer className="footer-fg mt-14">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-3">
        {/* Brand */}
        <div>
          <p className="mb-2 text-base font-extrabold text-white">🥬 Fresh Greens</p>
          <p className="text-sm leading-relaxed text-white/70">
            Farm-fresh produce delivered quickly with secure payments and trusted quality.
          </p>
          <div className="mt-3 text-xs text-white/50">
            <p>📧 support@freshgreens.com</p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-white/80">Quick Links</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="text-white/70 transition-colors hover:text-white">
                🏠 Home
              </Link>
            </li>
            <li>
              <Link to="/orders" className="text-white/70 transition-colors hover:text-white">
                📦 My Orders
              </Link>
            </li>
            <li>
              <Link to="/cart" className="text-white/70 transition-colors hover:text-white">
                🛒 Cart
              </Link>
            </li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-white/80">Account</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/profile" className="text-white/70 transition-colors hover:text-white">
                👤 Profile
              </Link>
            </li>
            <li>
              <Link to="/settings" className="text-white/70 transition-colors hover:text-white">
                ⚙️ Settings
              </Link>
            </li>
            <li>
              <Link to="/checkout" className="text-white/70 transition-colors hover:text-white">
                🔒 Secure Checkout
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15 py-3 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Fresh Greens. All rights reserved.
      </div>
    </footer>
  )
}

