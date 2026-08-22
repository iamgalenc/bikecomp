# Development Rules

## Goal

Build a lightweight web-based Bike Computer that can run on old and new Android phones, starting from Android 4.4 KitKat and newer.

The primary use case is reusing an old phone as a bicycle-mounted computer.

The application should run in a mobile browser and use the browser's Location API for GPS data.

## Engineering Philosophy

Act like a lazy senior software engineer.

Write the smallest amount of code that solves the problem correctly.

Prefer boring, stable browser APIs over clever frameworks.

Do not add a dependency unless it solves a real problem.

Do not build an abstraction for a problem that does not exist yet.

Avoid unnecessary state management, complex component systems, and over-engineered architecture.

Plain HTML, CSS, and JavaScript are preferred for the core application.

If a feature can be implemented with a few lines of vanilla JavaScript, do not introduce a framework for it.

## Compatibility

The minimum target is Android 4.4 KitKat and newer.

The application should be designed around features that have reasonable support across older Android browsers.

Prefer:

- HTML5
- CSS
- Vanilla JavaScript
- Geolocation API
- LocalStorage
- Basic Web APIs

Avoid making the application dependent on APIs that are only available on recent Android versions.

Use feature detection before using optional browser APIs.

The application should degrade gracefully when a browser does not support an optional feature.

## Location Permission

GPS functionality must use the browser's location permission system.

Request location permission only when the user starts the bike computer or explicitly enables GPS.

Do not request location permission immediately when the page loads.

The application should explain why location access is required.

Example:

```text
Location access is required to calculate speed, distance, and elevation.
```

Handle these states:

```text
Permission granted
Permission denied
Location unavailable
GPS searching
GPS active
GPS temporarily lost
```

Never crash because location permission was denied.

## HTTPS

Browser geolocation may require a secure context.

The production application should therefore be served through HTTPS.

`localhost` can be used for local development.

Do not build the application around insecure HTTP deployment.

## Code Style

Use clear variable and function names.

Keep functions small.

Avoid deeply nested code.

Avoid unnecessary classes.

Avoid unnecessary design patterns.

Keep GPS processing separate from UI rendering.

Comment only when the reason behind the code is not obvious.

Do not write comments that simply repeat the code.

## Performance

The application must work on weak phones.

Avoid excessive DOM updates.

Do not recreate the entire dashboard every GPS update.

Update only the values that changed.

Avoid large JavaScript bundles.

Avoid unnecessary animations.

Avoid loading large libraries for simple functionality.

Battery usage matters because the phone will be mounted to a bicycle for extended periods.

## Offline Behavior

The core bike computer should work without an internet connection after the application has been loaded.

Do not require a server for:

```text
speed
distance
timer
elevation
ride statistics
```

A Progressive Web App/service worker can be added later if compatibility testing shows acceptable support.

Do not make PWA installation mandatory for the core application.

## Development Rule

When choosing between two implementations, prefer the one with:

1. fewer dependencies
2. less JavaScript
3. fewer moving parts
4. better KitKat compatibility
5. easier debugging
6. lower battery usage

Do not sacrifice correctness merely to reduce code.
