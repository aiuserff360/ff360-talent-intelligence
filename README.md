# Future Factor 360 · Talent Market Intelligence

**Compensation Modeller · Role Library.** A demo of role-based market compensation modelling for building capability centers in India. Regulatory Affairs is fully enabled (16 roles, 8 families, full job descriptions); the other seven functions are shown as coming soon.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## What it does

- **Filters**: function (Regulatory Affairs), location (8 Indian cities), industry (9), compensation type (annual CTC INR, monthly CTC, annual fixed pay, annual CTC USD), experience level.
- **Role Library**: market low / reference / high per role with demand signal; KPI tiles; compensation trend by experience band; compensation by role family; market positioning curve and recommended hiring range for the selected role.
- **Role profile drawer**: level, family, experience, market tiles, hiring range; tabs for Role Details, Compensation Insights (how the number is built, monthly / fixed / USD, offer guidance, sources), Market Comparables and JD Preview; View Full JD, Generate JD, Edit JD (saved per role in the browser) and Export JD (Markdown + text).
- **Dashboard**: median reference by city and by industry, experience curve, roles in demand, family × city heatmap, family table.
- **Reports**: role benchmark sheet, city comparison, industry comparison, JD pack (all JDs as one Markdown file), methodology and sources. CSV export and print.
- **Settings**: default filters, INR/USD rate, variable pay share, hiring-range rule, location and industry indices with their basis.

## Data

`src/data/roles.js` holds the 16 Regulatory Affairs roles with benchmarks for the reference market (Bengaluru · Medical devices · annual CTC in ₹ lakh), each listing the public anchors it was derived from. `src/data/market.js` holds the location and industry indices and default settings. `src/data/sources.js` lists every source (Glassdoor, Payscale, Indeed, ERI SalaryExpert, Salary.com, Michael Page, Pharmaduniya, Cliniminds, Naukri, LinkedIn, ECB) with URLs and the methodology.

Benchmark = reference market × location index × industry index; recommended hiring range = 90–120% of the reference. Data reviewed in September 2026.

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
