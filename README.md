# LCCGuides

LCCGuides is a static site for publishing event guides. It uses simple Markdown content files stored under `guides/` and a small client-side template in `template/` to render the pages. The repo includes a Decap CMS admin interface in `admin/` and a `netlify.toml` for deployment.

### Quick overview

- Purpose: Host and manage event guides (Markdown) for the LCC site.
- Rendering: Client-side JavaScript reads Markdown files and renders them with the HTML template in `template/`.
- CMS: Decap CMS is configured under `admin/` to edit and create guides via the web UI.

### Adding a new contributor to Decap CMS

1. Go to the GitHub repo settings.
2. Navigate to "Contributors" and invite the new contributor.
3. Once they accept the invite, they can log in to Decap CMS using their GitHub account.

> Note: Only Raph currently has admin access to the GitHub repo and can add new contributors.

### Editing content

- Use the Decap CMS admin at `/admin` to create and edit guide Markdown files.

### Content format

- Guides are Markdown files. Create them with the "New Guide" button in Decap CMS.
- Use standard Markdown syntax for formatting.
- See here for reference:
    - https://www.markdownguide.org/cheat-sheet/

### Deployment details

- The repo is under the CoordoLCC GitHub account.
- The site is deployed on Netlify with the CoordoLCC account.
    - Github OAuth with Netlify is used for authentication in Decap CMS.
- The `guides.lcc-interne.com` domain points to the Netlify deployment and is registered with Cloudflare (Raph's account).

### Repository layout

- `admin/` — Decap CMS configuration and admin UI (`index.html`, `config.yml`, `widgets.js`).
- `guides/` — Content directory. Each guide is organized by name and year, e.g. `guides/<name>/<year>/<file>.md`.
- `template/` — Static site template used for preview and local testing:
	- `template/index.html` — Main page template.
	- `template/css/styles.css` — Styles.
	- `template/js/` — Client-side scripts (`markdownParser.js`, `contentRenderer.js`, `main.js`, etc.).
- `netlify.toml` — Deployment configuration for Netlify.

