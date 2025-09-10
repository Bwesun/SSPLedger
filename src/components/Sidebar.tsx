import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HomeIcon, PlusCircleIcon, ListIcon, UsersIcon, FileTextIcon, XIcon } from 'lucide-react';
interface SidebarProps {
  closeSidebar: () => void;
}
const Sidebar: React.FC<SidebarProps> = ({
  closeSidebar
}) => {
  const {
    user
  } = useAuth();
  const isAdmin = user?.role === 'admin';
  return <div className="flex flex-col h-full bg-gray-800">
      <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
        <span className="text-xl font-bold text-white">SSP Ledger</span>
        <button onClick={closeSidebar} className="lg:hidden p-1 text-gray-400 hover:text-white focus:outline-none">
          <XIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-2">
          {isAdmin ? <>
              <NavLink to="/admin" className={({
            isActive
          }) => `flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`} end>
                <HomeIcon className="mr-3 h-5 w-5" />
                Dashboard
              </NavLink>
              <NavLink to="/admin/users" className={({
            isActive
          }) => `flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                <UsersIcon className="mr-3 h-5 w-5" />
                User Management
              </NavLink>
              <NavLink to="/admin/records" className={({
            isActive
          }) => `flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                <FileTextIcon className="mr-3 h-5 w-5" />
                Record Management
              </NavLink>
            </> : <>
              <NavLink to="/ssp" className={({
            isActive
          }) => `flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`} end>
                <HomeIcon className="mr-3 h-5 w-5" />
                Dashboard
              </NavLink>
              <NavLink to="/ssp/add-record" className={({
            isActive
          }) => `flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                <PlusCircleIcon className="mr-3 h-5 w-5" />
                Add Record
              </NavLink>
              <NavLink to="/ssp/records" className={({
            isActive
          }) => `flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                <ListIcon className="mr-3 h-5 w-5" />
                View Records
              </NavLink>
            </>}
        </nav>
      </div>
    </div>;
};
export default Sidebar;