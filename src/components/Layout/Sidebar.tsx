import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  CheckSquare, 
  BarChart3, 
  Settings,
  Building2,
  ClipboardList,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const adminNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Building2, label: 'Departments', path: '/admin/departments' },
    { icon: FolderOpen, label: 'Projects', path: '/admin/projects' },
    { icon: CheckSquare, label: 'Tasks', path: '/admin/tasks' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const employeeNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/employee' },
    { icon: ClipboardList, label: 'My Tasks', path: '/employee/tasks' },
    { icon: Clock, label: 'Time Logs', path: '/employee/logs' },
    { icon: Settings, label: 'Settings', path: '/employee/settings' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : employeeNavItems;

  return (
    <div className="bg-white border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500 rounded-lg">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
            <p className="text-sm text-gray-500">Manage & Track</p>
          </div>
        </div>
      </div>

      <nav className="px-6 pb-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;