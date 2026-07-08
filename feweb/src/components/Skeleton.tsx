interface SkeletonProps {
  rows?: number;
  columns?: number;
}

/**
 * Skeleton loading dạng bảng — shimmer animation.
 * @param rows - Số hàng giả
 * @param columns - Số cột giả mỗi hàng
 */
export default function Skeleton({ rows = 5, columns = 5 }: SkeletonProps) {
  const widths = ['30%', '20%', '25%', '15%', '10%', '18%', '22%', '12%'];

  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div className="skeleton-row" key={rowIdx}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="skeleton skeleton-cell"
              style={{
                width: widths[(rowIdx + colIdx) % widths.length],
                flex: 1,
              }}
            />
          ))}
        </div>
      ))}
    </>
  );
}
