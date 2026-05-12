import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as RNLocalize from 'react-native-localize'

import en from './locales/en.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
}

const LANGUAGE_KEY = 'appLanguage'

const languageDetector = {
  type: 'languageDetector',
  async: true,

  detect: async (callback: any) => {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY)

    if (savedLanguage) {
      callback(savedLanguage)
      return
    }

    const locales = RNLocalize.getLocales()
    const deviceLanguage = locales?.[0]?.languageCode ?? 'en'

    callback(deviceLanguage)
  },

  init: () => {},

  cacheUserLanguage: async (language: string) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, language)
  }
}

i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    initImmediate: false,
  })

export default i18n