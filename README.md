# JSON Portfolio Showcase — Version 2

React + TypeScript portfolio app driven by one JSON file.

## What changed in V2

- Book viewer is now a single large page, not a duplicate two-page layout.
- Mobile book behavior no longer exposes a broken second page underneath.
- Card deck height/overflow was adjusted so the active card is not clipped.
- Creative viewers are now separated by platform/section. Pick ReactJS, Django, Odoo, etc. first, then switch the viewer mode.
- Every project media area now has an expand button.
- Fullscreen media viewer supports cycling through the current project's media assets: image, video, or lottie placeholder.

## Run

```bash
npm install
npm run dev
```

## Edit your content

Edit:

```text
src/data/portfolio.json
```

Main shape:

```json
{
  "profile": {
    "image": "/portfolio-assets/profile.svg",
    "traits": "...",
    "aboutMeHtml": "<p>...</p>",
    "technologies": ["ReactJS", "Django"]
  },
  "sections": [
    { "title": "ReactJS" },
    { "title": "Django" }
  ],
  "projects": [
    {
      "projectTitle": "Project name",
      "sections": ["ReactJS", "Django"],
      "link": "https://example.com",
      "assets": [
        { "url": "/portfolio-assets/project.svg", "type": "image" },
        { "url": "/portfolio-assets/demo.mp4", "type": "video" },
        { "url": "/portfolio-assets/animation.json", "type": "lottie" }
      ]
    }
  ]
}
```

## Media notes

Put local files in:

```text
public/portfolio-assets/
```

Then reference them like:

```json
{ "url": "/portfolio-assets/my-image.png", "type": "image" }
```

For videos:

```json
{ "url": "/portfolio-assets/demo.mp4", "type": "video" }
```

For Lottie, this project currently shows a clean placeholder. You can connect a renderer like `lottie-react` later if you want live animation.
