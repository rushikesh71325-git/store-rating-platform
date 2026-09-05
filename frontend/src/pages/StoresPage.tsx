import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { Store, PaginationMeta } from '../types';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import {
  Search,
  MapPin,
  Star,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

export const StoresPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });

  // Search, Filter & Sort State
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [sortField, setSortField] = useState('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  // Rating Modal State
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedRatingValue, setSelectedRatingValue] = useState<number>(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  const fetchStores = useCallback(
    async (pageToLoad = 1) => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: pageToLoad.toString(),
          limit: '9',
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

  const handleOpenRatingModal = (store: Store) => {
    setSelectedStore(store);
    setSelectedRatingValue(store.userRating || 5);
    setRatingError(null);
  };

  const handleCloseRatingModal = () => {
    setSelectedStore(null);
    setRatingError(null);
  };

  const handleSubmitRating = async () => {
    if (!selectedStore) return;
    setIsSubmittingRating(true);
    setRatingError(null);

    try {
      const response: any = await apiClient.post(`/stores/${selectedStore.id}/ratings`, {
        value: selectedRatingValue,
      });

      if (response.success) {
        // Update store item in local state immediately
        const { averageRating, ratingCount } = response.data.storeStats;
        setStores((prevStores) =>
          prevStores.map((s) =>
            s.id === selectedStore.id
              ? {
                  ...s,
                  averageRating,
                  ratingCount,
                  userRating: selectedRatingValue,
                }
              : s
          )
        );
        handleCloseRatingModal();
      }
    } catch (err: any) {
      setRatingError(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleResetFilters = () => {
    setSearchName('');
    setSearchAddress('');
    setSortField('rating');
    setSortOrder('desc');
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl shadow-brand-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-3 text-white">
            <Sparkles className="w-3.5 h-3.5" /> Consumer Rating Hub
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Discover & Rate Stores
          </h1>
          <p className="mt-2 text-brand-100 text-sm sm:text-base max-w-xl">
            Browse verified local businesses, explore authentic consumer ratings, and share your own 1–5 star feedback.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search by Name */}
          <div className="md:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search by store name..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          {/* Search by Address */}
          <div className="md:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Search by address or city..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          {/* Sort Column & Direction */}
          <div className="md:col-span-3 flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm appearance-none"
              >
                <option value="rating">Sort by Rating</option>
                <option value="name">Sort by Name</option>
                <option value="address">Sort by Address</option>
                <option value="createdAt">Sort by Date Added</option>
              </select>
              <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Switch to ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              className="p-2.5 border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Filters */}
          <div className="md:col-span-1 flex items-center">
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Store Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse space-y-4"
            >
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              <div className="h-12 bg-slate-50 rounded-xl"></div>
              <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No stores found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            We couldn't find any stores matching your current search or filter criteria. Try clearing your search parameters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-5 px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Store Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                    {store.name}
                  </h3>
                </div>

                {/* Store Address */}
                <div className="flex items-start gap-2 text-slate-500 text-xs mb-4">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
                  <span>{store.address}</span>
                </div>

                {/* Overall Rating Block */}
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 mb-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Overall Rating
                    </span>
                    <StarRating
                      rating={store.averageRating}
                      totalRatings={store.ratingCount}
                      size="sm"
                    />
                  </div>

                  {/* Caller's Submitted Rating */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-500 font-medium">Your Rating:</span>
                    {store.userRating ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {store.userRating} / 5
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not rated yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rate / Modify Button */}
              <button
                onClick={() => handleOpenRatingModal(store)}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  store.userRating
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 shadow-sm'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20'
                }`}
              >
                <Star
                  className={`w-4 h-4 ${
                    store.userRating ? 'fill-amber-500 text-amber-500' : 'text-white'
                  }`}
                />
                {store.userRating ? 'Modify Your Rating' : 'Rate This Store'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">
            Showing Page <span className="font-semibold text-slate-700">{pagination.page}</span> of{' '}
            <span className="font-semibold text-slate-700">{pagination.totalPages}</span> ({pagination.total} stores total)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStores(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchStores(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Rate Store Modal */}
      <Modal
        isOpen={!!selectedStore}
        onClose={handleCloseRatingModal}
        title={selectedStore?.userRating ? 'Modify Store Rating' : 'Rate Store'}
        maxWidth="md"
      >
        {selectedStore && (
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-bold text-slate-900">{selectedStore.name}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" /> {selectedStore.address}
              </p>
            </div>

            {ratingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
                {ratingError}
              </div>
            )}

            <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Select your rating (1 to 5 Stars):
              </p>
              <div className="flex justify-center">
                <StarRating
                  rating={selectedRatingValue}
                  interactive={true}
                  size="lg"
                  showValue={false}
                  onChange={(val) => setSelectedRatingValue(val)}
                />
              </div>
              <p className="text-sm font-bold text-amber-600">
                {selectedRatingValue} out of 5 Stars
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseRatingModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitRating}
                disabled={isSubmittingRating}
                className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                {isSubmittingRating ? 'Saving...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StoresPage;
