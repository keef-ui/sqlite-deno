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
        addressField.textContent = `street: ${address.street}, city: ${address.city}, postcode: ${address.postcode}`;
        saveButton.disabled = false;
    }



    function init() {
        initMap();

    }


    async function fetchLocationData(latitude, longitude) {
        const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
      
        try {
          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
      
          // Extract required information
          const street = data.address.road || 'N/A';
          const city = data.address.city || data.address.town || data.address.village || 'N/A';
          const postcode = data.address.postcode || 'N/A';
      
          return {
            street,
            city,
            postcode
          };
        } catch (error) {
          console.error('Error fetching location data:', error);
          return null;
        }
      }

    return {
        init: init
    };
})();
