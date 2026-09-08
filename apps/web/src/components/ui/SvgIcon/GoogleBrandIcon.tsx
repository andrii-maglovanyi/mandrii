type GoogleBrandIconProps = {
  className?: string;
  size?: number;
};

/** Google's multicolour mark for authentication entry points. */
export const GoogleBrandIcon = ({ className, size = 24 }: Readonly<GoogleBrandIconProps>) => (
  <svg aria-hidden="true" className={className} focusable="false" height={size} viewBox="0 0 48 48" width={size}>
    <path
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.39 30.45 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.77 9.5 24 9.5Z"
      fill="#EA4335"
    />
    <path
      d="M46.98 24.55c0-1.64-.15-3.22-.42-4.73H24v8.95h12.91c-.56 2.88-2.18 5.32-4.65 6.97l7.11 5.52C43.53 37.4 46.98 31.49 46.98 24.55Z"
      fill="#4285F4"
    />
    <path
      d="M10.53 28.59A14.4 14.4 0 0 1 9.78 24c0-1.61.28-3.15.75-4.59l-7.98-6.19A24 24 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z"
      fill="#FBBC05"
    />
    <path
      d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.11-5.52c-1.97 1.32-4.5 2.1-7.79 2.1-6.23 0-11.57-4.22-13.47-9.89l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      fill="#34A853"
    />
  </svg>
);
