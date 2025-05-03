type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export const metadata = {
  title: "Мандрій",
  description: 'Мандруй / Мрій / Дій"',
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
