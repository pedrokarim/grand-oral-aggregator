export function DesktopWallpaper() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Light mode background pattern */}
      <div
        className="absolute inset-0 dark:opacity-0"
        style={{
          backgroundColor: "#E1D7C2",
          backgroundImage: "url(/wallpaper/bg-light.png)",
          backgroundSize: "100px 100px",
          backgroundRepeat: "repeat",
        }}
      />
      {/* Dark mode background pattern */}
      <div
        className="absolute inset-0 opacity-0 dark:opacity-100"
        style={{
          backgroundColor: "#333733",
          backgroundImage: "url(/wallpaper/bg-dark.png)",
          backgroundSize: "200px 200px",
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}
