---
applyTo: "app/**/*.jsx,components/**/*.jsx,**/*.module.css,app/globals.css"
---
# Frontend instructions

- Use JavaScript/JSX and the Next.js App Router already present in the repository.
- Prefer Server Components unless client interactivity genuinely requires `use client`.
- Keep page components thin. Move reusable UI into `components/` and domain operations into `lib/`.
- Use CSS Modules for component/page styling. Avoid adding selectors to `app/globals.css` unless they are truly global.
- Preserve responsive behavior and RTL/LTR support.
- Do not hard-code business data in UI when the value belongs to the domain/database layer.
- Keep loading, empty, error, and disabled states explicit for data-driven UI.
