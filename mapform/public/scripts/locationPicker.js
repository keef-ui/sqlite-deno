const LocationPicker = (function() {
    let map, marker;
    const form = document.getElementById('locationForm');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const saveButton = document.getElementById('saveButton');

    function initMap() {
        map = L.map('map').setView([51.537968, 0.051541], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.on('click', onMapClick);
    }

    function onMapClick(e) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);

        if (marker) {
            map.removeLayer(marker);
        }

        marker = L.marker([lat, lng]).addTo(map);
        updateForm(lat, lng);
    }

    function updateForm(lat, lng) {
        latitudeInput.value = lat;
        longitudeInput.value = lng;
        saveButton.disabled = false;
    }



    function init() {
        initMap();

    }

    return {
        init: init
    };
})();