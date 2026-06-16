/** Icône PNG d'un widget (même style rétro que le bureau). */
export function WidgetIcon({
  src,
  size = "sm",
  className = "",
}: {
  src: string;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const sizeClass =
    size === "xs" ? "w-3.5 h-3.5" : size === "md" ? "w-8 h-8" : "w-4 h-4";
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={`${sizeClass} shrink-0 object-contain ${className}`}
    />
  );
}
