export type PolishFlagProps = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Renders the Polish flag (Flaga Rzeczypospolitej Polskiej) as an SVG.
 * Two equal horizontal stripes: white (top) and red (bottom).
 * Proportions: 5:8 (width:height ratio per Polish law).
 *
 * @param {string} [props.className] - Optional CSS class for styling
 * @param {React.CSSProperties} [props.style] - Optional inline styles
 * @returns {JSX.Element} SVG element representing the Polish flag
 */
export const PolishFlag = ({ className, style }: PolishFlagProps) => {
  return (
    <svg
      aria-hidden="true"
      className={className}
      height="500"
      preserveAspectRatio="xMidYMid slice"
      style={style}
      viewBox="0 0 80 50"
      width="800"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="80" height="25" y="0" fill="#FFFFFF" />
      <rect width="80" height="25" y="25" fill="#DC143C" />
    </svg>
  );
};
