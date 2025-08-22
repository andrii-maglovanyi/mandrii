"use client";

import Image from "next/image";

import { useTheme } from "~/contexts/ThemeContext";

export const Avatar = () => {
  const { isDark } = useTheme();

  const src = isDark ? "/static/mandrii-dark.png" : "/static/mandrii.png";

  return <Image alt="Mandrii" height={100} src={src} width={100} />;
};
