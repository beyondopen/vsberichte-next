import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Archivo } from "next/font/google";
import "./globals.css";

const sourceSerif4 = Source_Serif_4({
  variable: "--font-source-serif-4",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// Logo- und Headline-Schrift (Variable Font: alle Gewichte fuer
// font-bold-Headlines + font-extrabold-Wortmarke).
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Verfassungsschutzberichte.de",
  description:
    "Alle Verfassungsschutzberichte des Bundes und der Laender: gesammelt, durchsuchbar und analysiert.",
  metadataBase: new URL("https://verfassungsschutzberichte.de"),
  openGraph: {
    type: "website",
    siteName: "Verfassungsschutzberichte.de",
    title: "Verfassungsschutzberichte.de",
    description:
      "Alle Verfassungsschutzberichte des Bundes und der Laender: gesammelt, durchsuchbar und analysiert.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${sourceSerif4.variable} ${archivo.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var s=localStorage.getItem('dark-mode');if(s==='true'||(s===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){d.classList.add('dark')}else{d.classList.remove('dark')}}catch(e){}})();`,
          }}
        />
        {process.env.ANALYTICS_ENABLED === "true" && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `var _paq=window._paq=window._paq||[];_paq.push(["trackPageView"]);_paq.push(["enableLinkTracking"]);(function(){var u="https://matomo.daten.cool/";_paq.push(["setTrackerUrl",u+"matomo.php"]);_paq.push(["setSiteId","3"]);var d=document,g=d.createElement("script"),s=d.getElementsByTagName("script")[0];g.async=true;g.src=u+"matomo.js";s.parentNode.insertBefore(g,s)})();`,
              }}
            />
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://matomo.daten.cool/matomo.php?idsite=3&amp;rec=1"
                style={{ border: 0 }}
                alt=""
              />
            </noscript>
          </>
        )}
      </head>
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
