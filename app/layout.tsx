import "./globals.css";

export const metadata = {
  title: "투자로 만나는 미래 진로",
  description: "진로 투자 대결 사이트",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}