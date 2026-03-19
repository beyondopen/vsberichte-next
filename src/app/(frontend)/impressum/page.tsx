import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impressum -- Verfassungsschutzberichte.de',
  robots: { index: false, follow: true },
}

export default function ImpressumPage() {
  return (
    <section className="pt-16 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-serif font-bold text-4xl tracking-tight mb-8">Impressum</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
            Angaben gemaess &sect; 5 TMG
          </p>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Verfassungsschutzberichte.de
            <br />
            Ein zivilgesellschaftliches Projekt fuer Transparenz und Aufklaerung.
          </p>

          <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-4">
            Kontakt
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            E-Mail: info@verfassungsschutzberichte.de
          </p>

          <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-4">
            Haftungsausschluss
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Die Inhalte unserer Seiten wurden mit groesster Sorgfalt erstellt. Fuer die Richtigkeit,
            Vollstaendigkeit und Aktualitaet der Inhalte koennen wir jedoch keine Gewaehr uebernehmen.
          </p>
        </div>
      </div>
    </section>
  )
}
