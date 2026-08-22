import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold tracking-tight text-gray-900">
          E-Commerce
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
          <Link to="/" className="hover:text-accent transition-colors">
            Products
          </Link>
          {user && (
            <Link to="/orders" className="hover:text-accent transition-colors">
              Orders
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="hover:text-accent transition-colors">
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <Link to="/cart" className="relative text-gray-700 hover:text-accent transition-colors">
                <ShoppingCart size={20} />
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
                    {count}
                  </span>
                )}
              </Link>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <User size={16} />
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-accent transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-200 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-gray-700">
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Products
            </Link>
            {user && (
              <Link to="/cart" onClick={() => setMenuOpen(false)}>
                Cart ({count})
              </Link>
            )}
            {user && (
              <Link to="/orders" onClick={() => setMenuOpen(false)}>
                Orders
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            )}
            {user ? (
              <button onClick={handleLogout} className="text-left">
                Log out
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
