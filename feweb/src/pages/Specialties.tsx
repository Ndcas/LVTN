import { useState, useEffect, useCallback, useMemo } from 'react';
import { Pencil } from 'lucide-react';
import { X } from 'lucide-react';
import Header from '../components/Layout/Header';
import DataTable, { type Column } from '../components/DataTable';
import FormField from '../components/FormField';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import type { Specialty } from '../types';
import { fetchSpecialties, createSpecialty, updateSpecialty } from '../lib/api';

export default function SpecialtiesPage() {
  // ── Dữ liệu ──
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Tìm kiếm + phân trang client-side ──
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // ── Modal tạo/sửa ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    defaultFee: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  // ── Tải danh sách ──
  const loadSpecialties = useCallback(async () => {
    setLoading(true);

    try {
      const data = await fetchSpecialties();

      setSpecialties(data || []);
    } catch {
      toast.error('Không thể tải danh sách chuyên khoa');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpecialties();
  }, [loadSpecialties]);

  // ── Lọc + phân trang client-side ──
  const filteredSpecialties = useMemo(() => {
    if (!search.trim()) {
      return specialties;
    }

    const q = search.toLowerCase();

    return specialties.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
  }, [specialties, search]);

  const totalPages = Math.ceil(filteredSpecialties.length / limit) || 1;
  const paginatedSpecialties = useMemo(() => {
    const start = (page - 1) * limit;

    return filteredSpecialties.slice(start, start + limit);
  }, [filteredSpecialties, page]);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setPage(1);
  }, [search]);

  // ── Mở modal ──
  const openCreate = () => {
    setEditingId(null);

    setForm({
      name: '',
      code: '',
      description: '',
      defaultFee: ''
    });

    setFormErrors({});

    setIsModalOpen(true);
  };

  const openEdit = (item: Specialty) => {
    setEditingId(item.id);

    setForm({
      name: item.name,
      code: item.code,
      description: item.description || '',
      defaultFee: item.defaultFee != null ? String(item.defaultFee) : '',
    });

    setFormErrors({});

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // ── Cập nhật field ──
  const updateField = (field: keyof typeof form, value: string) => {
    setForm(f => ({
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
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) {
      errs.name = 'Tên chuyên khoa là bắt buộc';
    } else if (form.name.length > 100) {
      errs.name = 'Tên không được vượt quá 100 ký tự';
    }

    if (!form.code.trim()) {
      errs.code = 'Mã chuyên khoa là bắt buộc';
    } else if (form.code.length > 20) {
      errs.code = 'Mã không được vượt quá 20 ký tự';
    }

    if (form.defaultFee != '' && (isNaN(Number(form.defaultFee)) || Number(form.defaultFee) < 0)) {
      errs.defaultFee = 'Phí khám phải là số không âm';
    }

    setFormErrors(errs);

    return Object.keys(errs).length == 0;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setFormLoading(true);

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || undefined,
      defaultFee: form.defaultFee !== '' ? Number(form.defaultFee) : undefined,
    };

    try {
      if (editingId != null) {
        await updateSpecialty(editingId, payload);

        toast.success('Cập nhật chuyên khoa thành công');
      } else {
        await createSpecialty(payload as {
          name: string;
          code: string;
          description?: string;
          defaultFee?: number
        });

        toast.success('Tạo chuyên khoa thành công');
      }

      closeModal();

      loadSpecialties();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Columns ──
  const columns: Column<Specialty>[] = [
    {
      key: 'name',
      header: 'Tên chuyên khoa',
      render: (s) => (
        <div>
          <div className="cell-main">{s.name}</div>
          {s.description && <div className="cell-sub">{s.description}</div>}
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Mã',
      render: (s) => (
        <span className="badge badge-blue">{s.code}</span>
      ),
      width: '130px',
    },
    {
      key: 'defaultFee',
      header: 'Phí khám',
      render: (s) =>
        s.defaultFee != null
          ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.defaultFee)
          : '—',
      width: '150px',
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (s) => dayjs(s.createdAt).format('DD/MM/YYYY'),
      width: '120px',
    },
    {
      key: 'actions',
      header: '',
      render: (s) => (
        <div className="cell-actions">
          <button
            className="action-btn edit"
            title="Chỉnh sửa"
            onClick={() => openEdit(s)}
          >
            <Pencil size={15} />
          </button>
        </div>
      ),
      width: '70px',
    },
  ];

  return (
    <>
      <Header
        title="Quản lý chuyên khoa"
        subtitle="Danh mục các chuyên khoa trong phòng khám"
        action={{ label: '+ Thêm chuyên khoa', onClick: openCreate }}
      />

      <div className="page-content">
        <div className="card">
          <DataTable<Specialty>
            columns={columns}
            data={paginatedSpecialties}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={filteredSpecialties.length}
            limit={limit}
            onPageChange={setPage}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Tìm theo tên, mã chuyên khoa..."
            rowKey={(s) => s.id}
          />
        </div>
      </div>

      {/* ── Modal tạo / sửa ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId != null ? 'Chỉnh sửa chuyên khoa' : 'Thêm chuyên khoa mới'}
              </h2>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <FormField
                  label="Tên chuyên khoa"
                  id="specialty-name"
                  value={form.name}
                  onChange={(v) => updateField('name', v)}
                  error={formErrors.name}
                  placeholder="Ví dụ: Nội khoa tổng quát"
                  required
                />
                <FormField
                  label="Mã chuyên khoa"
                  id="specialty-code"
                  value={form.code}
                  onChange={(v) => updateField('code', v)}
                  error={formErrors.code}
                  placeholder="Ví dụ: NOI_KHOA"
                  required
                />
                <FormField
                  label="Phí khám mặc định (VNĐ)"
                  id="specialty-fee"
                  type="number"
                  value={form.defaultFee}
                  onChange={(v) => updateField('defaultFee', v)}
                  error={formErrors.defaultFee}
                  placeholder="Ví dụ: 150000"
                />
                <div className="form-group full-width">
                  <label className="form-label" htmlFor="specialty-description">
                    Mô tả
                  </label>
                  <input
                    id="specialty-description"
                    type="text"
                    className="form-input"
                    placeholder="Mô tả ngắn về chuyên khoa"
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal} disabled={formLoading}>
                Hủy
              </button>
              <button
                className="btn btn-primary"
                id="btn-submit-specialty"
                onClick={handleSubmit}
                disabled={formLoading}
              >
                {formLoading && <span className="spinner" />}
                {editingId != null ? 'Lưu thay đổi' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
