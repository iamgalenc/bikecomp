# UI Rules

## Main Screen

The dashboard must be readable while riding.

Primary information:

```text
SPEED
DISTANCE
TIME
```

Secondary information:

```text
AVG SPEED
MAX SPEED
ELEVATION
ELEVATION GAIN
GPS ACCURACY
```

## Example Layout

```text
+-----------------------------+
|          24.6               |
|          km/h               |
|                             |
|   32.41 km      01:24:32    |
|   Distance       Time       |
|                             |
|   AVG 22.8      MAX 41.3    |
|                             |
|   ALT 482 m     GAIN 312 m  |
|                             |
|   GPS 6 m       RECORDING   |
+-----------------------------+
```

This is conceptual.

Do not spend time making the UI complicated.

Also add live gps map if possible.

## Mobile Browser

The application should be designed for phone screens.

Use responsive CSS.

Avoid assuming a specific screen resolution.

Avoid layouts that require modern CSS features when an older-compatible alternative is simple.

Use landscape view if available.

## Readability

Use large typography for current speed.

Use high contrast.

Avoid small text.

Avoid unnecessary animation.

The rider should understand the current state with one glance.

## Touch Controls

Use large touch targets.

Primary controls:

```text
START
PAUSE
RESUME
STOP
```

Do not hide essential controls behind complicated menus.

## GPS Status

Always make GPS state visible.

Examples:

```text
GPS SEARCHING
GPS READY
GPS WEAK
GPS ERROR
```

Permission errors should be understandable:

```text
Location permission denied
```

The application should tell the user that location permission is required for GPS metrics.

## Permission Flow

Do not request location access immediately on page load.

Preferred flow:

```text
Open website
      |
      v
Press START
      |
      v
Request location permission
      |
      +---- denied ---> show explanation
      |
      +---- granted --> start GPS
```

This makes the permission request understandable.

## Screen Wake

The application should attempt to keep the display usable during a ride.

If the browser/device does not support a reliable screen-wake mechanism, do not make the entire application depend on it.

The user should still be able to ride with the screen timeout behavior of the device.

## Orientation

Landscape mode can be useful for a mounted phone.

Support responsive portrait and landscape layouts if it can be done simply.

Do not create separate application implementations for each orientation.

## Dark UI

A dark interface is preferred for a bike computer.

Keep the design simple.

Avoid gradients, excessive shadows, animated backgrounds, and decorative elements that do not help the rider.

## Battery

Do not refresh the UI excessively.

Do not animate every GPS update.

Do not poll GPS manually when `watchPosition()` can provide updates.

Do not run unnecessary background JavaScript.

Battery efficiency matters more than visual polish.
