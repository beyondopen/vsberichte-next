import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'

export const revalidate = 3600

interface Params {
  slug: string
}

async function getPage(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) {
    return { title: 'Nicht gefunden -- Verfassungsschutzberichte.de' }
  }
  return {
    title: `${page.title} -- Verfassungsschutzberichte.de`,
  }
}

export default async function CmsPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  return (
    <section className="pt-16 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-headline font-bold text-4xl tracking-tight mb-8">
          {page.title}
        </h1>
        <article className="prose prose-gray dark:prose-invert max-w-none prose-lg prose-a:text-blue-700 dark:prose-a:text-blue-400">
          <RichText data={page.content} />
        </article>
      </div>
    </section>
  )
}
