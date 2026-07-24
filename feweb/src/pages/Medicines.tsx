import { useState, useEffect, useCallback, useMemo } from 'react';
import { Pencil, Plus, Lock, Unlock, X } from 'lucide-react';
import Header from '../components/Layout/Header';
import DataTable, { type Column } from '../components/DataTable';
import FormField from '../components/FormField';
import ConfirmModal from '../components/ConfirmModal';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';
import type { Medicine } from '../types';
import { fetchMedicines, createMedicine, updateMedicine, toggleMedicineActive } from '../lib/api';

export default function MedicinesPage() {
  // ── Dữ liệu ──
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Tìm kiếm + phân trang client-side ──
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // ── Modal tạo/sửa ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', unit: '', pricePerUnit: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  // ── Modal khóa/mở khóa ──
  const [toggleTarget, setToggleTarget] = useState<Medicine | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  // ── Tải danh sách ──
  const loadMedicines = useCallback(async () => {
    setLoading(true);

    try {
      const data = await fetchMedicines();

      setMedicines(data || []);
    } catch {
      toast.error('Không thể tải danh sách thuốc');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  // ── Lọc + phân trang client-side ──
  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchActive = filterActive ? m.isActive == filterActive : true;

      return matchSearch && matchActive;
    });
  }, [medicines, search, filterActive]);
  const totalPages = Math.ceil(filteredMedicines.length / limit) || 1;
  const paginatedMedicines = useMemo(() => {
    const start = (page - 1) * limit;

    return filteredMedicines.slice(start, start + limit);
  }, [filteredMedicines, page]);

  // Guard page vượt biên
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  // ── Mở modal tạo ──
  const openCreate = () => {
    setEditingId(null);

    setForm({
      name: '',
      unit: '',
      pricePerUnit: ''
    });

    setFormErrors({});

    setIsModalOpen(true);
  };

  // ── Mở modal sửa ──
  const openEdit = (medicine: Medicine) => {
    setEditingId(medicine.id);

    setForm({
      name: medicine.name,
      unit: medicine.unit,
      pricePerUnit: medicine.pricePerUnit.toString(),
    });

    setFormErrors({});

    setIsModalOpen(true);
  };

  // ── Cập nhật form field ──
  const updateField = (field: keyof typeof form, value: string) => {
    setForm((f) => ({
      ...f,
      [field]: value
    }));

    if (formErrors[field]) {
      setFormErrors(e => ({
        ...e,
        [field]: ''
      }));
    }
  };

  // ── Validate ──
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) {
      errs.name = 'Tên thuốc là bắt buộc';
    } else if (form.name.length > 150) {
      errs.name = 'Tên thuốc không được vượt quá 150 ký tự';
    }

    if (!form.unit.trim()) {
      errs.unit = 'Đơn vị tính là bắt buộc';
    } else if (form.unit.length > 30) {
      errs.unit = 'Đơn vị tính không được vượt quá 30 ký tự';
    }

    if (!form.pricePerUnit.trim()) {
      errs.pricePerUnit = 'Giá tiền là bắt buộc';
    } else {
      const price = Number(form.pricePerUnit);

      if (isNaN(price)) {
        errs.pricePerUnit = 'Giá tiền phải là số hợp lệ';
      } else if (price < 0) {
        errs.pricePerUnit = 'Giá tiền không được nhỏ hơn 0';
      }
    }

    setFormErrors(errs);

    return Object.keys(errs).length === 0;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setFormLoading(true);

    try {
      if (editingId) {
        await updateMedicine(editingId, {
          name: form.name.trim(),
          unit: form.unit.trim(),
          pricePerUnit: Number(form.pricePerUnit),
        });

        toast.success('Cập nhật thuốc thành công');
      } else {
        await createMedicine({
          name: form.name.trim(),
          unit: form.unit.trim(),
          pricePerUnit: Number(form.pricePerUnit),
        });

        toast.success('Thêm thuốc mới thành công');
      }

      setIsModalOpen(false);

      loadMedicines();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Toggle Active ──
  const handleToggleActive = async () => {
    if (!toggleTarget) return;

    setToggleLoading(true);

    try {
      const newStatus = toggleTarget.isActive === '1' ? '0' : '1';

      await toggleMedicineActive(toggleTarget.id, newStatus);

      toast.success(newStatus === '1' ? 'Mở khóa thuốc thành công' : 'Khóa thuốc thành công');

      setToggleTarget(null);

      loadMedicines();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setToggleLoading(false);
    }
  };

  // ── Format Price ──
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // ── Columns ──
  const columns: Column<Medicine>[] = [
    {
      key: 'name',
      header: 'Tên thuốc',
      render: (m) => (
        <div style={{ fontWeight: 500, color: 'var(--neutral-900)' }}>{m.name}</div>
      ),
    },
    {
      key: 'unit',
      header: 'Đơn vị tính',
      render: (m) => (
        <span style={{ color: 'var(--neutral-700)' }}>{m.unit}</span>
      ),
      width: '120px',
    },
    {
      key: 'pricePerUnit',
      header: 'Giá / đơn vị',
      render: (m) => (
        <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{formatPrice(m.pricePerUnit)}</span>
      ),
      width: '150px',
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      render: (m) => (
        <Badge color={m.isActive === '1' ? 'green' : 'red'}>
          {m.isActive === '1' ? 'Hoạt động' : 'Ngừng KD'}
        </Badge>
      ),
      width: '120px',
    },
    {
      key: 'actions',
      header: '',
      render: (m) => (
        <div className="cell-actions">
          <button className="action-btn edit" title="Chỉnh sửa" onClick={() => openEdit(m)}>
            <Pencil size={15} />
          </button>
          {m.isActive === '1' ? (
            <button
              className="action-btn danger"
              title="Khóa"
              onClick={() => setToggleTarget(m)}
            >
              <Lock size={15} />
            </button>
          ) : (
            <button
              className="action-btn success"
              title="Mở khóa"
              onClick={() => setToggleTarget(m)}
            >
              <Unlock size={15} />
            </button>
          )}
        </div>
      ),
      width: '90px',
    },
  ];

  return (
    <>
      <Header
        title="Kho thuốc"
        subtitle="Quản lý danh mục thuốc và vật tư y tế"
        action={{ label: '+ Thêm thuốc mới', onClick: openCreate }}
      />

      <div className="page-content">
        <div className="card">
          <DataTable<Medicine>
            columns={columns}
            data={paginatedMedicines}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={filteredMedicines.length}
            limit={limit}
            onPageChange={setPage}
            rowKey={(m) => m.id}
            searchValue={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            searchPlaceholder="Tìm kiếm tên thuốc..."
            filters={
              <select
                className="form-input"
                style={{ width: 180 }}
                value={filterActive}
                onChange={(e) => { setFilterActive(e.target.value); setPage(1); }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="1">Đang hoạt động</option>
                <option value="0">Đã ngừng KD</option>
              </select>
            }
          />
        </div>
      </div>

      {/* ── Modal Thêm / Sửa ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !formLoading && setIsModalOpen(false)}>
          <div className="modal-container sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? 'Sửa thông tin thuốc' : 'Thêm thuốc mới'}
              </h2>
              <button
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                disabled={formLoading}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FormField
                  label="Tên thuốc"
                  id="form-medicine-name"
                  value={form.name}
                  onChange={(v) => updateField('name', v)}
                  error={formErrors.name}
                  placeholder="Nhập tên thuốc..."
                  required
                />
                <FormField
                  label="Đơn vị tính"
                  id="form-medicine-unit"
                  value={form.unit}
                  onChange={(v) => updateField('unit', v)}
                  error={formErrors.unit}
                  placeholder="VD: Viên, Vỉ, Hộp..."
                  required
                />
                <FormField
                  label="Giá tiền (VNĐ)"
                  id="form-medicine-price"
                  type="number"
                  value={form.pricePerUnit}
                  onChange={(v) => updateField('pricePerUnit', v)}
                  error={formErrors.pricePerUnit}
                  placeholder="VD: 5000"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setIsModalOpen(false)}
                disabled={formLoading}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={formLoading}
              >
                {formLoading && <span className="spinner" />}
                <Plus size={14} />
                {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Toggle Active ── */}
      {toggleTarget && (
        <ConfirmModal
          title={toggleTarget.isActive === '1' ? 'Khóa thuốc' : 'Mở khóa thuốc'}
          message={
            toggleTarget.isActive === '1'
              ? `Bạn có chắc muốn ngừng kinh doanh thuốc "${toggleTarget.name}"?`
              : `Bạn có chắc muốn cho phép sử dụng lại thuốc "${toggleTarget.name}"?`
          }
          subMessage={
            toggleTarget.isActive === '1'
              ? 'Thuốc sẽ không xuất hiện trong danh sách kê đơn nữa.'
              : undefined
          }
          confirmLabel={toggleTarget.isActive === '1' ? 'Khóa' : 'Mở khóa'}
          variant={toggleTarget.isActive === '1' ? 'danger' : 'info'}
          loading={toggleLoading}
          onConfirm={handleToggleActive}
          onClose={() => setToggleTarget(null)}
        />
      )}
    </>
  );
}
