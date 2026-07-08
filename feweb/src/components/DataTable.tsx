import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Skeleton from './Skeleton';

// ─────────────────────────────────────────────
// Column Definition
// ─────────────────────────────────────────────

export interface Column<T> {
  /** Unique key (thường là tên field) */
  key: string;
  /** Header label */
  header: string;
  /** Render cell content */
  render: (item: T) => React.ReactNode;
  /** Cho phép sort? */
  sortable?: boolean;
  /** CSS width */
  width?: string;
}

// ─────────────────────────────────────────────
// DataTable Props
// ─────────────────────────────────────────────

interface DataTableProps<T> {
  /** Cấu hình cột */
  columns: Column<T>[];
  /** Dữ liệu rows */
  data: T[];
  /** Đang loading? */
  loading?: boolean;
  /** Trang hiện tại (1-indexed) */
  page: number;
  /** Tổng trang */
  totalPages: number;
  /** Tổng bản ghi */
  total: number;
  /** Số bản ghi / trang */
  limit: number;
  /** Callback đổi trang */
  onPageChange: (page: number) => void;
  /** Search text */
  searchValue?: string;
  /** Callback đổi search */
  onSearchChange?: (value: string) => void;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Các filter controls phụ */
  filters?: React.ReactNode;
  /** Nút thêm / actions bên phải toolbar */
  actions?: React.ReactNode;
  /** Unique key cho mỗi row */
  rowKey: (item: T) => string | number;
}

/**
 * DataTable — bảng dữ liệu có phân trang, search, filter.
 * Server-side pagination: nhận data + total từ API.
 */
export default function DataTable<T>({
  columns,
  data,
  loading = false,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filters,
  actions,
  rowKey,
}: DataTableProps<T>) {
  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  /** Tạo danh sách nút trang hiển thị */
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    if (page > 3) {
      pages.push('...');
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          {onSearchChange && (
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="form-input"
                placeholder={searchPlaceholder}
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}
          {filters}
        </div>
        {actions && <div className="table-toolbar-right">{actions}</div>}
      </div>

      {/* ── Table ── */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: 0 }}>
                  <Skeleton rows={limit} columns={columns.length} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state" style={{ padding: '40px 20px' }}>
                    <p className="empty-state-text">Không tìm thấy dữ liệu</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={rowKey(item)}>
                  {columns.map((col) => (
                    <td key={col.key}>{col.render(item)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {total > 0 && (
        <div className="table-pagination">
          <span className="pagination-info">
            Hiển thị {startRecord}–{endRecord} / {total} bản ghi
          </span>
          <div className="pagination-buttons">
            <button
              className="pagination-btn"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="Trang trước"
            >
              <ChevronLeft size={14} />
            </button>
            {getPageNumbers().map((p, idx) =>
              p === '...' ? (
                <span key={`ellipsis-${idx}`} className="pagination-btn" style={{ cursor: 'default', border: 'none' }}>
                  …
                </span>
              ) : (
                <button
                  key={p}
                  className={`pagination-btn${p === page ? ' active' : ''}`}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </button>
              )
            )}
            <button
              className="pagination-btn"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label="Trang sau"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
