import type { Metadata } from 'next';
import { Inter, PT_Sans } from 'next/font/google'; // Import PT_Sans
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Setup fonts using next/font
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'], // Specify weights you need
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'Gerbang Madrasah',
  description: 'Pendaftaran Peserta Didik Baru MI Roudlotut Tholibin Warukulon Tahun Pelajaran 2024/2025',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${ptSans.variable}`}>
      <head>
        {/* Google Font links are handled by next/font, so these can be removed if not used elsewhere or for other fonts */}
        {/* <link rel="preconnect" href="https://fonts.googleapis.com" /> */}
        {/* <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /> */}
        {/* <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" /> */}
        {/* <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" /> */}
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
