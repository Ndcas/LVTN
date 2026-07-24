import { useState, useEffect, useCallback, useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Header from '../components/Layout/Header';
import DataTable, { type Column } from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import FormField from '../components/FormField';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import type { Holiday } from '../types';
import { fetchHolidays, createHoliday, updateHoliday, deleteHoliday } from '../lib/api';

export default function HolidaysPage() {
  // ── State ──
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  // Create/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    holidayDate: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Holiday | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadHolidays = useCallback(async () => {
    setLoading(true);

    try {
      const data = await fetchHolidays();

      setHolidays(data || []);
    } catch {
      toast.error('Không thể tải danh sách ngày lễ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHolidays();
  }, [loadHolidays]);

  const filteredHolidays = useMemo(() => {
    let result = [...holidays];

    result.sort((a, b) => new Date(b.holidayDate).getTime() - new Date(a.holidayDate).getTime());

    if (search) {
      const lowerSearch = search.toLowerCase();

      result = result.filter(h => h.name.toLowerCase().includes(lowerSearch) || dayjs(h.holidayDate).format('DD/MM/YYYY').includes(lowerSearch));
    }

    return result;
  }, [holidays, search]);
  const paginatedHolidays = useMemo(() => {
    const start = (page - 1) * limit;

    return filteredHolidays.slice(start, start + limit);
  }, [filteredHolidays, page, limit]);
  const totalPages = Math.ceil(filteredHolidays.length / limit) || 1;

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const openCreate = () => {
    setEditingId(null);

    setForm({
      name: '',
      holidayDate: '',
      description: ''
    });

    setFormErrors({});

    setIsModalOpen(true);
  };

  const openEdit = (holiday: Holiday) => {
    setEditingId(holiday.id);

    setForm({
      name: holiday.name,
      holidayDate: holiday.holidayDate,
      description: holiday.description || '',
    });

    setFormErrors({});

    setIsModalOpen(true);
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm(f => ({ ...f, [field]: value }));

    if (formErrors[field]) {
      setFormErrors(e => ({ ...e, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) {
      errs.name = 'Tên ngày lễ là bắt buộc';
    } else if (form.name.length > 150) {
      errs.name = 'Tên ngày lễ không được vượt quá 150 ký tự';
    }

    if (!form.holidayDate) {
      errs.holidayDate = 'Ngày lễ là bắt buộc';
    }

    if (form.description.length > 255) {
      errs.description = 'Mô tả không được vượt quá 255 ký tự';
    }

    setFormErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setFormLoading(true);

    try {
      if (editingId) {
        await updateHoliday(editingId, {
          name: form.name,
          description: form.description || undefined
        });

        toast.success('Cập nhật thành công');
      } else {
        await createHoliday({
          name: form.name,
          holidayDate: form.holidayDate,
          description: form.description || undefined
        });

        toast.success('Thêm ngày lễ thành công');
      }

      setIsModalOpen(false);

      loadHolidays();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleteLoading(true);

    try {
      await deleteHoliday(deleteTarget.id);

      toast.success('Đã xóa ngày lễ');

      setDeleteTarget(null);

      loadHolidays();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Xóa thất bại');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Columns ──
  const columns: Column<Holiday>[] = [
    {
      key: 'name',
      header: 'Tên ngày lễ',
      render: (h) => <div className="font-medium text-neutral-900">{h.name}</div>,
    },
    {
      key: 'holidayDate',
      header: 'Ngày',
      render: (h) => dayjs(h.holidayDate).format('DD/MM/YYYY'),
      width: '150px',
    },
    {
      key: 'description',
      header: 'Mô tả',
      render: (h) => <div className="text-neutral-500">{h.description || '—'}</div>,
    },
    {
      key: 'actions',
      header: '',
      render: (h) => (
        <div className="cell-actions">
          <button
            className="action-btn edit"
            title="Chỉnh sửa"
            onClick={() => openEdit(h)}
          >
            <Pencil size={15} />
          </button>
          <button
            className="action-btn danger"
            title="Xóa"
            onClick={() => setDeleteTarget(h)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
      width: '100px',
    },
  ];

  return (
    <>
      <Header
        title="Quản lý ngày lễ"
        subtitle="Thiết lập các ngày nghỉ lễ của phòng khám"
        action={{
          label: '+ Thêm ngày lễ',
          onClick: openCreate,
        }}
      />
      <div className="page-content">
        <div className="card">
          <DataTable<Holiday>
            columns={columns}
            data={paginatedHolidays}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={filteredHolidays.length}
            limit={limit}
            onPageChange={setPage}
            searchValue={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            searchPlaceholder="Tìm kiếm tên ngày lễ..."
            rowKey={(h) => h.id}
          />
        </div>
      </div>

      {/* ── Modal Thêm/Sửa ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? 'Sửa ngày lễ' : 'Thêm ngày lễ mới'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <FormField
                  label="Tên ngày lễ"
                  id="form-name"
                  value={form.name}
                  onChange={(v) => updateField('name', v)}
                  error={formErrors.name}
                  required
                />
                <FormField
                  label="Ngày"
                  id="form-date"
                  type="date"
                  value={form.holidayDate}
                  onChange={(v) => updateField('holidayDate', v)}
                  error={formErrors.holidayDate}
                  required
                  disabled={editingId ? true : false}
                />
                <div className="form-group full-width">
                  <label className="form-label" htmlFor="form-description">Mô tả</label>
                  <textarea
                    id="form-description"
                    className={`form-input${formErrors.description ? ' error' : ''}`}
                    rows={3}
                    placeholder="Ghi chú thêm..."
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                  />
                  {formErrors.description && (
                    <span className="form-error" style={{ display: 'block', marginTop: '4px', fontSize: '0.875rem', color: 'var(--danger)' }}>{formErrors.description}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={formLoading}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={formLoading}>
                {formLoading && <span className="spinner" />}
                {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Xóa ── */}
      {deleteTarget && (
        <ConfirmModal
          title="Xóa ngày lễ"
          message={`Bạn có chắc muốn xóa ngày lễ "${deleteTarget.name}" (${dayjs(deleteTarget.holidayDate).format('DD/MM/YYYY')})?`}
          subMessage="Hành động này không thể hoàn tác."
          confirmLabel="Xóa"
          variant="danger"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
