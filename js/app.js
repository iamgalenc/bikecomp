/* App module - wires GPS, ride processor, and UI together */
(function () {
    "use strict";

    var processor = new RideProcessor();
    var clockInterval = null;
    var screenWake = null;
    var lastTrackIndex = 0;

    function init() {
        UI.cacheElements();

        var els = UI.els();

        els.btnStart.addEventListener("click", onStart);
        els.btnPause.addEventListener("click", onPause);
        els.btnResume.addEventListener("click", onResume);
        els.btnStop.addEventListener("click", onStop);
        els.btnFull.addEventListener("click", function () {
            onToggleFullscreen("portrait");
        });
        els.btnWide.addEventListener("click", function () {
            onToggleFullscreen("landscape");
        });

        if (!isFullscreenSupported()) {
            els.btnFull.classList.add("hidden");
            els.btnWide.classList.add("hidden");
        }

        MapModule.init();
        /* wait for layout before sizing the map */
        setTimeout(function () {
            MapModule.invalidate();
        }, 100);

        UI.showPermissionBanner(false);
        UI.setGpsStatus("off", "GPS OFF");
        UI.updateClock();

        initBattery();
        startClock();
    }

    function initBattery() {
        if (!navigator.getBattery) {
            /* Battery API unsupported - indicator stays hidden */
            return;
        }

        navigator.getBattery().then(function (bat) {
            var update = function () {
                UI.updateBattery(bat.level, bat.charging);
            };

            update();
            UI.showBattery(true);

            bat.addEventListener("levelchange", update);
            bat.addEventListener("chargingchange", update);
        }).catch(function () {
            /* battery info unavailable - indicator stays hidden */
        });
    }

    function isFullscreenSupported() {
        return !!(document.documentElement.requestFullscreen ||
                  document.documentElement.webkitRequestFullscreen ||
                  document.documentElement.mozRequestFullScreen ||
                  document.documentElement.msRequestFullscreen);
    }

    function onToggleFullscreen(orientation) {
        var doc = document;
        var el = doc.documentElement;

        if (doc.fullscreenElement || doc.webkitFullscreenElement ||
            doc.mozFullScreenElement || doc.msFullscreenElement) {
            unlockOrientation();
            if (doc.exitFullscreen) doc.exitFullscreen();
            else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
            else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen();
            else if (doc.msExitFullscreen) doc.msExitFullscreen();
        } else {
            var request = el.requestFullscreen || el.webkitRequestFullscreen ||
                          el.mozRequestFullScreen || el.msRequestFullscreen;
            var result = request.call(el);

            /* lock orientation after entering fullscreen (Chrome/Android) */
            if (result && result.then) {
                result.then(function () {
                    lockOrientation(orientation);
                }).catch(function () {});
            } else {
                setTimeout(function () {
                    lockOrientation(orientation);
                }, 300);
            }
        }
    }

    function lockOrientation(orientation) {
        var so = screen.orientation || screen.mozOrientation || screen.msOrientation;
        if (so && so.lock) {
            try {
                var p = so.lock(orientation);
                if (p && p.catch) p.catch(function () {});
            } catch (e) {
                /* orientation lock unsupported - fullscreen still works */
            }
        }
    }

    function unlockOrientation() {
        var so = screen.orientation || screen.mozOrientation || screen.msOrientation;
        if (so && so.unlock) {
            try {
                so.unlock();
            } catch (e) {}
        }
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

        MapModule.reset();
        lastTrackIndex = 0;

        UI.setGpsStatus("off", "GPS OFF");
        releaseWakeLock();
    }

    function onGpsUpdate(pos) {
        processor.handlePosition(pos);

        var state = processor.state;
        var accuracy = state.gpsAccuracy;

        /* feed the map with the live position */
        if (typeof state.gpsAccuracy === "number" &&
            typeof pos.coords.latitude === "number") {
            MapModule.updatePosition(pos.coords.latitude, pos.coords.longitude, state.gpsAccuracy);
        }

        /* append new track points since last update */
        var track = state.gpsTrack;
        var i;
        for (i = lastTrackIndex; i < track.length; i++) {
            MapModule.addTrackPoint(track[i].lat, track[i].lon);
        }
        lastTrackIndex = track.length;

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
            UI.updateClock();
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