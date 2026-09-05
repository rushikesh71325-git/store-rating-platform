import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { AdminDashboardStats } from '../types';
import { Users, Store, Star, ArrowRight, PlusCircle, ShieldCheck, Activity } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setIsLoading(true);
      try {
        const response: any = await apiClient.get('/dashboard/admin');
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load platform statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-purple-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-3 text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-300" /> Platform Administration
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            System Overview & Metrics
          </h1>
          <p className="mt-2 text-purple-200 text-sm sm:text-base max-w-xl">
            Monitor ecosystem scale, manage registered stores and user access, and oversee ratings activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/stores"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold backdrop-blur-md transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Add Store
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-lg shadow-brand-500/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Add User
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Users
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="my-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? (
                <span className="inline-block w-16 h-8 bg-slate-200 rounded animate-pulse"></span>
              ) : (
                stats?.totalUsers || 0
              )}
            </span>
            <span className="block text-xs text-slate-400 mt-1">
              Admins, Store Owners & Users
            </span>
          </div>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 pt-2 border-t border-slate-100"
          >
            Manage all users <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Total Stores */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Stores
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="my-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? (
                <span className="inline-block w-16 h-8 bg-slate-200 rounded animate-pulse"></span>
              ) : (
                stats?.totalStores || 0
              )}
            </span>
            <span className="block text-xs text-slate-400 mt-1">
              Registered storefronts listed
            </span>
          </div>
          <Link
            to="/admin/stores"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 pt-2 border-t border-slate-100"
          >
            Manage all stores <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Total Ratings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Ratings
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="my-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? (
                <span className="inline-block w-16 h-8 bg-slate-200 rounded animate-pulse"></span>
              ) : (
                stats?.totalRatings || 0
              )}
            </span>
            <span className="block text-xs text-slate-400 mt-1">
              Verified consumer scores submitted
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 pt-2 border-t border-slate-100">
            <Activity className="w-3.5 h-3.5 text-emerald-500" /> Active feedback loop
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
