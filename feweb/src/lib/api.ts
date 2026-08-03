import api from '../lib/axios';
import type { User, Doctor, Specialty, Degree, RoleItem, PaginatedResponse, GetUsersParams, GetDoctorsParams, Holiday, DoctorLeave, GetLeavesParams, ChangeRequest, GetChangeRequestsParams, Disease, Medicine, Feedback, Invoice } from '../types';

// ─────────────────────────────────────────────
// Users API
// ─────────────────────────────────────────────

/** Lấy danh sách users (phân trang, search, filter) */
export async function fetchUsers(params: GetUsersParams): Promise<PaginatedResponse<User>> {
  const { data } = await api.get('/users/list', { params });

  return data;
}

/** Lấy thông tin user theo ID */
export async function fetchUserById(id: number): Promise<User> {
  const { data } = await api.get(`/users/${id}`);

  return data.data;
}

/** Tạo người dùng mới (Nurse/Admin) */
export async function createUser(payload: {
  email: string;
  password: string;
  phone: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string;
  address?: string;
  roleId: number;
}): Promise<string> {
  const { data } = await api.post('/users', payload);

  return data.message;
}

/** Cập nhật thông tin user */
export async function updateUser(
  id: number,
  payload: Partial<Pick<User, 'phone' | 'email' | 'fullName' | 'gender' | 'dob' | 'address'>>
): Promise<string> {
  const { data } = await api.patch(`/users/${id}`, payload);

  return data.message;
}

/** Toggle trạng thái active user */
export async function toggleUserActive(id: number): Promise<string> {
  const { data } = await api.patch(`/users/${id}/toggle-active`);

  return data.message;
}

// ─────────────────────────────────────────────
// Doctors API
// ─────────────────────────────────────────────

/** Lấy danh sách bác sĩ (phân trang, search, filter) */
export async function fetchDoctors(params: GetDoctorsParams): Promise<PaginatedResponse<Doctor>> {
  const { data } = await api.get('/doctors', { params });

  return data;
}

/** Lấy thông tin bác sĩ theo user_id */
export async function fetchDoctorById(id: number): Promise<Doctor> {
  const { data } = await api.get(`/doctors/${id}`);

  return data.data;
}

/** Tạo bác sĩ mới */
export async function createDoctor(payload: {
  email: string;
  password: string;
  phone: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string;
  address?: string;
  specialtyId: number;
  degreeId: number;
  experienceYears?: number;
  biography?: string;
  workType?: 'ONLINE' | 'OFFLINE' | 'BOTH';
}): Promise<string> {
  const { data } = await api.post('/doctors', payload);

  return data.message;
}

/** Cập nhật thông tin bác sĩ */
export async function updateDoctor(
  id: number,
  payload: Partial<{
    email: string;
    phone: string;
    fullName: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dob: string;
    address: string;
    specialtyId: number;
    degreeId: number;
    experienceYears: number;
    biography: string;
    workType: 'ONLINE' | 'OFFLINE' | 'BOTH';
  }>
): Promise<string> {
  const { data } = await api.patch(`/doctors/${id}`, payload);

  return data.message;
}

// ─────────────────────────────────────────────
// Catalogs API
// ─────────────────────────────────────────────

/** Lấy danh sách roles */
export async function fetchRoles(): Promise<RoleItem[]> {
  const { data } = await api.get('/catalogs/roles');

  return data.data;
}

/** Lấy danh sách chuyên khoa */
export async function fetchSpecialties(): Promise<Specialty[]> {
  const { data } = await api.get('/catalogs/specialties');

  return data.data;
}

/** Lấy danh sách bằng cấp */
export async function fetchDegrees(): Promise<Degree[]> {
  const { data } = await api.get('/catalogs/degrees');

  return data.data;
}

// ─────────────────────────────────────────────
// Holidays API
// ─────────────────────────────────────────────

