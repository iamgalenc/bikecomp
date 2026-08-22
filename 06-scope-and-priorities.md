# Scope and Priorities

## Target

Build a web-based Bike Computer that runs on Android 4.4 KitKat and newer.

The website should reuse an old Android phone as a bicycle computer.

The application should work primarily offline during a ride after the required page resources have loaded.

GPS functionality uses browser location permission.

## Priority 1: MVP

The first version must provide:

```text
Location permission
GPS status
Current GPS speed
Distance
Ride timer
Moving time
Current elevation
Elevation gain
Average speed
Maximum speed
Start
Pause
Resume
Stop
```

If these work reliably, the project is already useful.

## Priority 2: Compatibility

Test on:

```text
Android 4.4 KitKat
Android 5.x
Android 6.x
Android 7.x
Android 8.x
Android 9.x+
```

The exact browser versions will vary.

Use feature detection.

Do not assume that a browser feature exists just because it works on the developer's phone.

## Priority 3: Reliability

Improve:

```text
GPS filtering
GPS recovery
Permission handling
Pause detection
Battery consumption
Timer accuracy
Invalid location handling
```

Reliability is more important than adding features.

## Priority 4: Local Storage

Add:

```text
Ride history
Saved settings
Last-used units
GPX export
```

Use local browser storage.

Do not introduce a server unless there is an actual need for synchronization.

## Priority 5: PWA

A Progressive Web App can be considered for:

```text
Installable shortcut
Cached application files
Standalone display
Offline startup
```

However, PWA functionality must not become a hard requirement if it reduces compatibility with Android 4.4 browsers.

The normal website must remain usable.

## Priority 6: Advanced Features

Potential additions:

```text
Offline maps
Route following
Compass
Heading
Auto pause
Auto start
Cadence
Heart rate
Bluetooth sensors
Navigation
```

These should remain optional.

## What Not To Build Yet

Do not start with:

```text
React
Vue
Angular
Large UI libraries
Backend servers
Cloud accounts
Social features
Real-time server analytics
Complex databases
Microservices
AI features
```

A bike computer does not need them.

Use vanilla HTML, CSS, and JavaScript until there is a concrete reason to change.

## Definition of Done

The MVP is complete when an old Android KitKat-or-newer phone can open the website, grant location permission, mount to a bicycle, and reliably display:

```text
speed
distance
time
moving time
elevation
elevation gain
average speed
maximum speed
GPS accuracy
```

without requiring an external GPS device or internet connection during the ride.

The application must survive:

```text
GPS loss
GPS recovery
permission denial
weak GPS accuracy
browser timer delays
temporary invalid coordinates
```

without crashing or losing the active ride.
