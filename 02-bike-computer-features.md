# Bike Computer Features

## Primary Purpose

Turn an old Android phone into a bicycle computer using the phone's onboard GPS/location hardware.

The application runs as a website and uses the browser's Geolocation API.

The core system must not require an external GPS device.

## Core Dashboard

The main dashboard should display:

```text
Current Speed
Distance
Ride Time
Moving Time
Current Elevation
Elevation Gain
Elevation Loss
Average Speed
Maximum Speed
GPS Accuracy
GPS Status
```

## GPS

Use:

```javascript
navigator.geolocation.watchPosition()
```

for continuous location updates.

Request permission when the user starts a ride.

Use the browser-provided location object:

```text
latitude
longitude
accuracy
altitude
speed
timestamp
```

Speed should preferably come from `position.coords.speed`.

If browser speed is unavailable, calculate speed from distance and timestamp differences.

## Location Permission

The application must explicitly handle permission failure.

If permission is denied:

```text
GPS: Permission denied
```

The application should continue running without crashing.

The user should still be able to access settings, previous data, and non-GPS UI.

If GPS is unavailable:

```text
GPS: Searching
```

Do not reset the ride.

## Speed

Display current speed prominently.

Default unit:

```text
km/h
```

Prefer the browser-provided GPS speed.

Fallback calculation:

```text
speed = distance / time
```

Filter obviously impossible values.

Do not allow GPS spikes to permanently corrupt maximum speed.

## Distance

Calculate distance between consecutive valid coordinates.

Use a simple geographic distance calculation such as the Haversine formula.

Ignore invalid coordinates.

Avoid accumulating GPS jitter while stationary.

A practical movement threshold can be used.

Do not over-engineer GPS filtering.

## Elevation

Use:

```text
position.coords.altitude
```

when available.

GPS altitude can be noisy.

Do not count every tiny altitude fluctuation as climbing.

Use an elevation threshold before adding gain or loss.

Example:

```text
delta > threshold -> elevation gain
delta < -threshold -> elevation loss
```

If altitude is unavailable, show:

```text
Elevation: --
```

Do not pretend the elevation value is accurate.

## Ride Timer

Provide:

```text
Elapsed Time
Moving Time
```

Elapsed time starts when the ride starts.

Moving time only increases while the rider is moving.

Use GPS speed and/or distance change for movement detection.

Do not make pause detection excessively complicated.

## Statistics

At ride completion show:

```text
Distance
Moving Time
Elapsed Time
Average Speed
Maximum Speed
Elevation Gain
Elevation Loss
```

## Ride Recording

A later version can record GPS points during the ride.

Possible storage:

```text
LocalStorage
IndexedDB
```

Start with LocalStorage only if the data volume is small.

Use IndexedDB if recorded GPS tracks become large.

Do not introduce a database before ride recording actually needs it.

## GPX Export

A useful future feature is GPX export.

The browser can generate a GPX file locally from recorded GPS points.

The export should not require uploading the ride to a server.

## Map

A map is optional.

The basic bike computer must work without a map.

Do not make online map tiles a requirement for:

```text
speed
distance
time
elevation
```

Offline map support can be considered later.

## Future Features

Possible additions:

```text
GPX export
Ride history
Offline maps
Compass
Heading
Auto pause
Auto start
Battery indicator
Cadence sensor
Heart-rate sensor
Bluetooth speed sensor
Navigation
Route following
```

These are secondary.

The basic bike computer must remain simple.
