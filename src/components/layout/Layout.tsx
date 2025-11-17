import { Link, useNavigate } from 'react-router-dom';
import { removeToken, getUser } from '../../utils/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, LayoutDashboard, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    // Konfirmasi sebelum logout
    const confirmLogout = window.confirm('Apakah Anda yakin ingin logout?');
    
    if (confirmLogout) {
      // Hapus token dan data user dari localStorage
      removeToken();
      
      // Redirect ke login page
      navigate('/login', { replace: true });
    }
  };

  // Get initials from user name
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo & Navigation */}
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2 group">
                <Package className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition" />
                <span className="text-xl font-bold text-gray-900">
                  Product Manager
                </span>
              </Link>
              
              <div className="hidden md:flex space-x-1">
                <Link to="/dashboard">
                  <Button variant="ghost" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/products">
                  <Button variant="ghost" className="gap-2">
                    <Package className="h-4 w-4" />
                    Products
                  </Button>
                </Link>
              </div>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user.image} alt={user.username} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              )}
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleLogout}
                className="gap-2 bg-orange-500"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">LOGOUT</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;