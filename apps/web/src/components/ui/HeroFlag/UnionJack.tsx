import { useId } from "react";

export type UnionJackProps = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Renders the Union Jack (UK flag) as an SVG.
 * Can be used as a decorative background or icon throughout the app.
 *
 * @param {string} [props.className] - Optional CSS class for styling
 * @param {React.CSSProperties} [props.style] - Optional inline styles
 * @returns {JSX.Element} SVG element representing the Union Jack
 */
export const UnionJack = ({ className, style }: UnionJackProps) => {
  const clipId = useId();
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
      <clipPath id={clipId}>
        <path d="M25,15h25v15zv15h-25zh-25v-15zv-15h25z" />
      </clipPath>
      <path d="M0,0v30h50v-30z" fill="#012169" />
      <path d="M0,0 50,30M50,0 0,30" stroke="#fff" strokeWidth="6" />
      <path clipPath={`url(#${clipId})`} d="M0,0 50,30M50,0 0,30" stroke="#C8102E" strokeWidth="4" />
      <path d="M-1 11h22v-12h8v12h22v8h-22v12h-8v-12h-22z" fill="#C8102E" stroke="#FFF" strokeWidth="2" />
    </svg>
  );
};
