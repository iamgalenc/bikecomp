/* Ride module - GPS processing, calculations, and ride state */
(function () {
    "use strict";

    var EARTH_RADIUS_M = 6371000;

    /* Movement/elevation thresholds in meters */
    var CONFIG = {
        movementThresholdM: 3,
        elevationThresholdM: 3,
        maxValidSpeedKmh: 120,
        maxValidAccuracyM: 100
    };

    function haversineMeters(lat1, lon1, lat2, lon2) {
        var R = EARTH_RADIUS_M;
        var toRad = Math.PI / 180;
        var dLat = (lat2 - lat1) * toRad;
        var dLon = (lon2 - lon1) * toRad;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function RideState() {
        this.recording = false;
        this.paused = false;
        this.distance = 0;
        this.movingTime = 0;
        this.elapsedTime = 0;
        this.currentSpeed = 0;
        this.averageSpeed = 0;
        this.maxSpeed = 0;
        this.elevation = null;
        this.elevationGain = 0;
        this.elevationLoss = 0;
        this.gpsAccuracy = null;
        this.gpsStatus = "off";
        this.gpsTrack = [];
    }

    function RideProcessor() {
        this.state = new RideState();

        this._prev = null;          /* last validated {lat, lon, alt, ts, accuracy} */
        this._rideStartTs = null;
        this._lastMoveTs = null;
        this._lastPauseTs = null;
    }

    RideProcessor.prototype.reset = function () {
        this.state = new RideState();
        this._prev = null;
        this._rideStartTs = null;
        this._lastMoveTs = null;
        this._lastPauseTs = null;
    };

    RideProcessor.prototype.start = function (ts) {
        this.reset();
        this.state.recording = true;
        this.state.paused = false;
        this._rideStartTs = ts;
        this._lastMoveTs = ts;
    };

    RideProcessor.prototype.pause = function () {
        if (!this.state.recording || this.state.paused) return;
        this.state.paused = true;
        this._lastPauseTs = Date.now();
    };

    RideProcessor.prototype.resume = function () {
        if (!this.state.recording || !this.state.paused) return;
        this.state.paused = false;
        this._rideStartTs += Date.now() - this._lastPauseTs;
        this._lastPauseTs = null;
        this._prev = null;
    };

    RideProcessor.prototype.stop = function () {
        this.state.recording = false;
        this.state.paused = false;
    };

    RideProcessor.prototype.updateElapsedTime = function (now) {
        if (this.state.recording && !this.state.paused) {
            this.state.elapsedTime = (now - this._rideStartTs) / 1000;
        }
        this._updateAverages();
    };

    RideProcessor.prototype.handlePosition = function (pos) {
        var state = this.state;
        var coords = pos.coords;
        var ts = pos.timestamp;

        if (!this._isValidPosition(pos)) {
            return;
        }

        state.gpsAccuracy = coords.accuracy;
        state.elevation = (typeof coords.altitude === "number") ? coords.altitude : null;

        if (state.paused) return;

        var prev = this._prev;

        if (prev) {
            var dt = (ts - prev.ts) / 1000;
            var dist = haversineMeters(
                prev.lat, prev.lon,
                coords.latitude, coords.longitude
            );

            if (dt > 0) {
                if (dist >= CONFIG.movementThresholdM) {
                    state.distance += dist;
                    state.movingTime += dt;
                    this._lastMoveTs = ts;

                    var speedKmh = this._calculateSpeed(coords, dt, dist);
                    if (speedKmh !== null) {
                        state.currentSpeed = speedKmh;
                        if (speedKmh > state.maxSpeed) {
                            state.maxSpeed = speedKmh;
                        }
                    }

                    if (typeof coords.altitude === "number" && prev.alt !== null) {
                        this._updateElevation(coords.altitude, prev.alt);
                    }
                    state.gpsTrack.push({
                        lat: coords.latitude,
                        lon: coords.longitude,
                        alt: coords.altitude,
                        ts: ts
                    });
                } else {
                    /* not enough movement - stationary jitter */
                    /* speed may still refresh from coords.speed when available */
                    var idleSpeed = this._calculateSpeed(coords, dt, dist);
                    if (idleSpeed !== null && dist < CONFIG.movementThresholdM) {
                        if (idleSpeed < 3) {
                            state.currentSpeed = 0;
                        }
                    }
                }
            }
        } else {
            state.currentSpeed = 0;
            state.maxSpeed = 0;
        }

        this._prev = {
            lat: coords.latitude,
            lon: coords.longitude,
            alt: (typeof coords.altitude === "number") ? coords.altitude : null,
            ts: ts,
            accuracy: coords.accuracy
        };

        this._updateAverages();
    };

    RideProcessor.prototype._isValidPosition = function (pos) {
        var c = pos.coords;
        if (!c || typeof c.latitude !== "number" || typeof c.longitude !== "number") return false;
        if (c.latitude < -90 || c.latitude > 90 || c.longitude < -180 || c.longitude > 180) return false;
        if (typeof pos.timestamp !== "number") return false;
        if (typeof c.accuracy === "number" && c.accuracy > CONFIG.maxValidAccuracyM) return false;
        return true;
    };

    RideProcessor.prototype._calculateSpeed = function (coords, dt, dist) {
        var speedKmh = null;

        if (typeof coords.speed === "number" && coords.speed >= 0) {
            speedKmh = coords.speed * 3.6;
        } else if (dt > 0 && dist >= 0) {
            speedKmh = (dist / dt) * 3.6;
        }

        if (speedKmh !== null && speedKmh > CONFIG.maxValidSpeedKmh) {
            return null;
        }
        return speedKmh;
    };

    RideProcessor.prototype._updateElevation = function (currAlt, prevAlt) {
        var delta = currAlt - prevAlt;
        if (delta > CONFIG.elevationThresholdM) {
            this.state.elevationGain += delta;
        } else if (delta < -CONFIG.elevationThresholdM) {
            this.state.elevationLoss += Math.abs(delta);
        }
    };

    RideProcessor.prototype._updateAverages = function () {
        var state = this.state;
        if (state.movingTime > 0) {
            state.averageSpeed = (state.distance / state.movingTime) * 3.6;
        } else {
            state.averageSpeed = 0;
        }
    };

    window.RideProcessor = RideProcessor;
    window.RideState = RideState;
})();