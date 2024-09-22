export async function fetchLocationData(latitude, longitude) {
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
  
  // Example usage:
  // fetchLocationData(51.538128, 0.051590)
  //   .then(result => {
  //     if (result) {
  //       console.log('Street:', result.street);
  //       console.log('City:', result.city);
  //       console.log('Postcode:', result.postcode);
  //     } else {
  //       console.log('Failed to fetch location data');
  //     }
  //   });