import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { User, Role, PaginationMeta } from '../types';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import {
  Users as UsersIcon,
  Plus,
  Search,
  Mail,
  MapPin,
  Lock,
  User as UserIcon,
  Shield,
  Briefcase,
  ArrowUpDown,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Store,
  Check,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Search & Filter State
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newRole, setNewRole] = useState<Role>('NORMAL_USER');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User Detail Modal State (inspect store ratings if Store Owner)
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Password checklist helpers
  const hasMinLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasSpecial;

  const fetchUsers = useCallback(
    async (pageToLoad = 1) => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: pageToLoad.toString(),
          limit: '10',
          sort: sortField,
          order: sortOrder,
        });

        if (searchName.trim()) queryParams.append('name', searchName.trim());
        if (searchEmail.trim()) queryParams.append('email', searchEmail.trim());
        if (searchAddress.trim()) queryParams.append('address', searchAddress.trim());
        if (filterRole) queryParams.append('role', filterRole);

        const response: any = await apiClient.get(`/users?${queryParams.toString()}`);
        if (response.success) {
          setUsers(response.data);
          if (response.meta) {
            setPagination(response.meta);
          }
        }
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [searchName, searchEmail, searchAddress, filterRole, sortField, sortOrder]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    setFieldErrors({});
    setGeneralError(null);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewAddress('');
    setNewRole('NORMAL_USER');
    setFieldErrors({});
    setGeneralError(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      const response: any = await apiClient.post('/users', {
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        address: newAddress.trim() ? newAddress.trim() : null,
        role: newRole,
      });

      if (response.success) {
        handleCloseAddModal();
        fetchUsers(1);
      }
    } catch (err: any) {
      if (err.fields) {
        setFieldErrors(err.fields);
      } else {
        setGeneralError(err.message || 'Failed to create user.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewUserDetail = async (userId: string) => {
    setIsLoadingDetail(true);
    try {
      const response: any = await apiClient.get(`/users/${userId}`);
      if (response.success && response.data) {
        setSelectedUserDetail(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleResetFilters = () => {
    setSearchName('');
    setSearchEmail('');
    setSearchAddress('');
    setFilterRole('');
    setSortField('createdAt');
    setSortOrder('desc');
  };

  const renderRoleBadge = (role: Role) => {
    switch (role) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <UsersIcon className="w-8 h-8 text-purple-600" /> User Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, search, filter by role, and view detailed user profiles and ratings.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md shadow-purple-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3">
          {/* Name */}
          <div className="md:col-span-3 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* Email */}
          <div className="md:col-span-3 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Search by email..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Address..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* Role Filter */}
          <div className="md:col-span-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="NORMAL_USER">Normal User</option>
            </select>
          </div>

          {/* Sort & Order */}
          <div className="md:col-span-2 flex items-center gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Switch to ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              className="p-2 border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-bold">User Name</th>
                <th className="px-6 py-3.5 font-bold">Email</th>
                <th className="px-6 py-3.5 font-bold">Address</th>
                <th className="px-6 py-3.5 font-bold">Role</th>
                <th className="px-6 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No users match your search criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {u.address || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="px-6 py-4">
                      {renderRoleBadge(u.role)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewUserDetail(u.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Page <span className="font-semibold text-slate-700">{pagination.page}</span> of{' '}
              <span className="font-semibold text-slate-700">{pagination.totalPages}</span> ({pagination.total} users)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Add New User Account"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {generalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
              {generalError}
            </div>
          )}

          {/* Full Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <span className={`text-xs ${newName.length < 20 || newName.length > 60 ? 'text-amber-600 font-medium' : 'text-emerald-600'}`}>
                {newName.length}/60 (min 20)
              </span>
            </div>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Eleanor Vance Montgomery"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            {fieldErrors.name && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            {fieldErrors.email && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
              <div className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Check className="w-3.5 h-3.5" /> 8-16 Chars
              </div>
              <div className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Check className="w-3.5 h-3.5" /> 1 Uppercase
              </div>
              <div className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Check className="w-3.5 h-3.5" /> 1 Special
              </div>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Account Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="NORMAL_USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Address (Optional)
              </label>
              <span className="text-xs text-slate-400">{newAddress.length}/400</span>
            </div>
            <textarea
              rows={2}
              maxLength={400}
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="e.g. 78 Kingfisher Way, West End, Metropolis"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            {fieldErrors.address && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.address}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseAddModal}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || newName.length < 20 || !isPasswordValid}
              className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* User Detail Modal */}
      <Modal
        isOpen={!!selectedUserDetail}
        onClose={() => setSelectedUserDetail(null)}
        title="User Profile Details"
        maxWidth="lg"
      >
        {selectedUserDetail && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <h4 className="text-lg font-bold text-slate-900">{selectedUserDetail.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{selectedUserDetail.email}</p>
              </div>
              {renderRoleBadge(selectedUserDetail.role)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block uppercase">Address</span>
                <span className="text-slate-700 font-medium mt-1 block">
                  {selectedUserDetail.address || 'No address provided'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block uppercase">Member Since</span>
                <span className="text-slate-700 font-medium mt-1 block">
                  {new Date(selectedUserDetail.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* If User is a Store Owner, display their managed store and ratings */}
            {selectedUserDetail.role === 'STORE_OWNER' && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Store className="w-4 h-4 text-brand-600" /> Owned Stores & Ratings
                </h5>

                {selectedUserDetail.storeOwnerDetails?.stores &&
                selectedUserDetail.storeOwnerDetails.stores.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUserDetail.storeOwnerDetails.stores.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 text-sm block">
                            {s.name}
                          </span>
                          <span className="text-xs text-slate-400 block">{s.address}</span>
                        </div>
                        <div>
                          <StarRating rating={s.averageRating} totalRatings={s.ratingCount} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                    This Store Owner has no assigned stores yet.
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
