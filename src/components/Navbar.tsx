import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, ShoppingCart, TrendingUp, Package, Menu, X, Package2, Factory, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { state, logout, hasPermission } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const allNavItems = [
    { path: '/', label: 'Tableau de Bord', icon: BarChart3 },
    { path: '/orders', label: 'Commandes', icon: ShoppingCart },
    { path: '/production', label: 'Production', icon: Factory },
    { path: '/performance', label: 'Performance', icon: TrendingUp },
    { path: '/inventory', label: 'Inventaire', icon: Package },
    { path: '/ingredients', label: 'Ingrédients', icon: Package2 },
  ];

  // Filter navigation items based on user permissions
  const getVisibleNavItems = () => {
    if (!state.user) return [];

    const rolePermissions = {
      admin: allNavItems,
      vendeur: [
        { path: '/', label: 'Tableau de Bord', icon: BarChart3 },
        { path: '/orders', label: 'Commandes', icon: ShoppingCart },
      ],
      stock_manager: [
        { path: '/', label: 'Tableau de Bord', icon: BarChart3 },
        { path: '/production', label: 'Production', icon: Factory },
        { path: '/inventory', label: 'Inventaire', icon: Package },
        { path: '/ingredients', label: 'Ingrédients', icon: Package2 },
      ]
    };

    return rolePermissions[state.user.role] || [];
  };

  const navItems = getVisibleNavItems();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <span className="text-xl font-bold text-gray-800">Midadcom</span>
              {state.user && (
                <div className="text-xs text-gray-500">
                  {state.user.name} ({state.user.role})
                </div>
              )}
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{label}</span>
                </Link>
              );
            })}
            
            {/* User Menu */}
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{state.user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Déconnexion</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-gray-800 focus:outline-none focus:text-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-2">
            <div className="flex flex-col space-y-1">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile User Menu */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex items-center space-x-3 px-4 py-3 text-gray-600">
                  <User className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{state.user?.name}</div>
                    <div className="text-sm text-gray-500">{state.user?.role}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;