import type { MetadataRoute } from 'next'
import { getIndex } from '@/lib/queries/documents'
import { jurisdictionToSlug } from '@/lib/jurisdictions'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://verfassungsschutzberichte.de'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/berichte`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/suche`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/trends`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/regional`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/news`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/impressum`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Add all document pages
  const { index } = await getIndex()
  const documentRoutes: MetadataRoute.Sitemap = []
  for (const entry of index) {
    const slug = jurisdictionToSlug(entry.jurisdiction)
    for (const year of entry.years) {
      documentRoutes.push({
        url: `${baseUrl}/${slug}/${year}`,
        changeFrequency: 'yearly',
        priority: 0.5,
      })
    }
  }

  return [...staticRoutes, ...documentRoutes]
}
