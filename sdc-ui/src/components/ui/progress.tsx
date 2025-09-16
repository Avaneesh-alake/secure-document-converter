type Props = { value?: number; className?: string };
export function Progress({ value = 0, className = "" }: Props) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-neutral-200 ${className}`}>
      <div className="h-full bg-blue-600 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
