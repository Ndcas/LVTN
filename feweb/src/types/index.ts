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

/** Đơn xin nghỉ phép bác sĩ */
export interface DoctorLeave {
  id: number;
  doctorId: number;
  doctorName?: string;
  leaveDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectedReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Chi tiết một ca trong yêu cầu đổi lịch */
export interface ChangeRequestDetail {
  id: number;
  requestId: number;
  dayOfWeek: number; // 0=CN, 1=T2, ..., 6=T7
  startTime: string; // HH:MM:00
  endTime: string;   // HH:MM:00
  clinicType: 'ONLINE' | 'OFFLINE';
}

/** Yêu cầu đổi lịch làm việc của bác sĩ */
export interface ChangeRequest {
  id: number;
  doctorId: number;
  doctorName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectedReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  details?: ChangeRequestDetail[];
}

/** Params lấy danh sách Change Requests */
export interface GetChangeRequestsParams {
  page: number;
  limit: number;
  status?: string;
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

/** Params lấy danh sách Leaves */
export interface GetLeavesParams {
  page: number;
  limit: number;
  status?: string;
}

/** Bệnh lý (ICD catalog) */
export interface Disease {
  id: number;
  name: string;
  diseaseCode: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Thuốc (Kho thuốc) */
export interface Medicine {
  id: number;
  name: string;
  unit: string;
  pricePerUnit: number;
  isActive: '0' | '1';
  createdAt?: string;
  updatedAt?: string;
}

/** Hòm thư góp ý */
export interface Feedback {
  id: number;
  userId: number;
  title: string;
  content: string;
  isRead: '0' | '1';
  createdAt?: string;
  updatedAt?: string;
  userName?: string;
}

/** Hóa đơn */
export interface Invoice {
  id: number;
  patientId: number;
  patientName?: string;
  bookingId: number;
  examinationFee: number;
  medicineFee: number;
  totalAmount: number;
  paymentMethod?: 'CASH' | 'VNPAY';
  status: 'UNPAID' | 'PAID';
  createdAt?: string;
  updatedAt?: string;
}
