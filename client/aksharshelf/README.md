# Frontend (React)

This is the React + Vite frontend for the eBook Platform.

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## API base URL

The frontend calls the backend at:

- `http://localhost:3000/api`

You can change this in `src/services/api.jsx` when deploying.

## Main pages

- `/books` browse books
- `/books/:id` book details
- `/read/:id` reader
- `/profile` profile settings
- `/admin/*` admin panel (requires admin login)
