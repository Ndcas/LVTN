import { useState, useEffect, useCallback, useMemo } from 'react';
import { Pencil } from 'lucide-react';
import { X } from 'lucide-react';
import Header from '../components/Layout/Header';
import DataTable, { type Column } from '../components/DataTable';
import FormField from '../components/FormField';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import type { Degree } from '../types';
import { fetchDegrees, createDegree, updateDegree } from '../lib/api';

export default function DegreesPage() {
  // ── Dữ liệu ──
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Tìm kiếm + phân trang client-side ──
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // ── Modal tạo/sửa ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  // ── Tải danh sách ──
  const loadDegrees = useCallback(async () => {
    setLoading(true);

    try {
      const data = await fetchDegrees();

      setDegrees(data || []);
    } catch {
      toast.error('Không thể tải danh sách bằng cấp');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDegrees();
  }, [loadDegrees]);

  // ── Lọc + phân trang client-side ──
  const filteredDegrees = useMemo(() => {
    if (!search.trim()) {
      return degrees;
    }

    const q = search.toLowerCase();

    return degrees.filter(d => d.name.toLowerCase().includes(q));
  }, [degrees, search]);

  const totalPages = Math.ceil(filteredDegrees.length / limit) || 1;
  const paginatedDegrees = useMemo(() => {
    const start = (page - 1) * limit;

    return filteredDegrees.slice(start, start + limit);
  }, [filteredDegrees, page]);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setPage(1);
  }, [search]);

  // ── Mở modal ──
  const openCreate = () => {
    setEditingId(null);

    setForm({
      name: '',
      description: ''
    });

    setFormErrors({});

    setIsModalOpen(true);
  };

  const openEdit = (item: Degree) => {
    setEditingId(item.id);

    setForm({
      name: item.name,
      description: item.description || '',
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
      errs.name = 'Tên bằng cấp là bắt buộc';
    } else if (form.name.length > 100) {
      errs.name = 'Tên không được vượt quá 100 ký tự';
    }

    setFormErrors(errs);

    return Object.keys(errs).length === 0;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validate()) return;

    setFormLoading(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    };

    try {
      if (editingId != null) {
        await updateDegree(editingId, payload);

        toast.success('Cập nhật bằng cấp thành công');
      } else {
        await createDegree(payload as {
          name: string;
          description?: string
        });

        toast.success('Tạo bằng cấp thành công');
      }

      closeModal();

      loadDegrees();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Columns ──
  const columns: Column<Degree>[] = [
    {
      key: 'name',
      header: 'Tên bằng cấp',
      render: (d) => (
        <div>
          <div className="cell-main">{d.name}</div>
          {d.description && <div className="cell-sub">{d.description}</div>}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (d) => dayjs(d.createdAt).format('DD/MM/YYYY'),
      width: '120px',
    },
    {
      key: 'actions',
      header: '',
      render: (d) => (
        <div className="cell-actions">
          <button
            className="action-btn edit"
            title="Chỉnh sửa"
            onClick={() => openEdit(d)}
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
        title="Quản lý bằng cấp"
        subtitle="Danh mục bằng cấp của bác sĩ trong hệ thống"
        action={{ label: '+ Thêm bằng cấp', onClick: openCreate }}
      />

      <div className="page-content">
        <div className="card">
          <DataTable<Degree>
            columns={columns}
            data={paginatedDegrees}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={filteredDegrees.length}
            limit={limit}
            onPageChange={setPage}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Tìm theo tên bằng cấp..."
            rowKey={(d) => d.id}
          />
        </div>
      </div>

      {/* ── Modal tạo / sửa ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId != null ? 'Chỉnh sửa bằng cấp' : 'Thêm bằng cấp mới'}
              </h2>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <FormField
                    label="Tên bằng cấp"
                    id="degree-name"
                    value={form.name}
                    onChange={(v) => updateField('name', v)}
                    error={formErrors.name}
                    placeholder="Ví dụ: Tiến sĩ Y khoa"
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label" htmlFor="degree-description">
                    Mô tả
                  </label>
                  <input
                    id="degree-description"
                    type="text"
                    className="form-input"
                    placeholder="Mô tả ngắn về bằng cấp"
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
                id="btn-submit-degree"
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
