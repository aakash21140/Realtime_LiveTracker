const socket = io(); // Initialize Socket.IO

// Check if Geolocation is supported
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude }); // Send location to the server
        },
        (error) => {
            console.error("Error obtaining location:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

// Initialize the Leaflet map
const map = L.map("map").setView([21.1670,81.8206], 8); // Set initial view

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
}).addTo(map);

const markers = {}; // Object to hold user markers

// Listen for location updates from the server
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    // Update map view to the new location
    map.setView([latitude, longitude]);

    // If the marker exists, update its position
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // If it doesn't exist, create a new marker
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Handle user disconnection
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]); // Remove the marker from the map
        delete markers[id]; // Delete the marker from the markers object
    }
});
