import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { Store, User, PaginationMeta } from '../types';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import {
  Store as StoreIcon,
  Plus,
  Search,
  MapPin,
  Mail,
  ArrowUpDown,
  RotateCcw,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

export const AdminStoresPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Search & Filter State
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  // Add Store Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [availableOwners, setAvailableOwners] = useState<User[]>([]);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreEmail, setNewStoreEmail] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStoreOwnerId, setNewStoreOwnerId] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStores = useCallback(
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
        if (searchAddress.trim()) queryParams.append('address', searchAddress.trim());

        const response: any = await apiClient.get(`/stores?${queryParams.toString()}`);
        if (response.success) {
          setStores(response.data);
          if (response.meta) {
            setPagination(response.meta);
          }
        }
      } catch (error) {
        console.error('Failed to load stores:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [searchName, searchAddress, sortField, sortOrder]
  );

  useEffect(() => {
    fetchStores(1);
  }, [fetchStores]);

  // Load Store Owners when opening Add Store modal
  const handleOpenAddModal = async () => {
    setIsAddModalOpen(true);
    setFieldErrors({});
    setGeneralError(null);
    try {
      const response: any = await apiClient.get('/users?role=STORE_OWNER&limit=100');
      if (response.success && response.data) {
        setAvailableOwners(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch store owners:', err);
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewStoreName('');
    setNewStoreEmail('');
    setNewStoreAddress('');
    setNewStoreOwnerId('');
    setFieldErrors({});
    setGeneralError(null);
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      const response: any = await apiClient.post('/stores', {
        name: newStoreName.trim(),
        email: newStoreEmail.trim() ? newStoreEmail.trim() : null,
        address: newStoreAddress.trim(),
        ownerId: newStoreOwnerId || null,
      });

      if (response.success) {
        handleCloseAddModal();
        fetchStores(1);
      }
    } catch (err: any) {
      if (err.fields) {
        setFieldErrors(err.fields);
      } else {
        setGeneralError(err.message || 'Failed to create store.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchName('');
    setSearchAddress('');
    setSortField('createdAt');
    setSortOrder('desc');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <StoreIcon className="w-8 h-8 text-brand-600" /> Store Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, search, and manage registered store profiles across the platform.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Store
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search by store name..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <div className="md:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Search by address..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm appearance-none"
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Store Name</option>
                <option value="address">Address</option>
                <option value="rating">Rating</option>
              </select>
              <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Switch to ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              className="p-2 border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          <div className="md:col-span-1 flex items-center">
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="w-full py-2 px-3 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-bold">Store Name</th>
                <th className="px-6 py-3.5 font-bold">Contact Email</th>
                <th className="px-6 py-3.5 font-bold">Address</th>
                <th className="px-6 py-3.5 font-bold">Assigned Owner</th>
                <th className="px-6 py-3.5 font-bold">Overall Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading stores...</span>
                    </div>
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No stores match your search criteria.
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {store.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {store.email ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {store.email}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {store.address}
                    </td>
                    <td className="px-6 py-4">
                      {store.owner ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100">
                          <UserIcon className="w-3 h-3 text-blue-600" /> {store.owner.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StarRating
                        rating={store.averageRating}
                        totalRatings={store.ratingCount}
                        size="sm"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Page <span className="font-semibold text-slate-700">{pagination.page}</span> of{' '}
              <span className="font-semibold text-slate-700">{pagination.totalPages}</span> ({pagination.total} stores)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchStores(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchStores(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Store Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Add New Store"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateStore} className="space-y-4">
          {generalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
              {generalError}
            </div>
          )}

          {/* Store Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Store Name <span className="text-rose-500">*</span>
              </label>
              <span className={`text-xs ${newStoreName.length < 20 || newStoreName.length > 60 ? 'text-amber-600 font-medium' : 'text-emerald-600'}`}>
                {newStoreName.length}/60 (min 20)
              </span>
            </div>
            <input
              type="text"
              required
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              placeholder="e.g. Downtown Organic Grocery Mart"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
            {fieldErrors.name && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Store Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Store Contact Email (Optional)
            </label>
            <input
              type="email"
              value={newStoreEmail}
              onChange={(e) => setNewStoreEmail(e.target.value)}
              placeholder="store@example.com"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
            {fieldErrors.email && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Store Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Address <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{newStoreAddress.length}/400</span>
            </div>
            <textarea
              rows={2}
              required
              maxLength={400}
              value={newStoreAddress}
              onChange={(e) => setNewStoreAddress(e.target.value)}
              placeholder="e.g. 101 Fresh Valley Plaza, Downtown Commercial Zone"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
            {fieldErrors.address && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.address}</p>
            )}
          </div>

          {/* Assign Store Owner */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assign Store Owner (Optional)
            </label>
            <select
              value={newStoreOwnerId}
              onChange={(e) => setNewStoreOwnerId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="">-- Leave Unassigned --</option>
              {availableOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
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
              disabled={isSubmitting || newStoreName.length < 20 || !newStoreAddress.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStoresPage;
