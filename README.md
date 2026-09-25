# Future Factor 360 · Talent Market Intelligence

**Compensation Modeller · Role Library.** A demo of role-based market compensation modelling for building capability centers in India. All eight functions are live (AI & Data, Operations / PMO, HR / People, IT, Manufacturing Support, Quality, Regulatory Affairs, R&D): 101 roles across levels L1–L5, each with researched benchmarks, comparables and a full job description. Industries are organised in two levels (7 industries, 29 sub-industries).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## What it does

- **Filters**: function (8), location (8 Indian cities), industry (7) and sub-industry (29), compensation type (annual CTC INR, monthly CTC, annual fixed pay, annual CTC USD), experience level.
- **Role Library**: market low / reference / high per role with demand signal; KPI tiles; compensation trend by experience band; compensation by role family; market positioning curve and recommended hiring range for the selected role.
- **Role profile drawer**: level, family, experience, market tiles, hiring range; tabs for Role Details, Compensation Insights (how the number is built, monthly / fixed / USD, offer guidance, sources), Market Comparables and JD Preview; View Full JD, Generate JD, Edit JD (saved per role in the browser) and Export JD (Markdown + text).
- **Dashboard**: median reference by city, by industry and by sub-industry within the selected industry, experience curve, roles in demand, family × city heatmap, family table. All scoped to the selected function.
- **Reports**: role benchmark sheet, city comparison, industry comparison, sub-industry comparison, JD pack (all JDs of the function as one Markdown file), methodology and sources. CSV export and print.
- **Settings**: default filters, INR/USD rate, variable pay share, hiring-range rule, function reference markets, location and sub-industry indices with their basis.

## Data

Roles live in one file per function (`src/data/roles-ai.js`, `roles-ops.js`, `roles-hr.js`, `roles-it.js`, `roles-mfg.js`, `roles-quality.js`, `roles-rd.js`, and the Regulatory Affairs set in `roles.js`, which also exports the combined catalogue). Every role stores a market low / reference / high in ₹ lakh annual CTC for Bengaluru at the function's reference sub-industry (`src/data/functions.js`: AI & Data at SaaS / Product; Operations, HR and IT at IT services & consulting; Manufacturing, Quality, Regulatory Affairs and R&D at Medical devices) and lists the public anchors it was derived from. `src/data/industries.js` holds the industry → sub-industry taxonomy with one common pay index; `src/data/market.js` holds the location indices and default settings. `src/data/sources.js` lists every source (Glassdoor, Payscale, Indeed, ERI SalaryExpert, Salary.com, Michael Page, Pharmaduniya, Cliniminds, Naukri, LinkedIn, ECB) with URLs and the methodology.

Benchmark = stored reference × location index × (selected sub-industry index ÷ the function's reference sub-industry index); recommended hiring range = 90–120% of the reference. Data reviewed in September 2026.

## Files

```
src/App.jsx                 page routing, persisted filters / settings / JD edits
src/components/Shell.jsx    header, nav, filter row, function rail
src/components/ui.jsx       panels, KPI tiles, tabs, modal, demand bars
src/components/viz.jsx      grouped columns, horizontal bars, bell curve, range strip, heatmap
src/model/comp.js           compensation model and aggregations
src/model/jd.js             JD generation and export
src/screens/RoleLibrary.jsx role library and role profile drawer
src/screens/Pages.jsx       Home, Dashboard, Reports, Settings
reference/                  the reference screenshot this demo was built from
public/logo.png             Future Factor logo
```
