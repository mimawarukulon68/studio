import type { Metadata } from 'next';
import { Poppins } from 'next/font/google'; // Import Poppins
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Setup fonts using next/font
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Specify weights you need
  variable: '--font-poppins',
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
    <html lang="en" className={`${poppins.variable}`}>
      <head />
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
