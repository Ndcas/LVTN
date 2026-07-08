interface FormFieldProps {
  /** Nhãn trường */
  label: string;
  /** HTML id cho input */
  id: string;
  /** Loại input */
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel';
  /** Placeholder */
  placeholder?: string;
  /** Giá trị hiện tại */
  value: string | number;
  /** Callback khi thay đổi */
  onChange: (value: string) => void;
  /** Thông báo lỗi */
  error?: string;
  /** Bắt buộc? */
  required?: boolean;
  /** Disabled? */
  disabled?: boolean;
}

/**
 * Wrapper cho form input (text, email, number, date...).
 * Tự quản lý label, error state, required indicator.
 */
export default function FormField({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
}: FormFieldProps) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
        {required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
      </label>
      <input
        id={id}
        type={type}
        className={`form-input${error ? ' error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

// ─── SelectField ───

interface SelectFieldProps {
  label: string;
  id: string;
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Select dropdown cho form (chuyên khoa, bằng cấp, giới tính...).
 */
export function SelectField({
  label,
  id,
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  error,
  required = false,
  disabled = false,
}: SelectFieldProps) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
        {required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
      </label>
      <select
        id={id}
        className={`form-select${error ? ' error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

// ─── TextareaField ───

interface TextareaFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

/**
 * Textarea cho form (tiểu sử bác sĩ, mô tả...).
 */
export function TextareaField({
  label,
  id,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 3,
}: TextareaFieldProps) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
        {required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
      </label>
      <textarea
        id={id}
        className={`form-textarea${error ? ' error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={rows}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
