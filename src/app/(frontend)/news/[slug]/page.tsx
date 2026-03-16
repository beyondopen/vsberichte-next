import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 3600

interface BlogPostData {
  slug: string
  date: string
  title: string
  tags: string[]
  content: string
}

const posts: Record<string, BlogPostData> = {
  'neue-berichte-neues-feature': {
    slug: 'neue-berichte-neues-feature',
    date: '21. Juni 2021',
    title: 'Neue Berichte und ein neues Feature',
    tags: ['Update', 'Feature'],
    content: `
      <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
        In den letzten Wochen haben wir zahlreiche neue Berichte in das Archiv aufgenommen. Damit umfasst die Sammlung nun ueber 500 Verfassungsschutzberichte von Bund und Laendern. Gleichzeitig haben wir an einem neuen Feature gearbeitet, das wir heute vorstellen moechten: die regionale Analyse.
      </p>

      <h2 class="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-4">Neue Berichte</h2>

      <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
        Das Archiv wurde um Berichte aus mehreren Bundeslaendern ergaenzt. Insbesondere konnten wir Luecken bei aelteren Jahrgaengen schliessen, die bisher nur schwer zugaenglich waren. Die folgenden Berichte sind neu hinzugekommen:
      </p>

      <ul class="ml-6 list-disc text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>Verfassungsschutzbericht Nordrhein-Westfalen 2020</li>
        <li>Verfassungsschutzbericht Sachsen 2020</li>
        <li>Verfassungsschutzbericht Hessen 2019 und 2020</li>
        <li>Verfassungsschutzbericht Thueringen 2018 und 2019</li>
        <li>Verfassungsschutzbericht Bremen 2017, 2018 und 2019</li>
      </ul>

      <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
        Alle neuen Berichte sind bereits vollstaendig durchsuchbar. Wir danken allen, die uns auf fehlende Berichte hingewiesen haben -- solche Hinweise helfen uns sehr, das Archiv zu vervollstaendigen.
      </p>

      <h2 class="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-4">Neues Feature: Regionale Analyse</h2>

      <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
        Ab sofort koennen Nutzerinnen und Nutzer auf der neuen Seite <a href="/regional" class="text-blue-700 dark:text-blue-400 underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-300">&bdquo;Regionale Analyse&ldquo;</a> vergleichen, wie haeufig bestimmte Begriffe in den Berichten verschiedener Bundeslaender erwaehnt werden. So laesst sich beispielsweise auf einen Blick erkennen, welche Landesbehoerden einen bestimmten Akteur besonders intensiv beobachten.
      </p>

      <blockquote class="border-l-4 border-blue-700 dark:border-blue-500 pl-6 my-8 italic text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
        &bdquo;Besonders auffaellig ist, dass der Begriff 'Reichsbuerger' in den bayerischen Berichten seit 2016 zehnmal haeufiger vorkommt als noch im Jahr zuvor -- ein deutliches Signal fuer die wachsende Aufmerksamkeit der Behoerden.&ldquo;
      </blockquote>

      <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
        Die regionale Analyse unterstuetzt die Auswahl von bis zu fuenf Bundeslaendern gleichzeitig und zeigt die Erwaehnungshaeufigkeit als interaktive Zeitleiste. Probieren Sie es selbst aus und entdecken Sie Muster, die in einzelnen Berichten leicht uebersehen werden koennen. Die Funktion ist unter <a href="/regional" class="text-blue-700 dark:text-blue-400 underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-300">verfassungsschutzberichte.de/regional</a> erreichbar.
      </p>

      <h2 class="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-4">Ausblick</h2>

      <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
        Wir arbeiten derzeit an weiteren Verbesserungen der Suchfunktion und planen, auch historische Berichte aus den 1960er- und 1970er-Jahren zu digitalisieren. Falls Sie Zugang zu aelteren Berichten haben oder das Projekt anderweitig unterstuetzen moechten, freuen wir uns ueber eine Nachricht.
      </p>
    `,
  },
  'ein-urteil-im-anhang': {
    slug: 'ein-urteil-im-anhang',
    date: '4. Mai 2020',
    title: 'Ein Urteil im Anhang',
    tags: ['Analyse', 'Bayern'],
    content: `
      <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
        Im Verfassungsschutzbericht Bayern 2019 befand sich im Anhang ein Gerichtsurteil. Das Verwaltungsgericht Muenchen entschied, dass die Zeitgeschichtliche Forschungsstelle Ingolstadt (ZFI) nicht als rechtsextrem einzustufen sei. Dieser ungewoehnliche Vorgang wirft Fragen ueber die Praxis der Berichterstattung auf.
      </p>
    `,
  },
  'verfassungsschutzberichte-auf-dem-36c3': {
    slug: 'verfassungsschutzberichte-auf-dem-36c3',
    date: '3. Januar 2020',
    title: 'Verfassungsschutzberichte auf dem 36C3',
    tags: ['Vortrag', 'CCC'],
    content: `
      <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
        Auf dem 36. Chaos Communication Congress haben wir das Projekt vorgestellt. Die Aufzeichnung des Vortrags ist online verfuegbar. Wir haben gezeigt, wie die Volltextsuche und die Trend-Analyse funktionieren und welche Erkenntnisse sich aus den Daten gewinnen lassen.
      </p>
    `,
  },
  'launch-verfassungsschutzberichte-de-ist-online': {
    slug: 'launch-verfassungsschutzberichte-de-ist-online',
    date: '2. November 2019',
    title: 'Launch: Verfassungsschutzberichte.de ist online',
    tags: ['Launch'],
    content: `
      <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
        Nach monatelanger Arbeit ist das Archiv der Verfassungsschutzberichte endlich online. Ueber 400 Berichte von Bund und Laendern sind ab sofort durchsuchbar. Jeder Bericht ist mit Seitenbildern versehen und als PDF herunterladbar.
      </p>

      <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
        Das Projekt ist ein Beitrag zur Transparenz: Die Verfassungsschutzberichte sind oeffentliche Dokumente, aber bisher war es schwierig, sie systematisch zu durchsuchen oder zu vergleichen. Mit Verfassungsschutzberichte.de aendern wir das.
      </p>

      <h2 class="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-4">Features</h2>

      <ul class="ml-6 list-disc text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>Volltextsuche ueber alle Berichte</li>
        <li>Seitenbilder fuer jeden Bericht</li>
        <li>Trend-Analyse: Begriffe im zeitlichen Verlauf vergleichen</li>
        <li>PDF-Download aller Berichte</li>
        <li>Offene JSON-API fuer Entwickler</li>
      </ul>

      <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
        Der Quellcode ist Open Source und auf GitHub verfuegbar. Wir freuen uns ueber Feedback und Beitraege.
      </p>
    `,
  },
}

interface Params {
  slug: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const post = posts[slug]
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
  const post = posts[slug]
  if (!post) notFound()

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
            {post.date}
          </time>
          <h1 className="font-serif font-bold text-4xl lg:text-5xl tracking-tight leading-tight mb-5">
            {post.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Article body */}
        <article dangerouslySetInnerHTML={{ __html: post.content }} />

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
