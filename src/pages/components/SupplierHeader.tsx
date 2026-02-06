import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/pages/components/ui/button';
import { 
  Home, 
  LayoutDashboard, 
  Package, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import LogoutModal from '@/components/LogoutModal';
import ritzyardLogo from "@/assets/RITZYARD3.svg";

const SupplierHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('supplierToken');
    localStorage.removeItem('supplierUser');
    setShowLogoutModal(false);
    window.location.href = '/supplier/login';
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const navItems = [
    { name: 'Dashboard', path: '/supplier/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/supplier/products', icon: Package },
    { name: 'Profile', path: '/supplier/profile', icon: User },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* <Link to="/supplier/dashboard" className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#B85C38] to-[#8B4513] flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Supplier Portal</span>
            </Link> */}
            <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md group-hover:shadow-lg transition-all overflow-hidden">
              <img src={ritzyardLogo} alt="ritzyard logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold leading-tight notranslate">
                <span className="text-primary">r</span>
                <span className="text-[#452a21]">itz </span>
                <span className="text-[#452a21]">yard</span>
              </span>
              <span className="text-xs md:text-xs font-medium  text-[#452a21]  notranslate">
                Where Value Meets Velocity 
              </span>
            </div>
          </Link>

          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#B85C38] hover:bg-gray-50 transition-colors"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
            
            <Button
              onClick={handleLogoutClick}
              variant="outline"
              className="flex items-center text-sm font-medium text-gray-700 hover:text-[#B85C38] border-gray-300 hover:border-[#B85C38]"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#B85C38] hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#B85C38] hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={() => {
                handleLogoutClick();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#B85C38] hover:bg-gray-50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </header>
  );
};

export default SupplierHeader;