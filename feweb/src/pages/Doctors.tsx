import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Eye, X } from 'lucide-react';
import Header from '../components/Layout/Header';
import DataTable, { type Column } from '../components/DataTable';
import Badge from '../components/Badge';
import FormField from '../components/FormField';
import { SelectField, TextareaField } from '../components/FormField';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import type { Doctor, Specialty, Degree } from '../types';
import {
  fetchDoctors,
  fetchDoctorById,
  createDoctor,
  updateDoctor,
  fetchSpecialties,
  fetchDegrees,
} from '../lib/api';

const GENDER_OPTIONS = [{
  value: 'MALE',
  label: 'Nam'
}, {
  value: 'FEMALE',
  label: 'Nữ'
}, {
  value: 'OTHER',
  label: 'Khác'
}];

const GENDER_MAP: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

interface DoctorFormState {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  specialtyId: string;
  degreeId: string;
  experienceYears: string;
  biography: string;
}

const INITIAL_FORM: DoctorFormState = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  gender: '',
  dob: '',
  address: '',
  specialtyId: '',
  degreeId: '',
  experienceYears: '',
  biography: '',
};

export default function DoctorsPage() {
  // ── List state ──
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const limit = 10;

  // Catalogs
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);

  // Create/Edit modal
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editDoctorId, setEditDoctorId] = useState<number | null>(null);
  const [form, setForm] = useState<DoctorFormState>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Detail view
  const [viewDoctor, setViewDoctor] = useState<Doctor | null>(null);

  // ── Load catalogs ──
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [specRes, degRes] = await Promise.all([fetchSpecialties(), fetchDegrees()]);

        setSpecialties(specRes);

        setDegrees(degRes);
      } catch {
        toast.error('Không thể tải dữ liệu danh mục');
      }
    };

    loadCatalogs();
  }, []);

  // ── Load doctors ──
  const loadDoctors = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetchDoctors({
        page,
        limit,
        search: search || undefined,
        specialtyId: filterSpecialty ? parseInt(filterSpecialty) : undefined,
        isActive: filterActive || undefined,
      });

      setDoctors(res.data || []);

      setTotal(res.total || 0);

      setTotalPages(Math.ceil(res.total / limit));
    } catch {
      toast.error('Không thể tải danh sách bác sĩ');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterSpecialty, filterActive]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => setPage(1), 400);

    return () => clearTimeout(timeout);
  }, [search]);

  // ── Form helpers ──
  const updateField = (field: keyof DoctorFormState, value: string) => {
    setForm((f) => ({
      ...f,
      [field]: value
    }));

    if (formErrors[field]) {
      setFormErrors((e) => ({
        ...e,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.fullName.trim()) {
      errs.fullName = 'Họ tên là bắt buộc';
    } else if (form.fullName.trim().length > 100) {
      errs.fullName = 'Họ tên không được vượt quá 100 ký tự';
    }

    if (!form.email.trim()) {
      errs.email = 'Email là bắt buộc';
    } else if (form.email.trim().length > 100) {
      errs.email = 'Email không được vượt quá 100 ký tự';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Email không hợp lệ';
    }

    if (modalMode == 'create' && !form.password) {
      errs.password = 'Mật khẩu là bắt buộc';
    } else if (modalMode == 'create' && form.password.length < 8) {
      errs.password = 'Tối thiểu 8 ký tự';
    }

    if (!form.phone.trim()) {
      errs.phone = 'SĐT là bắt buộc';
    } else if (form.phone.trim().length > 15) {
      errs.phone = 'SĐT không được vượt quá 15 ký tự';
    }

    if (!form.gender) {
      errs.gender = 'Giới tính là bắt buộc';
    }

    if (!form.specialtyId) {
      errs.specialtyId = 'Chuyên khoa là bắt buộc';
    }

    if (!form.degreeId) {
      errs.degreeId = 'Bằng cấp là bắt buộc';
    }

    setFormErrors(errs);

    return Object.keys(errs).length == 0;
  };

  // ── Open modals ──
  const openCreate = () => {
    setModalMode('create');

    setEditDoctorId(null);

    setForm(INITIAL_FORM);

    setFormErrors({});
  };

  const openEdit = async (doctor: Doctor) => {
    setModalMode('edit');

    setEditDoctorId(doctor.id);

    setFormErrors({});

    try {
      const detail = await fetchDoctorById(doctor.id);

      setForm({
        fullName: detail.fullName || '',
        email: detail.email || '',
        password: '',
        phone: detail.phone || '',
        gender: detail.gender || '',
        dob: detail.dob || '',
        address: detail.address || '',
        specialtyId: detail.specialtyId?.toString() || '',
        degreeId: detail.degreeId?.toString() || '',
        experienceYears: detail.experienceYears?.toString() || '',
        biography: detail.biography || '',
      });
    } catch {
      toast.error('Không thể tải thông tin bác sĩ');

      setModalMode(null);
    }
  };

  const openView = async (doctor: Doctor) => {
    try {
      const detail = await fetchDoctorById(doctor.id);

      setViewDoctor(detail);
    } catch {
      toast.error('Không thể tải thông tin bác sĩ');
    }
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (modalMode == 'create') {
        await createDoctor({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          gender: form.gender as 'MALE' | 'FEMALE' | 'OTHER',
          dob: form.dob || undefined,
          address: form.address || undefined,
          specialtyId: parseInt(form.specialtyId),
          degreeId: parseInt(form.degreeId),
          experienceYears: form.experienceYears ? parseInt(form.experienceYears) : undefined,
          biography: form.biography || undefined,
        });

        toast.success('Tạo bác sĩ thành công');
      } else if (editDoctorId) {
        await updateDoctor(editDoctorId, {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          gender: form.gender as 'MALE' | 'FEMALE' | 'OTHER',
          dob: form.dob || undefined,
          address: form.address || undefined,
          specialtyId: parseInt(form.specialtyId),
          degreeId: parseInt(form.degreeId),
          experienceYears: form.experienceYears ? parseInt(form.experienceYears) : undefined,
          biography: form.biography || undefined,
        });

        toast.success('Cập nhật bác sĩ thành công');
      }

      setModalMode(null);

      loadDoctors();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Table columns ──
  const columns: Column<Doctor>[] = [
    {
      key: 'doctor',
      header: 'Bác sĩ',
      render: (d) => (
        <div className="table-user-cell">
          <div className="table-avatar">
            {d.fullName?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          <div>
            <div className="cell-main">{d.fullName}</div>
            <div className="cell-sub">{d.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'specialty',
      header: 'Chuyên khoa',
      render: (d) => d.specialtyName || '—',
      width: '160px',
    },
    {
      key: 'degree',
      header: 'Bằng cấp',
      render: (d) => d.degreeName || '—',
      width: '140px',
    },
    {
      key: 'experience',
      header: 'Kinh nghiệm',
      render: (d) =>
        d.experienceYears != null
          ? `${d.experienceYears} năm`
          : '—',
      width: '110px',
    },

    {
      key: 'status',
      header: 'Trạng thái',
      render: (d) => (
        <Badge color={d.isActive == '1' ? 'green' : 'red'}>
          {d.isActive == '1' ? 'Hoạt động' : 'Vô hiệu'}
        </Badge>
      ),
      width: '120px',
    },
    {
      key: 'actions',
      header: '',
      render: (d) => (
        <div className="cell-actions">
          <button className="action-btn" title="Xem chi tiết" onClick={() => openView(d)}>
            <Eye size={15} />
          </button>
          <button className="action-btn edit" title="Chỉnh sửa" onClick={() => openEdit(d)}>
            <Pencil size={15} />
          </button>
        </div>
      ),
      width: '90px',
    },
  ];

  // ── Specialty & Degree options ──
  const specialtyOptions = specialties.map((s) => ({ value: s.id.toString(), label: s.name }));
  const degreeOptions = degrees.map((d) => ({ value: d.id.toString(), label: d.name }));

  return (
    <>
      <Header title="Quản lý bác sĩ" subtitle="Danh sách bác sĩ phòng khám" />
      <div className="page-content">
        <div className="card">
          <DataTable<Doctor>
            columns={columns}
            data={doctors}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={setPage}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Tìm theo tên, email, SĐT..."
            rowKey={(d) => d.id}
            filters={
              <>
                <select
                  className="filter-select"
                  value={filterSpecialty}
                  onChange={(e) => {
                    setFilterSpecialty(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Tất cả chuyên khoa</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={filterActive}
                  onChange={(e) => {
                    setFilterActive(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="1">Hoạt động</option>
                  <option value="0">Vô hiệu</option>
                </select>
              </>
            }
            actions={
              <button className="btn btn-primary" onClick={openCreate}>
                <Plus size={16} />
                Thêm bác sĩ
              </button>
            }
          />
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      {modalMode && (
        <div className="modal-overlay" onClick={() => setModalMode(null)}>
          <div className="modal-container lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode == 'create' ? 'Thêm bác sĩ mới' : 'Chỉnh sửa bác sĩ'}
              </h2>
              <button className="modal-close-btn" onClick={() => setModalMode(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                {/* ── Thông tin cá nhân ── */}
                <FormField
                  label="Họ tên"
                  id="doc-fullName"
                  value={form.fullName}
                  onChange={(v) => updateField('fullName', v)}
                  error={formErrors.fullName}
                  required
                />
                <FormField
                  label="Email"
                  id="doc-email"
                  type="email"
                  value={form.email}
                  onChange={(v) => updateField('email', v)}
                  error={formErrors.email}
                  required
                />
                {modalMode == 'create' && (
                  <FormField
                    label="Mật khẩu"
                    id="doc-password"
                    type="password"
                    value={form.password}
                    onChange={(v) => updateField('password', v)}
                    error={formErrors.password}
                    required
                    placeholder="Tối thiểu 8 ký tự"
                  />
                )}
                <FormField
                  label="Số điện thoại"
                  id="doc-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => updateField('phone', v)}
                  error={formErrors.phone}
                  required
                />
                <SelectField
                  label="Giới tính"
                  id="doc-gender"
                  value={form.gender}
                  onChange={(v) => updateField('gender', v)}
                  options={GENDER_OPTIONS}
                  error={formErrors.gender}
                  required
                />
                <FormField
                  label="Ngày sinh"
                  id="doc-dob"
                  type="date"
                  value={form.dob}
                  onChange={(v) => updateField('dob', v)}
                />
                <div className="form-group full-width">
                  <label className="form-label" htmlFor="doc-address">Địa chỉ</label>
                  <input
                    id="doc-address"
                    type="text"
                    className="form-input"
                    placeholder="Nhập địa chỉ"
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </div>

                {/* ── Thông tin chuyên môn ── */}
                <SelectField
                  label="Chuyên khoa"
                  id="doc-specialty"
                  value={form.specialtyId}
                  onChange={(v) => updateField('specialtyId', v)}
                  options={specialtyOptions}
                  error={formErrors.specialtyId}
                  required
                />
                <SelectField
                  label="Bằng cấp"
                  id="doc-degree"
                  value={form.degreeId}
                  onChange={(v) => updateField('degreeId', v)}
                  options={degreeOptions}
                  error={formErrors.degreeId}
                  required
                />
                <FormField
                  label="Kinh nghiệm (năm)"
                  id="doc-exp"
                  type="number"
                  value={form.experienceYears}
                  onChange={(v) => updateField('experienceYears', v)}
                  placeholder="VD: 5"
                />
                <div className="form-group full-width">
                  <TextareaField
                    label="Tiểu sử"
                    id="doc-biography"
                    value={form.biography}
                    onChange={(v) => updateField('biography', v)}
                    placeholder="Mô tả kinh nghiệm, thành tích chuyên môn..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModalMode(null)} disabled={submitting}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting && <span className="spinner" />}
                {modalMode == 'create' ? 'Tạo bác sĩ' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Detail Modal ── */}
      {viewDoctor && (
        <div className="modal-overlay" onClick={() => setViewDoctor(null)}>
          <div className="modal-container md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Chi tiết bác sĩ</h2>
              <button className="modal-close-btn" onClick={() => setViewDoctor(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div className="table-avatar" style={{ width: 52, height: 52, fontSize: '1.125rem' }}>
                  {viewDoctor.fullName?.charAt(0)?.toUpperCase() || 'D'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{viewDoctor.fullName}</h3>
                  <span className="text-muted text-sm">{viewDoctor.email}</span>
                </div>
              </div>
              <div className="form-grid" style={{ gap: '14px' }}>
                <DetailRow label="SĐT" value={viewDoctor.phone} />
                <DetailRow label="Giới tính" value={GENDER_MAP[viewDoctor.gender] || viewDoctor.gender} />
                <DetailRow label="Ngày sinh" value={viewDoctor.dob ? dayjs(viewDoctor.dob).format('DD/MM/YYYY') : '—'} />
                <DetailRow label="Địa chỉ" value={viewDoctor.address || '—'} />
                <DetailRow label="Chuyên khoa" value={viewDoctor.specialtyName || '—'} />
                <DetailRow label="Bằng cấp" value={viewDoctor.degreeName || '—'} />
                <DetailRow label="Kinh nghiệm" value={viewDoctor.experienceYears != null ? `${viewDoctor.experienceYears} năm` : '—'} />
                {viewDoctor.biography && (
                  <div className="form-group full-width">
                    <span className="form-label">Tiểu sử</span>
                    <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--neutral-700)' }}>
                      {viewDoctor.biography}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewDoctor(null)}>
                Đóng
              </button>
              <button className="btn btn-primary" onClick={() => {
                setViewDoctor(null);
                openEdit(viewDoctor);
              }}>
                <Pencil size={14} />
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Helper: hiển thị 1 dòng label + value trong modal view */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--neutral-400)' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.9375rem', color: 'var(--neutral-900)', fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}
