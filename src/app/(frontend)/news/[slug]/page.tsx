import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'

export const revalidate = 3600

interface Params {
  slug: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news-articles',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
  })
  const post = docs[0]
  if (!post) {
    return { title: 'Nicht gefunden -- Verfassungsschutzberichte.de' }
  }
  return {
    title: `${post.title} -- Verfassungsschutzberichte.de`,
    description: post.title,
  }
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news-articles',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
  })
  const post = docs[0]
  if (!post) notFound()

  const date = post.publishedDate
    ? new Date(post.publishedDate).toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''
  const tags = (post.tags as Array<{ tag?: string | null }> | undefined)
    ?.map((t) => t.tag)
    .filter(Boolean) as string[] || []

  return (
    <section className="pb-20">
      <div className="max-w-3xl mx-auto px-6">
        {/* Back link */}
        <Link
          href="/news"
          className="inline-flex items-center text-sm text-blue-700 dark:text-blue-400 hover:underline mb-10 mt-8"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Alle Beitraege
        </Link>

        {/* Post header */}
        <header className="mb-12">
          <time className="block text-sm text-gray-500 dark:text-gray-400 font-mono mb-4">
            {date}
          </time>
          <h1 className="font-serif font-bold text-4xl lg:text-5xl tracking-tight leading-tight mb-5">
            {post.title}
          </h1>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Article body */}
        <article className="prose prose-gray dark:prose-invert max-w-none prose-lg prose-a:text-blue-700 dark:prose-a:text-blue-400">
          <RichText data={post.content} />
        </article>

        {/* Post footer */}
        <hr className="border-gray-200 dark:border-gray-800 mt-16 mb-8" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/news"
            className="text-blue-700 dark:text-blue-400 font-medium hover:underline"
          >
            Alle Beitraege anzeigen &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
