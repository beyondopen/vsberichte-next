import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getIndex } from '@/lib/queries/documents'
import { jurisdictionToSlug } from '@/lib/jurisdictions'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://verfassungsschutzberichte.de'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/berichte`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/suche`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/analyse`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/news`, changeFrequency: 'weekly', priority: 0.6 },
  ]

  // CMS pages
  const payload = await getPayload({ config })
  const { docs: pages } = await payload.find({
    collection: 'pages',
    limit: 100,
  })
  const cmsPageRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${baseUrl}/seite/${page.slug}`,
    changeFrequency: 'yearly' as const,
    priority: 0.4,
  }))

  // Jurisdiction overview + document pages
  const { index } = await getIndex()
  const jurisdictionRoutes: MetadataRoute.Sitemap = []
  const documentRoutes: MetadataRoute.Sitemap = []
  for (const entry of index) {
    const slug = jurisdictionToSlug(entry.jurisdiction)
    jurisdictionRoutes.push({
      url: `${baseUrl}/${slug}`,
      changeFrequency: 'yearly',
      priority: 0.8,
    })
    for (const year of entry.years) {
      documentRoutes.push({
        url: `${baseUrl}/${slug}/${year}`,
        changeFrequency: 'yearly',
        priority: 0.5,
      })
    }
  }

  return [...staticRoutes, ...cmsPageRoutes, ...jurisdictionRoutes, ...documentRoutes]
}
