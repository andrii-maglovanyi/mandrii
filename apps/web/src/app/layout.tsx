type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export const metadata = {
  description: "Мандруй / Мрій / Дій",
  title: "Мандрій",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
