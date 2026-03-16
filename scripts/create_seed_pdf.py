#!/usr/bin/env python3
"""Generate fake Verfassungsschutzbericht PDFs for development seeding."""

import os
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.units import cm

DATA_DIR = Path(os.environ.get("DATA_DIR", "/data"))
PDF_DIR = DATA_DIR / "pdfs"

# ---------------------------------------------------------------------------
# Seed document definitions
# ---------------------------------------------------------------------------

SEED_PDFS = [
    {
        "filename": "vsbericht-bfv-seed-2023.pdf",
        "pages": [
            # Page 1: Title page
            [
                ("title", "Verfassungsschutzbericht 2023"),
                ("subtitle", "Bundesamt für Verfassungsschutz"),
                ("body", (
                    "Der Verfassungsschutzbericht 2023 gibt einen umfassenden Überblick über "
                    "die Aktivitäten extremistischer und terroristischer Bestrebungen in der "
                    "Bundesrepublik Deutschland. Die Sicherheitslage hat sich im Berichtszeitraum "
                    "weiter verschärft. Das Bundesamt für Verfassungsschutz beobachtet eine "
                    "zunehmende Radikalisierung in verschiedenen Phänomenbereichen."
                )),
                ("body", (
                    "Die vorliegende Publikation dokumentiert die wesentlichen Erkenntnisse "
                    "und Entwicklungen des Jahres 2023. Sie richtet sich an die Öffentlichkeit, "
                    "die Medien sowie an politische Entscheidungsträger. Der Bericht gliedert "
                    "sich in die Bereiche Rechtsextremismus, Linksextremismus, Islamismus und "
                    "Cyber-Sicherheit."
                )),
                ("body", (
                    "Das Bundesamt für Verfassungsschutz ist der Inlandsnachrichtendienst der "
                    "Bundesrepublik Deutschland. Es hat die Aufgabe, Informationen über "
                    "verfassungsfeindliche Bestrebungen zu sammeln und auszuwerten. Die "
                    "gewonnenen Erkenntnisse werden der Bundesregierung und den zuständigen "
                    "Stellen zur Verfügung gestellt."
                )),
            ],
            # Page 2: Rechtsextremismus
            [
                ("heading", "Rechtsextremismus"),
                ("body", (
                    "Der Rechtsextremismus bleibt die größte Bedrohung für die innere Sicherheit "
                    "in Deutschland. Die rechtsextreme Szene umfasst ein breites Spektrum von "
                    "Organisationen, Parteien und losen Netzwerken. Die Zahl der gewaltbereiten "
                    "Rechtsextremisten ist im Berichtszeitraum weiter gestiegen. Besonders "
                    "besorgniserregend ist die zunehmende Bewaffnung der Szene."
                )),
                ("body", (
                    "Der NSU-Komplex und seine Aufarbeitung bleiben ein zentrales Thema. Die "
                    "parlamentarischen Untersuchungsausschüsse auf Bundes- und Landesebene haben "
                    "wichtige Erkenntnisse zur Verstrickung staatlicher Stellen gewonnen. Die "
                    "Aufarbeitung des NSU ist noch nicht abgeschlossen und erfordert weiterhin "
                    "große Anstrengungen der Sicherheitsbehörden."
                )),
                ("body", (
                    "Die rechtsextreme Szene nutzt zunehmend das Internet und soziale Medien "
                    "zur Verbreitung ihrer Ideologie. Rechtsextreme Musikveranstaltungen und "
                    "Kampfsportevents dienen der Rekrutierung und Vernetzung. Die Szene zeigt "
                    "eine hohe Anpassungsfähigkeit an gesellschaftliche Entwicklungen und "
                    "instrumentalisiert aktuelle Krisenthemen für ihre Zwecke."
                )),
                ("body", (
                    "Das Bundesamt beobachtet eine zunehmende Verschmelzung verschiedener "
                    "rechtsextremer Strömungen. Neonazistische Gruppierungen, Reichsbürger und "
                    "rechtspopulistische Akteure agieren verstärkt gemeinsam. Diese Entwicklung "
                    "stellt die Sicherheitsbehörden vor neue Herausforderungen bei der "
                    "Beobachtung und Bekämpfung des Rechtsextremismus."
                )),
            ],
            # Page 3: Linksextremismus
            [
                ("heading", "Linksextremismus"),
                ("body", (
                    "Der Bereich Linksextremismus war im Berichtszeitraum geprägt von "
                    "gewalttätigen Aktionen im Zusammenhang mit Demonstrationen und Protesten. "
                    "Die autonome Szene verübte zahlreiche Anschläge auf Infrastruktur und "
                    "Einrichtungen. Brandanschläge auf Fahrzeuge und Gebäude stellten einen "
                    "Schwerpunkt der linksextremistischen Gewalt dar."
                )),
                ("body", (
                    "Autonome Gruppierungen und Antifa-Strukturen mobilisierten bundesweit zu "
                    "Demonstrationen gegen staatliche Maßnahmen. Die Gewaltbereitschaft bei "
                    "diesen Veranstaltungen hat zugenommen. Polizeibeamte wurden gezielt "
                    "angegriffen, und es kam zu erheblichen Sachschäden in mehreren Städten."
                )),
                ("body", (
                    "Die linksextremistische Szene zeigt eine hohe Vernetzung auf europäischer "
                    "Ebene. Internationale Solidaritätsaktionen und grenzüberschreitende "
                    "Kooperationen wurden verstärkt beobachtet. Die Kommunikation erfolgt "
                    "zunehmend über verschlüsselte Kanäle, was die Aufklärungsarbeit erschwert."
                )),
                ("body", (
                    "Besonders im urbanen Raum agieren autonome Gruppen mit hoher Intensität. "
                    "Die Besetzung von Gebäuden und die Konfrontation mit der Polizei gehören "
                    "zu den regelmäßig eingesetzten Aktionsformen. Die Szene rekrutiert vor "
                    "allem junge Menschen über soziale Medien und alternative Kulturangebote."
                )),
            ],
            # Page 4: Islamismus
            [
                ("heading", "Islamismus"),
                ("body", (
                    "Der islamistische Terrorismus bleibt eine anhaltende Bedrohung für die "
                    "Sicherheit in Deutschland. Die Gefahr durch islamistisch motivierte "
                    "Anschläge ist weiterhin hoch. Der Salafismus stellt dabei die dynamischste "
                    "islamistische Bewegung dar. Die Zahl der salafistischen Anhänger in "
                    "Deutschland ist im Berichtszeitraum weiter angestiegen."
                )),
                ("body", (
                    "Die Radikalisierung über das Internet spielt eine zentrale Rolle bei der "
                    "Verbreitung islamistischer Propaganda. Terroristische Organisationen nutzen "
                    "soziale Medien und Messenger-Dienste zur Rekrutierung und Anleitung "
                    "potenzieller Attentäter. Die Prävention von Online-Radikalisierung ist "
                    "eine der größten Herausforderungen für die Sicherheitsbehörden."
                )),
                ("body", (
                    "Im Bereich des islamistischen Terrorismus wurden mehrere Anschlagsplanungen "
                    "durch die Sicherheitsbehörden aufgedeckt und verhindert. Die internationale "
                    "Zusammenarbeit der Nachrichtendienste hat sich als entscheidend erwiesen. "
                    "Rückkehrer aus den ehemaligen Kampfgebieten des Islamischen Staates stellen "
                    "weiterhin ein Sicherheitsrisiko dar."
                )),
                ("body", (
                    "Die salafistische Szene in Deutschland umfasst mehrere tausend Personen. "
                    "Moscheen und islamische Vereine dienen teilweise als Anlaufstellen für "
                    "Radikalisierungsprozesse. Die Sicherheitsbehörden beobachten eine "
                    "zunehmende Vernetzung salafistischer Akteure auf nationaler und "
                    "internationaler Ebene."
                )),
            ],
            # Page 5: Cyber-Sicherheit
            [
                ("heading", "Cyber-Sicherheit und Spionageabwehr"),
                ("body", (
                    "Im Bereich Cyber-Sicherheit wurden im Berichtszeitraum verstärkt Angriffe "
                    "auf staatliche und private Infrastrukturen beobachtet. Die Bedrohung durch "
                    "Spionage und Sabotage hat erheblich zugenommen. Staatlich gesteuerte "
                    "Cyber-Angriffe richten sich gegen Regierungsstellen, Unternehmen und "
                    "kritische Infrastrukturen."
                )),
                ("body", (
                    "Die Spionageaktivitäten fremder Nachrichtendienste in Deutschland haben "
                    "ein neues Ausmaß erreicht. Cyber-Spionage ermöglicht es feindlichen "
                    "Akteuren, große Mengen vertraulicher Informationen zu erlangen. Die "
                    "Sabotage von IT-Systemen kann weitreichende Folgen für die öffentliche "
                    "Sicherheit und die Wirtschaft haben."
                )),
                ("body", (
                    "Das Bundesamt für Verfassungsschutz hat seine Fähigkeiten im Bereich "
                    "der Cyber-Abwehr weiter ausgebaut. Die Zusammenarbeit mit anderen "
                    "Sicherheitsbehörden und der Privatwirtschaft wurde intensiviert. "
                    "Angriffe auf die Lieferketten von Software-Anbietern stellen eine "
                    "besondere Herausforderung dar."
                )),
                ("body", (
                    "Die zunehmende Digitalisierung aller Lebensbereiche vergrößert die "
                    "Angriffsfläche für Cyber-Angriffe stetig. Hybride Bedrohungen, die "
                    "Cyber-Operationen mit klassischen Spionage- und Einflussmethoden "
                    "kombinieren, nehmen zu. Die Resilienz kritischer Infrastrukturen muss "
                    "weiter gestärkt werden, um den wachsenden Bedrohungen zu begegnen."
                )),
            ],
        ],
    },
    {
        "filename": "vsbericht-bfv-seed-2022.pdf",
        "pages": [
            # Page 1: Title + overview
            [
                ("title", "Verfassungsschutzbericht 2022"),
                ("subtitle", "Bundesamt für Verfassungsschutz"),
                ("body", (
                    "Das Bundesamt für Verfassungsschutz legt hiermit den Verfassungsschutzbericht "
                    "2022 vor. Der Bericht dokumentiert die wesentlichen Erkenntnisse zu "
                    "extremistischen und sicherheitsgefährdenden Bestrebungen im Jahr 2022. "
                    "Die Sicherheitslage in Deutschland war im Berichtszeitraum von einer "
                    "Vielzahl von Herausforderungen geprägt."
                )),
                ("body", (
                    "Der Verfassungsschutz hat seine Beobachtungsaktivitäten intensiviert und "
                    "konnte zahlreiche Bedrohungen frühzeitig erkennen. Die Zusammenarbeit "
                    "zwischen Bund und Ländern wurde weiter verbessert. Der vorliegende Bericht "
                    "gibt einen Überblick über die wichtigsten Phänomenbereiche und Entwicklungen."
                )),
                ("body", (
                    "Im Jahr 2022 stellten der Rechtsextremismus und der Islamismus die "
                    "größten Bedrohungen für die freiheitliche demokratische Grundordnung dar. "
                    "Gleichzeitig gewannen neue Phänomene wie die Delegitimierung des Staates "
                    "und die Verbreitung von Verschwörungstheorien an Bedeutung."
                )),
            ],
            # Page 2: Reichsbürger, Identitäre Bewegung, AfD
            [
                ("heading", "Reichsbürger und Delegitimierung des Staates"),
                ("body", (
                    "Die Reichsbürger-Szene hat sich im Jahr 2022 weiter radikalisiert. Die "
                    "Razzia gegen die Reichsbürger-Gruppierung um Heinrich XIII. Prinz Reuß im "
                    "Dezember 2022 offenbarte umfangreiche Umsturzplanungen. Die Szene stellt "
                    "eine erhebliche Gefahr für die demokratische Grundordnung dar. Die "
                    "Sicherheitsbehörden haben ihre Beobachtungsmaßnahmen verstärkt."
                )),
                ("body", (
                    "Die Identitäre Bewegung verfolgt eine Strategie der kulturellen Subversion "
                    "und propagiert das Konzept des Ethnopluralismus. Ihre Aktionen zielen auf "
                    "mediale Aufmerksamkeit und die Verschiebung des gesellschaftlichen Diskurses. "
                    "Die Bewegung ist in mehreren europäischen Ländern aktiv und verfügt über "
                    "internationale Netzwerke."
                )),
                ("body", (
                    "Die Alternative für Deutschland (AfD) wird in Teilen als rechtsextremistischer "
                    "Verdachtsfall eingestuft. Einzelne Landesverbände wurden als gesichert "
                    "rechtsextremistisch bewertet. Die Partei unterhält Verbindungen zu verschiedenen "
                    "Akteuren der rechtsextremen Szene. Die Beobachtung durch den Verfassungsschutz "
                    "erfolgt unter Beachtung des Parteienprivilegs."
                )),
                ("body", (
                    "Das Personenpotenzial im Bereich der Delegitimierung des Staates ist "
                    "weiterhin besorgniserregend hoch. Die Szene rekrutiert aktiv aus dem "
                    "bürgerlichen Spektrum und radikalisiert sich zunehmend. Gewaltbereite "
                    "Einzelpersonen stellen ein besonderes Risiko dar."
                )),
            ],
            # Page 3: RAF-Bezüge, historische Einordnung
            [
                ("heading", "Historische Einordnung und RAF-Bezüge"),
                ("body", (
                    "Die Aufarbeitung des Linksterrorismus der Roten Armee Fraktion (RAF) bleibt "
                    "ein wichtiges Thema. Die Festnahme von Daniela Klette im Jahr 2024 hat "
                    "die Diskussion über die ungelösten Fälle der RAF neu belebt. Die historische "
                    "Einordnung des RAF-Terrorismus ist für das Verständnis aktueller "
                    "linksextremistischer Bestrebungen von Bedeutung."
                )),
                ("body", (
                    "Die RAF-Bezüge in der heutigen linksextremen Szene sind nach wie vor "
                    "erkennbar. Symboliken und Bezugnahmen auf den bewaffneten Kampf finden "
                    "sich in verschiedenen Publikationen und Aktionsformen. Die historische "
                    "Verklärung der RAF dient einigen Gruppierungen als Legitimation für "
                    "eigene Gewaltaktionen."
                )),
                ("body", (
                    "Die wissenschaftliche Forschung zum Thema RAF und Linksterrorismus hat "
                    "in den letzten Jahren wichtige neue Erkenntnisse hervorgebracht. Archive "
                    "wurden geöffnet und neue Quellen erschlossen. Die Aufarbeitung dieser "
                    "Phase der deutschen Geschichte trägt zum Verständnis von "
                    "Radikalisierungsprozessen bei."
                )),
                ("body", (
                    "Der Verfassungsschutz beobachtet auch heute noch Gruppierungen, die sich "
                    "auf die Traditionen des bewaffneten Kampfes beziehen. Die Gefahr von "
                    "Nachahmungstaten wird ernst genommen. Die historische Analyse fließt in "
                    "die aktuelle Lageeinschätzung ein und hilft bei der Prävention."
                )),
            ],
        ],
    },
    {
        "filename": "vsbericht-by-seed-2023.pdf",
        "pages": [
            # Page 1: Bayerisches Landesamt title
            [
                ("title", "Verfassungsschutzbericht Bayern 2023"),
                ("subtitle", "Bayerisches Landesamt für Verfassungsschutz"),
                ("body", (
                    "Das Bayerische Landesamt für Verfassungsschutz berichtet über die "
                    "Sicherheitslage im Freistaat Bayern für das Jahr 2023. Der Bericht "
                    "dokumentiert extremistische Bestrebungen und gibt einen Überblick über "
                    "die Aktivitäten verfassungsfeindlicher Organisationen in Bayern. Die "
                    "Bedrohungslage hat sich im Berichtszeitraum weiter entwickelt."
                )),
                ("body", (
                    "Bayern nimmt eine besondere Stellung in der deutschen Sicherheitsarchitektur "
                    "ein. Der Freistaat verfügt über ein eigenes Landesamt für Verfassungsschutz, "
                    "das eng mit dem Bundesamt und den anderen Landesbehörden zusammenarbeitet. "
                    "Die VVN-BdA wird in Bayern weiterhin vom Verfassungsschutz beobachtet. "
                    "Diese Beobachtung ist bundesweit einzigartig und wird kontrovers diskutiert."
                )),
                ("body", (
                    "Der vorliegende Bericht gliedert sich in die Bereiche Rechtsextremismus, "
                    "Linksextremismus, Islamismus und Spionageabwehr. Besonderer Schwerpunkt "
                    "liegt auf den regionalen Besonderheiten des Extremismus in Bayern. Die "
                    "grenznahe Lage des Freistaats bringt zusätzliche Herausforderungen in "
                    "der Spionageabwehr mit sich."
                )),
            ],
            # Page 2: VVN-BdA Beobachtung, Rechtsextremismus in Bayern
            [
                ("heading", "Rechtsextremismus in Bayern"),
                ("body", (
                    "Im Bereich Rechtsextremismus wurden in Bayern zahlreiche Veranstaltungen "
                    "der rechtsextremen Szene dokumentiert. Der Freistaat geht konsequent "
                    "gegen verfassungsfeindliche Bestrebungen vor. Die rechtsextreme Szene in "
                    "Bayern umfasst sowohl organisierte Strukturen als auch lose Netzwerke. "
                    "Besonders aktiv sind neonazistische Kameradschaften im ländlichen Raum."
                )),
                ("body", (
                    "Die Vereinigung der Verfolgten des Naziregimes – Bund der Antifaschistinnen "
                    "und Antifaschisten (VVN-BdA) wird in Bayern als linksextremistisch "
                    "beeinflusst eingestuft und beobachtet. Diese Einschätzung wird von "
                    "zahlreichen gesellschaftlichen Akteuren kritisiert. Die VVN-BdA selbst "
                    "bestreitet jegliche extremistische Ausrichtung."
                )),
                ("body", (
                    "Rechtsextreme Musikveranstaltungen und Konzerte finden regelmäßig in Bayern "
                    "statt. Diese Veranstaltungen dienen der Szene als Treffpunkt, Einnahmequelle "
                    "und Rekrutierungsinstrument. Die Sicherheitsbehörden gehen mit Verboten "
                    "und Auflagen gegen diese Events vor. Die Szene weicht zunehmend auf private "
                    "Veranstaltungsorte aus."
                )),
                ("body", (
                    "Die Beobachtung der rechtsextremen Szene in Bayern erfordert erhebliche "
                    "Ressourcen. Das Landesamt hat seine Analysekapazitäten ausgebaut und "
                    "arbeitet verstärkt mit anderen Behörden zusammen. Die Prävention von "
                    "Rechtsextremismus ist ein wichtiger Bestandteil der bayerischen "
                    "Sicherheitsstrategie."
                )),
            ],
            # Page 3: Islamismus in Bayern
            [
                ("heading", "Islamismus in Bayern"),
                ("body", (
                    "Die islamistische Szene in Bayern ist weiterhin aktiv. Salafistische "
                    "Netzwerke unterhalten Verbindungen zu bundesweiten und internationalen "
                    "Strukturen. Die Radikalisierung junger Menschen über das Internet stellt "
                    "auch in Bayern eine erhebliche Herausforderung dar. Die Prävention von "
                    "islamistischer Radikalisierung hat Priorität."
                )),
                ("body", (
                    "Mehrere Moscheen in Bayern stehen unter Beobachtung des Verfassungsschutzes. "
                    "Die Verbreitung islamistischer Propaganda erfolgt zunehmend über soziale "
                    "Medien und Messenger-Dienste. Das Bayerische Landesamt arbeitet eng mit "
                    "den muslimischen Gemeinden zusammen, um Radikalisierungstendenzen "
                    "frühzeitig zu erkennen."
                )),
                ("body", (
                    "Die Rückkehr von Personen aus den ehemaligen Kampfgebieten des Islamischen "
                    "Staates betrifft auch Bayern. Diese Rückkehrer werden engmaschig überwacht "
                    "und gegebenenfalls strafrechtlich verfolgt. Die Reintegration dieser Personen "
                    "stellt eine gesellschaftliche Herausforderung dar."
                )),
                ("body", (
                    "Bayern setzt auf einen ganzheitlichen Ansatz im Umgang mit dem Islamismus. "
                    "Neben der nachrichtendienstlichen Beobachtung werden Präventionsprogramme "
                    "und Deradikalisierungsmaßnahmen durchgeführt. Die Zusammenarbeit mit "
                    "zivilgesellschaftlichen Akteuren und islamischen Verbänden ist ein "
                    "wichtiger Bestandteil dieser Strategie."
                )),
            ],
        ],
    },
    {
        "filename": "vsbericht-th-seed-2021.pdf",
        "pages": [
            # Page 1: NSU-Komplex Aufarbeitung
            [
                ("title", "Verfassungsschutzbericht Thüringen 2021"),
                ("subtitle", "Thüringer Landesamt für Verfassungsschutz"),
                ("body", (
                    "Der Verfassungsschutzbericht Thüringen 2021 widmet sich schwerpunktmäßig "
                    "dem NSU-Komplex und dessen Aufarbeitung. Der Freistaat Thüringen hat eine "
                    "besondere Verantwortung bei der Aufklärung, da der Nationalsozialistische "
                    "Untergrund (NSU) seine Wurzeln in der Thüringer rechtsextremen Szene hatte. "
                    "Die Aufarbeitung dieses Komplexes ist noch nicht abgeschlossen."
                )),
                ("body", (
                    "Der NSU-Komplex hat das Vertrauen der Öffentlichkeit in die "
                    "Sicherheitsbehörden nachhaltig erschüttert. Die parlamentarischen "
                    "Untersuchungsausschüsse haben schwerwiegende Versäumnisse aufgedeckt. "
                    "Der Thüringer Verfassungsschutz hat umfangreiche Reformen durchgeführt, "
                    "um vergleichbare Fehler in Zukunft zu vermeiden."
                )),
                ("body", (
                    "Die Aufarbeitung des NSU-Komplexes umfasst auch die Frage nach der Rolle "
                    "von V-Leuten und verdeckten Ermittlern. Die Aktenvernichtung beim "
                    "Bundesamt für Verfassungsschutz hat die Aufklärung erheblich erschwert. "
                    "Thüringen setzt sich für vollständige Transparenz und lückenlose "
                    "Aufarbeitung ein."
                )),
                ("body", (
                    "Der Bericht dokumentiert auch die Konsequenzen, die aus dem NSU-Komplex "
                    "gezogen wurden. Neue Kontrollmechanismen und verbesserte parlamentarische "
                    "Aufsicht sollen verhindern, dass sich derartige Vorgänge wiederholen. "
                    "Die Reform des Verfassungsschutzes ist ein fortlaufender Prozess, der "
                    "kontinuierliche Anpassungen erfordert."
                )),
            ],
            # Page 2: Neonazistische Strukturen, Kampfsport, Konzerte
            [
                ("heading", "Neonazistische Strukturen in Thüringen"),
                ("body", (
                    "Die rechtsextreme Szene in Thüringen bleibt aktiv und gefährlich. "
                    "Neonazistische Strukturen nutzen Konzerte und Kampfsportveranstaltungen "
                    "zur Rekrutierung und Vernetzung. Diese Events ziehen Teilnehmer aus dem "
                    "gesamten Bundesgebiet und dem europäischen Ausland an. Die Szene verfügt "
                    "über erhebliche finanzielle Ressourcen aus dem Verkauf von Merchandise "
                    "und Eintrittskarten."
                )),
                ("body", (
                    "Kampfsportveranstaltungen der rechtsextremen Szene haben in Thüringen "
                    "eine besondere Bedeutung. Events wie 'Kampf der Nibelungen' ziehen "
                    "hunderte Teilnehmer an und dienen der körperlichen Ertüchtigung für "
                    "gewalttätige Auseinandersetzungen. Die Sicherheitsbehörden gehen mit "
                    "Verboten und Auflagen gegen diese Veranstaltungen vor."
                )),
                ("body", (
                    "Rechtsextreme Konzerte finden regelmäßig in Thüringen statt und sind "
                    "ein wichtiges Element der Szenekultur. Die Musik transportiert "
                    "menschenverachtende und gewaltverherrlichende Inhalte. Konzertbesuche "
                    "dienen der Vernetzung und der Festigung der Gruppenidentität. Die "
                    "Einnahmen aus diesen Veranstaltungen finanzieren weitere Szeneaktivitäten."
                )),
                ("body", (
                    "Der Thüringer Verfassungsschutz beobachtet auch die zunehmende Vernetzung "
                    "der neonazistischen Szene mit anderen extremistischen Milieus. Die Grenzen "
                    "zwischen organisiertem Rechtsextremismus und der sogenannten neuen Rechten "
                    "verschwimmen zunehmend. Diese Entwicklung erfordert eine kontinuierliche "
                    "Anpassung der Beobachtungsstrategien und Analysemethoden."
                )),
            ],
        ],
    },
    {
        "filename": "vsbericht-bfv-seed-2023-kurzfassung.pdf",
        "pages": [
            # Page 1: Kurzfassung title
            [
                ("title", "Verfassungsschutzbericht 2023 — Kurzfassung"),
                ("subtitle", "Bundesamt für Verfassungsschutz"),
                ("body", (
                    "Die vorliegende Kurzfassung gibt einen kompakten Überblick über die "
                    "wesentlichen Erkenntnisse des Verfassungsschutzberichts 2023. Sie fasst "
                    "die wichtigsten Entwicklungen in den Bereichen Rechtsextremismus, "
                    "Linksextremismus, Islamismus und Spionageabwehr zusammen. Die Kurzfassung "
                    "richtet sich an Leserinnen und Leser, die sich schnell über die aktuelle "
                    "Sicherheitslage informieren möchten."
                )),
                ("body", (
                    "Im Berichtszeitraum 2023 hat sich die Bedrohungslage in Deutschland "
                    "weiter verschärft. Der Rechtsextremismus bleibt die größte Bedrohung "
                    "für die innere Sicherheit. Gleichzeitig stellen der islamistische "
                    "Terrorismus und die zunehmende Cyber-Bedrohung erhebliche "
                    "Herausforderungen dar."
                )),
            ],
            # Page 2: Zusammenfassung
            [
                ("heading", "Zusammenfassung der Phänomenbereiche"),
                ("body", (
                    "Der Rechtsextremismus umfasst weiterhin ein breites Spektrum von "
                    "gewaltbereiten Einzelpersonen über neonazistische Gruppierungen bis hin "
                    "zu Akteuren der sogenannten neuen Rechten. Die Zahl der rechtsextremistisch "
                    "motivierten Straftaten ist im Berichtszeitraum angestiegen. Besonders "
                    "besorgniserregend ist die zunehmende Bewaffnung der Szene."
                )),
                ("body", (
                    "Im Bereich Islamismus wurden mehrere Anschlagsplanungen durch die "
                    "Sicherheitsbehörden aufgedeckt und verhindert. Die salafistische Szene "
                    "umfasst weiterhin mehrere tausend Personen. Die Radikalisierung über "
                    "das Internet bleibt eine zentrale Herausforderung für die Prävention."
                )),
                ("body", (
                    "Cyber-Angriffe staatlicher Akteure auf deutsche Einrichtungen haben "
                    "ein neues Ausmaß erreicht. Die Spionageabwehr wurde weiter verstärkt. "
                    "Hybride Bedrohungen, die verschiedene Angriffsmethoden kombinieren, "
                    "nehmen zu und erfordern neue Abwehrstrategien."
                )),
            ],
        ],
    },
    {
        "filename": "vsbericht-bfv-seed-2023_en.pdf",
        "pages": [
            # Page 1: English title
            [
                ("title", "Annual Report on the Protection of the Constitution 2023"),
                ("subtitle", "Federal Office for the Protection of the Constitution"),
                ("body", (
                    "The Annual Report on the Protection of the Constitution 2023 provides "
                    "a comprehensive overview of extremist and terrorist activities in the "
                    "Federal Republic of Germany. The security situation has continued to "
                    "intensify during the reporting period. The Federal Office for the "
                    "Protection of the Constitution observes increasing radicalisation "
                    "across various phenomenon areas."
                )),
                ("body", (
                    "This publication documents the key findings and developments of the "
                    "year 2023. It is aimed at the general public, the media and political "
                    "decision-makers. The report is structured into the areas of right-wing "
                    "extremism, left-wing extremism, Islamism and cyber security."
                )),
            ],
            # Page 2: Right-wing extremism summary
            [
                ("heading", "Right-wing Extremism"),
                ("body", (
                    "Right-wing extremism remains the greatest threat to internal security "
                    "in Germany. The right-wing extremist scene encompasses a broad spectrum "
                    "of organisations, parties and loose networks. The number of violence-prone "
                    "right-wing extremists has continued to rise during the reporting period. "
                    "The increasing armament of the scene is particularly concerning."
                )),
                ("body", (
                    "The right-wing extremist scene increasingly uses the internet and social "
                    "media to spread its ideology. Right-wing extremist music events and "
                    "combat sports events serve as recruitment and networking tools. The scene "
                    "demonstrates a high degree of adaptability to social developments and "
                    "instrumentalises current crisis topics for its purposes."
                )),
                ("body", (
                    "The Federal Office observes an increasing convergence of various right-wing "
                    "extremist currents. Neo-Nazi groups, Reichsbuerger and right-wing populist "
                    "actors increasingly operate jointly. This development poses new challenges "
                    "for the security authorities in monitoring and combating right-wing extremism."
                )),
            ],
        ],
    },
    {
        "filename": "vsbericht-nw-seed-2020.pdf",
        "pages": [
            # Page 1: Rechtsextremismus in NRW
            [
                ("title", "Verfassungsschutzbericht Nordrhein-Westfalen 2020"),
                ("subtitle", "Ministerium des Innern des Landes Nordrhein-Westfalen"),
                ("body", (
                    "Der Verfassungsschutzbericht Nordrhein-Westfalen 2020 analysiert die "
                    "extremistischen Bestrebungen im bevölkerungsreichsten Bundesland. Der "
                    "Rechtsextremismus bleibt die größte Bedrohung für die Sicherheit in "
                    "Nordrhein-Westfalen. Die rechtsextreme Szene in NRW ist vielfältig und "
                    "umfasst Kameradschaften, Parteien und lose Netzwerke."
                )),
                ("body", (
                    "Die Zahl der Rechtsextremisten in Nordrhein-Westfalen ist im "
                    "Berichtszeitraum weiter angestiegen. Besonders besorgniserregend ist die "
                    "zunehmende Gewaltbereitschaft der Szene. Rechtsextremistisch motivierte "
                    "Straftaten haben zugenommen, insbesondere im Bereich der Hasskriminalität. "
                    "Der Verfassungsschutz beobachtet diese Entwicklung mit großer Aufmerksamkeit."
                )),
                ("body", (
                    "Nordrhein-Westfalen ist aufgrund seiner Bevölkerungsstruktur und seiner "
                    "wirtschaftlichen Bedeutung ein besonderer Brennpunkt extremistischer "
                    "Aktivitäten. Die Ballungsräume an Rhein und Ruhr bieten sowohl rechts- "
                    "als auch linksextremistischen Gruppierungen einen Aktionsrahmen. Die "
                    "Sicherheitsbehörden arbeiten eng zusammen, um Bedrohungen frühzeitig "
                    "zu erkennen und abzuwehren."
                )),
                ("body", (
                    "Der vorliegende Bericht dokumentiert die Lage in den verschiedenen "
                    "Phänomenbereichen des Extremismus in NRW. Er richtet sich an die "
                    "Öffentlichkeit und soll zu einem besseren Verständnis der Bedrohungslage "
                    "beitragen. Die Erkenntnisse des Verfassungsschutzes sind ein wichtiger "
                    "Baustein der Sicherheitsarchitektur des Landes."
                )),
            ],
            # Page 2: Salafisten, Koranverteilung
            [
                ("heading", "Salafismus und Islamismus in Nordrhein-Westfalen"),
                ("body", (
                    "Die Salafisten-Szene in Nordrhein-Westfalen ist weiterhin aktiv und "
                    "umfasst mehrere tausend Anhänger. Die Koranverteilungsaktion 'Lies!' "
                    "wurde zwar verboten, aber ähnliche Aktionen der Koranverteilung werden "
                    "unter anderen Namen fortgesetzt. Die Verteilung von Koranen in "
                    "Fußgängerzonen dient der Missionierung und der Kontaktaufnahme mit "
                    "potenziellen Sympathisanten."
                )),
                ("body", (
                    "Nordrhein-Westfalen ist ein Schwerpunkt der salafistischen Szene in "
                    "Deutschland. Städte wie Düsseldorf, Köln und Bonn sind bekannte Zentren "
                    "salafistischer Aktivitäten. Die Szene unterhält Verbindungen zu "
                    "internationalen Netzwerken und finanziert sich teilweise über Spenden "
                    "aus dem Ausland."
                )),
                ("body", (
                    "Die Prävention islamistischer Radikalisierung hat in Nordrhein-Westfalen "
                    "hohe Priorität. Das Land betreibt mehrere Aussteigerprogramme und "
                    "Beratungsstellen für Angehörige von Radikalisierten. Die Zusammenarbeit "
                    "mit muslimischen Gemeinden und Verbänden ist ein wichtiger Bestandteil "
                    "der Präventionsstrategie."
                )),
                ("body", (
                    "Moscheen stehen teilweise unter Beobachtung des Verfassungsschutzes. "
                    "Die Verbreitung islamistischer Propaganda erfolgt zunehmend über digitale "
                    "Kanäle. Der Verfassungsschutz NRW hat seine technischen Fähigkeiten zur "
                    "Beobachtung der Online-Aktivitäten der Szene ausgebaut. Die "
                    "Herausforderung besteht darin, die Balance zwischen Sicherheit und "
                    "Religionsfreiheit zu wahren."
                )),
            ],
        ],
    },
]


