import { InsertObject } from 'kysely'
import type { DB } from '../db.d.ts'

export const WIKIPEDIA_ISO_LANGUAGES = [
  {
    'iso_639_2_b': 'aar',
    'iso_639_2_t': 'aar',
    'iso_639_1': 'aa',
    'language_names': [
      'Afar',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Qafaraf',
      '’Afar Af',
      'Afaraf',
      'Qafar af',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'abk',
    'iso_639_2_t': 'abk',
    'iso_639_1': 'ab',
    'language_names': [
      'Abkhazian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Аҧсуа бызшәа*Aƥsua bızšwa*',
      'Аҧсшәа*Aƥsua*',
    ],
    'other_names': [
      'Abkhaz',
    ],
  },
  {
    'iso_639_2_b': 'ace',
    'iso_639_2_t': 'ace',
    'iso_639_1': null,
    'language_names': [
      'Achinese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'بهسا اچيه, *Basa Acèh*',
    ],
    'other_names': [
      'Acehnese',
    ],
  },
  {
    'iso_639_2_b': 'ach',
    'iso_639_2_t': 'ach',
    'iso_639_1': null,
    'language_names': [
      'Acoli',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Lwo',
    ],
    'other_names': [
      'Acholi',
    ],
  },
  {
    'iso_639_2_b': 'ada',
    'iso_639_2_t': 'ada',
    'iso_639_1': null,
    'language_names': [
      'Adangme',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Dangme',
    ],
    'other_names': [
      'Dangme',
    ],
  },
  {
    'iso_639_2_b': 'ady',
    'iso_639_2_t': 'ady',
    'iso_639_1': null,
    'language_names': [
      'Adyghe',
      'Adygei',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Адыгабзэ',
      'Кӏахыбзэ',
    ],
    'other_names': [
      'West Circassian',
    ],
  },
  {
    'iso_639_2_b': 'afa',
    'iso_639_2_t': 'afa',
    'iso_639_1': null,
    'language_names': [
      'Afro-Asiatic languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'afh',
    'iso_639_2_t': 'afh',
    'iso_639_1': null,
    'language_names': [
      'Afrihili',
    ],
    'scope': 'Individual',
    'type': 'Constructed',
    'native_names': [
      'El-Afrihili',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'afr',
    'iso_639_2_t': 'afr',
    'iso_639_1': 'af',
    'language_names': [
      'Afrikaans',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Afrikaans',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ain',
    'iso_639_2_t': 'ain',
    'iso_639_1': null,
    'language_names': [
      'Ainu',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'アイヌ・イタㇰ, *Ainu-itak*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'aka',
    'iso_639_2_t': 'aka',
    'iso_639_1': 'ak',
    'language_names': [
      'Akan',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Akan',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'akk',
    'iso_639_2_t': 'akk',
    'iso_639_1': null,
    'language_names': [
      'Akkadian',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      '𒀝𒅗𒁺𒌑, *Akkadû*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ale',
    'iso_639_2_t': 'ale',
    'iso_639_1': null,
    'language_names': [
      'Aleut',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Уна́ӈам тунуу́',
      'Унаӈан умсуу',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'alg',
    'iso_639_2_t': 'alg',
    'iso_639_1': null,
    'language_names': [
      'Algonquian languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'alt',
    'iso_639_2_t': 'alt',
    'iso_639_1': null,
    'language_names': [
      'Southern Altai',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Алтай тили',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'amh',
    'iso_639_2_t': 'amh',
    'iso_639_1': 'am',
    'language_names': [
      'Amharic',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'አማርኛ',
      'Amârıñâ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ang',
    'iso_639_2_t': 'ang',
    'iso_639_1': null,
    'language_names': [
      'English, Old (ca.450–1100)',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'Ænglisc',
      'Anglisc',
      'Englisc',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'anp',
    'iso_639_2_t': 'anp',
    'iso_639_1': null,
    'language_names': [
      'Angika',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'अंगिका',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'apa',
    'iso_639_2_t': 'apa',
    'iso_639_1': null,
    'language_names': [
      'Apache languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [
      'Southern Athabaskan languages',
    ],
  },
  {
    'iso_639_2_b': 'ara',
    'iso_639_2_t': 'ara',
    'iso_639_1': 'ar',
    'language_names': [
      'Arabic',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'العربية',
      "al'Arabiyyeẗ",
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'arc',
    'iso_639_2_t': 'arc',
    'iso_639_1': null,
    'language_names': [
      'Official Aramaic (700–300 BCE)',
      'Imperial Aramaic (700–300 BCE)',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'arg',
    'iso_639_2_t': 'arg',
    'iso_639_1': 'an',
    'language_names': [
      'Aragonese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Aragonés',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'arn',
    'iso_639_2_t': 'arn',
    'iso_639_1': null,
    'language_names': [
      'Mapudungun',
      'Mapuche',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Mapudungun',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'arp',
    'iso_639_2_t': 'arp',
    'iso_639_1': null,
    'language_names': [
      'Arapaho',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Hinónoʼeitíít',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'art',
    'iso_639_2_t': 'art',
    'iso_639_1': null,
    'language_names': [
      'Artificial languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic-like',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'arw',
    'iso_639_2_t': 'arw',
    'iso_639_1': null,
    'language_names': [
      'Arawak',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Lokono',
    ],
    'other_names': [
      'Lokono',
    ],
  },
  {
    'iso_639_2_b': 'asm',
    'iso_639_2_t': 'asm',
    'iso_639_1': 'as',
    'language_names': [
      'Assamese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'অসমীয়া',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ast',
    'iso_639_2_t': 'ast',
    'iso_639_1': null,
    'language_names': [
      'Asturian',
      'Bable',
      'Leonese',
      'Asturleonese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Asturianu',
      'Llïonés',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ath',
    'iso_639_2_t': 'ath',
    'iso_639_1': null,
    'language_names': [
      'Athapascan languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [
      'Athabaskan languages',
    ],
  },
  {
    'iso_639_2_b': 'aus',
    'iso_639_2_t': 'aus',
    'iso_639_1': null,
    'language_names': [
      'Australian languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ava',
    'iso_639_2_t': 'ava',
    'iso_639_1': 'av',
    'language_names': [
      'Avaric',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Авар мацӏ',
      'Магӏарул мацӏ',
    ],
    'other_names': [
      'Avar',
    ],
  },
  {
    'iso_639_2_b': 'ave',
    'iso_639_2_t': 'ave',
    'iso_639_1': 'ae',
    'language_names': [
      'Avestan',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'awa',
    'iso_639_2_t': 'awa',
    'iso_639_1': null,
    'language_names': [
      'Awadhi',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'अवधी, *Avadhī*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'aym',
    'iso_639_2_t': 'aym',
    'iso_639_1': 'ay',
    'language_names': [
      'Aymara',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Aymar aru',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'aze',
    'iso_639_2_t': 'aze',
    'iso_639_1': 'az',
    'language_names': [
      'Azerbaijani',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Azərbaycan dili',
      'آذربایجان دیلی',
      'Азәрбајҹан дили',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bad',
    'iso_639_2_t': 'bad',
    'iso_639_1': null,
    'language_names': [
      'Banda languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bai',
    'iso_639_2_t': 'bai',
    'iso_639_1': null,
    'language_names': [
      'Bamileke languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [
      'Bamiléké',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bak',
    'iso_639_2_t': 'bak',
    'iso_639_1': 'ba',
    'language_names': [
      'Bashkir',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Башҡорт теле',
      'Başqort tele',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bal',
    'iso_639_2_t': 'bal',
    'iso_639_1': null,
    'language_names': [
      'Baluchi',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'بلۏچی',
    ],
    'other_names': [
      'Balochi',
    ],
  },
  {
    'iso_639_2_b': 'bam',
    'iso_639_2_t': 'bam',
    'iso_639_1': 'bm',
    'language_names': [
      'Bambara',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ߓߡߊߣߊ߲ߞߊ߲, *Bamanankan*',
    ],
    'other_names': [
      'Bambaran',
    ],
  },
  {
    'iso_639_2_b': 'ban',
    'iso_639_2_t': 'ban',
    'iso_639_1': null,
    'language_names': [
      'Balinese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ᬪᬵᬱᬩᬮᬶ',
      'ᬩᬲᬩᬮᬶ',
      'Basa Bali',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bas',
    'iso_639_2_t': 'bas',
    'iso_639_1': null,
    'language_names': [
      'Basa',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Mbene',
      'Ɓasaá',
    ],
    'other_names': [
      'Basaa',
    ],
  },
  {
    'iso_639_2_b': 'bat',
    'iso_639_2_t': 'bat',
    'iso_639_1': null,
    'language_names': [
      'Baltic languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bej',
    'iso_639_2_t': 'bej',
    'iso_639_1': null,
    'language_names': [
      'Beja',
      'Bedawiyet',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Bidhaawyeet',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bel',
    'iso_639_2_t': 'bel',
    'iso_639_1': 'be',
    'language_names': [
      'Belarusian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Беларуская мова, *Belaruskaâ mova*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bem',
    'iso_639_2_t': 'bem',
    'iso_639_1': null,
    'language_names': [
      'Bemba',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Chibemba',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ben',
    'iso_639_2_t': 'ben',
    'iso_639_1': 'bn',
    'language_names': [
      'Bengali',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'বাংলা, *Bāŋlā*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ber',
    'iso_639_2_t': 'ber',
    'iso_639_1': null,
    'language_names': [
      'Berber languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [
      'ⵜⴰⵎⴰⵣⵉⵖⵜ',
      'ⵝⴰⵎⴰⵣⵉⵗⵝ',
      'ⵜⴰⵎⴰⵣⵉⵗⵜ',
      'Tamaziɣt',
      'Tamazight',
    ],
    'other_names': [
      'Amazigh languages',
    ],
  },
  {
    'iso_639_2_b': 'bho',
    'iso_639_2_t': 'bho',
    'iso_639_1': null,
    'language_names': [
      'Bhojpuri',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'भोजपुरी',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bih',
    'iso_639_2_t': 'bih',
    'iso_639_1': null,
    'language_names': [
      'Bihari languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bik',
    'iso_639_2_t': 'bik',
    'iso_639_1': null,
    'language_names': [
      'Bikol',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Bikol',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bin',
    'iso_639_2_t': 'bin',
    'iso_639_1': null,
    'language_names': [
      'Bini',
      'Edo',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Ẹ̀dó',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bis',
    'iso_639_2_t': 'bis',
    'iso_639_1': 'bi',
    'language_names': [
      'Bislama',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Bislama',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bla',
    'iso_639_2_t': 'bla',
    'iso_639_1': null,
    'language_names': [
      'Siksika',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ᓱᖽᐧᖿ',
    ],
    'other_names': [
      'Blackfoot',
    ],
  },
  {
    'iso_639_2_b': 'bnt',
    'iso_639_2_t': 'bnt',
    'iso_639_1': null,
    'language_names': [
      'Bantu languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bod',
    'iso_639_2_t': 'tib',
    'iso_639_1': 'bo',
    'language_names': [
      'Tibetan',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'བོད་སྐད་, *Bodskad*',
      "ལྷ་སའི་སྐད་, *Lhas'iskad*",
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bos',
    'iso_639_2_t': 'bos',
    'iso_639_1': 'bs',
    'language_names': [
      'Bosnian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Bosanski',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bra',
    'iso_639_2_t': 'bra',
    'iso_639_1': null,
    'language_names': [
      'Braj',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ब्रजभाषा, *Brij Bhasha*',
    ],
    'other_names': [
      'Braj Bhāshā',
    ],
  },
  {
    'iso_639_2_b': 'bre',
    'iso_639_2_t': 'bre',
    'iso_639_1': 'br',
    'language_names': [
      'Breton',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Brezhoneg',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'btk',
    'iso_639_2_t': 'btk',
    'iso_639_1': null,
    'language_names': [
      'Batak languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bua',
    'iso_639_2_t': 'bua',
    'iso_639_1': null,
    'language_names': [
      'Buriat',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'буряад хэлэн',
    ],
    'other_names': [
      'Buryat',
    ],
  },
  {
    'iso_639_2_b': 'bug',
    'iso_639_2_t': 'bug',
    'iso_639_1': null,
    'language_names': [
      'Buginese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ᨅᨔ ᨕᨘᨁᨗ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'bul',
    'iso_639_2_t': 'bul',
    'iso_639_1': 'bg',
    'language_names': [
      'Bulgarian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'български език, *Bălgarski ezik*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'byn',
    'iso_639_2_t': 'byn',
    'iso_639_1': null,
    'language_names': [
      'Blin',
      'Bilin',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ብሊና',
      'ብሊን',
    ],
    'other_names': [
      'Bilen',
    ],
  },
  {
    'iso_639_2_b': 'cad',
    'iso_639_2_t': 'cad',
    'iso_639_1': null,
    'language_names': [
      'Caddo',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Hasí:nay',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'cai',
    'iso_639_2_t': 'cai',
    'iso_639_1': null,
    'language_names': [
      'Central American Indian languages',
    ],
    'scope': 'Collective',
    'type': 'Geographic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'car',
    'iso_639_2_t': 'car',
    'iso_639_1': null,
    'language_names': [
      'Galibi Carib',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      "Kari'nja",
    ],
    'other_names': [
      'Carib',
    ],
  },
  {
    'iso_639_2_b': 'cat',
    'iso_639_2_t': 'cat',
    'iso_639_1': 'ca',
    'language_names': [
      'Catalan',
      'Valencian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Català, Valencià',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'cau',
    'iso_639_2_t': 'cau',
    'iso_639_1': null,
    'language_names': [
      'Caucasian languages',
    ],
    'scope': 'Collective',
    'type': 'Geographic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ceb',
    'iso_639_2_t': 'ceb',
    'iso_639_1': null,
    'language_names': [
      'Cebuano',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Sinugbuanong Binisayâ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'cel',
    'iso_639_2_t': 'cel',
    'iso_639_1': null,
    'language_names': [
      'Celtic languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ces',
    'iso_639_2_t': 'cze',
    'iso_639_1': 'cs',
    'language_names': [
      'Czech',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Čeština',
      'Český jazyk',
    ],
    'other_names': [
      'Czechian',
    ],
  },
  {
    'iso_639_2_b': 'cha',
    'iso_639_2_t': 'cha',
    'iso_639_1': 'ch',
    'language_names': [
      'Chamorro',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      "Finu' Chamoru",
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'chb',
    'iso_639_2_t': 'chb',
    'iso_639_1': null,
    'language_names': [
      'Chibcha',
    ],
    'scope': 'Individual',
    'type': 'Extinct',
    'native_names': [
      'Muysccubun',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'che',
    'iso_639_2_t': 'che',
    'iso_639_1': 'ce',
    'language_names': [
      'Chechen',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Нохчийн мотт',
      'نَاخچیین موٓتت',
      'ნახჩიე მუოთთ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'chg',
    'iso_639_2_t': 'chg',
    'iso_639_1': null,
    'language_names': [
      'Chagatai',
    ],
    'scope': 'Individual',
    'type': 'Extinct',
    'native_names': [
      'جغتای',
    ],
    'other_names': [
      'Eastern Turkic',
    ],
  },
  {
    'iso_639_2_b': 'chk',
    'iso_639_2_t': 'chk',
    'iso_639_1': null,
    'language_names': [
      'Chuukese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Chuukese',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'chm',
    'iso_639_2_t': 'chm',
    'iso_639_1': null,
    'language_names': [
      'Mari',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'марий йылме',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'chn',
    'iso_639_2_t': 'chn',
    'iso_639_1': null,
    'language_names': [
      'Chinook Jargon',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Chinuk wawa',
      'wawa',
      'Chinook lelang',
      'lelang',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'cho',
    'iso_639_2_t': 'cho',
    'iso_639_1': null,
    'language_names': [
      'Choctaw',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      "Chahta'",
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'chp',
    'iso_639_2_t': 'chp',
    'iso_639_1': null,
    'language_names': [
      'Chipewyan',
      'Dene Suline',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ᑌᓀᓱᒼᕄᓀ',
      'Dënesųłiné',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'chr',
    'iso_639_2_t': 'chr',
    'iso_639_1': null,
    'language_names': [
      'Cherokee',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ᏣᎳᎩ ᎦᏬᏂᎯᏍᏗ',
      'Tsalagi gawonihisdi',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'chu',
    'iso_639_2_t': 'chu',
    'iso_639_1': 'cu',
    'language_names': [
      'Church Slavic',
      'Old Slavonic',
      'Church Slavonic',
      'Old Bulgarian',
      ' Old Church Slavonic',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'Славе́нскїй ѧ҆зы́къ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'chv',
    'iso_639_2_t': 'chv',
    'iso_639_1': 'cv',
    'language_names': [
      'Chuvash',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Чӑвашла',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'chy',
    'iso_639_2_t': 'chy',
    'iso_639_1': null,
    'language_names': [
      'Cheyenne',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Tsėhésenėstsestȯtse',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'cmc',
    'iso_639_2_t': 'cmc',
    'iso_639_1': null,
    'language_names': [
      'Chamic languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'cnr',
    'iso_639_2_t': 'cnr',
    'iso_639_1': null,
    'language_names': [
      'Montenegrin',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Црногорски',
      'Crnogorski',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'cop',
    'iso_639_2_t': 'cop',
    'iso_639_1': null,
    'language_names': [
      'Coptic',
    ],
    'scope': 'Individual',
    'type': 'Extinct',
    'native_names': [
      'ϯⲙⲉⲑⲣⲉⲙⲛ̀ⲭⲏⲙⲓ',
      'ⲧⲙⲛ̄ⲧⲣⲙ̄ⲛ̄ⲕⲏⲙⲉ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'cor',
    'iso_639_2_t': 'cor',
    'iso_639_1': 'kw',
    'language_names': [
      'Cornish',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Kernowek',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'cos',
    'iso_639_2_t': 'cos',
    'iso_639_1': 'co',
    'language_names': [
      'Corsican',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Corsu',
      'Lingua corsa',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'cpe',
    'iso_639_2_t': 'cpe',
    'iso_639_1': null,
    'language_names': [
      'Creoles and pidgins, English based',
    ],
    'scope': 'Collective',
    'type': 'Genetic-like',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'cpf',
    'iso_639_2_t': 'cpf',
    'iso_639_1': null,
    'language_names': [
      'Creoles and pidgins, French-based',
    ],
    'scope': 'Collective',
    'type': 'Genetic-like',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'cpp',
    'iso_639_2_t': 'cpp',
    'iso_639_1': null,
    'language_names': [
      'Creoles and pidgins, Portuguese-based',
    ],
    'scope': 'Collective',
    'type': 'Genetic-like',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'cre',
    'iso_639_2_t': 'cre',
    'iso_639_1': 'cr',
    'language_names': [
      'Cree',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'ᓀᐦᐃᔭᐍᐏᐣ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'crh',
    'iso_639_2_t': 'crh',
    'iso_639_1': null,
    'language_names': [
      'Crimean Tatar',
      'Crimean Turkish',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Къырымтатарджа',
      'Къырымтатар тили',
      'Ҡырымтатарҗа',
      'Ҡырымтатар тили',
      'Qırımtatar  tili',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'crp',
    'iso_639_2_t': 'crp',
    'iso_639_1': null,
    'language_names': [
      'Creoles and pidgins',
    ],
    'scope': 'Collective',
    'type': 'Genetic-like',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'csb',
    'iso_639_2_t': 'csb',
    'iso_639_1': null,
    'language_names': [
      'Kashubian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Kaszëbsczi jãzëk',
    ],
    'other_names': [
      'Cassubian',
    ],
  },
  {
    'iso_639_2_b': 'cus',
    'iso_639_2_t': 'cus',
    'iso_639_1': null,
    'language_names': [
      'Cushitic languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'cym',
    'iso_639_2_t': 'wel',
    'iso_639_1': 'cy',
    'language_names': [
      'Welsh',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Cymraeg',
      'y Gymraeg',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'dak',
    'iso_639_2_t': 'dak',
    'iso_639_1': null,
    'language_names': [
      'Dakota',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Dakhótiyapi',
      'Dakȟótiyapi',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'dan',
    'iso_639_2_t': 'dan',
    'iso_639_1': 'da',
    'language_names': [
      'Danish',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Dansk',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'dar',
    'iso_639_2_t': 'dar',
    'iso_639_1': null,
    'language_names': [
      'Dargwa',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Дарган мез',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'day',
    'iso_639_2_t': 'day',
    'iso_639_1': null,
    'language_names': [
      'Land Dayak languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'del',
    'iso_639_2_t': 'del',
    'iso_639_1': null,
    'language_names': [
      'Delaware',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Lënapei èlixsuwakàn',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'den',
    'iso_639_2_t': 'den',
    'iso_639_1': null,
    'language_names': [
      'Slave (Athapascan)',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      "Dene K'e",
    ],
    'other_names': [
      'Slavey',
    ],
  },
  {
    'iso_639_2_b': 'deu',
    'iso_639_2_t': 'ger',
    'iso_639_1': 'de',
    'language_names': [
      'German',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Deutsch',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'dgr',
    'iso_639_2_t': 'dgr',
    'iso_639_1': null,
    'language_names': [
      'Tlicho',
      'Dogrib',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Tłı̨chǫ Yatıì',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'din',
    'iso_639_2_t': 'din',
    'iso_639_1': null,
    'language_names': [
      'Dinka',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Thuɔŋjäŋ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'div',
    'iso_639_2_t': 'div',
    'iso_639_1': 'dv',
    'language_names': [
      'Divehi',
      'Dhivehi',
      'Maldivian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ދިވެހި ދިވެހިބަސް, *Divehi*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'doi',
    'iso_639_2_t': 'doi',
    'iso_639_1': null,
    'language_names': [
      'Dogri',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      '𑠖𑠵𑠌𑠤𑠮',
      'डोगरी',
      'ڈوگرى',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'dra',
    'iso_639_2_t': 'dra',
    'iso_639_1': null,
    'language_names': [
      'Dravidian languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'dsb',
    'iso_639_2_t': 'dsb',
    'iso_639_1': null,
    'language_names': [
      'Lower Sorbian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Dolnoserbski',
      'Dolnoserbšćina',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'dua',
    'iso_639_2_t': 'dua',
    'iso_639_1': null,
    'language_names': [
      'Duala',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Duálá',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'dum',
    'iso_639_2_t': 'dum',
    'iso_639_1': null,
    'language_names': [
      'Dutch, Middle (ca.1050–1350)',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'dyu',
    'iso_639_2_t': 'dyu',
    'iso_639_1': null,
    'language_names': [
      'Dyula',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Julakan',
    ],
    'other_names': [
      'Jula',
    ],
  },
  {
    'iso_639_2_b': 'dzo',
    'iso_639_2_t': 'dzo',
    'iso_639_1': 'dz',
    'language_names': [
      'Dzongkha',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'རྫོང་ཁ་, *Ĵoŋkha*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'efi',
    'iso_639_2_t': 'efi',
    'iso_639_1': null,
    'language_names': [
      'Efik',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Usem Efịk',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'egy',
    'iso_639_2_t': 'egy',
    'iso_639_1': null,
    'language_names': [
      'Egyptian (Ancient)',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'eka',
    'iso_639_2_t': 'eka',
    'iso_639_1': null,
    'language_names': [
      'Ekajuk',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Ekajuk',
    ],
    'other_names': [
      'Kajuk',
    ],
  },
  {
    'iso_639_2_b': 'ell',
    'iso_639_2_t': 'gre',
    'iso_639_1': 'el',
    'language_names': [
      'Greek, Modern (1453–)',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Νέα Ελληνικά, *Néa Ellêniká*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'elx',
    'iso_639_2_t': 'elx',
    'iso_639_1': null,
    'language_names': [
      'Elamite',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'eng',
    'iso_639_2_t': 'eng',
    'iso_639_1': 'en',
    'language_names': [
      'English',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'English',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'enm',
    'iso_639_2_t': 'enm',
    'iso_639_1': null,
    'language_names': [
      'English, Middle (1100–1500)',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'epo',
    'iso_639_2_t': 'epo',
    'iso_639_1': 'eo',
    'language_names': [
      'Esperanto',
    ],
    'scope': 'Individual',
    'type': 'Constructed',
    'native_names': [
      'Esperanto',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'est',
    'iso_639_2_t': 'est',
    'iso_639_1': 'et',
    'language_names': [
      'Estonian',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Eesti keel',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'eus',
    'iso_639_2_t': 'baq',
    'iso_639_1': 'eu',
    'language_names': [
      'Basque',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Euskara',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ewe',
    'iso_639_2_t': 'ewe',
    'iso_639_1': 'ee',
    'language_names': [
      'Ewe',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Èʋegbe',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ewo',
    'iso_639_2_t': 'ewo',
    'iso_639_1': null,
    'language_names': [
      'Ewondo',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Ewondo',
    ],
    'other_names': [
      'Kolo',
    ],
  },
  {
    'iso_639_2_b': 'fan',
    'iso_639_2_t': 'fan',
    'iso_639_1': null,
    'language_names': [
      'Fang',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Fang',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'fao',
    'iso_639_2_t': 'fao',
    'iso_639_1': 'fo',
    'language_names': [
      'Faroese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Føroyskt',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'fas',
    'iso_639_2_t': 'per',
    'iso_639_1': 'fa',
    'language_names': [
      'Persian',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'فارسی, *Fārsī*',
    ],
    'other_names': [
      'Farsi',
    ],
  },
  {
    'iso_639_2_b': 'fat',
    'iso_639_2_t': 'fat',
    'iso_639_1': null,
    'language_names': [
      'Fanti',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Mfantse',
      'Fante',
      'Fanti',
    ],
    'other_names': [
      'Fante',
    ],
  },
  {
    'iso_639_2_b': 'fij',
    'iso_639_2_t': 'fij',
    'iso_639_1': 'fj',
    'language_names': [
      'Fijian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Na Vosa Vakaviti',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'fil',
    'iso_639_2_t': 'fil',
    'iso_639_1': null,
    'language_names': [
      'Filipino',
      'Pilipino',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Wikang Filipino',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'fin',
    'iso_639_2_t': 'fin',
    'iso_639_1': 'fi',
    'language_names': [
      'Finnish',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'suomen kieli',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'fiu',
    'iso_639_2_t': 'fiu',
    'iso_639_1': null,
    'language_names': [
      'Finno-Ugrian languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [
      'Finno-Ugric languages',
    ],
  },
  {
    'iso_639_2_b': 'fon',
    'iso_639_2_t': 'fon',
    'iso_639_1': null,
    'language_names': [
      'Fon',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Fon gbè',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'fra',
    'iso_639_2_t': 'fre',
    'iso_639_1': 'fr',
    'language_names': [
      'French',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Français',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'frm',
    'iso_639_2_t': 'frm',
    'iso_639_1': null,
    'language_names': [
      'French, Middle (ca.1400–1600)',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'François',
      'Franceis',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'fro',
    'iso_639_2_t': 'fro',
    'iso_639_1': null,
    'language_names': [
      'French, Old (842–ca.1400)',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'Franceis',
      'François',
      'Romanz',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'frr',
    'iso_639_2_t': 'frr',
    'iso_639_1': null,
    'language_names': [
      'Northern Frisian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Frasch',
      'Fresk',
      'Freesk',
      'Friisk',
    ],
    'other_names': [
      'North Frisian',
    ],
  },
  {
    'iso_639_2_b': 'frs',
    'iso_639_2_t': 'frs',
    'iso_639_1': null,
    'language_names': [
      'Eastern Frisian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Oostfräsk',
      'Oostfreesk',
      'Plattdüütsk',
    ],
    'other_names': [
      'East Frisian Low Saxon',
    ],
  },
  {
    'iso_639_2_b': 'fry',
    'iso_639_2_t': 'fry',
    'iso_639_1': 'fy',
    'language_names': [
      'Western Frisian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Frysk',
    ],
    'other_names': [
      'West Frisian',
    ],
  },
  {
    'iso_639_2_b': 'ful',
    'iso_639_2_t': 'ful',
    'iso_639_1': 'ff',
    'language_names': [
      'Fulah',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Fulfulde',
      'Pulaar',
      'Pular',
    ],
    'other_names': [
      'Fula',
    ],
  },
  {
    'iso_639_2_b': 'fur',
    'iso_639_2_t': 'fur',
    'iso_639_1': null,
    'language_names': [
      'Friulian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Furlan',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'gaa',
    'iso_639_2_t': 'gaa',
    'iso_639_1': null,
    'language_names': [
      'Ga',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Gã',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'gay',
    'iso_639_2_t': 'gay',
    'iso_639_1': null,
    'language_names': [
      'Gayo',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Basa Gayo',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'gba',
    'iso_639_2_t': 'gba',
    'iso_639_1': null,
    'language_names': [
      'Gbaya',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Gbaya',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'gem',
    'iso_639_2_t': 'gem',
    'iso_639_1': null,
    'language_names': [
      'Germanic languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'gez',
    'iso_639_2_t': 'gez',
    'iso_639_1': null,
    'language_names': [
      'Geez',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'ግዕዝ',
    ],
    'other_names': [
      "Ge'ez",
    ],
  },
  {
    'iso_639_2_b': 'gil',
    'iso_639_2_t': 'gil',
    'iso_639_1': null,
    'language_names': [
      'Gilbertese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Taetae ni Kiribati',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'gla',
    'iso_639_2_t': 'gla',
    'iso_639_1': 'gd',
    'language_names': [
      'Gaelic',
      'Scottish Gaelic',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Gàidhlig',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'gle',
    'iso_639_2_t': 'gle',
    'iso_639_1': 'ga',
    'language_names': [
      'Irish',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Gaeilge',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'glg',
    'iso_639_2_t': 'glg',
    'iso_639_1': 'gl',
    'language_names': [
      'Galician',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Galego',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'glv',
    'iso_639_2_t': 'glv',
    'iso_639_1': 'gv',
    'language_names': [
      'Manx',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Gaelg',
      'Gailck',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'gmh',
    'iso_639_2_t': 'gmh',
    'iso_639_1': null,
    'language_names': [
      'German, Middle High (ca.1050–1500)',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'Diutsch',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'goh',
    'iso_639_2_t': 'goh',
    'iso_639_1': null,
    'language_names': [
      'German, Old High (ca.750–1050)',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'Diutisk',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'gon',
    'iso_639_2_t': 'gon',
    'iso_639_1': null,
    'language_names': [
      'Gondi',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'गोण्डि',
      'Koitur',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'gor',
    'iso_639_2_t': 'gor',
    'iso_639_1': null,
    'language_names': [
      'Gorontalo',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Bahasa Hulontalo',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'got',
    'iso_639_2_t': 'got',
    'iso_639_1': null,
    'language_names': [
      'Gothic',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'Gutiska',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'grb',
    'iso_639_2_t': 'grb',
    'iso_639_1': null,
    'language_names': [
      'Grebo',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Kréébo',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'grc',
    'iso_639_2_t': 'grc',
    'iso_639_1': null,
    'language_names': [
      'Greek, Ancient (to 1453)',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'Ἑλληνική',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'grn',
    'iso_639_2_t': 'grn',
    'iso_639_1': 'gn',
    'language_names': [
      'Guarani',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      "Avañe'ẽ",
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'gsw',
    'iso_639_2_t': 'gsw',
    'iso_639_1': null,
    'language_names': [
      'Swiss German',
      'Alemannic',
      'Alsatian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Schwiizerdütsch',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'guj',
    'iso_639_2_t': 'guj',
    'iso_639_1': 'gu',
    'language_names': [
      'Gujarati',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ગુજરાતી, *Gujarātī*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'gwi',
    'iso_639_2_t': 'gwi',
    'iso_639_1': null,
    'language_names': [
      "Gwich'in",
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Dinjii Zhu’ Ginjik',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'hai',
    'iso_639_2_t': 'hai',
    'iso_639_1': null,
    'language_names': [
      'Haida',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'X̱aat Kíl',
      'X̱aadas Kíl',
      'X̱aayda Kil',
      'Xaad kil',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'hat',
    'iso_639_2_t': 'hat',
    'iso_639_1': 'ht',
    'language_names': [
      'Haitian',
      'Haitian Creole',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Kreyòl Ayisyen',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'hau',
    'iso_639_2_t': 'hau',
    'iso_639_1': 'ha',
    'language_names': [
      'Hausa',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Harshen Hausa',
      'هَرْشَن',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'haw',
    'iso_639_2_t': 'haw',
    'iso_639_1': null,
    'language_names': [
      'Hawaiian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ʻŌlelo Hawaiʻi',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'heb',
    'iso_639_2_t': 'heb',
    'iso_639_1': 'he',
    'language_names': [
      'Hebrew',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      "עברית, *'Ivriyþ*",
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'her',
    'iso_639_2_t': 'her',
    'iso_639_1': 'hz',
    'language_names': [
      'Herero',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Otjiherero',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'hil',
    'iso_639_2_t': 'hil',
    'iso_639_1': null,
    'language_names': [
      'Hiligaynon',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Ilonggo',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'him',
    'iso_639_2_t': 'him',
    'iso_639_1': null,
    'language_names': [
      'Himachali languages',
      'Pahari languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'hin',
    'iso_639_2_t': 'hin',
    'iso_639_1': 'hi',
    'language_names': [
      'Hindi',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'हिन्दी, *Hindī*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'hit',
    'iso_639_2_t': 'hit',
    'iso_639_1': null,
    'language_names': [
      'Hittite',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      '𒉈𒅆𒇷',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'hmn',
    'iso_639_2_t': 'hmn',
    'iso_639_1': null,
    'language_names': [
      'Hmong',
      'Mong',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'lus Hmoob',
      'lug Moob',
      'lol Hmongb',
      '𖬇𖬰𖬞 𖬌𖬣𖬵',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'hmo',
    'iso_639_2_t': 'hmo',
    'iso_639_1': 'ho',
    'language_names': [
      'Hiri Motu',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Police Motu',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'hrv',
    'iso_639_2_t': 'hrv',
    'iso_639_1': 'hr',
    'language_names': [
      'Croatian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Hrvatski',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'hsb',
    'iso_639_2_t': 'hsb',
    'iso_639_1': null,
    'language_names': [
      'Upper Sorbian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Hornjoserbšćina',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'hun',
    'iso_639_2_t': 'hun',
    'iso_639_1': 'hu',
    'language_names': [
      'Hungarian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Magyar nyelv',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'hup',
    'iso_639_2_t': 'hup',
    'iso_639_1': null,
    'language_names': [
      'Hupa',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      "Na:tinixwe Mixine:whe'",
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'hye',
    'iso_639_2_t': 'arm',
    'iso_639_1': 'hy',
    'language_names': [
      'Armenian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Հայերէն, *Hayerèn*',
      'Հայերեն, *Hayeren*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'iba',
    'iso_639_2_t': 'iba',
    'iso_639_1': null,
    'language_names': [
      'Iban',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Jaku Iban',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ibo',
    'iso_639_2_t': 'ibo',
    'iso_639_1': 'ig',
    'language_names': [
      'Igbo',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Asụsụ Igbo',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ido',
    'iso_639_2_t': 'ido',
    'iso_639_1': 'io',
    'language_names': [
      'Ido',
    ],
    'scope': 'Individual',
    'type': 'Constructed',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'iii',
    'iso_639_2_t': 'iii',
    'iso_639_1': 'ii',
    'language_names': [
      'Sichuan Yi',
      'Nuosu',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ꆈꌠꉙ, *Nuosuhxop*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ijo',
    'iso_639_2_t': 'ijo',
    'iso_639_1': null,
    'language_names': [
      'Ijo languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [
      'Ịjọ',
    ],
    'other_names': [
      'Ijaw languages',
    ],
  },
  {
    'iso_639_2_b': 'iku',
    'iso_639_2_t': 'iku',
    'iso_639_1': 'iu',
    'language_names': [
      'Inuktitut',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'ᐃᓄᒃᑎᑐᑦ, *Inuktitut*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ile',
    'iso_639_2_t': 'ile',
    'iso_639_1': 'ie',
    'language_names': [
      'Interlingue',
      'Occidental',
    ],
    'scope': 'Individual',
    'type': 'Constructed',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ilo',
    'iso_639_2_t': 'ilo',
    'iso_639_1': null,
    'language_names': [
      'Iloko',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Pagsasao nga Ilokano',
      'Ilokano',
    ],
    'other_names': [
      'Ilocano',
    ],
  },
  {
    'iso_639_2_b': 'ina',
    'iso_639_2_t': 'ina',
    'iso_639_1': 'ia',
    'language_names': [
      'Interlingua (International Auxiliary Language Association)',
    ],
    'scope': 'Individual',
    'type': 'Constructed',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'inc',
    'iso_639_2_t': 'inc',
    'iso_639_1': null,
    'language_names': [
      'Indic languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [
      'Indo-Aryan languages',
    ],
  },
  {
    'iso_639_2_b': 'ind',
    'iso_639_2_t': 'ind',
    'iso_639_1': 'id',
    'language_names': [
      'Indonesian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'bahasa Indonesia',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ine',
    'iso_639_2_t': 'ine',
    'iso_639_1': null,
    'language_names': [
      'Indo-European languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'inh',
    'iso_639_2_t': 'inh',
    'iso_639_1': null,
    'language_names': [
      'Ingush',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ГӀалгӀай мотт',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ipk',
    'iso_639_2_t': 'ipk',
    'iso_639_1': 'ik',
    'language_names': [
      'Inupiaq',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Iñupiaq',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ira',
    'iso_639_2_t': 'ira',
    'iso_639_1': null,
    'language_names': [
      'Iranian languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'iro',
    'iso_639_2_t': 'iro',
    'iso_639_1': null,
    'language_names': [
      'Iroquoian languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'isl',
    'iso_639_2_t': 'ice',
    'iso_639_1': 'is',
    'language_names': [
      'Icelandic',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Íslenska',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ita',
    'iso_639_2_t': 'ita',
    'iso_639_1': 'it',
    'language_names': [
      'Italian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Italiano',
      'lingua italiana',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'jav',
    'iso_639_2_t': 'jav',
    'iso_639_1': 'jv',
    'language_names': [
      'Javanese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ꦧꦱꦗꦮ',
      'Basa Jawa',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'jbo',
    'iso_639_2_t': 'jbo',
    'iso_639_1': null,
    'language_names': [
      'Lojban',
    ],
    'scope': 'Individual',
    'type': 'Constructed',
    'native_names': [
      'la .lojban.',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'jpn',
    'iso_639_2_t': 'jpn',
    'iso_639_1': 'ja',
    'language_names': [
      'Japanese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      '日本語',
      'Nihongo',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'jpr',
    'iso_639_2_t': 'jpr',
    'iso_639_1': null,
    'language_names': [
      'Judeo-Persian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Dzhidi',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'jrb',
    'iso_639_2_t': 'jrb',
    'iso_639_1': null,
    'language_names': [
      'Judeo-Arabic',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'ערבית יהודית',
      'عربية يهودية',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kaa',
    'iso_639_2_t': 'kaa',
    'iso_639_1': null,
    'language_names': [
      'Kara-Kalpak',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Qaraqalpaq tili',
      'Қарақалпақ тили',
    ],
    'other_names': [
      'Karakalpak',
    ],
  },
  {
    'iso_639_2_b': 'kab',
    'iso_639_2_t': 'kab',
    'iso_639_1': null,
    'language_names': [
      'Kabyle',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Tamaziɣt Taqbaylit',
      'Tazwawt',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kac',
    'iso_639_2_t': 'kac',
    'iso_639_1': null,
    'language_names': [
      'Kachin',
      'Jingpho',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Jingpho',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kal',
    'iso_639_2_t': 'kal',
    'iso_639_1': 'kl',
    'language_names': [
      'Kalaallisut',
      'Greenlandic',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Kalaallisut',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kam',
    'iso_639_2_t': 'kam',
    'iso_639_1': null,
    'language_names': [
      'Kamba',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Kikamba',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kan',
    'iso_639_2_t': 'kan',
    'iso_639_1': 'kn',
    'language_names': [
      'Kannada',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ಕನ್ನಡ',
      'Kannađa',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kar',
    'iso_639_2_t': 'kar',
    'iso_639_1': null,
    'language_names': [
      'Karen languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [
      'Karenic languages',
    ],
  },
  {
    'iso_639_2_b': 'kas',
    'iso_639_2_t': 'kas',
    'iso_639_1': 'ks',
    'language_names': [
      'Kashmiri',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'कॉशुर',
      'كأشُر',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kat',
    'iso_639_2_t': 'geo',
    'iso_639_1': 'ka',
    'language_names': [
      'Georgian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ქართული',
      'Kharthuli',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kau',
    'iso_639_2_t': 'kau',
    'iso_639_1': 'kr',
    'language_names': [
      'Kanuri',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Kànùrí',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kaw',
    'iso_639_2_t': 'kaw',
    'iso_639_1': null,
    'language_names': [
      'Kawi',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'ꦧꦱꦗꦮ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kaz',
    'iso_639_2_t': 'kaz',
    'iso_639_1': 'kk',
    'language_names': [
      'Kazakh',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Қазақ тілі',
      'Qazaq tili',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kbd',
    'iso_639_2_t': 'kbd',
    'iso_639_1': null,
    'language_names': [
      'Kabardian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Адыгэбзэ (Къэбэрдейбзэ)',
      'Adıgăbză (Qăbărdeĭbză)',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kha',
    'iso_639_2_t': 'kha',
    'iso_639_1': null,
    'language_names': [
      'Khasi',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'কা কতিয়েন খাশি, *Ka Ktien Khasi*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'khi',
    'iso_639_2_t': 'khi',
    'iso_639_1': null,
    'language_names': [
      'Khoisan languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'khm',
    'iso_639_2_t': 'khm',
    'iso_639_1': 'km',
    'language_names': [
      'Central Khmer',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ភាសាខ្មែរ, *Phiəsaakhmær*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kho',
    'iso_639_2_t': 'kho',
    'iso_639_1': null,
    'language_names': [
      'Khotanese',
      'Sakan',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [],
    'other_names': [
      'Saka',
    ],
  },
  {
    'iso_639_2_b': 'kik',
    'iso_639_2_t': 'kik',
    'iso_639_1': 'ki',
    'language_names': [
      'Kikuyu',
      'Gikuyu',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Gĩkũyũ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kin',
    'iso_639_2_t': 'kin',
    'iso_639_1': 'rw',
    'language_names': [
      'Kinyarwanda',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Ikinyarwanda',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kir',
    'iso_639_2_t': 'kir',
    'iso_639_1': 'ky',
    'language_names': [
      'Kirghiz',
      'Kyrgyz',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Кыргызча, *Kırgızça*',
      'Кыргыз тили, *Kırgız tili*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kmb',
    'iso_639_2_t': 'kmb',
    'iso_639_1': null,
    'language_names': [
      'Kimbundu',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Kimbundu',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kok',
    'iso_639_2_t': 'kok',
    'iso_639_1': null,
    'language_names': [
      'Konkani',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'कोंकणी',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kom',
    'iso_639_2_t': 'kom',
    'iso_639_1': 'kv',
    'language_names': [
      'Komi',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Коми кыв',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kon',
    'iso_639_2_t': 'kon',
    'iso_639_1': 'kg',
    'language_names': [
      'Kongo',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Kikongo',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kor',
    'iso_639_2_t': 'kor',
    'iso_639_1': 'ko',
    'language_names': [
      'Korean',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      "한국어, *Han'gug'ô*",
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kos',
    'iso_639_2_t': 'kos',
    'iso_639_1': null,
    'language_names': [
      'Kosraean',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Kosraean',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kpe',
    'iso_639_2_t': 'kpe',
    'iso_639_1': null,
    'language_names': [
      'Kpelle',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Kpɛlɛwoo',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'krc',
    'iso_639_2_t': 'krc',
    'iso_639_1': null,
    'language_names': [
      'Karachay-Balkar',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Къарачай-Малкъар тил',
      'Таулу тил',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'krl',
    'iso_639_2_t': 'krl',
    'iso_639_1': null,
    'language_names': [
      'Karelian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      "Kard'al",
      'Kariela',
      'Karjala',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kro',
    'iso_639_2_t': 'kro',
    'iso_639_1': null,
    'language_names': [
      'Kru languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kru',
    'iso_639_2_t': 'kru',
    'iso_639_1': null,
    'language_names': [
      'Kurukh',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'कुड़ुख़',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kua',
    'iso_639_2_t': 'kua',
    'iso_639_1': 'kj',
    'language_names': [
      'Kuanyama',
      'Kwanyama',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Oshikwanyama',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kum',
    'iso_639_2_t': 'kum',
    'iso_639_1': null,
    'language_names': [
      'Kumyk',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Къумукъ тил, *Qumuq til*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kur',
    'iso_639_2_t': 'kur',
    'iso_639_1': 'ku',
    'language_names': [
      'Kurdish',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'کوردی, *Kurdî*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'kut',
    'iso_639_2_t': 'kut',
    'iso_639_1': null,
    'language_names': [
      'Kutenai',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Ktunaxa',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'lad',
    'iso_639_2_t': 'lad',
    'iso_639_1': null,
    'language_names': [
      'Ladino',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Judeo-español',
    ],
    'other_names': [
      'Judaeo-Spanish',
    ],
  },
  {
    'iso_639_2_b': 'lah',
    'iso_639_2_t': 'lah',
    'iso_639_1': null,
    'language_names': [
      'Lahnda',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'بھارت کا',
    ],
    'other_names': [
      'Western Punjabi',
    ],
  },
  {
    'iso_639_2_b': 'lam',
    'iso_639_2_t': 'lam',
    'iso_639_1': null,
    'language_names': [
      'Lamba',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Ichilamba',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'lao',
    'iso_639_2_t': 'lao',
    'iso_639_1': 'lo',
    'language_names': [
      'Lao',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ພາສາລາວ, *Phasalaw*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'lat',
    'iso_639_2_t': 'lat',
    'iso_639_1': 'la',
    'language_names': [
      'Latin',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'Lingua latīna',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'lav',
    'iso_639_2_t': 'lav',
    'iso_639_1': 'lv',
    'language_names': [
      'Latvian',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Latviešu valoda',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'lez',
    'iso_639_2_t': 'lez',
    'iso_639_1': null,
    'language_names': [
      'Lezghian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Лезги чӏал',
    ],
    'other_names': [
      'Lezgian',
    ],
  },
  {
    'iso_639_2_b': 'lim',
    'iso_639_2_t': 'lim',
    'iso_639_1': 'li',
    'language_names': [
      'Limburgan',
      'Limburger',
      'Limburgish',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Lèmburgs',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'lin',
    'iso_639_2_t': 'lin',
    'iso_639_1': 'ln',
    'language_names': [
      'Lingala',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Lingála',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'lit',
    'iso_639_2_t': 'lit',
    'iso_639_1': 'lt',
    'language_names': [
      'Lithuanian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Lietuvių kalba',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'lol',
    'iso_639_2_t': 'lol',
    'iso_639_1': null,
    'language_names': [
      'Mongo',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Lomongo',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'loz',
    'iso_639_2_t': 'loz',
    'iso_639_1': null,
    'language_names': [
      'Lozi',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Silozi',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ltz',
    'iso_639_2_t': 'ltz',
    'iso_639_1': 'lb',
    'language_names': [
      'Luxembourgish',
      'Letzeburgesch',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Lëtzebuergesch',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'lua',
    'iso_639_2_t': 'lua',
    'iso_639_1': null,
    'language_names': [
      'Luba-Lulua',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Cilubà',
      'Tshiluba',
    ],
    'other_names': [
      'Luba-Kasai',
    ],
  },
  {
    'iso_639_2_b': 'lub',
    'iso_639_2_t': 'lub',
    'iso_639_1': 'lu',
    'language_names': [
      'Luba-Katanga',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Kiluba',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'lug',
    'iso_639_2_t': 'lug',
    'iso_639_1': 'lg',
    'language_names': [
      'Ganda',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Luganda',
    ],
    'other_names': [
      'Luganda',
    ],
  },
  {
    'iso_639_2_b': 'lui',
    'iso_639_2_t': 'lui',
    'iso_639_1': null,
    'language_names': [
      'Luiseno',
    ],
    'scope': 'Individual',
    'type': 'Extinct',
    'native_names': [
      "Cham'teela",
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'lun',
    'iso_639_2_t': 'lun',
    'iso_639_1': null,
    'language_names': [
      'Lunda',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Chilunda',
    ],
    'other_names': [
      'Lundan',
    ],
  },
  {
    'iso_639_2_b': 'luo',
    'iso_639_2_t': 'luo',
    'iso_639_1': null,
    'language_names': [
      'Luo (Kenya and Tanzania)',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Dholuo',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'lus',
    'iso_639_2_t': 'lus',
    'iso_639_1': null,
    'language_names': [
      'Lushai',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Mizo ṭawng',
    ],
    'other_names': [
      'Mizo',
    ],
  },
  {
    'iso_639_2_b': 'mad',
    'iso_639_2_t': 'mad',
    'iso_639_1': null,
    'language_names': [
      'Madurese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Madhura',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mag',
    'iso_639_2_t': 'mag',
    'iso_639_1': null,
    'language_names': [
      'Magahi',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'मगही',
    ],
    'other_names': [
      'Magadhi',
    ],
  },
  {
    'iso_639_2_b': 'mah',
    'iso_639_2_t': 'mah',
    'iso_639_1': 'mh',
    'language_names': [
      'Marshallese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Kajin M̧ajeļ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mai',
    'iso_639_2_t': 'mai',
    'iso_639_1': null,
    'language_names': [
      'Maithili',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'मैथिली',
      'মৈথিলী',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mak',
    'iso_639_2_t': 'mak',
    'iso_639_1': null,
    'language_names': [
      'Makasar',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      "ᨅᨔ ᨆᨀᨔᨑ, *basa Mangkasara'*",
    ],
    'other_names': [
      'Makassarese',
    ],
  },
  {
    'iso_639_2_b': 'mal',
    'iso_639_2_t': 'mal',
    'iso_639_1': 'ml',
    'language_names': [
      'Malayalam',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'മലയാളം, *Malayāḷaṁ*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'man',
    'iso_639_2_t': 'man',
    'iso_639_1': null,
    'language_names': [
      'Mandingo',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      "*Mandi'nka kango*, ߡߊ߲߬ߘߌ߲߬ߞߊ, مَانْدِنْجَوْ",
    ],
    'other_names': [
      'Manding',
      'Mandikan',
    ],
  },
  {
    'iso_639_2_b': 'map',
    'iso_639_2_t': 'map',
    'iso_639_1': null,
    'language_names': [
      'Austronesian languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mar',
    'iso_639_2_t': 'mar',
    'iso_639_1': 'mr',
    'language_names': [
      'Marathi',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'मराठी, *Marāţhī*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mas',
    'iso_639_2_t': 'mas',
    'iso_639_1': null,
    'language_names': [
      'Masai',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ɔl Maa',
    ],
    'other_names': [
      'Maasai',
    ],
  },
  {
    'iso_639_2_b': 'mdf',
    'iso_639_2_t': 'mdf',
    'iso_639_1': null,
    'language_names': [
      'Moksha',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Мокшень кяль',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mdr',
    'iso_639_2_t': 'mdr',
    'iso_639_1': null,
    'language_names': [
      'Mandar',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Mandar',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'men',
    'iso_639_2_t': 'men',
    'iso_639_1': null,
    'language_names': [
      'Mende',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Mɛnde yia',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mga',
    'iso_639_2_t': 'mga',
    'iso_639_1': null,
    'language_names': [
      'Irish, Middle (900–1200)',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'Gaoidhealg',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mic',
    'iso_639_2_t': 'mic',
    'iso_639_1': null,
    'language_names': [
      "Mi'kmaq",
      'Micmac',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Míkmawísimk',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'min',
    'iso_639_2_t': 'min',
    'iso_639_1': null,
    'language_names': [
      'Minangkabau',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Baso Minang',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mis',
    'iso_639_2_t': 'mis',
    'iso_639_1': null,
    'language_names': [
      'Uncoded languages',
    ],
    'scope': 'Special',
    'type': 'Special',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mkd',
    'iso_639_2_t': 'mac',
    'iso_639_1': 'mk',
    'language_names': [
      'Macedonian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Македонски јазик, *Makedonski jazik*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mkh',
    'iso_639_2_t': 'mkh',
    'iso_639_1': null,
    'language_names': [
      'Mon-Khmer languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [
      'Austroasiatic languages',
    ],
  },
  {
    'iso_639_2_b': 'mlg',
    'iso_639_2_t': 'mlg',
    'iso_639_1': 'mg',
    'language_names': [
      'Malagasy',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'مَلَغَسِ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mlt',
    'iso_639_2_t': 'mlt',
    'iso_639_1': 'mt',
    'language_names': [
      'Maltese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Malti',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mnc',
    'iso_639_2_t': 'mnc',
    'iso_639_1': null,
    'language_names': [
      'Manchu',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ᠮᠠᠨᠵᡠ ᡤᡳᠰᡠᠨ, *Manju gisun*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mni',
    'iso_639_2_t': 'mni',
    'iso_639_1': null,
    'language_names': [
      'Manipuri',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'মৈতৈলোন, ꯃꯩꯇꯩꯂꯣꯟ, *Meiteilon*',
    ],
    'other_names': [
      'Meitei',
    ],
  },
  {
    'iso_639_2_b': 'mno',
    'iso_639_2_t': 'mno',
    'iso_639_1': null,
    'language_names': [
      'Manobo languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'moh',
    'iso_639_2_t': 'moh',
    'iso_639_1': null,
    'language_names': [
      'Mohawk',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Kanien’kéha',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mon',
    'iso_639_2_t': 'mon',
    'iso_639_1': 'mn',
    'language_names': [
      'Mongolian',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ, Монгол хэл',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mos',
    'iso_639_2_t': 'mos',
    'iso_639_1': null,
    'language_names': [
      'Mossi',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Mooré',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mri',
    'iso_639_2_t': 'mao',
    'iso_639_1': 'mi',
    'language_names': [
      'Maori',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Te Reo Māori',
    ],
    'other_names': [
      'Māori',
    ],
  },
  {
    'iso_639_2_b': 'msa',
    'iso_639_2_t': 'may',
    'iso_639_1': 'ms',
    'language_names': [
      'Malay',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Bahasa Melayu',
    ],
    'other_names': [
      'Malaysian',
    ],
  },
  {
    'iso_639_2_b': 'mul',
    'iso_639_2_t': 'mul',
    'iso_639_1': null,
    'language_names': [
      'Multiple languages',
    ],
    'scope': 'Special',
    'type': 'Special',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mun',
    'iso_639_2_t': 'mun',
    'iso_639_1': null,
    'language_names': [
      'Munda languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mus',
    'iso_639_2_t': 'mus',
    'iso_639_1': null,
    'language_names': [
      'Creek',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Mvskoke',
    ],
    'other_names': [
      'Muscogee',
    ],
  },
  {
    'iso_639_2_b': 'mwl',
    'iso_639_2_t': 'mwl',
    'iso_639_1': null,
    'language_names': [
      'Mirandese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Mirandés',
      'lhéngua Mirandesa',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mwr',
    'iso_639_2_t': 'mwr',
    'iso_639_1': null,
    'language_names': [
      'Marwari',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'मारवाड़ी',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'mya',
    'iso_639_2_t': 'bur',
    'iso_639_1': 'my',
    'language_names': [
      'Burmese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'မြန်မာစာ, *Mrãmācā*',
      'မြန်မာစကား, *Mrãmākā:*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'myn',
    'iso_639_2_t': 'myn',
    'iso_639_1': null,
    'language_names': [
      'Mayan languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'myv',
    'iso_639_2_t': 'myv',
    'iso_639_1': null,
    'language_names': [
      'Erzya',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Ерзянь кель',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nah',
    'iso_639_2_t': 'nah',
    'iso_639_1': null,
    'language_names': [
      'Nahuatl languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [
      'Nahuan languages',
    ],
  },
  {
    'iso_639_2_b': 'nai',
    'iso_639_2_t': 'nai',
    'iso_639_1': null,
    'language_names': [
      'North American Indian languages',
    ],
    'scope': 'Collective',
    'type': 'Geographic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nap',
    'iso_639_2_t': 'nap',
    'iso_639_1': null,
    'language_names': [
      'Neapolitan',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Napulitano',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nau',
    'iso_639_2_t': 'nau',
    'iso_639_1': 'na',
    'language_names': [
      'Nauru',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'dorerin Naoero',
    ],
    'other_names': [
      'Nauruan',
    ],
  },
  {
    'iso_639_2_b': 'nav',
    'iso_639_2_t': 'nav',
    'iso_639_1': 'nv',
    'language_names': [
      'Navajo',
      'Navaho',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Diné bizaad',
      'Naabeehó bizaad',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nbl',
    'iso_639_2_t': 'nbl',
    'iso_639_1': 'nr',
    'language_names': [
      'Ndebele, South',
      'South Ndebele',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'isiNdebele seSewula',
    ],
    'other_names': [
      'Southern Ndebele',
    ],
  },
  {
    'iso_639_2_b': 'nde',
    'iso_639_2_t': 'nde',
    'iso_639_1': 'nd',
    'language_names': [
      'Ndebele, North',
      'North Ndebele',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'siNdebele saseNyakatho',
    ],
    'other_names': [
      'Northern Ndebele',
    ],
  },
  {
    'iso_639_2_b': 'ndo',
    'iso_639_2_t': 'ndo',
    'iso_639_1': 'ng',
    'language_names': [
      'Ndonga',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Ndonga',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nds',
    'iso_639_2_t': 'nds',
    'iso_639_1': null,
    'language_names': [
      'Low German',
      'Low Saxon',
      'German, Low',
      'Saxon, Low',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Plattdütsch',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nep',
    'iso_639_2_t': 'nep',
    'iso_639_1': 'ne',
    'language_names': [
      'Nepali',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'नेपाली, *Gorkhali*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'new',
    'iso_639_2_t': 'new',
    'iso_639_1': null,
    'language_names': [
      'Nepal Bhasa',
      'Newari',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'नेपाल भाषा, *Nepāla bhāṣā*',
    ],
    'other_names': [
      'Newar',
    ],
  },
  {
    'iso_639_2_b': 'nia',
    'iso_639_2_t': 'nia',
    'iso_639_1': null,
    'language_names': [
      'Nias',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Li Niha',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nic',
    'iso_639_2_t': 'nic',
    'iso_639_1': null,
    'language_names': [
      'Niger-Kordofanian languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [
      'Niger-Congo languages',
    ],
  },
  {
    'iso_639_2_b': 'niu',
    'iso_639_2_t': 'niu',
    'iso_639_1': null,
    'language_names': [
      'Niuean',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ko e vagahau Niuē',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nld',
    'iso_639_2_t': 'dut',
    'iso_639_1': 'nl',
    'language_names': [
      'Dutch',
      'Flemish',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Nederlands',
      'Vlaams',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nno',
    'iso_639_2_t': 'nno',
    'iso_639_1': 'nn',
    'language_names': [
      'Norwegian Nynorsk',
      'Nynorsk, Norwegian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Norsk Nynorsk',
    ],
    'other_names': [
      'Nynorsk',
    ],
  },
  {
    'iso_639_2_b': 'nob',
    'iso_639_2_t': 'nob',
    'iso_639_1': 'nb',
    'language_names': [
      'Bokmål, Norwegian',
      'Norwegian Bokmål',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Norsk Bokmål',
    ],
    'other_names': [
      'Bokmål',
    ],
  },
  {
    'iso_639_2_b': 'nog',
    'iso_639_2_t': 'nog',
    'iso_639_1': null,
    'language_names': [
      'Nogai',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Ногай тили',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'non',
    'iso_639_2_t': 'non',
    'iso_639_1': null,
    'language_names': [
      'Norse, Old',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'Dǫnsk tunga',
      'Norrœnt mál',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nor',
    'iso_639_2_t': 'nor',
    'iso_639_1': 'No',
    'language_names': [
      'Norwegian',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Norsk',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nqo',
    'iso_639_2_t': 'nqo',
    'iso_639_1': null,
    'language_names': [
      "N'Ko",
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ߒߞߏ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nso',
    'iso_639_2_t': 'nso',
    'iso_639_1': null,
    'language_names': [
      'Pedi',
      'Sepedi',
      'Northern Sotho',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Sesotho sa Leboa',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nub',
    'iso_639_2_t': 'nub',
    'iso_639_1': null,
    'language_names': [
      'Nubian languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [
      'لغات نوبية',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nwc',
    'iso_639_2_t': 'nwc',
    'iso_639_1': null,
    'language_names': [
      'Classical Newari',
      'Old Newari',
      'Classical Nepal Bhasa',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'पुलां भाय्',
      'पुलाङु नेपाल भाय्',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nya',
    'iso_639_2_t': 'nya',
    'iso_639_1': 'ny',
    'language_names': [
      'Chichewa',
      'Chewa',
      'Nyanja',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Chichewa',
      'Chinyanja',
    ],
    'other_names': [
      'Chichewan',
      'Chewan',
    ],
  },
  {
    'iso_639_2_b': 'nym',
    'iso_639_2_t': 'nym',
    'iso_639_1': null,
    'language_names': [
      'Nyamwezi',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'KiNyamwezi',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nyn',
    'iso_639_2_t': 'nyn',
    'iso_639_1': null,
    'language_names': [
      'Nyankole',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Orunyankore',
    ],
    'other_names': [
      'Nkore',
    ],
  },
  {
    'iso_639_2_b': 'nyo',
    'iso_639_2_t': 'nyo',
    'iso_639_1': null,
    'language_names': [
      'Nyoro',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Orunyoro',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'nzi',
    'iso_639_2_t': 'nzi',
    'iso_639_1': null,
    'language_names': [
      'Nzima',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Nzema',
    ],
    'other_names': [
      'Nzema',
    ],
  },
  {
    'iso_639_2_b': 'oci',
    'iso_639_2_t': 'oci',
    'iso_639_1': 'oc',
    'language_names': [
      'Occitan (post 1500)',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Occitan',
      "lenga d'Òc",
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'oji',
    'iso_639_2_t': 'oji',
    'iso_639_1': 'oj',
    'language_names': [
      'Ojibwa',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'ᐊᓂᐦᔑᓈᐯᒧᐎᓐ',
      'Anishinaabemowin',
    ],
    'other_names': [
      'Ojibwe',
      'Ojibwan',
    ],
  },
  {
    'iso_639_2_b': 'ori',
    'iso_639_2_t': 'ori',
    'iso_639_1': 'or',
    'language_names': [
      'Oriya',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'ଓଡ଼ିଆ',
    ],
    'other_names': [
      'Odia',
      'Odishan',
    ],
  },
  {
    'iso_639_2_b': 'orm',
    'iso_639_2_t': 'orm',
    'iso_639_1': 'om',
    'language_names': [
      'Oromo',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Afaan Oromoo',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'osa',
    'iso_639_2_t': 'osa',
    'iso_639_1': null,
    'language_names': [
      'Osage',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      '𐓏𐓘𐓻𐓘𐓻𐓟 𐒻𐓟, *Wazhazhe ie*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'oss',
    'iso_639_2_t': 'oss',
    'iso_639_1': 'os',
    'language_names': [
      'Ossetian',
      'Ossetic',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Ирон ӕвзаг, *Iron ævzag*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ota',
    'iso_639_2_t': 'ota',
    'iso_639_1': null,
    'language_names': [
      'Turkish, Ottoman (1500–1928)',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'لسان عثمانى, *lisân-ı Osmânî*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'oto',
    'iso_639_2_t': 'oto',
    'iso_639_1': null,
    'language_names': [
      'Otomian languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [
      'Oto-Pamean languages',
    ],
  },
  {
    'iso_639_2_b': 'paa',
    'iso_639_2_t': 'paa',
    'iso_639_1': null,
    'language_names': [
      'Papuan languages',
    ],
    'scope': 'Collective',
    'type': 'Geographic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'pag',
    'iso_639_2_t': 'pag',
    'iso_639_1': null,
    'language_names': [
      'Pangasinan',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Salitan Pangasinan',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'pal',
    'iso_639_2_t': 'pal',
    'iso_639_1': null,
    'language_names': [
      'Pahlavi',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'Pārsīk',
      'Pārsīg',
    ],
    'other_names': [
      'Middle Persian',
    ],
  },
  {
    'iso_639_2_b': 'pam',
    'iso_639_2_t': 'pam',
    'iso_639_1': null,
    'language_names': [
      'Pampanga',
      'Kapampangan',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Amánung Kapampangan',
      'Amánung Sísuan',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'pan',
    'iso_639_2_t': 'pan',
    'iso_639_1': 'pa',
    'language_names': [
      'Panjabi',
      'Punjabi',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ਪੰਜਾਬੀ, پنجابی, *Pãjābī*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'pap',
    'iso_639_2_t': 'pap',
    'iso_639_1': null,
    'language_names': [
      'Papiamento',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Papiamentu',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'pau',
    'iso_639_2_t': 'pau',
    'iso_639_1': null,
    'language_names': [
      'Palauan',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'a tekoi er a Belau',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'peo',
    'iso_639_2_t': 'peo',
    'iso_639_1': null,
    'language_names': [
      'Persian, Old (ca.600–400 B.C.)',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'phi',
    'iso_639_2_t': 'phi',
    'iso_639_1': null,
    'language_names': [
      'Philippine languages',
    ],
    'scope': 'Collective',
    'type': 'Geographic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'phn',
    'iso_639_2_t': 'phn',
    'iso_639_1': null,
    'language_names': [
      'Phoenician',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      "𐤃𐤁𐤓𐤉𐤌 𐤊𐤍𐤏𐤍𐤉𐤌, *Dabariym Kana'aniym*",
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'pli',
    'iso_639_2_t': 'pli',
    'iso_639_1': 'pi',
    'language_names': [
      'Pali',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'Pāli',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'pol',
    'iso_639_2_t': 'pol',
    'iso_639_1': 'pl',
    'language_names': [
      'Polish',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Język polski',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'pon',
    'iso_639_2_t': 'pon',
    'iso_639_1': null,
    'language_names': [
      'Pohnpeian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Lokaiahn Pohnpei',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'por',
    'iso_639_2_t': 'por',
    'iso_639_1': 'pt',
    'language_names': [
      'Portuguese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Português',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'pra',
    'iso_639_2_t': 'pra',
    'iso_639_1': null,
    'language_names': [
      'Prakrit languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'pro',
    'iso_639_2_t': 'pro',
    'iso_639_1': null,
    'language_names': [
      'Provençal, Old (to 1500)',
      'Old Occitan (to 1500)',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'pus',
    'iso_639_2_t': 'pus',
    'iso_639_1': 'ps',
    'language_names': [
      'Pushto',
      'Pashto',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'پښتو, *Pax̌tow*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'que',
    'iso_639_2_t': 'que',
    'iso_639_1': 'qu',
    'language_names': [
      'Quechua',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Runa simi',
      'kichwa simi',
      'Nuna shimi',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'raj',
    'iso_639_2_t': 'raj',
    'iso_639_1': null,
    'language_names': [
      'Rajasthani',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'राजस्थानी',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'rap',
    'iso_639_2_t': 'rap',
    'iso_639_1': null,
    'language_names': [
      'Rapanui',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Vananga rapa nui',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'rar',
    'iso_639_2_t': 'rar',
    'iso_639_1': null,
    'language_names': [
      'Rarotongan',
      'Cook Islands Maori',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      "Māori Kūki 'Āirani",
    ],
    'other_names': [
      'Cook Islands Māori',
    ],
  },
  {
    'iso_639_2_b': 'roa',
    'iso_639_2_t': 'roa',
    'iso_639_1': null,
    'language_names': [
      'Romance languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'roh',
    'iso_639_2_t': 'roh',
    'iso_639_1': 'rm',
    'language_names': [
      'Romansh',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Rumantsch',
      'Rumàntsch',
      'Romauntsch',
      'Romontsch',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'rom',
    'iso_639_2_t': 'rom',
    'iso_639_1': null,
    'language_names': [
      'Romany',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Romani čhib',
    ],
    'other_names': [
      'Romani',
    ],
  },
  {
    'iso_639_2_b': 'ron',
    'iso_639_2_t': 'rum',
    'iso_639_1': 'ro',
    'language_names': [
      'Romanian',
      'Moldavian',
      'Moldovan',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'limba Română',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'run',
    'iso_639_2_t': 'run',
    'iso_639_1': 'rn',
    'language_names': [
      'Rundi',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Ikirundi',
    ],
    'other_names': [
      'Kirundi',
    ],
  },
  {
    'iso_639_2_b': 'rup',
    'iso_639_2_t': 'rup',
    'iso_639_1': null,
    'language_names': [
      'Aromanian',
      'Arumanian',
      'Macedo-Romanian[b]',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Armãneashce',
      'Armãneashti',
      'Rrãmãneshti',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'rus',
    'iso_639_2_t': 'rus',
    'iso_639_1': 'ru',
    'language_names': [
      'Russian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Русский язык',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sad',
    'iso_639_2_t': 'sad',
    'iso_639_1': null,
    'language_names': [
      'Sandawe',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Sàndàwé kì’ìng',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sag',
    'iso_639_2_t': 'sag',
    'iso_639_1': 'sg',
    'language_names': [
      'Sango',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'yângâ tî Sängö',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sah',
    'iso_639_2_t': 'sah',
    'iso_639_1': null,
    'language_names': [
      'Yakut',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Сахалыы',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sai',
    'iso_639_2_t': 'sai',
    'iso_639_1': null,
    'language_names': [
      'South American Indian languages',
    ],
    'scope': 'Collective',
    'type': 'Geographic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sal',
    'iso_639_2_t': 'sal',
    'iso_639_1': null,
    'language_names': [
      'Salishan languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sam',
    'iso_639_2_t': 'sam',
    'iso_639_1': null,
    'language_names': [
      'Samaritan Aramaic',
    ],
    'scope': 'Individual',
    'type': 'Extinct',
    'native_names': [
      'ארמית',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'san',
    'iso_639_2_t': 'san',
    'iso_639_1': 'sa',
    'language_names': [
      'Sanskrit',
    ],
    'scope': 'Macrolanguage',
    'type': 'Historical',
    'native_names': [
      'संस्कृतम्*Sąskŕtam*',
      '𑌸𑌂𑌸𑍍𑌕𑍃𑌤𑌮𑍍',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sas',
    'iso_639_2_t': 'sas',
    'iso_639_1': null,
    'language_names': [
      'Sasak',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ᬪᬵᬲᬵᬲᬓ᭄ᬱᬓ᭄, *Base Sasak*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sat',
    'iso_639_2_t': 'sat',
    'iso_639_1': null,
    'language_names': [
      'Santali',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ᱥᱟᱱᱛᱟᱲᱤ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'scn',
    'iso_639_2_t': 'scn',
    'iso_639_1': null,
    'language_names': [
      'Sicilian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Sicilianu',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sco',
    'iso_639_2_t': 'sco',
    'iso_639_1': null,
    'language_names': [
      'Scots',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Braid Scots',
      'Lallans',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sel',
    'iso_639_2_t': 'sel',
    'iso_639_1': null,
    'language_names': [
      'Selkup',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Чу́мэл шэ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sem',
    'iso_639_2_t': 'sem',
    'iso_639_1': null,
    'language_names': [
      'Semitic languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sga',
    'iso_639_2_t': 'sga',
    'iso_639_1': null,
    'language_names': [
      'Irish, Old (to 900)',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      'Goídelc',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sgn',
    'iso_639_2_t': 'sgn',
    'iso_639_1': null,
    'language_names': [
      'Sign languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic-like',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'shn',
    'iso_639_2_t': 'shn',
    'iso_639_1': null,
    'language_names': [
      'Shan',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ၵႂၢမ်းတႆးယႂ်, *Kwam Tai Yai*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sid',
    'iso_639_2_t': 'sid',
    'iso_639_1': null,
    'language_names': [
      'Sidamo',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Sidaamu Afoo',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sin',
    'iso_639_2_t': 'sin',
    'iso_639_1': 'si',
    'language_names': [
      'Sinhala',
      'Sinhalese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'සිංහල, *Sĩhala*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sio',
    'iso_639_2_t': 'sio',
    'iso_639_1': null,
    'language_names': [
      'Siouan languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sit',
    'iso_639_2_t': 'sit',
    'iso_639_1': null,
    'language_names': [
      'Sino-Tibetan languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sla',
    'iso_639_2_t': 'sla',
    'iso_639_1': null,
    'language_names': [
      'Slavic languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'slk',
    'iso_639_2_t': 'slo',
    'iso_639_1': 'sk',
    'language_names': [
      'Slovak',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Slovenčina',
      'Slovenský jazyk',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'slv',
    'iso_639_2_t': 'slv',
    'iso_639_1': 'sl',
    'language_names': [
      'Slovenian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Slovenščina',
      'Slovenski jezik',
    ],
    'other_names': [
      'Slovene',
    ],
  },
  {
    'iso_639_2_b': 'sma',
    'iso_639_2_t': 'sma',
    'iso_639_1': null,
    'language_names': [
      'Southern Sami',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Åarjelsaemien gïele',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sme',
    'iso_639_2_t': 'sme',
    'iso_639_1': 'se',
    'language_names': [
      'Northern Sami',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Davvisámegiella',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'smi',
    'iso_639_2_t': 'smi',
    'iso_639_1': null,
    'language_names': [
      'Sami languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'smj',
    'iso_639_2_t': 'smj',
    'iso_639_1': null,
    'language_names': [
      'Lule Sami',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Julevsámegiella',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'smn',
    'iso_639_2_t': 'smn',
    'iso_639_1': null,
    'language_names': [
      'Inari Sami',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Anarâškielâ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'smo',
    'iso_639_2_t': 'smo',
    'iso_639_1': 'sm',
    'language_names': [
      'Samoan',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Gagana faʻa Sāmoa',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sms',
    'iso_639_2_t': 'sms',
    'iso_639_1': null,
    'language_names': [
      'Skolt Sami',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Sääʹmǩiõll',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sna',
    'iso_639_2_t': 'sna',
    'iso_639_1': 'sn',
    'language_names': [
      'Shona',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'chiShona',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'snd',
    'iso_639_2_t': 'snd',
    'iso_639_1': 'sd',
    'language_names': [
      'Sindhi',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'सिन्धी, سنڌي',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'snk',
    'iso_639_2_t': 'snk',
    'iso_639_1': null,
    'language_names': [
      'Soninke',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Sooninkanxanne',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sog',
    'iso_639_2_t': 'sog',
    'iso_639_1': null,
    'language_names': [
      'Sogdian',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'som',
    'iso_639_2_t': 'som',
    'iso_639_1': 'so',
    'language_names': [
      'Somali',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'af Soomaali',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'son',
    'iso_639_2_t': 'son',
    'iso_639_1': null,
    'language_names': [
      'Songhai languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [
      'Songhay languages',
    ],
  },
  {
    'iso_639_2_b': 'sot',
    'iso_639_2_t': 'sot',
    'iso_639_1': 'st',
    'language_names': [
      'Sotho, Southern',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Sesotho',
      'Sesotho sa Borwa',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'spa',
    'iso_639_2_t': 'spa',
    'iso_639_1': 'es',
    'language_names': [
      'Spanish',
      'Castilian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Español',
      'Castellano',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sqi',
    'iso_639_2_t': 'alb',
    'iso_639_1': 'sq',
    'language_names': [
      'Albanian',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Shqip',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'srd',
    'iso_639_2_t': 'srd',
    'iso_639_1': 'sc',
    'language_names': [
      'Sardinian',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Sardu',
      'limba Sarda',
      'lingua Sarda',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'srn',
    'iso_639_2_t': 'srn',
    'iso_639_1': null,
    'language_names': [
      'Sranan Tongo',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Sranan Tongo',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'srp',
    'iso_639_2_t': 'srp',
    'iso_639_1': 'sr',
    'language_names': [
      'Serbian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Ссрпски, *Srpski*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'srr',
    'iso_639_2_t': 'srr',
    'iso_639_1': null,
    'language_names': [
      'Serer',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Seereer',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ssa',
    'iso_639_2_t': 'ssa',
    'iso_639_1': null,
    'language_names': [
      'Nilo-Saharan languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ssw',
    'iso_639_2_t': 'ssw',
    'iso_639_1': 'ss',
    'language_names': [
      'Swati',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'siSwati',
    ],
    'other_names': [
      'Swazi',
    ],
  },
  {
    'iso_639_2_b': 'suk',
    'iso_639_2_t': 'suk',
    'iso_639_1': null,
    'language_names': [
      'Sukuma',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Kɪsukuma',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sun',
    'iso_639_2_t': 'sun',
    'iso_639_1': 'su',
    'language_names': [
      'Sundanese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ᮘᮞ ᮞᮥᮔ᮪ᮓ, *basa Sunda*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sus',
    'iso_639_2_t': 'sus',
    'iso_639_1': null,
    'language_names': [
      'Susu',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Sosoxui',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'sux',
    'iso_639_2_t': 'sux',
    'iso_639_1': null,
    'language_names': [
      'Sumerian',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [
      '𒅴𒂠',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'swa',
    'iso_639_2_t': 'swa',
    'iso_639_1': 'sw',
    'language_names': [
      'Swahili',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Kiswahili',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'swe',
    'iso_639_2_t': 'swe',
    'iso_639_1': 'sv',
    'language_names': [
      'Swedish',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Svenska',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'syc',
    'iso_639_2_t': 'syc',
    'iso_639_1': null,
    'language_names': [
      'Classical Syriac',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'syr',
    'iso_639_2_t': 'syr',
    'iso_639_1': null,
    'language_names': [
      'Syriac',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'ܠܫܢܐ ܣܘܪܝܝܐ, *Lešānā Suryāyā*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tah',
    'iso_639_2_t': 'tah',
    'iso_639_1': 'ty',
    'language_names': [
      'Tahitian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Reo Tahiti',
      "Reo Mā'ohi",
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tai',
    'iso_639_2_t': 'tai',
    'iso_639_1': null,
    'language_names': [
      'Tai languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [
      'ภาษาไท',
      'ภาษาไต',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tam',
    'iso_639_2_t': 'tam',
    'iso_639_1': 'ta',
    'language_names': [
      'Tamil',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'தமிழ், *Tamił*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tat',
    'iso_639_2_t': 'tat',
    'iso_639_1': 'tt',
    'language_names': [
      'Tatar',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Татар теле, *Tatar tele*, تاتار',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tel',
    'iso_639_2_t': 'tel',
    'iso_639_1': 'te',
    'language_names': [
      'Telugu',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'తెలుగు, *Telugu*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tem',
    'iso_639_2_t': 'tem',
    'iso_639_1': null,
    'language_names': [
      'Timne',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'KʌThemnɛ',
    ],
    'other_names': [
      'Temne',
    ],
  },
  {
    'iso_639_2_b': 'ter',
    'iso_639_2_t': 'ter',
    'iso_639_1': null,
    'language_names': [
      'Tereno',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Terêna',
    ],
    'other_names': [
      'Terena',
    ],
  },
  {
    'iso_639_2_b': 'tet',
    'iso_639_2_t': 'tet',
    'iso_639_1': null,
    'language_names': [
      'Tetum',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Lia-Tetun',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tgk',
    'iso_639_2_t': 'tgk',
    'iso_639_1': 'tg',
    'language_names': [
      'Tajik',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Тоҷикӣ, *toçikī*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tgl',
    'iso_639_2_t': 'tgl',
    'iso_639_1': 'tl',
    'language_names': [
      'Tagalog',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Wikang Tagalog',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tha',
    'iso_639_2_t': 'tha',
    'iso_639_1': 'th',
    'language_names': [
      'Thai',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ภาษาไทย, *Phasathay*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tig',
    'iso_639_2_t': 'tig',
    'iso_639_1': null,
    'language_names': [
      'Tigre',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ትግረ',
      'ትግሬ',
      'ኻሳ',
      'ትግራይት',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tir',
    'iso_639_2_t': 'tir',
    'iso_639_1': 'ti',
    'language_names': [
      'Tigrinya',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ትግርኛ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tiv',
    'iso_639_2_t': 'tiv',
    'iso_639_1': null,
    'language_names': [
      'Tiv',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Tiv',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tkl',
    'iso_639_2_t': 'tkl',
    'iso_639_1': null,
    'language_names': [
      'Tokelau',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'gagana Tokelau',
    ],
    'other_names': [
      'Tokelauan',
    ],
  },
  {
    'iso_639_2_b': 'tlh',
    'iso_639_2_t': 'tlh',
    'iso_639_1': null,
    'language_names': [
      'Klingon',
      'tlhIngan-Hol',
    ],
    'scope': 'Individual',
    'type': 'Constructed',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tli',
    'iso_639_2_t': 'tli',
    'iso_639_1': null,
    'language_names': [
      'Tlingit',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Lingít',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tmh',
    'iso_639_2_t': 'tmh',
    'iso_639_1': null,
    'language_names': [
      'Tamashek',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [],
    'other_names': [
      'Tuareg',
      'Tamasheq',
    ],
  },
  {
    'iso_639_2_b': 'tog',
    'iso_639_2_t': 'tog',
    'iso_639_1': null,
    'language_names': [
      'Tonga (Nyasa)',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'chiTonga',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ton',
    'iso_639_2_t': 'ton',
    'iso_639_1': 'to',
    'language_names': [
      'Tonga (Tonga Islands)',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'lea faka-Tonga',
    ],
    'other_names': [
      'Tongan',
    ],
  },
  {
    'iso_639_2_b': 'tpi',
    'iso_639_2_t': 'tpi',
    'iso_639_1': null,
    'language_names': [
      'Tok Pisin',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Tok Pisin',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tsi',
    'iso_639_2_t': 'tsi',
    'iso_639_1': null,
    'language_names': [
      'Tsimshian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Tsmksian',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tsn',
    'iso_639_2_t': 'tsn',
    'iso_639_1': 'tn',
    'language_names': [
      'Tswana',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Setswana',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tso',
    'iso_639_2_t': 'tso',
    'iso_639_1': 'ts',
    'language_names': [
      'Tsonga',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Xitsonga',
    ],
    'other_names': [
      'Tsongan',
    ],
  },
  {
    'iso_639_2_b': 'tuk',
    'iso_639_2_t': 'tuk',
    'iso_639_1': 'tk',
    'language_names': [
      'Turkmen',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      '*Türkmençe*, Түркменче, تۆرکمنچه‎',
      '*Türkmen dili*, Түркмен дили, تۆرکمن ديلی',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tum',
    'iso_639_2_t': 'tum',
    'iso_639_1': null,
    'language_names': [
      'Tumbuka',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'chiTumbuka',
    ],
    'other_names': [
      'Tumbukan',
    ],
  },
  {
    'iso_639_2_b': 'tup',
    'iso_639_2_t': 'tup',
    'iso_639_1': null,
    'language_names': [
      'Tupi languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [
      'Tupian languages',
    ],
  },
  {
    'iso_639_2_b': 'tur',
    'iso_639_2_t': 'tur',
    'iso_639_1': 'tr',
    'language_names': [
      'Turkish',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Türkçe',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tut',
    'iso_639_2_t': 'tut',
    'iso_639_1': null,
    'language_names': [
      'Altaic languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tvl',
    'iso_639_2_t': 'tvl',
    'iso_639_1': null,
    'language_names': [
      'Tuvalu',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Te Ggana Tuuvalu',
      'Te Gagana Tuuvalu',
    ],
    'other_names': [
      'Tuvaluan',
    ],
  },
  {
    'iso_639_2_b': 'twi',
    'iso_639_2_t': 'twi',
    'iso_639_1': 'tw',
    'language_names': [
      'Twi',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Twi',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'tyv',
    'iso_639_2_t': 'tyv',
    'iso_639_1': null,
    'language_names': [
      'Tuvinian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Тыва дыл',
    ],
    'other_names': [
      'Tuvan',
    ],
  },
  {
    'iso_639_2_b': 'udm',
    'iso_639_2_t': 'udm',
    'iso_639_1': null,
    'language_names': [
      'Udmurt',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Удмурт кыл',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'uga',
    'iso_639_2_t': 'uga',
    'iso_639_1': null,
    'language_names': [
      'Ugaritic',
    ],
    'scope': 'Individual',
    'type': 'Historical',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'uig',
    'iso_639_2_t': 'uig',
    'iso_639_1': 'ug',
    'language_names': [
      'Uighur',
      'Uyghur',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ئۇيغۇر تىلى, *Uyghur tili*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ukr',
    'iso_639_2_t': 'ukr',
    'iso_639_1': 'uk',
    'language_names': [
      'Ukrainian',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Українська мова',
      'Українська',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'umb',
    'iso_639_2_t': 'umb',
    'iso_639_1': null,
    'language_names': [
      'Umbundu',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Úmbúndú',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'und',
    'iso_639_2_t': 'und',
    'iso_639_1': null,
    'language_names': [
      'Undetermined',
    ],
    'scope': 'Special',
    'type': 'Special',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'urd',
    'iso_639_2_t': 'urd',
    'iso_639_1': 'ur',
    'language_names': [
      'Urdu',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'اُردُو*Urduw*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'uzb',
    'iso_639_2_t': 'uzb',
    'iso_639_1': 'uz',
    'language_names': [
      'Uzbek',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      '*Oʻzbekcha*, *Ózbekça*, ўзбекча, ئوزبېچه',
      '  *oʻzbek tili*, ўзбек тили, ئوبېک تیلی',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'vai',
    'iso_639_2_t': 'vai',
    'iso_639_1': null,
    'language_names': [
      'Vai',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ꕙꔤ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ven',
    'iso_639_2_t': 'ven',
    'iso_639_1': 've',
    'language_names': [
      'Venda',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Tshivenḓa',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'vie',
    'iso_639_2_t': 'vie',
    'iso_639_1': 'vi',
    'language_names': [
      'Vietnamese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Tiếng Việt',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'vol',
    'iso_639_2_t': 'vol',
    'iso_639_1': 'vo',
    'language_names': [
      'Volapük',
    ],
    'scope': 'Individual',
    'type': 'Constructed',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'vot',
    'iso_639_2_t': 'vot',
    'iso_639_1': null,
    'language_names': [
      'Votic',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Vaďďa tšeeli',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'wak',
    'iso_639_2_t': 'wak',
    'iso_639_1': null,
    'language_names': [
      'Wakashan languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'wal',
    'iso_639_2_t': 'wal',
    'iso_639_1': null,
    'language_names': [
      'Wolaitta',
      'Wolaytta',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Wolayttatto Doonaa',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'war',
    'iso_639_2_t': 'war',
    'iso_639_1': null,
    'language_names': [
      'Waray',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Winaray',
      'Samareño',
      'Lineyte-Samarnon',
      'Binisayâ nga Winaray',
      'Binisayâ  nga Samar-Leyte',
      'Binisayâ nga Waray',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'was',
    'iso_639_2_t': 'was',
    'iso_639_1': null,
    'language_names': [
      'Washo',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Wá:šiw ʔítlu',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'wen',
    'iso_639_2_t': 'wen',
    'iso_639_1': null,
    'language_names': [
      'Sorbian languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [
      '*Serbsce',
      'Serbski*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'wln',
    'iso_639_2_t': 'wln',
    'iso_639_1': 'wa',
    'language_names': [
      'Walloon',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Walon',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'wol',
    'iso_639_2_t': 'wol',
    'iso_639_1': 'wo',
    'language_names': [
      'Wolof',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Wolof làkk',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'xal',
    'iso_639_2_t': 'xal',
    'iso_639_1': null,
    'language_names': [
      'Kalmyk',
      'Oirat',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Хальмг келн, *Xaľmg keln*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'xho',
    'iso_639_2_t': 'xho',
    'iso_639_1': 'xh',
    'language_names': [
      'Xhosa',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'isiXhosa',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'yao',
    'iso_639_2_t': 'yao',
    'iso_639_1': null,
    'language_names': [
      'Yao',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'chiYao',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'yap',
    'iso_639_2_t': 'yap',
    'iso_639_1': null,
    'language_names': [
      'Yapese',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Thin nu Waqaab',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'yid',
    'iso_639_2_t': 'yid',
    'iso_639_1': 'yi',
    'language_names': [
      'Yiddish',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'ייִדיש',
      'יידיש',
      'אידיש*Yidiš*',
    ],
    'other_names': [
      'Judeo-German',
    ],
  },
  {
    'iso_639_2_b': 'yor',
    'iso_639_2_t': 'yor',
    'iso_639_1': 'yo',
    'language_names': [
      'Yoruba',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'èdè Yorùbá',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'ypk',
    'iso_639_2_t': 'ypk',
    'iso_639_1': null,
    'language_names': [
      'Yupik languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'zap',
    'iso_639_2_t': 'zap',
    'iso_639_1': null,
    'language_names': [
      'Zapotec',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Diidxazá*, *Dizhsa',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'zbl',
    'iso_639_2_t': 'zbl',
    'iso_639_1': null,
    'language_names': [
      'Blissymbols',
      'Blissymbolics',
      'Bliss',
    ],
    'scope': 'Individual',
    'type': 'Constructed',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'zen',
    'iso_639_2_t': 'zen',
    'iso_639_1': null,
    'language_names': [
      'Zenaga',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'Tuẓẓungiyya',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'zgh',
    'iso_639_2_t': 'zgh',
    'iso_639_1': null,
    'language_names': [
      'Standard Moroccan Tamazight',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'ⵜⴰⵎⴰⵣⵉⵖⵜ ⵜⴰⵏⴰⵡⴰⵢⵜ',
    ],
    'other_names': [
      'Standard Moroccan Berber',
    ],
  },
  {
    'iso_639_2_b': 'zha',
    'iso_639_2_t': 'zha',
    'iso_639_1': 'ZA',
    'language_names': [
      'Zhuang',
      'Chuang',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      '話僮, *Vahcuengh*',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'zho',
    'iso_639_2_t': 'chi',
    'iso_639_1': 'zh',
    'language_names': [
      'Chinese',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      '中文',
      'Zhōngwén',
      '汉语',
      '漢語',
      'Hànyǔ',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'znd',
    'iso_639_2_t': 'znd',
    'iso_639_1': null,
    'language_names': [
      'Zande languages',
    ],
    'scope': 'Collective',
    'type': 'Genetic',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'zul',
    'iso_639_2_t': 'zul',
    'iso_639_1': 'zu',
    'language_names': [
      'Zulu',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      'isiZulu',
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'zun',
    'iso_639_2_t': 'zun',
    'iso_639_1': null,
    'language_names': [
      'Zuni',
    ],
    'scope': 'Individual',
    'type': 'Living',
    'native_names': [
      "Shiwi'ma",
    ],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'zxx',
    'iso_639_2_t': 'zxx',
    'iso_639_1': null,
    'language_names': [
      'No linguistic content',
      'Not applicable',
    ],
    'scope': 'Special',
    'type': 'Special',
    'native_names': [],
    'other_names': [],
  },
  {
    'iso_639_2_b': 'zza',
    'iso_639_2_t': 'zza',
    'iso_639_1': null,
    'language_names': [
      'Zaza',
      'Dimili',
      'Dimli',
      'Kirdki',
      'Kirmanjki',
      'Zazaki',
    ],
    'scope': 'Macrolanguage',
    'type': 'Living',
    'native_names': [
      'Kirmanckî',
      'Dimilkî',
      'Kirdkî',
      'Zazakî',
    ],
    'other_names': [
      'Zazan',
    ],
  },
] satisfies InsertObject<DB, 'languages'>[]
