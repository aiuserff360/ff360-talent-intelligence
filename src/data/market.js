// Location and industry adjustments applied to the reference market (Bengaluru · Medical devices).
// Indices are relative to the reference (1.00) and are derived from public city and sector pay differentials
// (see sources.js). They are deliberately conservative: regulatory pay varies less across cities than
// commercial or engineering pay.

export const LOCATIONS = [
  { key: 'bengaluru', name: 'Bengaluru', index: 1.00, tier: 1, cluster: 'Medical devices, biotech and GCC hub; deepest RA talent pool for devices', note: 'Reference market.' },
  { key: 'hyderabad', name: 'Hyderabad', index: 0.98, tier: 1, cluster: 'Pharma and biotech (Genome Valley); strong generics and CRO RA talent', note: 'Glassdoor RA Specialist average ₹8.0L vs ₹6.5L nationally, reflecting pharma density; devices talent thinner than Bengaluru.' },
  { key: 'mumbai', name: 'Mumbai', index: 1.05, tier: 1, cluster: 'Pharma HQs, MNC commercial offices and regulatory consulting', note: 'Mumbai carries a 5–10% premium for RA and up to 15–20% for commercial pharma roles.' },
  { key: 'pune', name: 'Pune', index: 0.95, tier: 1, cluster: 'Medical devices, CDMO and engineering services', note: 'Roughly 5% below Bengaluru; growing device manufacturing base.' },
  { key: 'chennai', name: 'Chennai', index: 0.92, tier: 1, cluster: 'Medical devices (Trivitron cluster), CROs and clinical research', note: 'Strong for clinical and device roles; pay 8–10% below Bengaluru.' },
  { key: 'delhi-ncr', name: 'Delhi NCR', index: 1.00, tier: 1, cluster: 'Medical devices, consumer health and CDSCO proximity', note: 'On par with Bengaluru; CDSCO headquarters supports regulatory-agency-facing roles.' },
  { key: 'ahmedabad', name: 'Ahmedabad', index: 0.86, tier: 2, cluster: 'Pharma manufacturing hub (Zydus, Torrent, Intas)', note: 'Tier-2 differential of 15–18% below Tier-1 metros despite deep pharma RA talent.' },
  { key: 'kolkata', name: 'Kolkata', index: 0.84, tier: 2, cluster: 'Smaller life-sciences base; limited device RA talent', note: 'Tier-2 differential; limited senior RA supply.' },
];

export const COMP_TYPES = [
  { key: 'ctc-annual', name: 'Annual CTC (INR)', unit: '₹ Lakh / year' },
  { key: 'ctc-monthly', name: 'Monthly CTC (INR)', unit: '₹ / month' },
  { key: 'fixed-annual', name: 'Annual fixed pay (INR)', unit: '₹ Lakh / year' },
  { key: 'ctc-usd', name: 'Annual CTC (USD)', unit: 'USD / year' },
];

export const EXPERIENCE_LEVELS = [
  { key: 'all', name: 'All', min: 0, max: 99 },
  { key: '0-3', name: '0 – 3 years', min: 0, max: 3 },
  { key: '3-6', name: '3 – 6 years', min: 3, max: 6 },
  { key: '6-10', name: '6 – 10 years', min: 6, max: 10 },
  { key: '10-15', name: '10 – 15 years', min: 10, max: 15 },
  { key: '15+', name: '15+ years', min: 15, max: 99 },
];

// Default settings. Variable pay share and hiring-range multipliers are editable on the Settings screen.
export const DEFAULT_SETTINGS = {
  fxInrPerUsd: 95.96,           // ECB reference rate, 24 Sep 2026 (converted to per-USD)
  variablePayPct: 12,            // typical variable component in Indian life-sciences CTC (10–15%)
  hiringLowPct: 90,              // recommended hiring range = 90% to 120% of market reference
  hiringHighPct: 120,
  displayLakh: true,
  dataAsOf: 'September 2026',
};
