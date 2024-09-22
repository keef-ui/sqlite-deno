import { fetchLocationData } from "./fetch_location.ts";

// Test the function High street north
const latitude = 51.538128;
const longitude = 0.051590;



console.log(`Fetching location data for coordinates: ${latitude}, ${longitude}`);

const result = await fetchLocationData(latitude, longitude);

if (result) {
  console.log('Street:', result.street);
  console.log('City:', result.city);
  console.log('Postcode:', result.postcode);
} else {
  console.log('Failed to fetch location data');
}



//other locations to try
// Charing Cross Road road: lat: -0.129926  -- long: 51.515032