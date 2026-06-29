/** Thông tin user từ JWT payload */
export interface AuthUser {
  userId: number;
  roleId: number;
  email: string;
  fullName: string;
}

/** Response từ API login */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/** Response từ API refresh */
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/** Auth Context state */
export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/** Vai trò hệ thống */
export const Role = {
  Admin: 1,
  Doctor: 2,
  Patient: 3,
  Nurse: 4,
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/** Sidebar navigation item */
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
  roles?: Role[];
}

/** Sidebar navigation section */
export interface NavSection {
  title: string;
  items: NavItem[];
}
