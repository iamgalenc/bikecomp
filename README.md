# Bike Computer

Lightweight web-based bike computer that runs on old Android phones (4.4 KitKat and newer).

Uses the browser's Geolocation API to display:

- Current speed (km/h)
- Distance
- Ride time / moving time
- Average / max speed
- Elevation, elevation gain, elevation loss
- GPS accuracy and status
- Optional live GPS map with ride track (Leaflet + CARTO dark tiles)

## Usage

Open `index.html` in a browser with HTTPS or on `localhost` (Geolocation requires a secure context).

Press **START** to request location permission and begin tracking.

Tap **MAP** to show/hide the live GPS map. The map is optional —
speed, distance, time, and elevation all work without it, and the app
continues normally if the map tiles can't load (e.g. offline).

## Map tiles

The map renders with Leaflet and uses OpenStreetMap's standard tiles by
default — free, no API key required. CARTO's dark/light tiles are optional:
CARTO now requires a free key, so if you paste one into the `CARTO_API_KEY`
constant at the top of `js/map.js`, the dark/light tile toggle is enabled.

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Initial bike computer"
git remote add origin https://github.com/YOUR_USERNAME/bikecomp.git
git push -u origin main
```

Then in the GitHub repo:

1. Go to **Settings** → **Pages**
2. Under **Branch**, select `main` and folder `/ (root)`
3. Click **Save**

Your site will be live at:

```
https://YOUR_USERNAME.github.io/bikecomp/
```

## Files

```
index.html          Main dashboard
css/style.css       Dark responsive UI
js/gps.js           Geolocation wrapper
js/ride.js          GPS processing + calculations
js/ui.js            DOM rendering
js/map.js           Optional Leaflet map
js/app.js           Wiring & ride controls
```

## License

MIT