import Link from "next/link";
import SearchForm from "@/components/SearchForm";
import HomepageChart from "@/components/HomepageChart";
import {
  getDocumentCount,
  getJurisdictionCount,
  getIndex,
} from "@/lib/queries/documents";

interface JurisdictionStat {
  jurisdiction: string;
  count: number;
}

export default async function HomePage() {
  const [documentCount, jurisdictionCount, indexResult] = await Promise.all([
    getDocumentCount(),
    getJurisdictionCount(),
    getIndex(),
  ]);
  const topJurisdictions: JurisdictionStat[] = indexResult.index
    .map((j) => ({ jurisdiction: j.jurisdiction, count: j.years.length }))
    .filter((j) => j.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            {/* Left column */}
            <div className="lg:col-span-3">
              <h1 className="font-serif font-bold text-5xl lg:text-6xl leading-tight tracking-tight mb-6">
                &Uuml;ber was informiert der Verfassungs&shy;schutz?
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Die Berichte des Geheimdienstes: gesammelt, durchsuchbar und
                analysiert.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-10 max-w-xl">
                Der Verfassungsschutz hat die Aufgabe die &Ouml;ffentlichkeit
                &uuml;ber verfassungsfeindliche Bestrebungen aufzukl&auml;ren.
                Die 16 Landes&auml;mter und das Bundesamt
                ver&ouml;ffentlichen j&auml;hrlich
                Verfassungsschutzberichte.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/suche"
                  className="inline-flex items-center px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
                >
                  Berichte durchsuchen
                </Link>
                <Link
                  href="/trends"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  Trends entdecken
                </Link>
              </div>
            </div>
            {/* Right column: Stats card */}
            <div className="lg:col-span-2">
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-3xl font-bold tracking-tight">
                      {documentCount}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Berichte
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight">
                      {jurisdictionCount}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Beh&ouml;rden
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight">
                      1950
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      seit
                    </div>
                  </div>
                </div>
                <hr className="border-gray-200 dark:border-gray-800 mb-6" />
                <table className="w-full text-sm">
                  <tbody>
                    {topJurisdictions.map((j, i) => (
                      <tr
                        key={j.jurisdiction}
                        className={
                          i < topJurisdictions.length - 1
                            ? "border-b border-gray-100 dark:border-gray-800/50"
                            : ""
                        }
                      >
                        <td className="py-2 text-gray-600 dark:text-gray-400">
                          {j.jurisdiction}
                        </td>
                        <td className="py-2 text-right font-medium">
                          {j.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Link
                  href="/berichte"
                  className="inline-flex items-center text-blue-700 dark:text-blue-400 text-sm font-medium mt-4 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  Alle Berichte &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Band */}
      <section className="bg-blue-700 dark:bg-blue-900 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif font-bold text-2xl lg:text-3xl text-white mb-6">
            Volltextsuche in allen Berichten
          </h2>
          <SearchForm size="lg" />
          <p className="text-blue-200 text-sm mt-4">
            Beispiele:{" "}
            <Link
              href="/suche?q=NSU"
              className="underline underline-offset-2 hover:text-white transition-colors"
            >
              &bdquo;NSU&ldquo;
            </Link>
            ,{" "}
            <Link
              href="/suche?q=links+OR+rechts"
              className="underline underline-offset-2 hover:text-white transition-colors"
            >
              links OR rechts
            </Link>
            ,{" "}
            <Link
              href="/suche?q=cyber"
              className="underline underline-offset-2 hover:text-white transition-colors"
            >
              cyber
            </Link>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1: Suche */}
            <div>
              <div className="text-3xl mb-4" aria-hidden="true">
                &#x1F50D;
              </div>
              <h3 className="text-lg font-bold mb-2">Durchsuche alle Seiten</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                Volltextsuche &uuml;ber alle Verfassungsschutzberichte mit
                Hervorhebung der Treffer direkt auf den Originalseiten.
              </p>
              <Link
                href="/suche"
                className="text-blue-700 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                Zur Suche &rarr;
              </Link>
            </div>
            {/* Feature 2: Trends */}
            <div>
              <div className="text-3xl mb-4" aria-hidden="true">
                &#x1F4C8;
              </div>
              <h3 className="text-lg font-bold mb-2">Vergleiche Begriffe</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                Analysiere, wie sich die Erw&auml;hnung von Begriffen
                &uuml;ber die Jahre ver&auml;ndert hat. Vergleiche mehrere
                Begriffe in interaktiven Charts.
              </p>
              <Link
                href="/trends"
                className="text-blue-700 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                Trends ansehen &rarr;
              </Link>
            </div>
            {/* Feature 3: Regional */}
            <div>
              <div className="text-3xl mb-4" aria-hidden="true">
                &#x1F5FA;
              </div>
              <h3 className="text-lg font-bold mb-2">
                Analysiere nach Bundesland
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                Vergleiche Erw&auml;hnungen nach Bundesl&auml;ndern und
                entdecke regionale Unterschiede in der Berichterstattung.
              </p>
              <Link
                href="/regional"
                className="text-blue-700 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                Regionale Analyse &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif font-bold text-3xl lg:text-4xl tracking-tight mb-12">
            Verfassungsschutz Trends
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Chart 1 */}
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <HomepageChart
                title="Erw&auml;hnungen von RAF und NSU"
                subtitle="Bundesberichte, 1990&ndash;2023"
                queries={['raf', 'nsu']}
              />
            </div>
            {/* Chart 2 */}
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <HomepageChart
                title="Erw&auml;hnungen von Parteien"
                subtitle="Alle Berichte, 2000&ndash;2023"
                queries={['npd', 'pkk', 'dkp']}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-serif font-bold text-3xl lg:text-4xl tracking-tight mb-16 text-center">
            Das sagen andere
          </h2>

          {/* Testimonial 1: Nocun */}
          <div className="mb-16">
            <div className="relative pl-8 border-l-4 border-blue-700">
              <blockquote>
                <p className="font-serif text-xl lg:text-2xl leading-relaxed text-gray-800 dark:text-gray-200 mb-6">
                  &bdquo;Die Verfassungsschutzberichte der letzten Jahrzehnte
                  belegen eindrucksvoll eine fehlende
                  Priorit&auml;tensetzung im Bereich Rechtsextremismus.
                  Wer Umweltbewegungen beobachten l&auml;sst, statt
                  Rechtsterroristen ins Visier zu nehmen, hat ein
                  grundlegend falsches Verst&auml;ndnis von dem, was unsere
                  demokratische und freiheitliche Gesellschaft
                  tats&auml;chlich bedroht. Diese Plattform leistet einen
                  wichtigen Beitrag f&uuml;r die kritische
                  Auseinandersetzung mit der Arbeit des
                  Verfassungsschutzes.&ldquo;
                </p>
                <footer className="flex items-center gap-3">
                  <img src="/avatars/kn.jpg" alt="Katharina Nocun" className="w-10 h-10 rounded-full" />
                  <cite className="not-italic">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      Katharina Nocun
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {" "}
                      &ndash; B&uuml;rgerrechtlerin und Netzaktivistin
                    </span>
                  </cite>
                </footer>
              </blockquote>
            </div>
          </div>

          {/* Testimonial 2: Neumann */}
          <div className="mb-16">
            <div className="relative pl-8 border-l-4 border-blue-700">
              <blockquote>
                <p className="font-serif text-xl lg:text-2xl leading-relaxed text-gray-800 dark:text-gray-200 mb-6">
                  &bdquo;Die Bundes- und Landes&auml;mter f&uuml;r
                  Verfassungsschutz sind wohl die intransparentesten
                  Beh&ouml;rden der BRD &ndash; und
                  regelm&auml;&szlig;ig Kern schwerster Skandale. Ihre
                  Berichte sind das kleine bisschen Transparenz, das der
                  &Ouml;ffentlichkeit zugestanden wird. Jetzt wird es
                  erstmalig m&ouml;glich, sie gezielt
                  l&auml;ngsschnittlich zu analysieren. Frei, offen,
                  unverf&auml;lscht und f&uuml;r alle
                  zug&auml;nglich.&ldquo;
                </p>
                <footer className="flex items-center gap-3">
                  <img src="/avatars/ln.jpg" alt="Linus Neumann" className="w-10 h-10 rounded-full" />
                  <cite className="not-italic">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      Linus Neumann
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {" "}
                      &ndash; Hacker und Sprecher des Chaos Computer Club
                    </span>
                  </cite>
                </footer>
              </blockquote>
            </div>
          </div>

          {/* Testimonial 3: Semsrott */}
          <div className="mb-16">
            <div className="relative pl-8 border-l-4 border-blue-700">
              <blockquote>
                <p className="font-serif text-xl lg:text-2xl leading-relaxed text-gray-800 dark:text-gray-200 mb-6">
                  &bdquo;Eine Supersache, dass die Berichte des sog.
                  Verfassungsschutzes jetzt &ouml;ffentlich
                  zug&auml;nglich sind. Der Geheimdienst hat bei dem
                  Versagen rund um die Aufkl&auml;rung des NSU gezeigt,
                  dass er von Transparenz nichts h&auml;lt. Die
                  Aktenvernichtung und die Verharmlosung der rechten
                  Gewalt sind einer Demokratie unw&uuml;rdig. Die
                  Zivilgesellschaft muss weiter Druck aufbauen, um
                  deutsche Geheimdienste besser zu
                  kontrollieren.&ldquo;
                </p>
                <footer className="flex items-center gap-3">
                  <img src="/avatars/as.jpg" alt="Arne Semsrott" className="w-10 h-10 rounded-full" />
                  <cite className="not-italic">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      Arne Semsrott
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {" "}
                      &ndash; Aktivist und Projektleiter bei FragDenStaat
                    </span>
                  </cite>
                </footer>
              </blockquote>
            </div>
          </div>

          {/* Testimonial 4: Winkler */}
          <div>
            <div className="relative pl-8 border-l-4 border-blue-700">
              <blockquote>
                <p className="font-serif text-xl lg:text-2xl leading-relaxed text-gray-800 dark:text-gray-200 mb-6">
                  &bdquo;Aus radikal demokratischer Sicht d&uuml;rfte es
                  grunds&auml;tzlich keine Inlandsgeheimdienste geben. Auf
                  dem Weg dahin muss diesen Beh&ouml;rden und ihrer an
                  Eigeninteressen ausgerichteten und politisch motivierten
                  Au&szlig;endarstellung kritisch begegnet werden. Dies
                  wird durch diese Webseite nun einfacher.&ldquo;
                </p>
                <footer className="flex items-center gap-3">
                  <img src="/avatars/mw.jpg" alt="Michèle Winkler" className="w-10 h-10 rounded-full" />
                  <cite className="not-italic">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      Mich&egrave;le Winkler
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {" "}
                      &ndash; Referentin beim Komitee f&uuml;r Grundrechte
                      und Demokratie
                    </span>
                  </cite>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Offene Daten Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif font-bold text-3xl lg:text-4xl tracking-tight mb-8">
            Offene Daten
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
            Alle Daten sind frei verf&uuml;gbar. Die Berichte k&ouml;nnen
            als PDFs oder Textdateien heruntergeladen werden.
            Au&szlig;erdem gibt es eine JSON-API f&uuml;r die
            programmatische Nutzung.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <a
              href="/data/pdfs.zip"
              className="group block border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="text-2xl mb-3" aria-hidden="true">
                &#x1F4E6;
              </div>
              <div className="font-bold mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                Alle PDFs
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                ZIP-Archiv, &gt;6 GB
              </div>
            </a>
            <a
              href="/data/texte.zip"
              className="group block border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="text-2xl mb-3" aria-hidden="true">
                &#x1F4C4;
              </div>
              <div className="font-bold mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                Alle Texte
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                ZIP-Archiv der extrahierten Texte
              </div>
            </a>
            <a
              href="/api"
              className="group block border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="text-2xl mb-3" aria-hidden="true">
                &#x1F517;
              </div>
              <div className="font-bold mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                JSON-API
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                &Uuml;bersicht &amp; Einzelansichten
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif font-bold text-3xl lg:text-4xl tracking-tight mb-4">
            Partner:innen
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-12">
            Unterst&uuml;tzt und gef&ouml;rdert von
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 items-center justify-items-center">
            <a href="https://www.apabiz.de" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
              <img src="/logos/apabiz.svg" alt="apabiz e.V." className="h-12 w-auto dark:invert" />
            </a>
            <a href="http://www.humanistische-union.de/" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
              <img src="/logos/hu.jpg" alt="Humanistische Union" className="h-12 w-auto" />
            </a>
            <a href="https://blackbox-vs.de" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
              <img src="/logos/blackbox.jpg" alt="Blackbox VS" className="h-12 w-auto" />
            </a>
            <a href="https://fragdenstaat.de" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
              <img src="/logos/frag_den_staat_logo.svg" alt="FragDenStaat" className="h-10 w-auto dark:invert" />
            </a>
            <a href="https://codefor.de" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
              <img src="/logos/CFG_logo.svg" alt="Code for Germany" className="h-10 w-auto dark:invert" />
            </a>
            <a href="https://okfn.de" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
              <img src="/logos/okf.svg" alt="Open Knowledge Foundation" className="h-10 w-auto dark:invert" />
            </a>
          </div>
        </div>
      </section>

      {/* Kontakt Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif font-bold text-3xl lg:text-4xl tracking-tight mb-8">
            Kontakt
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            F&uuml;r Fragen und Anregungen bitte (verschl&uuml;sselt) eine
            E-Mail senden:
          </p>
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-8">
            <a
              href="mailto:vsberichte@proton.me"
              className="text-blue-700 dark:text-blue-400 font-medium text-lg hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              vsberichte@proton.me
            </a>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              PGP-Fingerprint:{" "}
              <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                918c f3ae ab72 3636 372b 9a22 e761 aa4b d9be 25e0
              </code>
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <a
              href="https://instagram.com/vsberichte"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            <span className="text-gray-300 dark:text-gray-700">
              &middot;
            </span>
            <a
              href="https://chaos.social/@vsberichte"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mastodon
            </a>
            <span className="text-gray-300 dark:text-gray-700">
              &middot;
            </span>
            <a
              href="https://bsky.app/profile/vsberichte.bsky.social"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              BlueSky
            </a>
            <span className="text-gray-300 dark:text-gray-700">
              &middot;
            </span>
            <a
              href="https://github.com/codeforberlin/verfassungsschutzberichte.de"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 leading-relaxed">
            Ehrenamtlich konzipiert und umgesetzt von{" "}
            <a
              href="https://johannesfilter.com"
              className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Johannes Filter
            </a>{" "}
            aus dem Open Knowledge Lab Berlin von{" "}
            <a
              href="https://codefor.de"
              className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Code for Germany
            </a>
            , einem Projekt der{" "}
            <a
              href="https://okfn.de"
              className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Knowledge Foundation Deutschland
            </a>
            .
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif font-bold text-3xl lg:text-4xl tracking-tight mb-12">
            H&auml;ufig gestellte Fragen
          </h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            <details className="group py-6">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium text-lg">
                  Was ist ein Verfassungsschutzbericht?
                </span>
                <span className="chevron-rotate ml-4 text-gray-400 shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                Verfassungsschutzberichte sind j&auml;hrliche
                Ver&ouml;ffentlichungen der
                Verfassungsschutzbeh&ouml;rden des Bundes und der
                L&auml;nder. Sie informieren die &Ouml;ffentlichkeit
                &uuml;ber verfassungsfeindliche Bestrebungen, also
                &uuml;ber Aktivit&auml;ten, die sich gegen die
                freiheitliche demokratische Grundordnung richten. Die
                Berichte decken ein breites Spektrum ab: vom Rechts- und
                Linksextremismus &uuml;ber Islamismus bis hin zu
                Spionageaktivit&auml;ten.
              </p>
            </details>
            <details className="group py-6">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium text-lg">
                  Woher stammen die Berichte auf dieser Seite?
                </span>
                <span className="chevron-rotate ml-4 text-gray-400 shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                Alle Berichte stammen aus &ouml;ffentlich
                zug&auml;nglichen Quellen. Sie werden von den Webseiten
                der jeweiligen Verfassungsschutzbeh&ouml;rden
                heruntergeladen, aus Archiven bezogen oder &uuml;ber
                Anfragen nach dem Informationsfreiheitsgesetz beschafft.
                Die PDFs werden anschlie&szlig;end mit OCR-Verfahren
                digitalisiert und f&uuml;r die Volltextsuche aufbereitet.
              </p>
            </details>
            <details className="group py-6">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium text-lg">
                  Wie funktioniert die Volltextsuche?
                </span>
                <span className="chevron-rotate ml-4 text-gray-400 shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                Die Suche durchsucht den extrahierten Text aller
                Verfassungsschutzberichte. Sie unterst&uuml;tzt Boolesche
                Operatoren (AND, OR, NOT), Phrasensuche mit
                Anf&uuml;hrungszeichen und Wildcards. Die Treffer werden
                mit dem relevanten Textausschnitt und einer Hervorhebung
                auf der Originalseite angezeigt.
              </p>
            </details>
            <details className="group py-6">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium text-lg">
                  Kann ich die Daten herunterladen oder weiterverwenden?
                </span>
                <span className="chevron-rotate ml-4 text-gray-400 shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                Ja. Alle Berichte k&ouml;nnen als PDF heruntergeladen
                werden. Der Quellcode des Projekts ist Open Source und auf
                GitHub verf&uuml;gbar. F&uuml;r wissenschaftliche oder
                journalistische Nutzung stellen wir gerne auch die
                extrahierten Textdaten zur Verf&uuml;gung &ndash; nehmen
                Sie einfach Kontakt mit uns auf.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24">
        <div className="max-w-xl mx-auto px-6">
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
            <h2 className="font-serif font-bold text-2xl mb-2">
              Newsletter abonnieren
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Erhalte Updates zu neuen Berichten und Analysen.
            </p>
            <form
              method="post"
              action="https://listen.daten.cool/subscription/form"
              className="flex gap-3"
            >
              <input type="hidden" name="nonce" />
              <input
                type="hidden"
                name="l"
                value="4539a1e9-ea50-4a91-bd6e-6730ea3eedd0"
              />
              <label htmlFor="email-input" className="sr-only">
                E-Mail-Adresse
              </label>
              <input
                id="email-input"
                type="email"
                name="email"
                placeholder="name@beispiel.de"
                required
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors whitespace-nowrap"
              >
                Abonnieren
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
