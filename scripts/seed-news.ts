/**
 * Seed the 4 original blog posts into Payload CMS.
 * Run with: npx tsx scripts/seed-news.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const posts = [
  {
    title: 'Neue Berichte und ein neues Feature',
    slug: 'neue-berichte-neues-feature',
    publishedDate: '2021-06-21',
    tags: [{ tag: 'Update' }, { tag: 'Feature' }],
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'In den letzten Wochen haben wir zahlreiche neue Berichte in das Archiv aufgenommen. Damit umfasst die Sammlung nun über 500 Verfassungsschutzberichte von Bund und Ländern. Gleichzeitig haben wir an einem neuen Feature gearbeitet: die regionale Analyse. Ab sofort können Nutzerinnen und Nutzer vergleichen, wie häufig bestimmte Begriffe in den Berichten verschiedener Bundesländer erwähnt werden.' }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
  },
  {
    title: 'Ein Urteil im Anhang',
    slug: 'ein-urteil-im-anhang',
    publishedDate: '2020-05-04',
    tags: [{ tag: 'Analyse' }, { tag: 'Bayern' }],
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Im Verfassungsschutzbericht Bayern 2019 befand sich im Anhang ein Gerichtsurteil. Das Verwaltungsgericht München entschied, dass die Zeitgeschichtliche Forschungsstelle Ingolstadt (ZFI) nicht als rechtsextrem einzustufen sei. Dieser ungewöhnliche Vorgang wirft Fragen über die Praxis der Berichterstattung auf.' }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
  },
  {
    title: 'Verfassungsschutzberichte auf dem 36C3',
    slug: 'verfassungsschutzberichte-auf-dem-36c3',
    publishedDate: '2020-01-03',
    tags: [{ tag: 'Vortrag' }, { tag: 'CCC' }],
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Auf dem 36. Chaos Communication Congress haben wir das Projekt vorgestellt. Die Aufzeichnung des Vortrags ist online verfügbar. Wir haben gezeigt, wie die Volltextsuche und die Trend-Analyse funktionieren und welche Erkenntnisse sich aus den Daten gewinnen lassen.' }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
  },
  {
    title: 'Launch: Verfassungsschutzberichte.de ist online',
    slug: 'launch-verfassungsschutzberichte-de-ist-online',
    publishedDate: '2019-11-02',
    tags: [{ tag: 'Launch' }],
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Nach monatelanger Arbeit ist das Archiv der Verfassungsschutzberichte endlich online. Über 400 Berichte von Bund und Ländern sind ab sofort durchsuchbar. Jeder Bericht ist mit Seitenbildern versehen und als PDF herunterladbar. Das Projekt ist ein Beitrag zur Transparenz: Die Verfassungsschutzberichte sind öffentliche Dokumente, aber bisher war es schwierig, sie systematisch zu durchsuchen oder zu vergleichen.' }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
  },
]

async function seed() {
  const payload = await getPayload({ config })

  for (const post of posts) {
    const existing = await payload.find({
      collection: 'news-articles',
      where: { slug: { equals: post.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`Skipping "${post.title}" (already exists)`)
      continue
    }

    await payload.create({
      collection: 'news-articles',
      data: {
        ...post,
        _status: 'published',
      },
    })
    console.log(`Created "${post.title}"`)
  }

  console.log('Done seeding news articles.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