/** Lấy danh sách ngày lễ */
export async function fetchHolidays(): Promise<Holiday[]> {
  const { data } = await api.get('/holidays');

  return data.data;
}

/** Tạo ngày lễ mới */
export async function createHoliday(payload: {
  holidayDate: string;
  name: string;
  description?: string
}): Promise<string> {
  const { data } = await api.post('/holidays', payload);

  return data.message;
}

/** Cập nhật ngày lễ */
export async function updateHoliday(id: number, payload: {
  name?: string;
  description?: string
}): Promise<string> {
  const { data } = await api.patch(`/holidays/${id}`, payload);

  return data.message;
}

/** Xóa ngày lễ */
export async function deleteHoliday(id: number): Promise<string> {
  const { data } = await api.delete(`/holidays/${id}`);

  return data.message;
}

// ───────────────────────────────────────────────
// Leaves API
// ───────────────────────────────────────────────

/** Lấy danh sách đơn xin nghỉ phép (phân trang + filter status) */
export async function fetchLeaves(params: GetLeavesParams): Promise<PaginatedResponse<DoctorLeave>> {
  const { data } = await api.get('/leaves', { params });

  return data;
}

/** Duyệt đơn xin nghỉ phép */
export async function approveLeave(id: number): Promise<string> {
  const { data } = await api.patch(`/leaves/${id}`, { status: 'APPROVED' });

  return data.message;
}

/** Từ chối đơn xin nghỉ phép */
export async function rejectLeave(id: number, rejectedReason?: string): Promise<string> {
  const { data } = await api.patch(`/leaves/${id}`, {
    status: 'REJECTED',
    rejectedReason: rejectedReason || undefined,
  });

  return data.message;
}

// ───────────────────────────────────────────────
// Change Requests API
// ───────────────────────────────────────────────

/** Lấy danh sách yêu cầu đổi lịch (phân trang + filter status) */
export async function fetchChangeRequests(params: GetChangeRequestsParams): Promise<PaginatedResponse<ChangeRequest>> {
  const { data } = await api.get('/change-requests', { params });

  return data;
}

/** Lấy chi tiết yêu cầu đổi lịch theo ID */
export async function getChangeRequestById(id: number): Promise<ChangeRequest> {
  const { data } = await api.get(`/change-requests/${id}`);

  return data.data;
}

/** Duyệt yêu cầu đổi lịch */
export async function approveChangeRequest(id: number): Promise<string> {
  const { data } = await api.patch(`/change-requests/${id}`, { status: 'APPROVED' });

  return data.message;
}

/** Từ chối yêu cầu đổi lịch */
export async function rejectChangeRequest(id: number, rejectedReason?: string): Promise<string> {
  const { data } = await api.patch(`/change-requests/${id}`, {
    status: 'REJECTED',
    rejectedReason: rejectedReason || undefined,
  });

  return data.message;
}

// ───────────────────────────────────────────────
// Diseases API
// ───────────────────────────────────────────────

/** Lấy danh sách bệnh lý (search theo keyword) */
export async function fetchDiseases(keyword?: string): Promise<Disease[]> {
  const { data } = await api.get('/diseases', { params: keyword ? { keyword } : undefined });

  return data.data || [];
}

/** Tạo bệnh lý mới */
export async function createDisease(payload: {
  name: string;
  diseaseCode: string;
  description?: string;
}): Promise<string> {
  const { data } = await api.post('/diseases', payload);

  return data.message;
}

/** Cập nhật bệnh lý */
export async function updateDisease(id: number, payload: {
  name?: string;
  diseaseCode?: string;
  description?: string
}): Promise<string> {
  const { data } = await api.patch(`/diseases/${id}`, payload);

  return data.message;
}

// ───────────────────────────────────────────────
// Medicines API
// ───────────────────────────────────────────────

