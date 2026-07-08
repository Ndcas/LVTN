import { X, AlertTriangle, Info } from 'lucide-react';

interface ConfirmModalProps {
  /** Tiêu đề modal */
  title: string;
  /** Thông điệp chính */
  message: string;
  /** Ghi chú phụ (optional) */
  subMessage?: string;
  /** Nhãn nút xác nhận */
  confirmLabel?: string;
  /** Nhãn nút hủy */
  cancelLabel?: string;
  /** Kiểu icon + nút: danger, warning, info */
  variant?: 'danger' | 'warning' | 'info';
  /** Đang loading */
  loading?: boolean;
  /** Callback khi xác nhận */
  onConfirm: () => void;
  /** Callback khi hủy/đóng */
  onClose: () => void;
}

/**
 * Modal xác nhận hành động nguy hiểm hoặc quan trọng.
 * Backdrop blur + slide-in animation.
 */
export default function ConfirmModal({
  title,
  message,
  subMessage,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const IconComponent = variant === 'info' ? Info : AlertTriangle;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className={`confirm-icon-wrapper ${variant}`}>
            <IconComponent size={24} />
          </div>
          <p className="confirm-message">{message}</p>
          {subMessage && <p className="confirm-sub">{subMessage}</p>}
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <span className="spinner" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
