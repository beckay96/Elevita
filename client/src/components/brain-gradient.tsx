export function GradientBrainIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73C13.6 6.07 14 6.7 14 7.5C14 8.33 13.67 9.08 13.11 9.58C13.67 10.08 14 10.83 14 11.67C14 12.5 13.6 13.23 13 13.57C13.6 13.91 14 14.56 14 15.3C14 16.4 13.1 17.3 12 17.3C11.26 17.3 10.61 16.9 10.27 16.3C9.93 16.9 9.28 17.3 8.54 17.3C7.44 17.3 6.54 16.4 6.54 15.3C6.54 14.56 6.94 13.91 7.54 13.57C6.94 13.23 6.54 12.5 6.54 11.67C6.54 10.83 6.87 10.08 7.43 9.58C6.87 9.08 6.54 8.33 6.54 7.5C6.54 6.7 6.94 6.07 7.54 5.73C6.94 5.39 6.54 4.74 6.54 4C6.54 2.9 7.44 2 8.54 2C9.28 2 9.93 2.4 10.27 3C10.61 2.4 11.26 2 12 2Z"
        fill="url(#brainGradient)"
      />
      <circle cx="9" cy="7" r="0.5" fill="white" opacity="0.8" />
      <circle cx="11.5" cy="8.5" r="0.5" fill="white" opacity="0.8" />
      <circle cx="8.5" cy="11" r="0.5" fill="white" opacity="0.8" />
      <circle cx="11" cy="12.5" r="0.5" fill="white" opacity="0.8" />
    </svg>
  );
}