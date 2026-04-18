import './globals.css';

export const metadata = {
  title: 'Vaani — వాణి | AP Citizen Grievance Portal',
  description: 'File and track your complaints to the Andhra Pradesh government. ఆంధ్రప్రదేశ్ పౌర ఫిర్యాదు పోర్టల్.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
  openGraph: {
    title: 'Vaani — వాణి | AP Citizen Grievance Portal',
    description: 'File and track complaints to the Andhra Pradesh government.',
    images: ['/favicon.png'],
  },
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
