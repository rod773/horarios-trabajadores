export const siteConfig = {
  name: "Horarios",
  shortName: "Horarios",
  description: "Aplicación de gestión de horarios y turnos para equipos de trabajo.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
    "https://horarios.example.com",
  locale: "es_ES",
  ogImage: "/logo.svg",
  keywords: [
    "gestión de horarios",
    "turnos",
    "planificación de equipos",
    "horarios de trabajadores",
    "calendario laboral",
  ],
} as const;

export const publicRoutes = {
  login: "/login",
} as const;

export function noindexMetadata(title: string, description?: string) {
  return {
    title,
    ...(description ? { description } : {}),
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        "max-image-preview": "none" as const,
        "max-snippet": 0,
      },
    },
  };
}
