import { useState, useEffect, useCallback } from 'react';
import { MailOpen, Mail, X } from 'lucide-react';
import Header from '../components/Layout/Header';
import DataTable, { type Column } from '../components/DataTable';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import type { Feedback } from '../types';
import { fetchFeedbacks, markFeedbackAsRead, fetchFeedbackById } from '../lib/api';

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filterIsRead, setFilterIsRead] = useState<string>('');
  const limit = 10;
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const loadFeedbacks = useCallback(async () => {
    setLoading(true);

    try {
      const data = await fetchFeedbacks({
        page,
        limit,
        isRead: filterIsRead ? (filterIsRead as '0' | '1') : undefined,
      });

      setFeedbacks(data.data || []);

      setTotal(data.total || 0);

      setTotalPages(Math.ceil((data.total || 0) / limit) || 1);
    } catch {
      toast.error('Không thể tải danh sách góp ý');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterIsRead]);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);
  const handleViewDetails = async (feedback: Feedback) => {
    setDetailLoadingId(feedback.id);

    try {
      const detailedFeedback = await fetchFeedbackById(feedback.id);

      setSelectedFeedback(detailedFeedback);

      if (feedback.isRead === '0') {
        await markFeedbackAsRead(feedback.id);

        setFeedbacks(prev => prev.map((f) => (f.id === feedback.id ? {
          ...f,
          isRead: '1'
        } : f)));
      }
    } catch {
      toast.error('Không thể tải chi tiết góp ý');
    } finally {
      setDetailLoadingId(null);
    }
  };

  const closeDetails = () => {
    setSelectedFeedback(null);
  };

  const columns: Column<Feedback>[] = [
    {
      header: 'Tiêu đề',
      key: 'title',
      render: (item) => (
        <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--neutral-700)' }} title={item.title}>
          {item.title}
        </div>
      ),
    },
    {
      header: 'Trạng thái',
      key: 'isRead',
      width: '150px',
      render: (item) =>
        item.isRead === '1' ? (
          <Badge color="green" dot={false}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MailOpen size={14} /> Đã đọc
            </span>
          </Badge>
        ) : (
          <Badge color="orange" dot={false}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={14} /> Chưa đọc
            </span>
          </Badge>
        ),
    },
    {
      header: 'Ngày gửi',
      key: 'createdAt',
      width: '160px',
      render: (item) => (item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY HH:mm') : '—'),
    },
    {
      header: '',
      key: 'actions',
      width: '100px',
      render: (item) => (
        <div className="cell-actions">
          <button
            className="action-btn"
            title="Xem chi tiết"
            onClick={() => handleViewDetails(item)}
            disabled={detailLoadingId === item.id}
            style={{ fontSize: '0.75rem', padding: '4px 8px', whiteSpace: 'nowrap' }}
          >
            {detailLoadingId === item.id ? 'Đang tải...' : 'Chi tiết'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header
        title="Hòm thư góp ý"
        subtitle="Xem và quản lý các phản hồi, góp ý từ người dùng."
      />

      <div className="page-content">
        <div className="card">
          <DataTable
            columns={columns}
            data={feedbacks}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={setPage}
            filters={
              <select
                className="filter-select"
                value={filterIsRead}
                onChange={(e) => {
                  setFilterIsRead(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="0">Chưa đọc</option>
                <option value="1">Đã đọc</option>
              </select>
            }
            rowKey={(item) => item.id}
          />
        </div>
      </div>

      {selectedFeedback && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-container sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Chi tiết góp ý</h2>
              <button className="modal-close-btn" onClick={closeDetails}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="table-avatar" style={{ width: 44, height: 44, fontSize: '1rem', flexShrink: 0 }}>
                  {selectedFeedback.userName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '0.9375rem' }}>{selectedFeedback.userName || `Người dùng #${selectedFeedback.userId}`}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--neutral-400)', marginTop: 2 }}>Gửi lúc: {selectedFeedback.createdAt ? dayjs(selectedFeedback.createdAt).format('DD/MM/YYYY HH:mm') : '—'}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                <FeedbackDetailRow label="Tiêu đề" value={selectedFeedback.title} />
              </div>
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--neutral-400)' }}>Nội dung</span>
                <p style={{ marginTop: 6, fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--neutral-700)', whiteSpace: 'pre-line', background: 'var(--neutral-50)', border: '1px solid var(--neutral-200)', borderRadius: 8, padding: '10px 14px' }}>
                  {selectedFeedback.content}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeDetails}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FeedbackDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--neutral-400)' }}>{label}</span>
      <span style={{ fontSize: '0.9375rem', color: 'var(--neutral-900)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
