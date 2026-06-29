export function FreshBadge({
  size = "lg",
  className = "",
}: {
  size?: "lg" | "sm";
  className?: string;
}) {
  const sizeClasses = size === "lg" ? "h-20 w-20 text-[9px]" : "h-12 w-12 text-[7px]";

  return (
    <div
      className={`flex items-center justify-center rounded-full border-2 border-green/70 font-mono font-semibold uppercase tracking-widest text-green ${sizeClasses} ${className}`}
      style={{ transform: "rotate(-12deg)" }}
    >
      <span className="text-center leading-tight">
        Fresh
        <br />
        Today
      </span>
    </div>
  );
}