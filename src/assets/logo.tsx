export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img src="/logo-white.svg" className="size-8" />
      <div className="relative hidden sm:block">
        <h1 className="font-semibold text-base sm:text-xl">
          Streaming Display
        </h1>
        <p className="absolute -bottom-2 right-2 sm:right-2.5 text-xs font-bold font-mono text-primary brightness-200">
          v2
        </p>
      </div>
    </div>
  );
}
