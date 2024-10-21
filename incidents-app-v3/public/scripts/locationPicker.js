import { fetchLocationData } from "./fetch_location.js";

 const LocationPicker = (function() {
    let map, marker;
    const form = document.getElementById('locationForm');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const addressField=document.getElementById('address');
    const saveButton = document.getElementById('saveButton');

    function initMap() {
        map = L.map('map').setView([51.537968, 0.051541], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.on('click', onMapClick);
    }

    async function onMapClick(e) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);

        if (marker) {
            map.removeLayer(marker);
        }
        const address = await fetchLocationData(lat, lng);
        marker = L.marker([lat, lng]).addTo(map);
        updateForm(lat, lng, address);
    }

    function updateForm(lat, lng,address) {
        latitudeInput.value = lat;
        longitudeInput.value = lng;
        addressField.value = ` ${address.street},  ${address.city}, postcode: ${address.postcode}`;
        saveButton.disabled = false;
    }



    function init() {
        initMap();

    }

    return {
        init: init
    };
})();


export default LocationPicker