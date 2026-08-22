# Web Architecture Rules

## General Architecture

Keep the application simple.

Recommended flow:

```text
Browser Geolocation API
        |
        v
Location Processor
        |
        v
Ride State
        |
        v
Dashboard Renderer
```

Avoid unnecessary frontend architecture.

A simple project structure is enough:

```text
bike-computer/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── gps.js
│   ├── ride.js
│   └── ui.js
└── assets/
```

The exact structure can change if the project stays small.

## GPS Module

One module should own the browser geolocation logic.

Responsibilities:

```text
Request location permission
Start watchPosition
Stop watchPosition
Handle success
Handle errors
Expose GPS state
```

Do not scatter `navigator.geolocation` calls across the application.

## Location Processor

Keep calculations separate from the browser API.

Responsibilities:

```text
Distance
Speed
Elevation gain
Elevation loss
GPS filtering
Movement detection
```

This code should ideally work with plain JavaScript objects so it can be tested without a browser.

## Ride State

Keep current ride information in one place.

Example:

```javascript
{
    recording: false,
    paused: false,
    distance: 0,
    movingTime: 0,
    elapsedTime: 0,
    currentSpeed: 0,
    averageSpeed: 0,
    maxSpeed: 0,
    elevation: null,
    elevationGain: 0,
    elevationLoss: 0,
    gpsAccuracy: null,
    gpsStatus: "searching"
}
```

Do not duplicate these values in multiple UI elements as separate sources of truth.

## UI

The UI should display state.

It should not perform GPS calculations.

Avoid this architecture:

```text
UI receives GPS
UI calculates distance
UI calculates elevation
UI calculates speed
UI manages timers
UI saves rides
```

Prefer:

```text
GPS
 -> processor
 -> ride state
 -> UI
```

## Rendering

Avoid rebuilding the entire DOM for every GPS update.

Cache references to important elements.

Update only the necessary text values.

For example:

```javascript
speedElement.textContent = formatSpeed(speed);
distanceElement.textContent = formatDistance(distance);
```

Do not use a frontend framework just to update a few text nodes.

## Timer

Use JavaScript timers only for display and ride timing.

Do not assume timer callbacks run at exact intervals.

Use timestamps to calculate actual elapsed time.

This prevents timer drift when the browser is busy.

## Persistence

Start with no persistence if it is not required.

For settings:

```text
LocalStorage
```

is usually sufficient.

For larger ride histories:

```text
IndexedDB
```

may be appropriate.

Do not add a backend unless cloud synchronization is actually required.

## Offline

The core application should not need a network connection during a ride.

A service worker may be added for caching if appropriate.

However, do not make the application depend on advanced PWA APIs that could reduce KitKat compatibility.

## External Sensors

Bluetooth sensor support should be optional.

Do not make the core application depend on Web Bluetooth because support varies significantly across old and new Android browsers.

The onboard GPS remains the baseline.
