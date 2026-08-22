# GPS Calculation Rules

## Location Input

Use the browser Geolocation API:

```javascript
navigator.geolocation.watchPosition(success, error, options)
```

Useful options may include:

```javascript
{
    enableHighAccuracy: true,
    maximumAge: 1000,
    timeout: 10000
}
```

These values should be tested on real old devices.

Do not blindly assume high accuracy is always better for battery life.

## Valid Location

A location is usable when:

```text
latitude is valid
longitude is valid
timestamp is valid
accuracy is reasonable
```

If the location is invalid, ignore it.

Never allow one broken GPS point to corrupt the entire ride.

## GPS Accuracy

Use:

```text
position.coords.accuracy
```

and display it in meters.

Example:

```text
GPS 6 m
```

A weak signal should be visible to the rider.

## Distance

Calculate distance between two coordinates using the Haversine formula.

Conceptually:

```text
previous coordinate
        +
current coordinate
        |
        v
Haversine distance
        |
        v
validate movement
        |
        v
add to total distance
```

Do not accumulate tiny movements caused by GPS jitter.

A simple threshold can be applied.

Do not use complex Kalman filters unless real device testing proves they are necessary.

## Speed

Preferred:

```javascript
position.coords.speed
```

Fallback:

```text
distance / timeDelta
```

Convert meters per second to km/h:

```text
km/h = m/s × 3.6
```

Do not calculate speed when:

```text
timeDelta <= 0
distance < 0
```

Reject obviously impossible GPS spikes.

## Average Speed

Use:

```text
average speed = total distance / moving time
```

If moving time is zero:

```text
--
```

Do not divide by elapsed time when the ride contains long stops.

## Maximum Speed

Update maximum speed only using validated speed readings.

A single GPS spike should not automatically become the maximum speed.

Use simple sanity checking.

Do not implement complicated statistical filtering unless testing shows a need.

## Elevation

Use:

```javascript
position.coords.altitude
```

when available.

Altitude may be `null`.

When altitude is unavailable:

```text
elevation = --
```

## Elevation Gain

Do not calculate:

```text
gain += abs(currentAltitude - previousAltitude)
```

because GPS altitude noise will create fake climbing.

Instead:

```text
delta = currentAltitude - previousAltitude

if delta > threshold:
    gain += delta

if delta < -threshold:
    loss += abs(delta)
```

The threshold should be configurable.

Start with a practical value and tune it using real rides.

## GPS Loss

When the browser reports an error:

```text
gpsStatus = unavailable/searching
```

Do not stop or reset the ride automatically.

When GPS returns, validate the first new position before resuming calculations.

Avoid blindly connecting two positions separated by a long GPS outage.

## Timestamps

Use:

```javascript
position.timestamp
```

for GPS calculations.

Do not assume that `watchPosition()` callbacks happen at fixed intervals.

Always calculate the actual time delta.

## Filtering Philosophy

The goal is a useful cycling computer, not scientific GPS processing.

Start simple.

Only add advanced filtering when real-world testing demonstrates a measurable problem.
