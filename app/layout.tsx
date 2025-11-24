import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FacebookPixel } from "@/components/facebook-pixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DigiWolf - Digital Agency",
  description: "Transform your digital presence with cutting-edge solutions. Media buying, web development, and marketing services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

  return (
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var path = window.location.pathname;
                var locale = 'en';
                var dir = 'ltr';
                if (path.startsWith('/ar')) {
                  locale = 'ar';
                  dir = 'rtl';
                } else if (path.startsWith('/fr')) {
                  locale = 'fr';
                }
                var html = document.documentElement;
                html.setAttribute('lang', locale);
                html.setAttribute('dir', dir);
                if (dir === 'rtl') {
                  html.classList.add('rtl');
                } else {
                  html.classList.remove('rtl');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {pixelId && <FacebookPixel pixelId={pixelId} />}
        {children}
      </body>
    </html>
  );
}
