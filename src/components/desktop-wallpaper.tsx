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
      {/* Iconic illustration */}
      <div className="absolute bottom-4 right-4 md:bottom-12 md:right-12 select-none pointer-events-none">
        <img
          src="/wallpaper/iconic-background.png"
          alt=""
          className="w-[250px] md:w-[450px] h-auto opacity-90"
          draggable={false}
        />
      </div>
    </div>
  );
}
