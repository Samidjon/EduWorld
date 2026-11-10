import type { Curriculum } from "@/types/content";

/**
 * Curricula. EduWorld ships its own skills framework. Country curricula are listed so that
 * official programmes can be connected later - they are DRAFT mappings and must not be
 * presented as the official national programme until reviewed against the source.
 */
export const CURRICULA: Curriculum[] = [
  { id: "eduworld-core-v1", countryCode: "INTL", name: { en: "EduWorld Core Skills Framework", ru: "Базовая программа навыков EduWorld" }, language: "en", version: "1.0.0", status: "reviewed", official: false, source: { en: "EduWorld's own skills graph, reviewed internally. Not an official national curriculum.", ru: "Собственный граф навыков EduWorld, прошёл внутреннюю проверку. Не является официальной государственной программой." } },
  { id: "uz-national-map-draft", countryCode: "UZ", name: { en: "Uzbekistan - national standard mapping (draft)", ru: "Узбекистан - соответствие гос. стандарту (черновик)" }, language: "uz", version: "0.1.0", status: "draft", official: false, source: { en: "Mapping of EduWorld topics to the national standard is not verified yet. Uses EduWorld Core content.", ru: "Сопоставление тем EduWorld с государственным стандартом ещё не проверено. Используется контент Базовой программы EduWorld." } },
  { id: "ru-fgos-map-draft", countryCode: "RU", name: { en: "Russia - FGOS mapping (draft)", ru: "Россия - соответствие ФГОС (черновик)" }, language: "ru", version: "0.1.0", status: "draft", official: false, source: { en: "Mapping to FGOS is not verified yet. Uses EduWorld Core content.", ru: "Соответствие ФГОС ещё не проверено. Используется контент Базовой программы EduWorld." } },
  { id: "kz-map-draft", countryCode: "KZ", name: { en: "Kazakhstan - standard mapping (draft)", ru: "Казахстан - соответствие стандарту (черновик)" }, language: "ru", version: "0.1.0", status: "draft", official: false, source: { en: "Not verified yet. Uses EduWorld Core content.", ru: "Ещё не проверено. Используется контент Базовой программы EduWorld." } },
  { id: "us-ccss-map-draft", countryCode: "US", name: { en: "USA - Common Core mapping (draft)", ru: "США - соответствие Common Core (черновик)" }, language: "en", version: "0.1.0", status: "draft", official: false, source: { en: "Mapping to the Common Core State Standards is not verified yet. Uses EduWorld Core content.", ru: "Соответствие Common Core ещё не проверено. Используется контент Базовой программы EduWorld." } },
  { id: "gb-nc-map-draft", countryCode: "GB", name: { en: "UK - National Curriculum mapping (draft)", ru: "Великобритания - соответствие National Curriculum (черновик)" }, language: "en", version: "0.1.0", status: "draft", official: false, source: { en: "Not verified yet. Uses EduWorld Core content.", ru: "Ещё не проверено. Используется контент Базовой программы EduWorld." } },
];

export const COUNTRIES = [
  { code: "UZ", name: { en: "Uzbekistan", ru: "Узбекистан", uz: "O‘zbekiston" }, flag: "🇺🇿" },
  { code: "RU", name: { en: "Russia", ru: "Россия", uz: "Rossiya" }, flag: "🇷🇺" },
  { code: "KZ", name: { en: "Kazakhstan", ru: "Казахстан", uz: "Qozog‘iston" }, flag: "🇰🇿" },
  { code: "US", name: { en: "United States", ru: "США", uz: "AQSH" }, flag: "🇺🇸" },
  { code: "GB", name: { en: "United Kingdom", ru: "Великобритания", uz: "Buyuk Britaniya" }, flag: "🇬🇧" },
  { code: "INTL", name: { en: "Other country", ru: "Другая страна", uz: "Boshqa davlat" }, flag: "🌍" },
];

export function curriculaForCountry(code: string): Curriculum[] {
  const core = CURRICULA.filter((c) => c.countryCode === "INTL");
  return [...core, ...CURRICULA.filter((c) => c.countryCode === code && c.status !== "archived")];
}
export const getCurriculum = (id: string) => CURRICULA.find((c) => c.id === id);
