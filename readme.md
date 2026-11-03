# Fake Supermarket

Eleventy templates and data for supermarket pages and the shopper dashboard.

Install dependencies from this directory:

```bash
npm install
```

| Command | Purpose | Output |
| --- | --- | --- |
| `npm start` | Serve normal pages and watch for changes | `_site/` |
| `npm run build` | Build normal pages once | `_site/` |
| `npm run start:prototypes` | Serve prototypes and watch for changes | `_site-prototypes/` |
| `npm run build:prototypes` | Build prototypes once | `_site-prototypes/` |

Normal preview starts on port 8080; prototypes use 8081. The auth option can be combined with either mode:

```bash
SHOW_AUTH_DIALOGUE=true npm run start:prototypes
```

## Assets

Source assets are in `src/assets/`:

```text
src/assets/
  scss/                    Sass source, compiled into css/
  css/                     Stylesheets
  js/                      Browser modules
  fonts/                   Web fonts
  images/                  Shared images and icons
    storefronts/
      breakfastcereal/     Cereal product images and banners
      meat/                Meat product images and banners
```

Both build modes publish the public files under `/assets/`. Sass source is not published. Fonts and images are copied without text decoding. A fresh build does not need an existing `_site/` for assets.

Page paths remain `/pages/<route>/<filename>.html` normally and `/prototypes/<route>/<filename>.html` in prototype mode. Use `pageUrl` for page links; asset URLs always use `/assets/`, with no prototype prefix.

When publishing, upload the generated `assets/` directory to the domain's `/assets/` location alongside the selected HTML. Retain older asset URLs on the server while historical pages still use them. Builds do not remove older files from `_site/`; prototype commands recreate only `_site-prototypes/`.

Normal commands distribute shared partials, SCSS variables, CSS and fonts to the sibling projects. Prototype commands do not.

The local frontend uses HTTP; the backend requires HTTPS.
