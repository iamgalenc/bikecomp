# Bike Computer

Lightweight web-based bike computer that runs on old Android phones (4.4 KitKat and newer).

Uses the browser's Geolocation API to display:

- Current speed (km/h)
- Distance
- Ride time / moving time
- Average / max speed
- Elevation, elevation gain, elevation loss
- GPS accuracy and status

## Usage

Open `index.html` in a browser with HTTPS or on `localhost` (Geolocation requires a secure context).

Press **START** to request location permission and begin tracking.

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
js/app.js           Wiring & ride controls
```

## License

MIT