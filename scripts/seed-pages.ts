/**
 * Seed initial CMS pages into Payload.
 * Run with: npx tsx scripts/seed-pages.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

function paragraph(text: string) {
  return {
    type: 'paragraph',
    children: [{ type: 'text', text }],
    version: 1,
  }
}

function heading(text: string) {
  return {
    type: 'heading',
    tag: 'h2',
    children: [{ type: 'text', text }],
    version: 1,
  }
}

function richText(blocks: ReturnType<typeof paragraph | typeof heading>[]) {
  return {
    root: {
      type: 'root',
      children: blocks,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

const pages = [
  {
    title: 'Impressum',
    slug: 'impressum',
    content: richText([
      paragraph('Angaben gemäß § 5 TMG'),
      paragraph('Open Knowledge Foundation Deutschland e.V.\nSingerstr. 109\n10179 Berlin\nDeutschland'),
      heading('Kontakt'),
      paragraph('E-Mail: info@okfn.de\nTelefon: +49 30 57703666 0\nFax: +49 30 57703666 9'),
      heading('Vertretungsberechtigt'),
      paragraph('Vorstand: Henriette Litta, Gabriele C. Klug, Felix Reda, Daniel Dietrich'),
      heading('Registereintrag'),
      paragraph('Eingetragen im Vereinsregister des Amtsgerichts Berlin-Charlottenburg\nRegisternummer: VR 30468 B'),
      paragraph('Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE278022128'),
      heading('Haftungsausschluss'),
      paragraph('Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.'),
    ]),
  },
  {
    title: 'Datenschutz',
    slug: 'datenschutz',
    content: richText([
      paragraph('Verfassungsschutzberichte.de nimmt den Schutz Ihrer persönlichen Daten ernst.'),
      heading('Verantwortlicher'),
      paragraph('Open Knowledge Foundation Deutschland e.V.\nSingerstr. 109\n10179 Berlin'),
      heading('Zugriffsdaten'),
      paragraph('Bei jedem Zugriff auf diese Website werden vom Webserver automatisch Daten gespeichert (Server-Logfiles). Zu diesen Daten gehören z.B. die IP-Adresse, der Browser-Typ und das Datum des Zugriffs. Diese Daten werden ausschließlich zur Sicherstellung eines störungsfreien Betriebs ausgewertet und nach 7 Tagen gelöscht.'),
      heading('Webanalyse mit Matomo'),
      paragraph('Diese Website nutzt Matomo (ehemals Piwik) zur Webanalyse. Matomo wird auf eigenen Servern betrieben. Es werden keine Daten an Dritte weitergegeben. Ihre IP-Adresse wird anonymisiert.'),
      heading('Tor-Zugang'),
      paragraph('Diese Website ist auch über das Tor-Netzwerk erreichbar. Bei Zugriff über Tor wird Ihre IP-Adresse nicht in den Server-Logfiles gespeichert.'),
      heading('Ihre Rechte'),
      paragraph('Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten. Bitte wenden Sie sich an: info@okfn.de'),
    ]),
  },
  {
    title: 'Über uns',
    slug: 'ueber-uns',
    content: richText([
      paragraph('Verfassungsschutzberichte.de ist ein zivilgesellschaftliches Projekt für Transparenz und Aufklärung. Wir sammeln die Verfassungsschutzberichte des Bundes und der Länder, machen sie durchsuchbar und ermöglichen eine systematische Analyse.'),
      heading('Warum dieses Projekt?'),
      paragraph('Die Verfassungsschutzberichte sind öffentliche Dokumente, aber sie waren bisher schwer zugänglich und kaum systematisch auswertbar. Wir möchten das ändern: Journalistinnen, Wissenschaftler und die interessierte Öffentlichkeit sollen die Berichte einfach durchsuchen und vergleichen können.'),
      heading('Wer steckt dahinter?'),
      paragraph('Das Projekt wurde ehrenamtlich konzipiert und umgesetzt von Johannes Filter aus dem Open Knowledge Lab Berlin von Code for Germany, einem Projekt der Open Knowledge Foundation Deutschland.'),
      heading('Open Source'),
      paragraph('Der gesamte Quellcode ist frei verfügbar auf GitHub. Wir freuen uns über Beiträge und Feedback.'),
      heading('Kontakt'),
      paragraph('E-Mail: vsberichte@proton.me\nPGP-Fingerprint: 918c f3ae ab72 3636 372b 9a22 e761 aa4b d9be 25e0'),
    ]),
  },
  {
    title: 'Kontakt',
    slug: 'kontakt',
    content: richText([
      paragraph('Für Fragen, Anregungen und Hinweise auf fehlende Berichte freuen wir uns über eine Nachricht.'),
      heading('E-Mail'),
      paragraph('vsberichte@proton.me\n\nPGP-Fingerprint: 918c f3ae ab72 3636 372b 9a22 e761 aa4b d9be 25e0'),
      heading('Social Media'),
      paragraph('Mastodon: @vsberichte@chaos.social\nBlueSky: vsberichte.bsky.social\nInstagram: @vsberichte'),
      heading('Träger'),
      paragraph('Open Knowledge Foundation Deutschland e.V.\nSingerstr. 109\n10179 Berlin'),
    ]),
  },
]

async function seed() {
  const payload = await getPayload({ config })

  for (const page of pages) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`Skipping "${page.title}" (already exists)`)
      continue
    }

    await payload.create({
      collection: 'pages',
      data: page,
    })
    console.log(`Created "${page.title}"`)
  }

  console.log('Done seeding pages.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
