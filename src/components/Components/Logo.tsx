interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-shox-500/20 to-accent-cyan/10 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3a7bff" />
            <stop offset="100%" stopColor="#00d4ff" />
          </linearGradient>
        </defs>
        <path
          d="M20 24 Q20 16 32 16 Q44 16 44 24 Q44 30 38 32 L26 36 Q20 38 20 44 Q20 48 26 48 L44 48"
          stroke="url(#logoGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="50" cy="18" r="3" fill="#00d4ff" />
      </svg>
    </div>
  );
}

export function LogoText({ size = 'text-xl' }: { size?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Logo size={36} />
      <div className="flex flex-col leading-none">
        <span className={`${size} font-extrabold tracking-tight`}>
          <span className="gradient-text">SHOX</span>
          <span className="text-white"> AI</span>
        </span>
        <span className="text-[10px] text-dark-400 font-medium tracking-widest uppercase mt-0.5">
          Sun'iy Intellekt
        </span>
      </div>
    </div>
  );
}
