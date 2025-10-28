import { LanguageType } from '../db.d.ts'
import wikipediaIsoLanguages from '../db/resources/languages/wikipedia-iso-languages.ts'

const living_language_types = new Set<LanguageType>([
  'Living',
  'Genetic',
  'Genetic-like',
])

export const LIVING_LANGUAGES = wikipediaIsoLanguages.filter((lang) =>
  living_language_types.has(lang.type)
)

export const OFFICIAL_LANGUAGES = {
  ZA: new Set([
    'afr', // Afrikaans
    'eng', // English
    'nbl', // Ndebele (South)
    'nso', // Pedi (Northern Sotho)
    'sgn', // South African Sign Language
    'sot', // Sotho (Southern)
    'ssw', // Swazi
    'tsn', // Tswana
    'tso', // Tsonga
    'ven', // Venda
    'xho', // Xhosa
    'zul', // Zulu
  ]),
}
