import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { reviewedWords } from "@/lib/vocab";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/hoc", "/thu-vien", "/hoi-dap", "/tien-do", "/gioi-thieu", "/quy-dinh", "/rieng-tu", ...reviewedWords.map(word=>`/tu/${word.id}`)].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: "monthly",
    priority: path ? 0.5 : 1,
  }));
}
