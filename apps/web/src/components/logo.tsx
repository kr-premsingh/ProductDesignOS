/** Bold "P" monogram with an accent dot — the ProductDesignOS mark. */
export function Logomark({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pdos-mark" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00E5FF" />
          <stop offset="1" stopColor="#FF4DA6" />
        </linearGradient>
      </defs>
      <path
        d="M6 3h8.5a5.5 5.5 0 0 1 0 11H10v7H6V3Zm4 4v7h4.5a3.5 3.5 0 0 0 0-7H10Z"
        fill="url(#pdos-mark)"
      />
      <circle cx="17.5" cy="17.5" r="2.5" fill="url(#pdos-mark)" />
    </svg>
  );
}
