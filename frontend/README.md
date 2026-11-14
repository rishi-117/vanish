# Vanish — frontend

React 19 + Vite + Tailwind 4. See the [project README](../README.md) for how the
whole thing fits together.

```bash
npm install
npm run dev
```

Runs on http://localhost:5173 and expects the Spring Boot backend on
http://localhost:8080. Point it elsewhere with `VITE_API_BASE_URL`.

```bash
npm run build     # production bundle in dist/
npm run lint
```

## Where things live

- `src/App.jsx` — reads `/s/:id` from the URL and picks which page to render
- `src/CreateSecret.jsx` — compose, character counter, generated link
- `src/ReadSecret.jsx` — sealed → reveal → message, and the vanished state
- `src/api.js` — the two `fetch` calls, with error messages the UI can show
- `src/Shell.jsx` — header, centered column, footer
- `src/useCopy.js` — clipboard copy with a fallback for non-HTTPS origins

No router library: a shared link is just `/s/<uuid>`, so a regex on
`window.location.pathname` covers it.
