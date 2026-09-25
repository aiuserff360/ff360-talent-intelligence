// One exchange-rate table drives every currency view, so a figure shown in dollars, euros or yen is always the
// same rupee amount converted through the same reference rates. Rates are ECB euro reference rates (24 Sep 2026)
// re-expressed per USD, identical to the table used by the FF360 GCC Business Case Builder.
export const FX = {
  asOf: '24 September 2026',
  source: 'European Central Bank euro foreign exchange reference rates, converted to per-USD',
  url: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html',
  perUsd: { INR: 95.96, USD: 1, EUR: 0.8797, GBP: 0.7565, JPY: 158.85, CHF: 0.8278, SGD: 1.2799, AUD: 1.4232, CAD: 1.4117, AED: 3.6725, CNY: 6.7126, HKD: 7.8427, SEK: 9.9098 },
};

export const CURRENCIES = [
  { code: 'INR', name: 'Indian rupee', symbol: '₹', locale: 'en-IN', decimals: 0, note: 'Reference currency; annual figures shown in lakh' },
  { code: 'USD', name: 'US dollar', symbol: '$', locale: 'en-US', decimals: 0, note: 'United States HQs' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', decimals: 0, note: 'Germany, Netherlands, France, Ireland and other euro-area HQs' },
  { code: 'GBP', name: 'British pound', symbol: '£', locale: 'en-GB', decimals: 0, note: 'United Kingdom HQs' },
  { code: 'JPY', name: 'Japanese yen', symbol: '¥', locale: 'ja-JP', decimals: 0, note: 'Japanese HQs' },
  { code: 'CHF', name: 'Swiss franc', symbol: 'CHF', locale: 'de-CH', decimals: 0, note: 'Swiss pharma, devices and banking HQs' },
  { code: 'SGD', name: 'Singapore dollar', symbol: 'S$', locale: 'en-SG', decimals: 0, note: 'Singapore regional HQs' },
  { code: 'AUD', name: 'Australian dollar', symbol: 'A$', locale: 'en-AU', decimals: 0, note: 'Australian HQs' },
  { code: 'CAD', name: 'Canadian dollar', symbol: 'C$', locale: 'en-CA', decimals: 0, note: 'Canadian HQs' },
  { code: 'AED', name: 'UAE dirham', symbol: 'AED', locale: 'en-AE', decimals: 0, note: 'Gulf HQs' },
  { code: 'CNY', name: 'Chinese yuan', symbol: '¥', locale: 'zh-CN', decimals: 0, note: 'Chinese HQs' },
  { code: 'HKD', name: 'Hong Kong dollar', symbol: 'HK$', locale: 'en-HK', decimals: 0, note: 'Hong Kong HQs' },
  { code: 'SEK', name: 'Swedish krona', symbol: 'kr', locale: 'sv-SE', decimals: 0, note: 'Nordic HQs' },
];

export const findCurrency = (code) => CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
// Units of `to` per one unit of `from`, from a per-USD table (defaults to the ECB table).
export const fxRate = (from, to, perUsd = FX.perUsd) => (perUsd[to] || FX.perUsd[to] || 1) / (perUsd[from] || FX.perUsd[from] || 1);
