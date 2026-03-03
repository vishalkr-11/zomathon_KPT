import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'KPT Signal Hub',
  description: 'Zomato Kitchen Intelligence',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin:0, padding:0, background:'#0D0D0D' }}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}