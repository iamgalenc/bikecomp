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
        _lastCentered: null,
        _tileLayers: {},
        _mode: "dark",
        _fallbackTiles: false
    };

    /* Leaflet is the map engine - it doesn't ship tiles, so we pick a tile provider.
       The default below is OpenStreetMap's standard tiles (same as Leaflet's official
       examples): free, no key required, light style. Optionally, paste a free CARTO key
       (https://carto.com/basemaps/apikey) to also enable the dark/light tile toggle. */
    var CARTO_API_KEY = "";

    var TILE_URLS = {
        dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=" + CARTO_API_KEY,
        light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=" + CARTO_API_KEY
    };

    var OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

    MapModule.isSupported = function () {
        return typeof window.L !== "undefined" && document.getElementById("map");
    };

    MapModule.init = function () {
        if (!this.isSupported()) return;

        try {
            /* guarantee the container has real dimensions before Leaflet init */
            var container = document.getElementById("map");
            container.style.width = "100vw";
            container.style.height = "100vh";

            this._map = L.map("map", {
                zoomControl: true,
                attributionControl: true
            }).setView([0, 0], 16);

            /* keep map sized correctly on resize/orientation change */
            var self = this;
            window.addEventListener("resize", function () {
                self.invalidate();
            });
            window.addEventListener("orientationchange", function () {
                setTimeout(function () {
                    self.invalidate();
                }, 200);
            });

            var osmAttribution = "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors";

            if (CARTO_API_KEY !== "") {
                var cartoOpts = {
                    attribution: osmAttribution + " &copy; CARTO",
                    subdomains: "abcd",
                    maxZoom: 20
                };
                this._tileLayers.dark = L.tileLayer(TILE_URLS.dark, cartoOpts).addTo(this._map);
                this._tileLayers.light = L.tileLayer(TILE_URLS.light, cartoOpts);
            } else {
                /* No CARTO key configured - use OSM standard tiles (Leaflet's default, no key needed) */
                var osmOpts = {
                    attribution: osmAttribution,
                    maxZoom: 19
                };
                this._fallbackTiles = true;
                this._tileLayers.dark = L.tileLayer(OSM_TILE_URL, osmOpts).addTo(this._map);
                this._tileLayers.light = this._tileLayers.dark;
            }

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

    MapModule.setMode = function (mode) {
        if (!this.enabled || this._fallbackTiles || !this._tileLayers[mode] || mode === this._mode) return;

        this._map.removeLayer(this._tileLayers[this._mode]);
        this._tileLayers[mode].addTo(this._map);
        /* tiles must be re-checked after being re-added */
        this._tileLayers[mode].redraw();
        this._mode = mode;
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

    MapModule.invalidate = function () {
        if (this.enabled) {
            this._map && this._map.invalidateSize();
        }
    };

    window.MapModule = MapModule;
})();