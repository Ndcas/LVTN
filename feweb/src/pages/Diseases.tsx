import { useState, useEffect, useCallback, useMemo } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { X } from 'lucide-react';
import Header from '../components/Layout/Header';
import DataTable, { type Column } from '../components/DataTable';
import FormField from '../components/FormField';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import type { Disease } from '../types';
import { fetchDiseases, createDisease, updateDisease } from '../lib/api';

export default function DiseasesPage() {
  // ── Dữ liệu ──
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Tìm kiếm + phân trang client-side ──
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // ── Modal tạo/sửa ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', diseaseCode: '', description: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  // ── Tải danh sách ──
  const loadDiseases = useCallback(async () => {
    setLoading(true);

    try {
      const data = await fetchDiseases();

      setDiseases(data || []);
    } catch {
      toast.error('Không thể tải danh sách bệnh lý');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDiseases();
  }, [loadDiseases]);

  // ── Lọc + phân trang client-side ──
  const filteredDiseases = useMemo(() => {
    if (!search.trim()) return diseases;

    const q = search.toLowerCase();

    return diseases.filter(d => d.name.toLowerCase().includes(q) || d.diseaseCode.toLowerCase().includes(q));
  }, [diseases, search]);
  const totalPages = Math.ceil(filteredDiseases.length / limit) || 1;
  const paginatedDiseases = useMemo(() => {
    const start = (page - 1) * limit;

    return filteredDiseases.slice(start, start + limit);
  }, [filteredDiseases, page]);

  // ── Guard page vượt biên ──
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
      diseaseCode: '',
      description: ''
    });

    setFormErrors({});

    setIsModalOpen(true);
  };

  // ── Mở modal sửa ──
  const openEdit = (disease: Disease) => {
    setEditingId(disease.id);

    setForm({
      name: disease.name,
      diseaseCode: disease.diseaseCode,
      description: disease.description || '',
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
      setFormErrors((e) => ({
        ...e,
        [field]: ''
      }));
    }
  };

  // ── Validate ──
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) {
      errs.name = 'Tên bệnh là bắt buộc';
    } else if (form.name.length > 255) {
      errs.name = 'Tên bệnh tối đa 255 ký tự';
    }

    if (!form.diseaseCode.trim()) {
      errs.diseaseCode = 'Mã ICD là bắt buộc';
    } else if (form.diseaseCode.length > 20) {
      errs.diseaseCode = 'Mã ICD tối đa 20 ký tự';
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
        await updateDisease(editingId, {
          name: form.name.trim(),
          diseaseCode: form.diseaseCode.trim(),
          description: form.description.trim() || undefined,
        });

        toast.success('Cập nhật bệnh lý thành công');
      } else {
        await createDisease({
          name: form.name.trim(),
          diseaseCode: form.diseaseCode.trim(),
          description: form.description.trim() || undefined,
        });

        toast.success('Thêm bệnh lý thành công');
      }

      setIsModalOpen(false);

      loadDiseases();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Columns ──
  const columns: Column<Disease>[] = [
    {
      key: 'diseaseCode',
      header: 'Mã ICD',
      render: (d) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'var(--primary)',
            background: 'var(--primary-light)',
            padding: '2px 8px',
            borderRadius: 4,
          }}
        >
          {d.diseaseCode}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'name',
      header: 'Tên bệnh',
      render: (d) => (
        <div style={{ fontWeight: 500, color: 'var(--neutral-900)' }}>{d.name}</div>
      ),
    },
    {
      key: 'description',
      header: 'Mô tả',
      render: (d) => (
        <div
          style={{
            maxWidth: 320,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'var(--neutral-400)',
            fontSize: '0.875rem',
          }}
          title={d.description || ''}
        >
          {d.description || '—'}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (d) => (d.createdAt ? dayjs(d.createdAt).format('DD/MM/YYYY') : '—'),
      width: '120px',
    },
    {
      key: 'actions',
      header: '',
      render: (d) => (
        <div className="cell-actions">
          <button className="action-btn edit" title="Chỉnh sửa" onClick={() => openEdit(d)}>
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
        title="Danh mục bệnh"
        subtitle="Quản lý danh mục bệnh lý ICD của phòng khám"
        action={{ label: '+ Thêm bệnh lý', onClick: openCreate }}
      />
      <div className="page-content">
        <div className="card">
          <DataTable<Disease>
            columns={columns}
            data={paginatedDiseases}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={filteredDiseases.length}
            limit={limit}
            onPageChange={setPage}
            rowKey={(d) => d.id}
            searchValue={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            searchPlaceholder="Tìm kiếm tên bệnh hoặc mã ICD..."
          />
        </div>
      </div>

      {/* ── Modal Thêm / Sửa ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !formLoading && setIsModalOpen(false)}>
          <div className="modal-container md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? 'Sửa bệnh lý' : 'Thêm bệnh lý mới'}
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
              <div className="form-grid">
                {/* Mã ICD */}
                <FormField
                  label="Mã ICD"
                  id="form-disease-code"
                  value={form.diseaseCode}
                  onChange={(v) => updateField('diseaseCode', v)}
                  error={formErrors.diseaseCode}
                  placeholder="VD: J00, B34.9..."
                  required
                />
                {/* Tên bệnh */}
                <FormField
                  label="Tên bệnh"
                  id="form-disease-name"
                  value={form.name}
                  onChange={(v) => updateField('name', v)}
                  error={formErrors.name}
                  placeholder="Nhập tên bệnh lý..."
                  required
                />
                {/* Mô tả */}
                <div className="form-group full-width">
                  <label className="form-label" htmlFor="form-disease-description">
                    Mô tả{' '}
                    <span style={{ color: 'var(--neutral-400)', fontWeight: 400, textTransform: 'none' }}>
                      (tùy chọn)
                    </span>
                  </label>
                  <textarea
                    id="form-disease-description"
                    className={`form-input${formErrors.description ? ' error' : ''}`}
                    rows={3}
                    placeholder="Mô tả ngắn về bệnh lý..."
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    disabled={formLoading}
                    style={{ resize: 'vertical' }}
                  />
                </div>
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
    </>
  );
}
