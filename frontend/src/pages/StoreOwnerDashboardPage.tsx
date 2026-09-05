import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { StoreOwnerDashboardStats } from '../types';
import StarRating from '../components/StarRating';
import {
  Briefcase,
  Star,
  Users,
  Store,
  MapPin,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const StoreOwnerDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StoreOwnerDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOwnerStats = async () => {
      setIsLoading(true);
      try {
        const response: any = await apiClient.get('/dashboard/store-owner');
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load store owner statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwnerStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-3 text-white">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" /> Store Owner Reputation Hub
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Store Performance & Ratings
          </h1>
          <p className="mt-2 text-blue-100 text-sm sm:text-base max-w-xl">
            Track your store's customer satisfaction, monitor aggregate rating trends, and review individual customer feedback.
          </p>
        </div>

        {/* Aggregate KPI Pill */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <span className="text-xs font-medium text-blue-200 uppercase tracking-wider block">
              Overall Reputation
            </span>
            <span className="text-2xl font-extrabold text-white">
              {stats?.overallAverageRating !== null && stats?.overallAverageRating !== undefined
                ? `${stats.overallAverageRating} / 5.0`
                : 'No ratings yet'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Stores Managed
            </span>
            <span className="text-2xl font-extrabold text-slate-900">
              {isLoading ? '...' : stats?.totalStores || 0}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Customer Ratings
            </span>
            <span className="text-2xl font-extrabold text-slate-900">
              {isLoading ? '...' : stats?.totalRatingsReceived || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Stores Breakdown & Raters List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-brand-600" /> Your Store Listings
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                <div className="h-24 bg-slate-50 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : !stats || stats.stores.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No stores assigned yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              You currently do not have any stores linked to your owner account. Platform administrators assign stores to store owners.
            </p>
          </div>
        ) : (
          stats.stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
            >
              {/* Store Title Bar */}
              <div className="p-6 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{store.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {store.address}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StarRating
                    rating={store.averageRating}
                    totalRatings={store.ratingCount}
                    size="md"
                  />
                </div>
              </div>

              {/* Raters Table */}
              <div className="p-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-400" /> Customer Ratings ({store.raters.length})
                </h4>

                {store.raters.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl text-xs text-slate-400">
                    No customers have submitted ratings for this store yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="pb-3 font-semibold">Customer Name</th>
                          <th className="pb-3 font-semibold">Email</th>
                          <th className="pb-3 font-semibold">Submitted Rating</th>
                          <th className="pb-3 font-semibold text-right">Date Rated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {store.raters.map((rater) => (
                          <tr key={rater.ratingId} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 font-medium text-slate-900">
                              {rater.user.name}
                            </td>
                            <td className="py-3.5 text-slate-500 text-xs">
                              {rater.user.email}
                            </td>
                            <td className="py-3.5">
                              <StarRating rating={rater.value} size="sm" showValue={false} />
                              <span className="text-xs font-bold text-amber-600 ml-1.5">
                                {rater.value} / 5
                              </span>
                            </td>
                            <td className="py-3.5 text-right text-xs text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {new Date(rater.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboardPage;
