interface BadgeProps {
  children: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'red' | 'gray';
  dot?: boolean;
}

/**
 * Badge hiển thị trạng thái, tag.
 * @param color - Màu sắc: blue, green, orange, red, gray
 * @param dot - Hiển thị chấm tròn phía trước
 */
export default function Badge({ children, color, dot = true }: BadgeProps) {
  return (
    <span className={`badge ${color}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}
