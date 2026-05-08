import { en } from "./en";
import { ka } from "./ka";

const dictionaries = {
  en,
  ka,
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = (locale: Locale) => dictionaries[locale];
