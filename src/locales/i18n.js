import { createI18n } from 'vue-i18n'
import en from './en.json'
import ar from './ar.json'

const savedLang = localStorage.getItem('preferred_language') || 'en'

export default createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'en',
  messages: { en, ar },
  datetimeFormats: {
    en: {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long:  { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    },
    ar: {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long:  { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    },
  },
})
