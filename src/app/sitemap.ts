import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://peelpartyco.co.uk";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/shop/stickers`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/shop/mugs`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/shop/keyrings`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/custom-order`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
