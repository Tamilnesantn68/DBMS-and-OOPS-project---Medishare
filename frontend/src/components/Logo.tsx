interface LogoProps {
  size?: number
  variant?: 'full' | 'icon' | 'header'
  className?: string
}

export default function Logo({ size = 40, variant = 'full', className = '' }: LogoProps) {
  const iconSize = variant === 'header' ? 32 : size

  const LogoIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Background rounded square */}
      <rect width="48" height="48" rx="12" fill="url(#logoGrad)" />

      {/* Cross / Plus shape — medicine symbol */}
      <rect x="20" y="10" width="8" height="28" rx="3" fill="white" fillOpacity="0.95" />
      <rect x="10" y="20" width="28" height="8" rx="3" fill="white" fillOpacity="0.95" />

      {/* Circular arrows — redistribution / sharing */}
      <path
        d="M15.5 13.5C15.5 13.5 12 16.5 12 20"
        stroke="white"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M13 12L15.5 13.5L14 16"
        stroke="white"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32.5 34.5C32.5 34.5 36 31.5 36 28"
        stroke="white"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M35 36L32.5 34.5L34 32"
        stroke="white"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Small pulse dot — life indicator */}
      <circle cx="24" cy="24" r="2.5" fill="#62df7d" />
      <circle cx="24" cy="24" r="2.5" fill="#62df7d" className="animate-pulse-soft" />

      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f766e" />
          <stop offset="1" stopColor="#005c55" />
        </linearGradient>
      </defs>
    </svg>
  )

  if (variant === 'icon') {
    return <LogoIcon />
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon />
      {variant === 'full' && (
        <div className="flex flex-col">
          <span
            className="font-bold tracking-tight text-[var(--color-primary)]"
            style={{ fontSize: size * 0.55, lineHeight: 1.1 }}
          >
            MediShare
          </span>
          <span
            className="text-[var(--color-outline)] tracking-wide"
            style={{ fontSize: size * 0.25, lineHeight: 1.2 }}
          >
            Give Medicines a Second Chance
          </span>
        </div>
      )}
      {variant === 'header' && (
        <div className="flex flex-col">
          <span className="text-headline-md text-[var(--color-primary)] tracking-tight font-bold leading-none">
            MediShare
          </span>
          <span className="text-[11px] text-[var(--color-outline)] leading-none mt-0.5">
            Clinical Logistics
          </span>
        </div>
      )}
    </div>
  )
}
