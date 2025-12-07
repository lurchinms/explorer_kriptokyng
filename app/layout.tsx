import type { Metadata } from "next";
import { Whisper } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/config/Site";
import "./globals.css";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

const whisper = Whisper({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-windsong",
});

// Force dynamic rendering for all pages under this layout
export const dynamic = "force-dynamic";
// Disable caching for all pages under this layout
export const revalidate = 0;

// Default metadata that will be used if a page doesn't specify its own
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    template: `%s | ${siteConfig.name}`,
    default: `${siteConfig.tagline} | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add cache control meta tags */}
        <meta
          httpEquiv="Cache-Control"
          content="no-store, max-age=0, must-revalidate"
        />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body
        className={`antialiased min-h-screen flex flex-col font-sans ${whisper.variable}`}
      >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>
              <div className="w-full min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 w-full">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </Providers>
          </ThemeProvider>
      </body>
    </html>
  );
}
