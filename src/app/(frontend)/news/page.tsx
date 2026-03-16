import type { Metadata } from 'next'
import Link from 'next/link'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog -- Verfassungsschutzberichte.de',
  description: 'Neuigkeiten und Analysen rund um die Verfassungsschutzberichte.',
}

interface BlogPost {
  slug: string
  date: string
  title: string
  excerpt: string
  tags: string[]
}

const posts: BlogPost[] = [
  {
    slug: 'neue-berichte-neues-feature',
    date: '21. Juni 2021',
    title: 'Neue Berichte und ein neues Feature',
    excerpt:
      'Es gibt wieder einige neue Berichte im Archiv. Ausserdem haben wir ein neues Feature eingebaut: Ab sofort koennen Erwaehnungen regional verglichen werden...',
    tags: ['Update', 'Feature'],
  },
  {
    slug: 'ein-urteil-im-anhang',
    date: '4. Mai 2020',
    title: 'Ein Urteil im Anhang',
    excerpt:
      'Im Verfassungsschutzbericht Bayern 2019 befand sich im Anhang ein Gerichtsurteil. Das Verwaltungsgericht Muenchen entschied, dass die Zeitgeschichtliche Forschungsstelle Ingolstadt nicht als rechtsextrem einzustufen sei...',
    tags: ['Analyse', 'Bayern'],
  },
  {
    slug: 'verfassungsschutzberichte-auf-dem-36c3',
    date: '3. Januar 2020',
    title: 'Verfassungsschutzberichte auf dem 36C3',
    excerpt:
      'Auf dem 36. Chaos Communication Congress haben wir das Projekt vorgestellt. Die Aufzeichnung des Vortrags ist online verfuegbar...',
    tags: ['Vortrag', 'CCC'],
  },
  {
    slug: 'launch-verfassungsschutzberichte-de-ist-online',
    date: '2. November 2019',
    title: 'Launch: Verfassungsschutzberichte.de ist online',
    excerpt:
      'Nach monatelanger Arbeit ist das Archiv der Verfassungsschutzberichte endlich online. Ueber 400 Berichte von Bund und Laendern sind ab sofort durchsuchbar...',
    tags: ['Launch'],
  },
]

export default function NewsPage() {
  return (
    <>
      {/* Page Header */}
      <section className="pt-16 pb-8">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-serif font-bold text-4xl tracking-tight mb-3">Blog</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Neuigkeiten und Analysen rund um die Verfassungsschutzberichte
          </p>
        </div>
      </section>

      {/* Post List */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-6">
          {posts.map((post, idx) => (
            <div key={post.slug}>
              {idx > 0 && <hr className="border-gray-200 dark:border-gray-800" />}
              <article className="py-10">
                <time className="block text-sm text-gray-500 dark:text-gray-400 font-mono mb-2">
                  {post.date}
                </time>
                <h2 className="font-serif text-2xl font-bold mb-3">
                  <Link
                    href={`/news/${post.slug}`}
                    className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/news/${post.slug}`}
                    className="text-blue-700 dark:text-blue-400 text-sm font-medium hover:underline"
                  >
                    Weiterlesen &rarr;
                  </Link>
                  {post.tags.map((tag) => (
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
          ))}
        </div>
      </section>
    </>
  )
}
