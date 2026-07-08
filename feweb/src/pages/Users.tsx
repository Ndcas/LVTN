import { useState, useEffect, useCallback } from 'react';
import { Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import Header from '../components/Layout/Header';
import DataTable, { type Column } from '../components/DataTable';
import Badge from '../components/Badge';
import ConfirmModal from '../components/ConfirmModal';
import FormField from '../components/FormField';
import { SelectField } from '../components/FormField';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import type { User } from '../types';
import { fetchUsers, updateUser, toggleUserActive } from '../lib/api';

const GENDER_MAP: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

export default function UsersPage() {
  // ── State ──
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const limit = 10;

  // Edit modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    address: '',
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editLoading, setEditLoading] = useState(false);

  // Toggle active modal
  const [toggleTarget, setToggleTarget] = useState<User | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  // ── Fetch Data ──
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchUsers({
        page,
        limit,
        search: search || undefined,
        roleId: 3, // Chỉ bệnh nhân
        isActive: filterActive || undefined,
      });

      setUsers(res.data || []);

      setTotal(res.total || 0);

      setTotalPages(Math.ceil(res.total / limit));
    } catch {
      toast.error('Không thể tải danh sách bệnh nhân');
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

  // ── Edit Handlers ──
  const openEdit = (user: User) => {
    setEditingUser(user);

    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      gender: user.gender || '',
      dob: user.dob || '',
      address: user.address || '',
    });

    setEditErrors({});
  };

  const updateField = (field: keyof typeof editForm, value: string) => {
    setEditForm((f) => ({
      ...f,
      [field]: value
    }));

    if (editErrors[field]) {
      setEditErrors((e) => ({
        ...e,
        [field]: ''
      }));
    }
  };

  const validateEdit = (): boolean => {
    const errs: Record<string, string> = {};

    if (!editForm.fullName.trim()) {
      errs.fullName = 'Họ tên là bắt buộc';
    }

    if (!editForm.email.trim()) {
      errs.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      errs.email = 'Email không hợp lệ';
    }

    if (!editForm.phone.trim()) {
      errs.phone = 'SĐT là bắt buộc';
    }

    if (!editForm.gender) {
      errs.gender = 'Giới tính là bắt buộc';
    }

    setEditErrors(errs);

    return Object.keys(errs).length == 0;
  };

  const handleEditSubmit = async () => {
    if (!editingUser || !validateEdit()) {
      return;
    }

    setEditLoading(true);

    try {
      await updateUser(editingUser.id, {
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        gender: editForm.gender as 'MALE' | 'FEMALE' | 'OTHER',
        dob: editForm.dob || undefined,
        address: editForm.address || undefined,
      });

      toast.success('Cập nhật thành công');

      setEditingUser(null);

      loadUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setEditLoading(false);
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
      header: 'Bệnh nhân',
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
      <Header title="Quản lý bệnh nhân" subtitle="Danh sách tài khoản bệnh nhân" />
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
          />
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-container md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Chỉnh sửa bệnh nhân</h2>
              <button className="modal-close-btn" onClick={() => setEditingUser(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <FormField
                  label="Họ tên"
                  id="edit-fullName"
                  value={editForm.fullName}
                  onChange={(v) => updateField('fullName', v)}
                  error={editErrors.fullName}
                  required
                />
                <FormField
                  label="Email"
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(v) => updateField('email', v)}
                  error={editErrors.email}
                  required
                />
                <FormField
                  label="Số điện thoại"
                  id="edit-phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(v) => updateField('phone', v)}
                  error={editErrors.phone}
                  required
                />
                <SelectField
                  label="Giới tính"
                  id="edit-gender"
                  value={editForm.gender}
                  onChange={(v) => updateField('gender', v)}
                  options={[
                    { value: 'MALE', label: 'Nam' },
                    { value: 'FEMALE', label: 'Nữ' },
                    { value: 'OTHER', label: 'Khác' },
                  ]}
                  error={editErrors.gender}
                  required
                />
                <FormField
                  label="Ngày sinh"
                  id="edit-dob"
                  type="date"
                  value={editForm.dob}
                  onChange={(v) => setEditForm((f) => ({ ...f, dob: v }))}
                />
                <div className="form-group full-width">
                  <label className="form-label" htmlFor="edit-address">Địa chỉ</label>
                  <input
                    id="edit-address"
                    type="text"
                    className="form-input"
                    placeholder="Nhập địa chỉ"
                    value={editForm.address}
                    onChange={(e) => setEditForm((f) => ({
                      ...f,
                      address: e.target.value
                    }))}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditingUser(null)} disabled={editLoading}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleEditSubmit} disabled={editLoading}>
                {editLoading && <span className="spinner" />}
                Lưu thay đổi
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
              ? 'Bệnh nhân sẽ không thể đăng nhập cho đến khi được kích hoạt lại.'
              : 'Bệnh nhân sẽ có thể đăng nhập và sử dụng hệ thống.'
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
