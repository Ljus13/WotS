# WotS

This repository contains basic HTML and CSS samples.  We use **Vite** as a lightweight development server and build tool, which boots faster than webpack.

## Getting started with Vite

```sh
npm install            # install dependencies (vite)
npm run dev            # start development server (hot reload)
npm run build          # bundle for production
npm run serve          # preview production build
```

Configuration lives in `vite.config.js` if needed, but the default settings are sufficient for plain HTML/CSS.

## Tailwind CSS

We've added Tailwind to the project for utility‑first styling. The main stylesheet (`css/wots.css`) includes the `@tailwind` directives and is processed by PostCSS during development and build. Tailwind's `content` paths are set to watch the HTML files (`index.html` and `html/**/*.html`).

To regenerate Tailwind output simply run the dev server or build; no additional commands are required.

## Deployment to GitHub Pages

The project includes an automated GitHub Action to build and publish the site whenever you push to `main`.

1. **Push your code to GitHub** (repository should already exist).<br>
2. If this is the first time, open **Settings > Pages** in your repo and set the source to "gh-pages branch" (or `main/docs` if you change the workflow).<br>
3. The action defined in `.github/workflows/pages.yml` installs dependencies, runs `npm run build`, and deploys the contents of `dist/` to the `gh-pages` branch.
4. After the workflow finishes, your site will be available at `https://<your-username>.github.io/<repo-name>/` (URL shown in Pages settings).

You can manually trigger the workflow from the Actions tab if needed; otherwise it runs on every push to `main`.



Whisper of the Shadow TRPG
