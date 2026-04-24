import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  title: 'Vaani — వాణి | AP Citizen Grievance Portal',
  description: 'File civic complaints in under 3 minutes. No Aadhaar needed. Free for every AP citizen of Andhra Pradesh.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
  openGraph: {
    title: 'Vaani — వాణి | AP Citizen Grievance Portal',
    description: 'File civic complaints in under 3 minutes. No Aadhaar needed. Free for every AP citizen.',
    url: 'https://vaani-ecru.vercel.app',
    siteName: 'Vaani',
    images: [
      {
        url: 'https://vaani-ecru.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vaani — AP Citizen Grievance Portal',
      }
    ],
    locale: 'te_IN',
    type: 'website',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="te">
      <body>
        {children}
      </body>
    </html>
  );
}