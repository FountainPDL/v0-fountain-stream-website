export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="relative w-24 h-24">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>

        {/* Middle rotating ring (slower) */}
        <div className="absolute inset-2 rounded-full border-3 border-transparent border-b-accent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>

        {/* Center emoji */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">🙂</span>
        </div>
      </div>
    </div>
  )
}
