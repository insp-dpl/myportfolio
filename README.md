# portfolia — Uno Mawlue's Portfolio Prototype (Deliverable 2)

Static HTML/CSS/JS portfolio. Dark theme by default, with a light-mode toggle.

```
portfolia/
├── index.html              Landing page: intro, about, skills, featured projects
├── contact.html            Best ways to contact me: GitHub, LinkedIn, phone
├── projects/
│   ├── index.html          Project list: title + link for every project, filters, and the TABLE
│   ├── farmer-wellness.html   One page per project: overview, screenshots,
│   ├── sports-rag.html        details table, GitHub / live-site buttons,
│   └── wine-tasting.html      previous/next links
├── css/styles.css          All styling (no inline CSS, no <font> tags)
├── js/main.js              Theme toggle, mobile menu, dates, project filter, gallery + lightbox
└── images/
    ├── logo.svg
    ├── profile.png         YOUR PHOTO: copy it here (see step 1 below)
    └── projects/           placeholder screenshots: replace with real ones
```

Live URLs once hosted:
- Project list: `https://insp-dpl.github.io/portfolia/projects/`
- One project: `https://insp-dpl.github.io/portfolia/projects/sports-rag.html`

Pages inside `projects/` reach shared files with `../` (for example `../css/styles.css`).

## Make it yours
1. **Your photo (required):** the home page loads `images/profile.png`. Copy your photo there:
   `cp "/mnt/c/Users/YUN/Pictures/SHUX1498[1].PNG" images/profile.png`
2. **Screenshots:** put real screenshots in `images/projects/` (e.g. `sports-rag-1.png`). In that
   project's page (`projects/sports-rag.html`), update the large image and each thumbnail's
   `src` and `data-src`, and write `alt` / `data-alt` text that describes the screenshot.
   Also update the card image in `projects/index.html` (and `index.html` for featured projects).
3. **Links:** in each project page, change the "View code on GitHub" link and the GitHub link in
   the details table. If the project is hosted, there is a commented-out "Visit live site" button
   in the page: uncomment it and paste the URL.
4. **Placeholders:** search all files for `YOUR-LINKEDIN` and replace it with your LinkedIn handle, and put your real number in `contact.html` (`tel:+1...`).

### Add a new project
1. Copy any page in `projects/` (e.g. `sports-rag.html` to `my-new-project.html`) and edit its text,
   images, and links.
2. In `projects/index.html`, copy one `<li class="project-card">` and one table `<tr>`, and point
   both links at `my-new-project.html`.
3. Update the previous/next links at the bottom of the neighboring project pages if you want it in
   the sequence.

## Free hosting: GitHub Pages
1. Create a **public** GitHub repo named `portfolia`.
2. In WSL, from this folder:
   ```bash
   git init
   git add .
   git commit -m "Deliverable 2 prototype"
   git branch -M main
   git remote add origin https://github.com/insp-dpl/portfolia.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
4. In 1–2 minutes the site is live at `https://insp-dpl.github.io/portfolia/`.

No Git? Drag this folder onto https://app.netlify.com/drop (also free).

## Run locally
```bash
python3 -m http.server 8000   # open http://localhost:8000
```
(Opening the files directly also works.)

## Accessibility screenshots for the report
1. On the live **Contact** page, open Chrome DevTools (F12) → **Lighthouse** → check only
   **Accessibility** → **Analyze page load** → take a screenshot.
2. Do the same on the **Projects** page (`/projects/`).
3. Optional: with the **axe DevTools** extension, submit the empty form, then
   **Scan all of my page** → take a screenshot.
