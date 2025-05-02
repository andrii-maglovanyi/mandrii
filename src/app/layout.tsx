export const metadata = {
  title: "Мандрій",
  description: 'Мандруй / Мрій / Дій"',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
