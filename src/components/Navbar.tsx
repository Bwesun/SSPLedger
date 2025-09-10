import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MenuIcon, LogOutIcon, UserIcon } from 'lucide-react';
interface NavbarProps {
  openSidebar: () => void;
}
const Navbar: React.FC<NavbarProps> = ({
  openSidebar
}) => {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sm:px-6">
      <button type="button" className="inline-flex items-center justify-center p-2 text-gray-500 rounded-md lg:hidden hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500" onClick={openSidebar}>
        <span className="sr-only">Open sidebar</span>
        <MenuIcon className="w-6 h-6" aria-hidden="true" />
      </button>
      <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-start">
        <h1 className="text-xl font-bold text-gray-800">SSP Ledger Book</h1>
      </div>
      <div className="flex items-center">
        <div className="hidden md:block">
          <span className="text-sm font-medium text-gray-700">
            {user?.name || 'User'}
          </span>
        </div>
        <div className="ml-3 relative flex items-center space-x-4">
          {user?.role === 'ssp' && <button onClick={() => navigate('/ssp/profile')} className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <UserIcon className="h-6 w-6" />
            </button>}
          <button onClick={handleLogout} className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <LogOutIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>;
};
export default Navbar;