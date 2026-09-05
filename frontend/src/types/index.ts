export type Role = 'ADMIN' | 'NORMAL_USER' | 'STORE_OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  address?: string | null;
  createdAt: string;
  updatedAt?: string;
  storeOwnerDetails?: {
    stores: Array<{
      id: string;
      name: string;
      email?: string | null;
      address: string;
      ratingCount: number;
      averageRating: number | null;
    }>;
  };
}

export interface Store {
  id: string;
  name: string;
  email?: string | null;
  address: string;
  ownerId?: string | null;
  createdAt: string;
  updatedAt?: string;
  ratingCount: number;
  averageRating: number | null;
  userRating?: number | null;
  owner?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface Rating {
  id: string;
  userId: string;
  storeId: string;
  value: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface StoreRater {
  ratingId: string;
  value: number;
  createdAt: string;
  updatedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface StoreWithOwnerRatings extends Store {
  raters: StoreRater[];
}

export interface StoreOwnerDashboardStats {
  stores: StoreWithOwnerRatings[];
  totalStores: number;
  totalRatingsReceived: number;
  overallAverageRating: number | null;
}
