// languageService.js
import en from "./en.json";
import ar from "./ar.json";
import de from "./de.json";
import cs from "./cs.json";
import es from "./es.json";
import fr from "./fr.json";
import hu from "./hu.json";
import it from "./it.json";
import ro from "./ro.json";
import ru from "./ru.json";
import * as Localization from "expo-localization";

const translations = { en, ro, ar, de, cs, es, fr, hu, it, ru };
export async function initLocalization() {
  await Localization.getLocalizationAsync(); // Wait for localization to initialize
  var localValue = Localization.locale.split("-")[0]; // Extract the language code
  if (translations[localValue]) currentLanguage = localValue;
  else currentLanguage = "en";

  return currentLanguage;
}

let currentLanguage = "ro";

export function setLanguage(language) {
  currentLanguage = language;
  return currentLanguage;
}
export async function getLocalLanguage() {
  return currentLanguage;
  await Localization.getLocalizationAsync(); // Wait for localization to initialize
  var localValue = Localization.locale; // Extract the language code
  return localValue;
}

export function translate(key) {
  if (key === "weightValidationError")
    console.log("current langualge " + currentLanguage);
  if (!translations[currentLanguage][key]) console.log("wtf" + key);
  var returnValue = translations[currentLanguage][key] || key;

  return returnValue;
}
export function translateToLanguage(key, forcedLanguage) {
  if (key === "weightValidationError")
    console.log("current langualge " + currentLanguage);

  return translations[forcedLanguage][key] || key;
}
