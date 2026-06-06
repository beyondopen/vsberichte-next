import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'News -- Verfassungsschutzberichte.de',
  description: 'Neuigkeiten und Analysen rund um die Verfassungsschutzberichte.',
}

export default async function NewsPage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news-articles',
    sort: '-publishedDate',
    limit: 50,
    where: {
      _status: { equals: 'published' },
    },
  })

  return (
    <>
      {/* Page Header */}
      <section className="pt-16 pb-8">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-headline font-bold text-4xl tracking-tight mb-3">News</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Neuigkeiten und Analysen rund um die Verfassungsschutzberichte
          </p>
        </div>
      </section>

      {/* Post List */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-6">
          {docs.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 py-12 text-center">
              Noch keine Beitraege vorhanden.
            </p>
          )}
          {docs.map((post, idx) => {
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
              <div key={post.id}>
                {idx > 0 && <hr className="border-gray-200 dark:border-gray-800" />}
                <article className="py-10">
                  <time className="block text-sm text-gray-500 dark:text-gray-400 font-mono mb-2">
                    {date}
                  </time>
                  <h2 className="font-headline text-2xl font-bold mb-3">
                    <Link
                      href={`/news/${post.slug}`}
                      className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/news/${post.slug}`}
                      className="text-blue-700 dark:text-blue-400 text-sm font-medium hover:underline"
                    >
                      Weiterlesen &rarr;
                    </Link>
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
