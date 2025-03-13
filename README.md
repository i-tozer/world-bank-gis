# World GDP Map

This application visualizes World Bank GDP data on an interactive world map using Mapbox GL JS. It allows users to explore GDP data for different countries over time.

## Features

- Interactive world map showing GDP data for each country
- Time slider to view GDP data across different years (1960-2022)
- Color-coded countries based on GDP values
- Detailed information panel showing country details on hover
- Legend explaining the color scale

## Setup Instructions

### Prerequisites

- A Mapbox account and access token (free tier available at [mapbox.com](https://www.mapbox.com/))

### Installation

1. Clone this repository or download the source code.
2. Open the `js/config.js` file and replace `'YOUR_MAPBOX_ACCESS_TOKEN'` with your actual Mapbox access token:

```javascript
const MAPBOX_ACCESS_TOKEN = 'your_mapbox_access_token_here';
```

3. Serve the application using a local web server. You can use one of the following methods:

   - Using Python:
     ```
     python -m http.server
     ```
   
   - Using Node.js (with the `http-server` package):
     ```
     npx http-server
     ```

4. Open your browser and navigate to the local server address (typically `http://localhost:8000` or `http://127.0.0.1:8000`).

## Data Source

The GDP data used in this application is from the World Bank's World Development Indicators. The specific dataset is "GDP (current US$)" with the indicator code "NY.GDP.MKTP.CD".

## Usage

- Use the mouse to pan and zoom the map
- Use the year slider at the bottom to change the displayed year
- Hover over countries to see detailed information in the info panel
- Refer to the legend to understand the color scale

## Technologies Used

- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/) - For rendering the interactive map
- [D3.js](https://d3js.org/) - For data processing and color scaling
- HTML, CSS, and JavaScript - For the web application structure and functionality

## License

This project is open source and available under the [MIT License](LICENSE). 