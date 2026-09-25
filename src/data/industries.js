// Two-level industry taxonomy. Every sub-industry carries a pay index on one common scale
// (Life Sciences · Medical devices = 1.00, which also equals IT services & consulting).
// Each function's benchmarks are stored at that function's own reference sub-industry; the model
// rescales by (selected index ÷ reference index). Indices are drawn from published sector pay
// differentials (see sources.js: gcc-industry-premium, product-vs-services, technobridge-sectors, biotecnika-biotech).

export const INDUSTRY_GROUPS = [
  {
    key: 'technology', name: 'Technology & Software',
    note: 'Product and SaaS companies pay the highest premiums for engineering, data and product roles; IT services sit at the bottom of the range for equivalent experience. GCCs pay 12–20% above IT services.',
    subs: [
      { key: 'saas', name: 'SaaS / Product companies', index: 1.20, note: 'Product-first companies; strongest premium for data, AI and engineering talent.' },
      { key: 'it-services', name: 'IT services & consulting', index: 1.00, note: 'Baseline for technology functions; large volume hiring, lower bands.' },
      { key: 'semiconductors', name: 'Semiconductors & hardware', index: 1.20, note: 'ER&D GCCs (chip design, hardware) lead for engineering specialists.' },
      { key: 'fintech', name: 'Fintech & payments', index: 1.20, note: 'Well-funded fintechs pay close to product companies.' },
      { key: 'ecommerce', name: 'E-commerce & internet', index: 1.12, note: 'Consumer internet platforms; strong data and operations demand.' },
    ],
  },
  {
    key: 'life-sciences', name: 'Life Sciences & Healthcare',
    note: 'Medical devices is the reference sub-industry for regulatory, quality, manufacturing and R&D benchmarks in this library.',
    subs: [
      { key: 'medical-devices', name: 'Medical devices', index: 1.00, note: 'Reference. FDA 510(k), EU MDR and CDSCO MDR expertise.' },
      { key: 'pharma', name: 'Pharmaceuticals (generics)', index: 0.95, note: 'Domestic generics pay slightly below devices; MNC pharma at or above.' },
      { key: 'biotech', name: 'Biotech & biosimilars', index: 1.05, note: 'Scarcer biologics expertise commands a premium.' },
      { key: 'ivd', name: 'In-vitro diagnostics', index: 0.98, note: 'Close to devices; IVDR transition keeps demand high.' },
      { key: 'cro', name: 'CRO & regulatory services', index: 0.92, note: 'Service providers pay below product companies but hire in volume.' },
      { key: 'digital-health', name: 'Digital health & SaMD', index: 1.10, note: 'Software-as-medical-device expertise (IEC 62304, FDA digital health) earns a premium.' },
      { key: 'consumer-health', name: 'Consumer health & OTC', index: 0.92, note: 'Simpler dossiers and domestic focus.' },
      { key: 'providers', name: 'Hospitals & healthcare providers', index: 0.85, note: 'Provider organisations pay below product companies for corporate functions.' },
    ],
  },
  {
    key: 'chemicals', name: 'Chemicals & Materials',
    note: 'Adjacent talent pool for regulatory, quality and manufacturing; generally lower bands than life sciences.',
    subs: [
      { key: 'specialty-chem', name: 'Specialty chemicals', index: 0.92, note: 'REACH-style registrations and process safety expertise.' },
      { key: 'agrochem', name: 'Agrochemicals', index: 0.90, note: 'CIB&RC registrations; adjacent regulatory talent.' },
      { key: 'nutraceuticals', name: 'Nutraceuticals & food ingredients', index: 0.85, note: 'FSSAI-led frameworks; smaller companies.' },
      { key: 'cosmetics', name: 'Cosmetics & personal care', index: 0.88, note: 'BIS and cosmetics rules; brand-led organisations.' },
    ],
  },
  {
    key: 'manufacturing', name: 'Manufacturing & Industrial',
    note: 'Automotive and aerospace ER&D centers pay well for engineering; general machinery and EMS run lower.',
    subs: [
      { key: 'automotive', name: 'Automotive & EV', index: 0.95, note: 'Large ER&D base (Bosch, Continental); functional safety premium.' },
      { key: 'aerospace', name: 'Aerospace & defence', index: 1.00, note: 'Certification-heavy engineering; steady demand.' },
      { key: 'machinery', name: 'Industrial machinery & equipment', index: 0.90, note: 'Traditional manufacturers; lower corporate-function bands.' },
      { key: 'ems', name: 'Electronics manufacturing (EMS)', index: 0.90, note: 'High-volume manufacturing; cost-led pay structures.' },
    ],
  },
  {
    key: 'bfsi', name: 'Banking & Financial Services',
    note: 'BFSI GCCs offer the highest non-technology salaries and strong data, risk and operations demand.',
    subs: [
      { key: 'banking', name: 'Retail & corporate banking', index: 1.10, note: 'Global bank captives (JPMorgan, Goldman, Citi) pay a clear premium.' },
      { key: 'insurance', name: 'Insurance', index: 1.02, note: 'Insurer GCCs; actuarial and operations demand.' },
      { key: 'capital-markets', name: 'Asset management & capital markets', index: 1.18, note: 'Highest pay for quantitative and technology talent.' },
    ],
  },
  {
    key: 'consumer', name: 'Consumer & Retail',
    note: 'FMCG captives pay near baseline for corporate functions; retail operations run lower.',
    subs: [
      { key: 'fmcg', name: 'FMCG', index: 1.00, note: 'Brand-led MNCs; strong HR, supply chain and analytics functions.' },
      { key: 'retail', name: 'Retail & omnichannel', index: 0.90, note: 'Cost-led operations; large volume roles.' },
      { key: 'durables', name: 'Consumer durables & appliances', index: 0.92, note: 'Manufacturing-led; moderate bands.' },
    ],
  },
  {
    key: 'energy', name: 'Energy & Utilities',
    note: 'Oil and gas captives pay above baseline for engineering and data; renewables slightly below.',
    subs: [
      { key: 'oil-gas', name: 'Oil & gas', index: 1.05, note: 'Global energy majors with mature GCCs.' },
      { key: 'renewables', name: 'Renewables & power', index: 0.98, note: 'Growing sector; competitive but not premium pay.' },
    ],
  },
];

export const SUB_INDUSTRIES = INDUSTRY_GROUPS.flatMap((g) => g.subs.map((s) => ({ ...s, group: g.key, groupName: g.name })));
export const findGroup = (key) => INDUSTRY_GROUPS.find((g) => g.key === key) || INDUSTRY_GROUPS[1];
export const findSub = (key) => SUB_INDUSTRIES.find((s) => s.key === key) || SUB_INDUSTRIES.find((s) => s.key === 'medical-devices');
export const groupOfSub = (key) => findGroup(findSub(key).group);
