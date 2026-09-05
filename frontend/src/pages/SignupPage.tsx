import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { Store, User, Mail, Lock, MapPin, AlertCircle, ArrowRight, Check } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Password criteria helpers
  const hasMinLength = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response: any = await apiClient.post('/auth/signup', {
        name,
        email,
        password,
        address: address.trim() ? address.trim() : null,
      });

      if (response.success && response.data) {
        const { user, token } = response.data;
        login(user, token);
        navigate('/stores', { replace: true });
      }
    } catch (err: any) {
      if (err.fields) {
        setFieldErrors(err.fields);
      } else {
        setGeneralError(err.message || 'Signup failed. Please check your inputs.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-brand-50/30 to-indigo-50/20">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
            <Store className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Normal User Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Join StoreRating to discover and rate local stores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          {generalError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <span className={`text-xs ${name.length < 20 || name.length > 60 ? 'text-amber-600 font-medium' : 'text-emerald-600'}`}>
                  {name.length}/60 chars (min 20)
                </span>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jonathan Edward Harker"
                  className={`block w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                    fieldErrors.name
                      ? 'border-rose-300 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`block w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                    fieldErrors.email
                      ? 'border-rose-300 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`block w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                    fieldErrors.password
                      ? 'border-rose-300 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
                  }`}
                />
              </div>

              {/* Password Checklist Requirements */}
              <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-xs">
                <div className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>8-16 Chars</span>
                </div>
                <div className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>1 Uppercase</span>
                </div>
                <div className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  <Check className={`w-3.5 h-3.5 ${hasSpecial ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>1 Special Char</span>
                </div>
              </div>

              {fieldErrors.password && (
                <p className="text-xs text-rose-600 mt-1.5">{fieldErrors.password}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Address (Optional)
                </label>
                <span className="text-xs text-slate-400">{address.length}/400 max</span>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute top-3 left-3.5 flex items-start pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  rows={2}
                  maxLength={400}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 12 Castle Hill Road, Greenfield Town"
                  className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                />
              </div>
              {fieldErrors.address && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.address}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || name.length < 20 || !isPasswordValid}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                'Creating Account...'
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
