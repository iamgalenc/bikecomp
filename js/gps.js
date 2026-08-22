/* GPS module - owns all navigator.geolocation access */
(function () {
    "use strict";

    var GPS = {
        watching: false,
        watchId: null,

        _handlers: {
            onUpdate: null,
            onError: null
        },

        supported: function () {
            return typeof navigator !== "undefined" && "geolocation" in navigator;
        },

        start: function (onUpdate, onError) {
            if (!this.supported()) {
                if (onError) onError({ code: -1, message: "Geolocation not supported" });
                return;
            }

            this._handlers.onUpdate = onUpdate;
            this._handlers.onError = onError;

            var self = this;
            this.watchId = navigator.geolocation.watchPosition(
                function (pos) {
                    self._handlers.onUpdate && self._handlers.onUpdate(pos);
                },
                function (err) {
                    self._handlers.onError && self._handlers.onError(err);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 1000,
                    timeout: 10000
                }
            );
            this.watching = true;
        },

        stop: function () {
            if (this.watchId !== null && this.supported()) {
                navigator.geolocation.clearWatch(this.watchId);
            }
            this.watchId = null;
            this.watching = false;
            this._handlers.onUpdate = null;
            this._handlers.onError = null;
        }
    };

    window.GPS = GPS;
})();