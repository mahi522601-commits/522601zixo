import { useState, useEffect } from "react";
import { Search, User, ShoppingCart, Menu, X, ChevronDown, LogOut, Settings, ClipboardList } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router";
import { useProducts } from "@/context/ProductsContext";
import MyOrdersModal from "@/components/MyOrdersModal";

export default function Header() {
  const { toggleCart, totalItems } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { categories, products } = useProducts();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);

  const activeCategories = categories.filter((cat) =>
    products.some((p) => p.category.toLowerCase() === cat.name.toLowerCase())
  );

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    {
      label: "Buy Cookies",
      href: "#",
      children: [
        "All Cookies",
        ...activeCategories.map((cat) => cat.name),
      ],
    },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-[#0D0D0D] border-b border-[#C9960C]/30 transition-shadow duration-300 ${
          scrolled ? "shadow-md shadow-[#C9960C]/10" : ""
        }`}
      >
        <div className="container-main">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <a href="#" className="flex-shrink-0 flex items-center gap-3">
              <img
                src="/images/logo.jpeg"
                alt="Zixo Cookies"
                className="h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14 border border-[#C9960C]/50"
              />
              <span className="font-bold text-lg sm:text-2xl tracking-wider text-[#F0C040]">
                ZIXOCOOKIES
              </span>
            </a>

            {/* Search - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-4 pr-10 py-2 bg-[#1E1600] border border-[#C9960C]/30 rounded-full text-sm text-[#FFF8E7] placeholder-[#FFF8E7]/50 focus:outline-none focus:border-[#F0C040]"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9960C]" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {isAdmin && (
                <button 
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-1.5 text-sm font-bold text-[#F0C040] hover:text-[#C9960C] transition-colors"
                  aria-label="Admin Panel"
                >
                  <Settings className="w-5 h-5" />
                  <span className="hidden lg:inline">Admin Panel</span>
                </button>
              )}
              
              {user && (
                <button 
                  onClick={() => setOrdersModalOpen(true)}
                  className="flex items-center gap-1.5 text-sm text-[#FFF8E7] hover:text-[#F0C040] transition-colors"
                  aria-label="My Orders"
                >
                  <ClipboardList className="w-5 h-5" />
                  <span className="hidden lg:inline">My Orders</span>
                </button>
              )}
              
              {user && !user.isAnonymous ? (
                <button 
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm text-[#FFF8E7] hover:text-[#F0C040] transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              ) : (
                <button 
                  onClick={() => navigate("/auth")}
                  className="flex items-center gap-1.5 text-sm text-[#FFF8E7] hover:text-[#F0C040] transition-colors"
                  aria-label="Sign In"
                >
                  <User className="w-5 h-5 text-[#C9960C]" />
                  <span className="hidden lg:inline">Sign In</span>
                </button>
              )}
              <button
                onClick={toggleCart}
                className="flex items-center gap-1.5 text-sm text-[#FFF8E7] hover:text-[#F0C040] transition-colors relative min-w-[44px] min-h-[44px] justify-center"
                aria-label="View Cart"
              >
                <ShoppingCart className="w-5 h-5 text-[#C9960C]" />
                <span className="hidden lg:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-[#F0C040] text-[#0D0D0D] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-[#1E1600] text-[#FFF8E7] rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Toggle Mobile Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#F0C040]" /> : <Menu className="w-5 h-5 text-[#F0C040]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:block border-t border-[#C9960C]/30">
          <div className="container-main">
            <div className="flex items-center h-12 gap-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <a
                    href={item.href}
                    className="flex items-center gap-0.5 px-3 py-2 text-sm font-medium text-[#FFF8E7] hover:text-[#F0C040] transition-colors"
                  >
                    {item.label}
                    {item.children && <ChevronDown className="w-3.5 h-3.5 text-[#C9960C]" />}
                  </a>
                  {item.children && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 bg-[#1E1600] shadow-lg rounded-lg py-2 min-w-[200px] z-50 border border-[#C9960C]/30">
                      {item.children.map((child) => (
                        <a
                          key={child}
                          href={child === "All Cookies" ? "/#" : `/#${child.toLowerCase().replace(/\s+/g, '-')}`}
                          className="block px-4 py-2 text-sm text-[#FFF8E7] hover:bg-[#2A1E00] hover:text-[#F0C040] transition-colors"
                        >
                          {child}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-4 pr-10 py-2 bg-[#1E1600] border border-[#C9960C]/30 rounded-full text-sm text-[#FFF8E7] focus:outline-none focus:border-[#F0C040]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9960C]" />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[140px] bg-[#0D0D0D] z-30 md:hidden overflow-y-auto border-t border-[#C9960C]/30 pb-20">
          <div className="p-4 space-y-4">
            {/* Quick Actions in Mobile Menu */}
            <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-[#C9960C]/20">
              {isAdmin && (
                <button 
                  onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-4 bg-[#1E1600] rounded-xl border border-[#C9960C]/30 gap-2"
                >
                  <Settings className="w-6 h-6 text-[#F0C040]" />
                  <span className="text-xs font-bold text-[#FFF8E7]">Admin</span>
                </button>
              )}
              {user && (
                <button 
                  onClick={() => { setOrdersModalOpen(true); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-4 bg-[#1E1600] rounded-xl border border-[#C9960C]/30 gap-2"
                >
                  <ClipboardList className="w-6 h-6 text-[#F0C040]" />
                  <span className="text-xs font-bold text-[#FFF8E7]">Orders</span>
                </button>
              )}
              {user && !user.isAnonymous ? (
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-4 bg-[#1E1600] rounded-xl border border-[#C9960C]/30 gap-2"
                >
                  <LogOut className="w-6 h-6 text-[#F0C040]" />
                  <span className="text-xs font-bold text-[#FFF8E7]">Logout</span>
                </button>
              ) : (
                <button 
                  onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-4 bg-[#1E1600] rounded-xl border border-[#C9960C]/30 gap-2"
                >
                  <User className="w-6 h-6 text-[#F0C040]" />
                  <span className="text-xs font-bold text-[#FFF8E7]">Sign In</span>
                </button>
              )}
              <button 
                onClick={() => { toggleCart(); setMobileMenuOpen(false); }}
                className="flex flex-col items-center justify-center p-4 bg-[#1E1600] rounded-xl border border-[#C9960C]/30 gap-2"
              >
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 text-[#F0C040]" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#F0C040] text-[#0D0D0D] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-[#FFF8E7]">Cart</span>
              </button>
            </div>

            {navItems.map((item) => (
              <div key={item.label}>
                <a
                  href={item.href}
                  onClick={() => !item.children && setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3 text-sm font-bold text-[#F0C040] border-b border-[#C9960C]/20"
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-4 h-4 text-[#C9960C]" />}
                </a>
                {item.children && (
                  <div className="pl-4 py-2 grid grid-cols-1 gap-1">
                    {item.children.map((child) => (
                      <a
                        key={child}
                        href={child === "All Cookies" ? "/#" : `/#${child.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-3 text-sm text-[#FFF8E7]/80 hover:text-[#F0C040] border-b border-[#C9960C]/10 last:border-0"
                      >
                        {child}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <MyOrdersModal isOpen={ordersModalOpen} onClose={() => setOrdersModalOpen(false)} />
    </>
  );
}
