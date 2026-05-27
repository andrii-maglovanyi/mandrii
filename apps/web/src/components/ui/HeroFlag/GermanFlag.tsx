export type GermanFlagProps = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Renders the German flag (Bundesflagge) as an SVG.
 * Three equal horizontal stripes: black, red, and gold.
 * Can be used as a decorative background or icon throughout the app.
 *
 * @param {string} [props.className] - Optional CSS class for styling
 * @param {React.CSSProperties} [props.style] - Optional inline styles
 * @returns {JSX.Element} SVG element representing the German flag
 */
export const GermanFlag = ({ className, style }: GermanFlagProps) => {
  return (
    <svg
      aria-hidden="true"
      className={className}
      height="600"
      preserveAspectRatio="xMidYMid slice"
      style={style}
      viewBox="0 0 50 30"
      width="1000"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0,0h50v10h-50z" fill="#000000" />
      <path d="M0,10h50v10h-50z" fill="#DD0000" />
      <path d="M0,20h50v10h-50z" fill="#FFCE00" />
    </svg>
  );
};
