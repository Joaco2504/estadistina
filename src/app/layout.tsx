import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cátedra de Estadística y SySO | I.E.S. de Belén",
  description: "Plataforma Didáctica de Estadística, Cálculo de la Probabilidad y Costos de la Seguridad. Tecnicatura Superior en Higiene, Seguridad y Control Ambiental - Industrial. Docente: Prof. Pacheco E. Joaquín.",
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
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#1E293B]">
        {children}
      </body>
    </html>
  );
}
