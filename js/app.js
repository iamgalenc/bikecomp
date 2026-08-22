/* App module - wires GPS, ride processor, and UI together */
(function () {
    "use strict";

    var processor = new RideProcessor();
    var clockInterval = null;
    var screenWake = null;

    function init() {
        UI.cacheElements();

        var els = UI.els();

        els.btnStart.addEventListener("click", onStart);
        els.btnPause.addEventListener("click", onPause);
        els.btnResume.addEventListener("click", onResume);
        els.btnStop.addEventListener("click", onStop);

        UI.showPermissionBanner(false);
        UI.setGpsStatus("off", "GPS OFF");

        startClock();
    }

    function onStart() {
        if (!GPS.supported()) {
            UI.setGpsStatus("error", "GPS NOT SUPPORTED");
            return;
        }

        processor.start(Date.now());

        var els = UI.els();
        els.btnStart.classList.add("hidden");
        els.btnPause.classList.remove("hidden");
        els.btnStop.classList.remove("hidden");

        UI.setGpsStatus("searching", "GPS SEARCHING");
        UI.showPermissionBanner(false);

        requestWakeLock();

        GPS.start(onGpsUpdate, onGpsError);
    }

    function onPause() {
        var els = UI.els();
        processor.pause();

        els.btnPause.classList.add("hidden");
        els.btnResume.classList.remove("hidden");
        els.btnStop.classList.remove("hidden");

        UI.setGpsStatus("searching", "GPS PAUSED");
    }

    function onResume() {
        var els = UI.els();
        processor.resume();

        els.btnResume.classList.add("hidden");
        els.btnPause.classList.remove("hidden");
        els.btnStop.classList.remove("hidden");

        if (processor.state.recording) {
            UI.setGpsStatus("searching", "GPS SEARCHING");
        }

        if (!GPS.watching) {
            GPS.start(onGpsUpdate, onGpsError);
        }
    }

    function onStop() {
        var els = UI.els();
        processor.stop();

        GPS.stop();

        els.btnStop.classList.add("hidden");
        els.btnPause.classList.add("hidden");
        els.btnResume.classList.add("hidden");
        els.btnStart.classList.remove("hidden");

        UI.setGpsStatus("off", "GPS OFF");
        releaseWakeLock();
    }

    function onGpsUpdate(pos) {
        processor.handlePosition(pos);

        var state = processor.state;
        var accuracy = state.gpsAccuracy;
        var status = "searching";
        var text = "GPS SEARCHING";

        if (accuracy === null || typeof accuracy === "undefined") {
            status = "searching";
            text = "GPS SEARCHING";
        } else if (accuracy <= 10) {
            status = "active";
            text = "GPS READY";
        } else if (accuracy <= 30) {
            status = "weak";
            text = "GPS WEAK";
        } else {
            status = "weak";
            text = "GPS WEAK " + Math.round(accuracy) + "m";
        }

        UI.setGpsStatus(status, text);
        UI.updateDashboard(state);
    }

    function onGpsError(err) {
        var message = "GPS UNAVAILABLE";
        var status = "error";

        if (err && err.code === 1) {
            /* PERMISSION_DENIED */
            message = "LOCATION PERMISSION DENIED";
            status = "error";
            UI.showPermissionBanner(true);
        } else if (err && err.code === 2) {
            /* POSITION_UNAVAILABLE */
            message = "GPS UNAVAILABLE";
            status = "error";
        } else if (err && err.code === 3) {
            /* TIMEOUT */
            message = "GPS SEARCHING";
            status = "searching";
        }

        UI.setGpsStatus(status, message);
    }

    function startClock() {
        if (clockInterval) return;

        clockInterval = setInterval(function () {
            processor.updateElapsedTime(Date.now());
            UI.updateDashboard(processor.state);
        }, 1000);
    }

    function requestWakeLock() {
        if ("wakeLock" in navigator && navigator.wakeLock) {
            navigator.wakeLock.request("screen").then(function (lock) {
                screenWake = lock;
            }).catch(function () {
                screenWake = null;
            });
        }
    }

    function releaseWakeLock() {
        if (screenWake) {
            screenWake.release().catch(function () {});
            screenWake = null;
        }
    }

    document.addEventListener("DOMContentLoaded", init);
})();