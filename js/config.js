// Replace with your Mapbox access token
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaXR6ciIsImEiOiJjbTg3M2lzcWUwMDVuMmtyMG5hN3Vxb2V4In0.ESDOjUOZYUlyFMYql7id0A';

// Configuration settings
const CONFIG = {
    mapStyle: 'mapbox://styles/mapbox/light-v11',
    initialCenter: [0, 20], // [longitude, latitude]
    initialZoom: 1.5,
    minZoom: 1,
    maxZoom: 8,
    defaultYear: 2022,
    colorScale: [
        '#f7fbff',
        '#deebf7',
        '#c6dbef',
        '#9ecae1',
        '#6baed6',
        '#4292c6',
        '#2171b5',
        '#08519c',
        '#08306b'
    ],
    noDataColor: '#ccc'
}; 