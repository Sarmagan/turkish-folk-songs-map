# Türkiye Türkü Haritası

An interactive map of Turkey's 81 provinces displaying regional folk songs (türküler). Built for [Türk Güncesi](https://blog.turkguncesi.com/).

![Website](website_screenshot.png)

## Features

- **Hover tooltips** — hover over any province to see its folk songs in a floating tooltip
- **Click to pin** — click a province to display its info persistently in the side panel
- **Zoom & pan** — mouse wheel to zoom (centred on cursor), click and drag to pan
- **Zoom controls** — `+`, `−`, and `Reset` buttons for keyboard-free navigation
- **Data-driven highlights** — provinces with song data are visually distinct from empty ones

## File Structure

```
index.html      # Main page — SVG map embedded inline
styles.css      # All styling and theme variables
app.js          # Interactivity: hover, tooltip, zoom, pan, data fetching
songs.json      # Song data keyed by province name
turkeymap.svg   # Source SVG (not needed at runtime — already embedded in index.html)
```

## Adding Songs

Open `songs.json` and add an entry using the Turkish province name as the key:

```json
{
  "Konya": [
    "Karamana Giderim",
    "Konya Ovası"
  ]
}
```

The map will automatically highlight the province and display the songs on hover.

## Running Locally

Open `index.html` via a local server to ensure `songs.json` loads correctly:

```bash
npx serve .
# or
python3 -m http.server
```

Opening `index.html` directly as a `file://` URL also works — the app falls back to built-in mock data if the fetch fails.

## Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript (ES6+)
- No external libraries or frameworks
- SVG map © [Simplemaps.com](https://simplemaps.com) (free for commercial use)