/** Lấy danh sách thuốc */
export async function fetchMedicines(keyword?: string, isActive?: string): Promise<Medicine[]> {
  const params: Record<string, string> = {};

  if (keyword) {
    params.keyword = keyword;
  }

  if (isActive) {
    params.isActive = isActive;
  }

  const { data } = await api.get('/medicines', { params });

  return data.data || [];
}

/** Tạo thuốc mới */
export async function createMedicine(payload: {
  name: string;
  unit: string;
  pricePerUnit: number;
}): Promise<string> {
  const { data } = await api.post('/medicines', payload);

  return data.message;
}

/** Cập nhật thuốc */
export async function updateMedicine(id: number, payload: {
  name?: string;
  unit?: string;
  pricePerUnit?: number
}): Promise<string> {
  const { data } = await api.patch(`/medicines/${id}`, payload);
  return data.message;
}

/** Đổi trạng thái thuốc */
export async function toggleMedicineActive(id: number, isActive: '0' | '1'): Promise<string> {
  const { data } = await api.patch(`/medicines/toggle/${id}`, { isActive });

  return data.message;
}

// ─────────────────────────────────────────────
// Dashboard API
// ─────────────────────────────────────────────

export interface LogItem {
  level: string;
  message: string;
  service: string;
  correlationID: string;
  timestamp: string;
}

export interface DashboardData {
  patientsCount: number;
  todayAppointmentsCount: number;
  unpaidInvoicesCount: number;
  unreadFeedbackCount: number;
  logs: LogItem[];
}

/** Lấy dữ liệu admin dashboard (stats + logs) */
export async function fetchAdminDashboard(forceRefresh = false): Promise<DashboardData> {
  const { data } = await api.get('/general/admin-dashboard', {
    params: forceRefresh ? { forceRefresh: '1' } : undefined
  });

  return data.data;
}

/** Tự động lên lịch khám cho tuần tới */
export async function triggerScheduleTimeSlots(): Promise<any> {
  const { data } = await api.post('/time-slots/schedule-time-slots');

  return data;
}

// ─────────────────────────────────────────────
// Feedback API
// ─────────────────────────────────────────────

export interface GetFeedbacksParams {
  page?: number;
  limit?: number;
  isRead?: '0' | '1';
}

/** Lấy danh sách hòm thư góp ý */
export async function fetchFeedbacks(params?: GetFeedbacksParams): Promise<PaginatedResponse<Feedback>> {
  const { data } = await api.get('/feedbacks', { params });

  return data;
}

/** Lấy chi tiết góp ý theo ID */
export async function fetchFeedbackById(id: number): Promise<Feedback> {
  const { data } = await api.get(`/feedbacks/${id}`);

  return data.data;
}

/** Đánh dấu đã đọc góp ý */
export async function markFeedbackAsRead(id: number): Promise<string> {
  const { data } = await api.patch(`/feedbacks/${id}/read`);

  return data.message;
}

// ─────────────────────────────────────────────
// Invoices API
// ─────────────────────────────────────────────

export interface GetInvoicesParams {
  page?: number;
  limit?: number;
  status?: string; // '0' | '1'
}

/** Lấy danh sách hóa đơn */
export async function fetchInvoices(params?: GetInvoicesParams): Promise<PaginatedResponse<Invoice>> {
  const { data } = await api.get('/invoices', { params });

  return data;
}

/** Lấy chi tiết hóa đơn */
export async function getInvoiceById(id: number): Promise<Invoice> {
  const { data } = await api.get(`/invoices/${id}`);

  return data.data;
}

/** Đánh dấu hóa đơn đã thanh toán tiền mặt */
export async function markCashPaid(id: number): Promise<string> {
  const { data } = await api.patch(`/invoices/cash-paid/${id}`);

  return data.message;
}

// ─────────────────────────────────────────────
// Medical Records API
// ─────────────────────────────────────────────

export async function getRecordByBooking(bookingId: number): Promise<any> {
  const { data } = await api.get(`/records/booking/${bookingId}`);

  return data.data;
}
