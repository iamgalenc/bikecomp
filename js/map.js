/* Map module - optional live GPS map via Leaflet (feature-detected) */
(function () {
    "use strict";

    var MapModule = {
        enabled: false,      /* set true when Leaflet loaded + map initialized */
        visible: false,
        _map: null,
        _positionMarker: null,
        _accuracyCircle: null,
        _track: null,
        _points: [],
        _lastCentered: null
    };

    MapModule.isSupported = function () {
        return typeof window.L !== "undefined" && document.getElementById("map");
    };

    MapModule.init = function () {
        if (!this.isSupported()) return;

        try {
            this._map = L.map("map", {
                zoomControl: true,
                attributionControl: true
            }).setView([0, 0], 16);

            L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
                attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
                subdomains: "abcd",
                maxZoom: 20
            }).addTo(this._map);

            var icon = L.divIcon({
                className: "",
                html: '<div class="position-marker"></div>',
                iconSize: [18, 18],
                iconAnchor: [9, 9]
            });

            this._positionMarker = L.marker([0, 0], { icon: icon }).addTo(this._map);
            this._accuracyCircle = L.circle([0, 0], { radius: 0 }).addTo(this._map);
            this._track = L.polyline([], { className: "ride-track" }).addTo(this._map);

            this.enabled = true;
        } catch (e) {
            /* map failed, ride continues without it */
            this.enabled = false;
        }
    };

    MapModule.updatePosition = function (lat, lon, accuracy) {
        if (!this.enabled) return;

        this._positionMarker.setLatLng([lat, lon]);
        this._accuracyCircle.setLatLng([lat, lon]);
        this._accuracyCircle.setRadius(typeof accuracy === "number" ? accuracy : 0);

        /* always keep the pin centered */
        this._map.panTo([lat, lon]);
    };

    MapModule.addTrackPoint = function (lat, lon) {
        if (!this.enabled) return;
        this._points.push([lat, lon]);
        this._track.setLatLngs(this._points);
    };

    MapModule.reset = function () {
        this._points = [];
        this._lastCentered = null;
        if (this.enabled) {
            this._track.setLatLngs([]);
        }
    };

    MapModule.show = function () {
        if (!this.enabled) return;
        var panel = document.getElementById("map-panel");
        if (panel) {
            panel.classList.remove("hidden");
            this.visible = true;
            /* Leaflet needs an invalidateSize() when the container becomes visible */
            setTimeout(function () {
                this._map && this._map.invalidateSize();
            }.bind(this), 50);
        }
    };

    MapModule.hide = function () {
        var panel = document.getElementById("map-panel");
        if (panel) {
            panel.classList.add("hidden");
            this.visible = false;
        }
    };

    window.MapModule = MapModule;
})();