import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-400 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <h3 className="font-serif font-bold text-white text-lg mb-4">
              Verfassungsschutz&shy;berichte.de
            </h3>
            <p className="text-sm leading-relaxed">
              Ein zivilgesellschaftliches Projekt f&uuml;r Transparenz und
              Aufkl&auml;rung.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
              Entdecken
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/berichte"
                  className="hover:text-white transition-colors"
                >
                  Alle Berichte
                </Link>
              </li>
              <li>
                <Link
                  href="/suche"
                  className="hover:text-white transition-colors"
                >
                  Volltextsuche
                </Link>
              </li>
              <li>
                <Link
                  href="/trends"
                  className="hover:text-white transition-colors"
                >
                  Trend-Analyse
                </Link>
              </li>
              <li>
                <Link
                  href="/regional"
                  className="hover:text-white transition-colors"
                >
                  Regionale Analyse
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
              Projekt
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/seite/ueber-uns"
                  className="hover:text-white transition-colors"
                >
                  &Uuml;ber uns
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="hover:text-white transition-colors"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  href="/seite/kontakt"
                  className="hover:text-white transition-colors"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
              Folge uns
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/codeforberlin/verfassungsschutzberichte.de"
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://chaos.social/@vsberichte"
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mastodon
                </a>
              </li>
              <li>
                <a
                  href="https://bsky.app/profile/vsberichte.bsky.social"
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  BlueSky
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Verfassungsschutzberichte.de
            &ndash; Ein Open-Source-Projekt
          </p>
          <div className="flex gap-6">
            <Link
              href="/seite/impressum"
              className="hover:text-white transition-colors"
            >
              Impressum
            </Link>
            <Link
              href="/seite/datenschutz"
              className="hover:text-white transition-colors"
            >
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
