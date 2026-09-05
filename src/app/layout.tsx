import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cátedra de Estadística y SySO | I.E.S. de Belén",
  description: "Plataforma Didáctica de Estadística, Cálculo de la Probabilidad y Costos de la Seguridad. Tecnicatura Superior en Higiene, Seguridad y Control Ambiental - Industrial. Docente: Prof. Pacheco E. Joaquín.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
  keywords: [
    "Estadística",
    "Higiene y Seguridad",
    "I.E.S. Belén",
    "Tablas de Frecuencias",
    "Regla de la Raíz",
    "Costos de la Seguridad",
    "Prof. Pacheco Joaquín",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('ies-belen-theme');
                if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] dark:bg-[#080D1A] text-[#1E293B] dark:text-slate-100 transition-colors duration-150">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

