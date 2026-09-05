import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import apiClient from '../api/client';
import {
  Store,
  Users,
  LayoutDashboard,
  KeyRound,
  LogOut,
  Shield,
  Briefcase,
  User as UserIcon,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Password Update Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsUpdatingPassword(true);

    try {
      await apiClient.patch('/auth/password', {
        currentPassword,
        newPassword,
      });

      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess(null);
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Briefcase className="w-3 h-3" /> Store Owner
          </span>
        );
      case 'NORMAL_USER':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <UserIcon className="w-3 h-3" /> Normal User
          </span>
        );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-lg font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    StoreRating
                  </span>
                  <span className="text-xs block text-slate-400 font-medium -mt-1">
                    Platform
                  </span>
                </div>
              </Link>

              {/* Navigation Links based on Role */}
              {user && (
                <nav className="hidden md:flex items-center gap-1">
                  {user.role === 'ADMIN' && (
                    <>
                      <Link
                        to="/admin"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          location.pathname === '/admin'
                            ? 'bg-brand-50 text-brand-700 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link
                        to="/admin/stores"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          location.pathname === '/admin/stores'
                            ? 'bg-brand-50 text-brand-700 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <Store className="w-4 h-4" /> Stores
                      </Link>
                      <Link
                        to="/admin/users"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          location.pathname === '/admin/users'
                            ? 'bg-brand-50 text-brand-700 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <Users className="w-4 h-4" /> Users
                      </Link>
                    </>
                  )}

                  {user.role === 'STORE_OWNER' && (
                    <Link
                      to="/owner"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === '/owner'
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" /> My Stores & Ratings
                    </Link>
                  )}

                  {user.role === 'NORMAL_USER' && (
                    <Link
                      to="/stores"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === '/stores'
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Store className="w-4 h-4" /> Browse & Rate Stores
                    </Link>
                  )}
                </nav>
              )}
            </div>

            {/* User Profile & Actions */}
            {user && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {user.name}
                    </span>
                    {getRoleBadge()}
                  </div>
                  <span className="text-xs text-slate-400">{user.email}</span>
                </div>

                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    title="Change Password"
                    className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Update Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Account Password"
        maxWidth="md"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>{passwordError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">
              Must be 8-16 characters with at least 1 uppercase letter and 1 special symbol.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {isUpdatingPassword ? 'Updating...' : 'Save Password'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Navbar;
