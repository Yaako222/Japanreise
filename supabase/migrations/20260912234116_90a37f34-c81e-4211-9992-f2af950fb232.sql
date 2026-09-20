CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT 'info',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.info_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL,
  section text NOT NULL CHECK (section IN ('infos','checkliste','regeln')),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.info_blocks TO service_role;
ALTER TABLE public.info_blocks ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER announcements_updated_at BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER info_blocks_updated_at BEFORE UPDATE ON public.info_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.info_blocks (trip_id, section, title, body, sort_order) VALUES
('11111111-1111-1111-1111-111111111111','regeln','⏰ Pünktlichkeit ist das A und O','Der Zeitplan ist auf die Minute durchgeplant. Ein Flugzeug wartet keine Sekunde, japanische Züge fahren sekundengenau. Wer sich verspätet, informiert Takashi sofort und zahlt 2 € in die Reisekasse.',10),
('11111111-1111-1111-1111-111111111111','regeln','🏨 Sperrstunde im Hotel','Unter 16 Jahren: bis spätestens 22:00 Uhr zurück im Hotel. Ab 16 Jahren: bis 24:00 Uhr – aber ohne Jüngere unter 16.',20),
('11111111-1111-1111-1111-111111111111','regeln','📝 Ausgänge immer eintragen','Vor jedem Freigang in der App eintragen: wer geht, mit wem, Uhrzeit, Rückkehr und Ziel. Eine Begleitperson muss bestätigen. Bei Rückkehr abhaken.',30),
('11111111-1111-1111-1111-111111111111','regeln','🤝 Aufeinander aufpassen','70 Personen kann niemand allein beaufsichtigen. Jüngere unter 16 sind möglichst immer mit älteren Schülern unterwegs – die Älteren helfen den Jüngeren.',40),
('11111111-1111-1111-1111-111111111111','regeln','🚭 Alkohol & Tabak erst ab 20','In Japan gesetzlich erst ab 20 Jahren erlaubt – ausnahmslos für alle. Bitte strikt einhalten.',50),
('11111111-1111-1111-1111-111111111111','regeln','🚗 Linksverkehr!','Autos fahren links – beim Überqueren zuerst nach RECHTS schauen. Vor dem Hotel gibt es keinen Zebrastreifen, und Autos halten oft nicht an. Nie darauf verlassen, dass gebremst wird.',60),
('11111111-1111-1111-1111-111111111111','regeln','🗑️ Müll mitnehmen','Es gibt kaum öffentliche Mülleimer. Eigenen Müllbeutel dabeihaben und den Müll im Hotel entsorgen.',70),
('11111111-1111-1111-1111-111111111111','regeln','🙂 Freundlich grüßen & geduldig sein','Immer mit Lächeln und Gruß begegnen („Konnichiwa“, „Arigatou“). Über das Englisch anderer nie lachen – aufmerksam zuhören und die Mühe wertschätzen.',80),
('11111111-1111-1111-1111-111111111111','regeln','🖊️ Tattoos abdecken','Tätowierungen müssen in der Schule vollständig abgedeckt sein – z. B. mit Kleidung, Pflastern, Bandagen oder Arm-/Beinlingen.',90),
('11111111-1111-1111-1111-111111111111','regeln','📱 Signal & eSIM','Alle offiziellen Ansagen laufen über Signal. Wer Signal nicht nutzt, muss sich selbst bei anderen über den Ablauf informieren. Eine eSIM für Japan wird dringend empfohlen.',100),
('11111111-1111-1111-1111-111111111111','regeln','⚠️ Konsequenzen','Wer sich nicht an die Vereinbarungen hält, hat am Folgetag nach dem Abendessen Ausgangsverbot. Bei wiederholtem Fehlverhalten werden die Eltern kontaktiert.',110),
('11111111-1111-1111-1111-111111111111','checkliste','🧳 Unbedingt mit ins Handgepäck','Reisepass & Notfalldokumente (auch digital auf dem Handy)
Versicherungskarte / Auslandskrankenversicherung
Powerbank und lose Akkus – niemals in den Koffer!
Medikamente, Brille, wichtige persönliche Dinge',10),
('11111111-1111-1111-1111-111111111111','checkliste','🔌 Strom & Technik','Reiseadapter auf Typ A (mehrere mitnehmen)
Mehrfach-USB-Ladegerät – im Hotelzimmer gibt es wenige Steckdosen
Japan hat 100V: Geräte nur für 220–240V (z. B. Föhn) funktionieren kaum
Signal-App installiert, eSIM für Japan eingerichtet',20),
('11111111-1111-1111-1111-111111111111','checkliste','🎺 Für Musikerinnen und Musiker','Eigenes Mundstück – Pflicht, wenn ihr vor Ort ein Yamaha-Instrument ausleiht
Noten, Stimmgerät, Zubehör
Konzertkleidung',30),
('11111111-1111-1111-1111-111111111111','checkliste','💴 Geld & Suica','EC-Karte funktioniert in Japan NICHT – Kreditkarte (Visa/Mastercard) mitnehmen
Geld wechseln: bester Kurs meist am Flughafen Haneda
Suica-Karte: 15.000 Yen Startguthaben
Davon ca. 5.500 Yen für Fahrten aufheben (6 × 450 Yen Inage, 1 × 1.000 Yen Hiroo)
Mittagessen ca. 1.000 Yen an 6 Tagen (19., 20., 23., 24., 25., 27.)
Ein Abendessen selbst zahlen: ca. 2.000 Yen einplanen
Extra Taschengeld für Souvenirs
Aufladen geht bar am Fahrkartenautomaten oder im Konbini',40),
('11111111-1111-1111-1111-111111111111','checkliste','🗑️ Im Alltag dabei','Eigener Müllbeutel
Trinkflasche
Bequeme Schuhe (viel Laufen)
Kleines Geschenk / Mitbringsel für die Gastgeber',50),
('11111111-1111-1111-1111-111111111111','infos','☎️ Im Notfall','Takashi: +49 179 3243963 (nur über Signal oder WhatsApp erreichbar – keine normalen Anrufe oder SMS)
Notruf Japan: Polizei 110 · Feuerwehr & Rettungsdienst 119',10),
('11111111-1111-1111-1111-111111111111','infos','🏨 Unser Hotel','Tosei Hotel & Seminar Makuhari
2-3-2 Akanehama, Narashino-shi, Chiba 275-0024
Telefon: +81 47-452-0670
Nächster Bahnhof: JR Keiyo-Linie „Shin-Narashino“',20),
('11111111-1111-1111-1111-111111111111','infos','🆘 Japanisch: Notfall & Hilfe','Tasukete kudasai! – 助けてください！ – Hilfe! / Bitte helfen Sie mir!
Takashi-sensei wo sagashite imasu. – タカシ先生を探しています。 – Ich suche Takashi.
Kega o shimashita. – 怪我をしました。 – Ich habe mich verletzt.
Kibun ga warui desu. – 気分が悪いです。 – Mir ist schlecht.
Otoshimono o shimashita. – 落としものをしました。 – Ich habe etwas verloren.',30),
('11111111-1111-1111-1111-111111111111','infos','🧭 Japanisch: Nach dem Weg fragen','… wa doko desu ka? – 〜はどこですか？ – Wo ist …?
Eki wa doko desu ka? – 駅はどこですか？ – Wo ist der Bahnhof?
Hoteru wa doko desu ka? – ホテルはどこですか？ – Wo ist unser Hotel?
Toire wa doko desu ka? – トイレはどこですか？ – Wo ist die Toilette?
Michi ni mayoimashita. – 道に迷いました。 – Ich habe mich verlaufen.',40),
('11111111-1111-1111-1111-111111111111','infos','🙇 Japanisch: Alltag & Höflichkeit','Konnichiwa – こんにちは – Guten Tag / Hallo
Arigatou gozaimasu – ありがとうございます – Vielen Dank
Sumimasen – すみません – Entschuldigung / Verzeihung
Eigo ga hanasemasu ka? – 英語が話せますか？ – Sprechen Sie Englisch?
Daijoubu desu ka? / Daijoubu desu. – 大丈夫ですか？／大丈夫です。 – Alles in Ordnung? / Alles okay.',50),
('11111111-1111-1111-1111-111111111111','infos','🍜 Japanisch: Einkaufen & Essen','Suica de haraimasu. – Suicaで払います。 – Ich bezahle mit Suica.
Suica wa tsukaemasu ka? – Suicaは使えますか？ – Kann ich mit Suica bezahlen?
Watashi wa … no arergī ga arimasu. Taberaremasu ka? – 私は・・・のアレルギーがあります。食べられますか？ – Ich habe eine Allergie gegen … Kann ich das essen?',60);