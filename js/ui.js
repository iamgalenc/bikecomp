/* UI module - renders ride state to the DOM */
(function () {
    "use strict";

    var els = {};

    function cacheElements() {
        els.speed = document.getElementById("speed-value");
        els.distance = document.getElementById("distance-value");
        els.time = document.getElementById("time-value");
        els.movingTime = document.getElementById("moving-time-value");
        els.avgSpeed = document.getElementById("avg-speed-value");
        els.maxSpeed = document.getElementById("max-speed-value");
        els.elevation = document.getElementById("elevation-value");
        els.gain = document.getElementById("gain-value");
        els.loss = document.getElementById("loss-value");
        els.gpsText = document.getElementById("gps-text");
        els.gpsDot = document.getElementById("gps-dot");
        els.gpsAccuracy = document.getElementById("gps-accuracy");
        els.btnStart = document.getElementById("btn-start");
        els.btnPause = document.getElementById("btn-pause");
        els.btnResume = document.getElementById("btn-resume");
        els.btnStop = document.getElementById("btn-stop");
        els.btnMap = document.getElementById("btn-map");
        els.permissionBanner = document.getElementById("permission-banner");
    }

    function formatTime(seconds) {
        seconds = Math.max(0, Math.floor(seconds));
        var h = Math.floor(seconds / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = seconds % 60;
        return (h < 10 ? "0" + h : h) + ":" +
               (m < 10 ? "0" + m : m) + ":" +
               (s < 10 ? "0" + s : s);
    }

    function formatSpeed(kmh) {
        if (kmh === null || typeof kmh === "undefined") return "--";
        return kmh.toFixed(1);
    }

    function formatDistance(km) {
        return km.toFixed(2);
    }

    function formatElevation(m) {
        if (m === null || typeof m === "undefined") return "--";
        return Math.round(m) + "";
    }

    function formatAccuracy(m) {
        if (m === null || typeof m === "undefined") return "--";
        return Math.round(m) + " m";
    }

    function setGpsStatus(status, text) {
        var classes = ["searching", "active", "weak", "error"];
        for (var i = 0; i < classes.length; i++) {
            els.gpsDot.classList.remove(classes[i]);
        }
        if (status !== "off" && status !== "ready") {
            els.gpsDot.classList.add(status);
        }
        els.gpsText.textContent = text;
    }

    function showPermissionBanner(show) {
        if (show) {
            els.permissionBanner.classList.remove("hidden");
        } else {
            els.permissionBanner.classList.add("hidden");
        }
    }

    function updateDashboard(state) {
        /* Only set textContent when value changed to avoid useless DOM writes */
        if (els.speed.textContent !== formatSpeed(state.currentSpeed)) {
            els.speed.textContent = formatSpeed(state.currentSpeed);
        }
        if (els.distance.textContent !== formatDistance(state.distance / 1000)) {
            els.distance.textContent = formatDistance(state.distance / 1000);
        }
        if (els.time.textContent !== formatTime(state.elapsedTime)) {
            els.time.textContent = formatTime(state.elapsedTime);
        }
        if (els.movingTime.textContent !== formatTime(state.movingTime)) {
            els.movingTime.textContent = formatTime(state.movingTime);
        }

        var avgText = state.movingTime > 0 ? formatSpeed(state.averageSpeed) : "--";
        if (els.avgSpeed.textContent !== avgText) {
            els.avgSpeed.textContent = avgText;
        }

        var maxText = state.maxSpeed > 0 ? formatSpeed(state.maxSpeed) : "--";
        if (els.maxSpeed.textContent !== maxText) {
            els.maxSpeed.textContent = maxText;
        }

        if (els.elevation.textContent !== formatElevation(state.elevation)) {
            els.elevation.textContent = formatElevation(state.elevation);
        }
        if (els.gain.textContent !== formatElevation(state.elevationGain)) {
            els.gain.textContent = formatElevation(state.elevationGain);
        }
        if (els.loss.textContent !== formatElevation(state.elevationLoss)) {
            els.loss.textContent = formatElevation(state.elevationLoss);
        }
        if (els.gpsAccuracy.textContent !== formatAccuracy(state.gpsAccuracy)) {
            els.gpsAccuracy.textContent = formatAccuracy(state.gpsAccuracy);
        }
    }

    window.UI = {
        cacheElements: cacheElements,
        updateDashboard: updateDashboard,
        setGpsStatus: setGpsStatus,
        showPermissionBanner: showPermissionBanner,
        els: function () { return els; }
    };
})();