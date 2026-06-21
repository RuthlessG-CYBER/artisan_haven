import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Providers } from '@/lib/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BUSINESS_NAME, BUSINESS_DESCRIPTION } from '@/lib/constants';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: {
    default: `${BUSINESS_NAME} | Handcrafted with Love`,
    template: `%s | ${BUSINESS_NAME}`,
  },
  description: BUSINESS_DESCRIPTION,
  keywords: ['handmade', 'artisan', 'sustainable', 'eco-friendly', 'custom cakes', 'healthy food', 'recycled art'],
  authors: [{ name: BUSINESS_NAME }],
  creator: BUSINESS_NAME,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://artisanhaven.com',
    siteName: BUSINESS_NAME,
    title: `${BUSINESS_NAME} | Handcrafted with Love`,
    description: BUSINESS_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: BUSINESS_NAME,
    description: BUSINESS_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-[4.5rem]">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
