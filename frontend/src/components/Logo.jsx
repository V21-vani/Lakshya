export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xl font-bold tracking-tight text-ink ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-base text-white">L</span>
      Lakshya
    </span>
  );
}
