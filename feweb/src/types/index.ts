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

// ─────────────────────────────────────────────
// Domain Types — User Management
// ─────────────────────────────────────────────

/** Vai trò (read-only catalog) */
export interface RoleItem {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

/** Chuyên khoa */
export interface Specialty {
  id: number;
  name: string;
  code: string;
  description: string | null;
  defaultFee: number;
  createdAt: string;
}

/** Bằng cấp */
export interface Degree {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

/** User (Bệnh nhân / Admin / Nurse) */
export interface User {
  id: number;
  roleId: number;
  phone: string;
  email: string;
  isActive: '0' | '1';
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  role?: RoleItem;
}

/** Doctor metadata */
export interface DoctorMetadata {
  id: number;
  userId: number;
  specialtyId: number;
  degreeId: number;
  experienceYears: number;
  biography: string | null;
  workType: 'ONLINE' | 'OFFLINE' | 'BOTH';
  createdAt: string;
  updatedAt: string;
  specialty?: Specialty;
  degree?: Degree;
}

/** Doctor = User + metadata (response từ API) */
export interface Doctor extends User {
  specialtyId?: number;
  specialtyName?: string;
  degreeId?: number;
  degreeName?: string;
  experienceYears?: number;
  biography?: string;
  workType?: 'ONLINE' | 'OFFLINE' | 'BOTH';
}

/** Phân trang — response chuẩn từ backend */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Ngày lễ toàn phòng khám */
export interface Holiday {
  id: number;
  holidayDate: string;
  name: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Params phân trang chuẩn */
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

/** Params lấy danh sách Users */
export interface GetUsersParams extends PaginationParams {
  roleId?: number;
  isActive?: string;
}

/** Params lấy danh sách Doctors */
export interface GetDoctorsParams extends PaginationParams {
  specialtyId?: number;
  isActive?: string;
}
