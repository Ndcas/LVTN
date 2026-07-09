import api from '../lib/axios';
import type {
  User,
  Doctor,
  Specialty,
  Degree,
  RoleItem,
  PaginatedResponse,
  GetUsersParams,
  GetDoctorsParams,
} from '../types';

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
