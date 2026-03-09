import type { Metadata } from 'next'
import { Playfair_Display, IBM_Plex_Mono, Manrope } from 'next/font/google'
import Providers from '@/components/Providers'
import SiteVoice from '@/components/SiteVoice'
import '@/styles/globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Harshita Shyale — Product Designer',
  description:
    'Product Designer based in Seattle, specializing in human-centered AI interfaces and systems.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${ibmPlexMono.variable} ${manrope.variable}`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:ital,wght@0,400;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Runs before any JS — prevents black flash on load */}
        <style>{`html,body{background-color:#c3bcaa}`}</style>
      </head>
      <body style={{ backgroundColor: '#c3bcaa' }}>
        <Providers>
          {children}
          <SiteVoice />
        </Providers>
      </body>
    </html>
  )
}
