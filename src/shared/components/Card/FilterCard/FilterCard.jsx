import { cn } from '../../../../lib/utils';

/**
 * Shared FilterCard - Sử dụng làm khung bao (wrapper) cho các bộ lọc phức tạp
 * Chuẩn hóa theo semantic card tokens và Tailwind utilities.
 */
export default function FilterCard({ children, className = '' }) {
  return (
    <div className={cn('w-full rounded-card border border-border bg-surface p-4 shadow-card', className)}>
      {children}
    </div>
  );
}