def build_styles():
    """Create paragraph styles for the PDF."""
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "SeedTitle",
        parent=styles["Title"],
        fontSize=22,
        spaceAfter=0.5 * cm,
        leading=26,
    )
    subtitle_style = ParagraphStyle(
        "SeedSubtitle",
        parent=styles["Heading2"],
        fontSize=14,
        spaceAfter=1.5 * cm,
        leading=18,
        textColor="#555555",
    )
    heading_style = ParagraphStyle(
        "SeedHeading",
        parent=styles["Heading1"],
        fontSize=16,
        spaceAfter=0.8 * cm,
        leading=20,
    )
    body_style = ParagraphStyle(
        "SeedBody",
        parent=styles["BodyText"],
        fontSize=10.5,
        leading=14,
        spaceAfter=0.4 * cm,
    )

    return {
        "title": title_style,
        "subtitle": subtitle_style,
        "heading": heading_style,
        "body": body_style,
    }


def create_pdf(filepath, pages):
    """Generate a multi-page PDF at the given path."""
    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=A4,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        leftMargin=2.5 * cm,
        rightMargin=2.5 * cm,
    )

    styles = build_styles()
    story = []

    for page_idx, page_elements in enumerate(pages):
        if page_idx > 0:
            story.append(PageBreak())

        for elem_type, text in page_elements:
            story.append(Paragraph(text, styles[elem_type]))
            if elem_type in ("title", "subtitle"):
                story.append(Spacer(1, 0.3 * cm))
            else:
                story.append(Spacer(1, 0.2 * cm))

    doc.build(story)


def main():
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    print(f"PDF directory: {PDF_DIR}")

    created = 0
    skipped = 0

    for pdf_def in SEED_PDFS:
        filepath = PDF_DIR / pdf_def["filename"]
        if filepath.exists():
            print(f"  SKIP {pdf_def['filename']} (already exists)")
            skipped += 1
            continue

        create_pdf(filepath, pdf_def["pages"])
        print(f"  CREATE {pdf_def['filename']} ({len(pdf_def['pages'])} pages)")
        created += 1

    print(f"\nDone: {created} created, {skipped} skipped.")


if __name__ == "__main__":
    main()
