# ServeLink Frontend

This is a simple React frontend scaffold for the ServeLink backend.

Quick start

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the dev server:

```bash
npm start
```

Notes

- The project uses `react`, `react-dom`, `react-router-dom`, `axios`, and `react-scripts`.
- API base URL is defined in `src/utils/constants.js` and `src/utils/api.js`.
- To use Vite instead of CRA, initialize a Vite project and move the `src` and `public` folders into it.

Structure

- `public/` - static HTML
- `src/` - React source files (components, pages, routes, context, hooks, utils)

Next steps

- Wire forms to the backend API in `src/utils/api.js`.
- Add styling and responsive layout.
- Add authentication flow and protected routes.
