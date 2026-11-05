import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every retired address keeps working. Query strings are passed through, so
  // /politicos?party=PP lands on /personas?party=PP.
  async redirects() {
    return [
      // The 2026-11 redesign: the prototype at /nuevo became the site.
      { source: "/:locale/nuevo", destination: "/:locale", permanent: true },
      { source: "/:locale/nuevo/:path*", destination: "/:locale/:path*", permanent: true },
      { source: "/:locale/party/:nif", destination: "/:locale/partido/:nif", permanent: true },
      { source: "/:locale/donde/:provincia", destination: "/:locale/territorio/:provincia", permanent: true },
      {
        source: "/:locale/politicos/declaraciones",
        destination: "/:locale/personas?kind=declarations",
        permanent: true,
      },
      { source: "/:locale/politicos", destination: "/:locale/personas", permanent: true },
      // Merged into other pages: the votes into the topics, the map into the
      // territories, the organisations' feed into the LGTBI topic.
      { source: "/:locale/votaciones", destination: "/:locale/temas", permanent: true },
      { source: "/:locale/mapa", destination: "/:locale/territorios", permanent: true },
      { source: "/:locale/derechos", destination: "/:locale/tema/lgtbi", permanent: true },
      // Older merges, into what was /politicos.
      { source: "/:locale/sueldos", destination: "/:locale/personas", permanent: true },
      { source: "/:locale/caras", destination: "/:locale/personas", permanent: true },
      { source: "/:locale/politician/:slug", destination: "/:locale/personas", permanent: true },
    ];
  },
  images: {
    // Portraits come from Wikimedia Commons (see scripts/fetch-photos.mjs).
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
    ],
  },
};

export default nextConfig;
