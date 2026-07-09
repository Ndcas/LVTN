import { useState, useEffect, useCallback } from 'react';
import { Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import Header from '../components/Layout/Header';
import DataTable, { type Column } from '../components/DataTable';
import Badge from '../components/Badge';
import ConfirmModal from '../components/ConfirmModal';
import FormField from '../components/FormField';
import { SelectField } from '../components/FormField';
import { X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import type { User } from '../types';
import { fetchUsers, updateUser, toggleUserActive, createUser } from '../lib/api';

const GENDER_MAP: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

export default function NursesPage() {
  // ── State ──
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const limit = 10;

  // Create/Edit modal
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    gender: '',
    dob: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch Data ──
  const loadUsers = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetchUsers({
        page,
        limit,
        search: search || undefined,
        roleId: 4, // Chỉ điều dưỡng
        isActive: filterActive || undefined,
      });

      setUsers(res.data || []);

      setTotal(res.total || 0);

      setTotalPages(Math.ceil(res.total / limit));
    } catch {
      toast.error('Không thể tải danh sách điều dưỡng');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterActive]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  // Toggle active modal
  const [toggleTarget, setToggleTarget] = useState<User | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  // ── Open modals ──
  const openCreate = () => {
    setModalMode('create');

    setEditUserId(null);

    setForm({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      gender: '',
      dob: '',
      address: '',
    });

    setFormErrors({});
  };

  const openEdit = (user: User) => {
    setModalMode('edit');

    setEditUserId(user.id);

    setFormErrors({});

    setForm({
      fullName: user.fullName || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      gender: user.gender || '',
      dob: user.dob || '',
      address: user.address || '',
    });
  };

  const updateField = (field: keyof typeof form, value: string) => {
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
    }

    if (!form.email.trim()) {
      errs.email = 'Email là bắt buộc';
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
    }

    if (!form.gender) {
      errs.gender = 'Giới tính là bắt buộc';
    }

    setFormErrors(errs);

    return Object.keys(errs).length == 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (modalMode == 'create') {
        await createUser({
          ...form,
          gender: form.gender as 'MALE' | 'FEMALE' | 'OTHER',
          roleId: 4, // Nurse
          dob: form.dob || undefined,
          address: form.address || undefined,
        });

        toast.success('Thêm điều dưỡng thành công');
      } else if (editUserId) {
        await updateUser(editUserId, {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          gender: form.gender as 'MALE' | 'FEMALE' | 'OTHER',
          dob: form.dob || undefined,
          address: form.address || undefined,
        });

        toast.success('Cập nhật thành công');
      }

      setModalMode(null);

      loadUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle Active ──
  const handleToggle = async () => {
    if (!toggleTarget) {
      return;
    }

    setToggleLoading(true);

    try {
      await toggleUserActive(toggleTarget.id);

      toast.success(toggleTarget.isActive == '1' ? 'Đã vô hiệu hóa tài khoản' : 'Đã kích hoạt tài khoản');

      setToggleTarget(null);

      loadUsers();
    } catch {
      toast.error('Thao tác thất bại');
    } finally {
      setToggleLoading(false);
    }
  };


  // ── Columns ──
  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'Điều dưỡng',
      render: (u) => (
        <div className="table-user-cell">
          <div className="table-avatar">
            {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="cell-main">{u.fullName}</div>
            <div className="cell-sub">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'SĐT',
      render: (u) => u.phone,
      width: '130px',
    },
    {
      key: 'gender',
      header: 'Giới tính',
      render: (u) => GENDER_MAP[u.gender] || u.gender,
      width: '100px',
    },
    {
      key: 'dob',
      header: 'Ngày sinh',
      render: (u) => u.dob ? dayjs(u.dob).format('DD/MM/YYYY') : '—',
      width: '120px',
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (u) => (
        <Badge color={u.isActive == '1' ? 'green' : 'red'}>
          {u.isActive == '1' ? 'Hoạt động' : 'Vô hiệu'}
        </Badge>
      ),
      width: '120px',
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (u) => dayjs(u.createdAt).format('DD/MM/YYYY'),
      width: '120px',
    },
    {
      key: 'actions',
      header: '',
      render: (u) => (
        <div className="cell-actions">
          <button
            className="action-btn edit"
            title="Chỉnh sửa"
            onClick={() => openEdit(u)}
          >
            <Pencil size={15} />
          </button>
          <button
            className={`action-btn ${u.isActive == '1' ? 'danger' : 'success'}`}
            title={u.isActive == '1' ? 'Vô hiệu hóa' : 'Kích hoạt'}
            onClick={() => setToggleTarget(u)}
          >
            {u.isActive == '1' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </button>
        </div>
      ),
      width: '100px',
    },
  ];

  return (
    <>
      <Header title="Quản lý điều dưỡng" subtitle="Danh sách tài khoản điều dưỡng" />
      <div className="page-content">
        <div className="card">
          <DataTable<User>
            columns={columns}
            data={users}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={setPage}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Tìm theo tên, email, SĐT..."
            rowKey={(u) => u.id}
            filters={
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
            }
            actions={
              <button className="btn btn-primary" onClick={openCreate}>
                <Plus size={18} />
                Thêm điều dưỡng
              </button>
            }
          />
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      {modalMode && (
        <div className="modal-overlay" onClick={() => setModalMode(null)}>
          <div className="modal-container md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode == 'create' ? 'Thêm điều dưỡng mới' : 'Chỉnh sửa điều dưỡng'}
              </h2>
              <button className="modal-close-btn" onClick={() => setModalMode(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <FormField
                  label="Họ tên"
                  id="user-fullName"
                  value={form.fullName}
                  onChange={(v) => updateField('fullName', v)}
                  error={formErrors.fullName}
                  required
                />
                <FormField
                  label="Email"
                  id="user-email"
                  type="email"
                  value={form.email}
                  onChange={(v) => updateField('email', v)}
                  error={formErrors.email}
                  required
                />
                {modalMode == 'create' && (
                  <FormField
                    label="Mật khẩu"
                    id="user-password"
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
                  id="user-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => updateField('phone', v)}
                  error={formErrors.phone}
                  required
                />
                <SelectField
                  label="Giới tính"
                  id="user-gender"
                  value={form.gender}
                  onChange={(v) => updateField('gender', v)}
                  options={[
                    { value: 'MALE', label: 'Nam' },
                    { value: 'FEMALE', label: 'Nữ' },
                    { value: 'OTHER', label: 'Khác' },
                  ]}
                  error={formErrors.gender}
                  required
                />
                <FormField
                  label="Ngày sinh"
                  id="user-dob"
                  type="date"
                  value={form.dob}
                  onChange={(v) => updateField('dob', v)}
                />
                <div className="form-group full-width">
                  <label className="form-label" htmlFor="user-address">Địa chỉ</label>
                  <input
                    id="user-address"
                    type="text"
                    className="form-input"
                    placeholder="Nhập địa chỉ"
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
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
                {modalMode == 'create' ? 'Thêm điều dưỡng' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toggle Active Modal ── */}
      {toggleTarget && (
        <ConfirmModal
          title={toggleTarget.isActive == '1' ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
          message={
            toggleTarget.isActive == '1'
              ? `Bạn có chắc muốn vô hiệu hóa tài khoản "${toggleTarget.fullName}"?`
              : `Bạn có chắc muốn kích hoạt lại tài khoản "${toggleTarget.fullName}"?`
          }
          subMessage={
            toggleTarget.isActive == '1'
              ? 'Điều dưỡng sẽ không thể đăng nhập cho đến khi được kích hoạt lại.'
              : 'Điều dưỡng sẽ có thể đăng nhập và sử dụng hệ thống.'
          }
          confirmLabel={toggleTarget.isActive == '1' ? 'Vô hiệu hóa' : 'Kích hoạt'}
          variant={toggleTarget.isActive == '1' ? 'danger' : 'info'}
          loading={toggleLoading}
          onConfirm={handleToggle}
          onClose={() => setToggleTarget(null)}
        />
      )}
    </>
  );
}
