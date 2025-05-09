type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export const metadata = {
  description: "Мандруй / Мрій / Дій",
  title: "Мандрій",
};

console.log("t s est");

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <img hidden="true" />

      <a>Momo</a>
      <body>{children}</body>
    </html>
  );
}
