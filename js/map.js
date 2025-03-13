// Initialize the map and data
let map;
let currentYear = CONFIG.defaultYear;
let colorScale;
let is3DMode = true; // Start in 3D mode
let heightScaleFactor = 300; // Default height scale factor (300x)
let powerFactor = 10; // Default power factor for amplification (10x)
let minHeightPercent = 0.01; // Minimum height as percentage of max (default 1%)

// Initialize the application
async function initApp() {
    // Set Mapbox access token
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    
    // Load GDP data
    const data = await GDPData.loadGDPData();
    if (!data) {
        alert('Failed to load GDP data. Please check the console for errors.');
        return;
    }
    
    // Initialize the map
    initMap();
    
    // Initialize the year slider
    initYearSlider();
    
    // Initialize view toggle
    initViewToggle();
    
    // Initialize height scale slider
    initHeightScaleSlider();
    
    // Initialize power factor slider
    initPowerFactorSlider();
    
    // Initialize minimum height slider
    initMinHeightSlider();
    
    // Update the map with the default year
    updateMap(CONFIG.defaultYear);
}

// Initialize the minimum height slider
function initMinHeightSlider() {
    // Create the minimum height control container
    const minHeightControl = document.createElement('div');
    minHeightControl.className = 'min-height-control';
    
    // Create the label
    const label = document.createElement('label');
    label.htmlFor = 'min-height-slider';
    label.innerHTML = 'Min Height: <span id="min-height-value">1%</span>';
    
    // Create the slider
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'min-height-slider';
    slider.min = '0';
    slider.max = '20';
    slider.step = '0.5';
    slider.value = minHeightPercent * 100;
    
    // Add event listener for slider changes
    slider.addEventListener('input', (e) => {
        minHeightPercent = parseFloat(e.target.value) / 100;
        document.getElementById('min-height-value').textContent = `${e.target.value}%`;
        updateMap(currentYear);
    });
    
    // Append elements to the control
    minHeightControl.appendChild(label);
    minHeightControl.appendChild(slider);
    
    // Add the control to the map container
    document.querySelector('.map-container').appendChild(minHeightControl);
}

// Initialize the power factor slider
function initPowerFactorSlider() {
    // Create the power factor control container
    const powerFactorControl = document.createElement('div');
    powerFactorControl.className = 'power-factor-control';
    
    // Create the label
    const label = document.createElement('label');
    label.htmlFor = 'power-factor-slider';
    label.innerHTML = 'Amplification: <span id="power-factor-value">10x</span>';
    
    // Create the slider
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'power-factor-slider';
    slider.min = '0.5';
    slider.max = '50'; // Maximum value of 50x
    slider.step = '0.5';
    slider.value = powerFactor;
    
    // Add event listener for slider changes
    slider.addEventListener('input', (e) => {
        powerFactor = parseFloat(e.target.value);
        document.getElementById('power-factor-value').textContent = `${powerFactor.toFixed(1)}x`;
        updateMap(currentYear);
    });
    
    // Append elements to the control
    powerFactorControl.appendChild(label);
    powerFactorControl.appendChild(slider);
    
    // Add the control to the map container
    document.querySelector('.map-container').appendChild(powerFactorControl);
}

// Initialize the height scale slider
function initHeightScaleSlider() {
    // Create the height scale control container
    const heightScaleControl = document.createElement('div');
    heightScaleControl.className = 'height-scale-control';
    
    // Create the label
    const label = document.createElement('label');
    label.htmlFor = 'height-scale-slider';
    label.innerHTML = 'Height Scale: <span id="height-scale-value">300x</span>';
    
    // Create the slider
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'height-scale-slider';
    slider.min = '1';
    slider.max = '1000';
    slider.step = '5';
    slider.value = heightScaleFactor;
    
    // Add event listener for slider changes
    slider.addEventListener('input', (e) => {
        heightScaleFactor = parseInt(e.target.value);
        document.getElementById('height-scale-value').textContent = `${heightScaleFactor}x`;
        updateMap(currentYear);
    });
    
    // Append elements to the control
    heightScaleControl.appendChild(label);
    heightScaleControl.appendChild(slider);
    
    // Add the control to the map container
    document.querySelector('.map-container').appendChild(heightScaleControl);
}

// Initialize the Mapbox map
function initMap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: CONFIG.mapStyle,
        center: CONFIG.initialCenter,
        zoom: CONFIG.initialZoom,
        minZoom: CONFIG.minZoom,
        maxZoom: CONFIG.maxZoom,
        pitch: 60, // Increased pitch for more dramatic 3D view
        antialias: true // Enable antialiasing for smoother rendering
    });
    
    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Wait for the map to load
    map.on('load', () => {
        // Add a source for country boundaries
        map.addSource('countries', {
            type: 'vector',
            url: 'mapbox://mapbox.country-boundaries-v1'
        });
        
        // Add a layer for country fills
        map.addLayer({
            id: 'country-fills',
            type: 'fill',
            source: 'countries',
            'source-layer': 'country_boundaries',
            paint: {
                'fill-color': CONFIG.noDataColor,
                'fill-opacity': 0.8
            }
        });
        
        // Add a layer for country borders
        map.addLayer({
            id: 'country-borders',
            type: 'line',
            source: 'countries',
            'source-layer': 'country_boundaries',
            paint: {
                'line-color': '#ffffff',
                'line-width': 0.5
            }
        });
        
        // Add 3D extrusion layer for countries
        map.addLayer({
            id: 'country-extrusions',
            type: 'fill-extrusion',
            source: 'countries',
            'source-layer': 'country_boundaries',
            paint: {
                'fill-extrusion-color': CONFIG.noDataColor,
                'fill-extrusion-opacity': 0.8,
                'fill-extrusion-height': 0,
                'fill-extrusion-base': 0
            }
        });
        
        // Add hover effect
        map.on('mousemove', 'country-fills', showCountryInfo);
        map.on('mouseleave', 'country-fills', hideCountryInfo);
        
        // Update the map with the default year
        updateMap(CONFIG.defaultYear);
    });
}

// Initialize the view toggle button
function initViewToggle() {
    const viewToggleButton = document.getElementById('view-toggle');
    
    viewToggleButton.addEventListener('click', () => {
        is3DMode = !is3DMode;
        
        if (is3DMode) {
            // Switch to 3D view
            map.easeTo({
                pitch: 60,
                duration: 1000
            });
            
            // Show extrusions
            map.setLayoutProperty('country-extrusions', 'visibility', 'visible');
            
            // Update the map to refresh labels
            updateMap(currentYear);
            
            // Update button text
            viewToggleButton.textContent = 'Switch to 2D View';
        } else {
            // Switch to 2D view
            map.easeTo({
                pitch: 0,
                duration: 1000
            });
            
            // Hide extrusions
            map.setLayoutProperty('country-extrusions', 'visibility', 'none');
            
            // Update the map to refresh labels
            updateMap(currentYear);
            
            // Update button text
            viewToggleButton.textContent = 'Switch to 3D View';
        }
    });
}

// Initialize the year slider
function initYearSlider() {
    const yearSlider = document.getElementById('year-slider');
    const selectedYearElement = document.getElementById('selected-year');
    
    // Set the range of available years
    if (GDPData.availableYears && GDPData.availableYears.length > 0) {
        const minYear = GDPData.availableYears[0];
        const maxYear = GDPData.availableYears[GDPData.availableYears.length - 1];
        
        yearSlider.min = minYear;
        yearSlider.max = maxYear;
        yearSlider.value = CONFIG.defaultYear;
        selectedYearElement.textContent = CONFIG.defaultYear;
    }
    
    // Add event listener for slider changes
    yearSlider.addEventListener('input', (e) => {
        const year = parseInt(e.target.value);
        selectedYearElement.textContent = year;
        currentYear = year;
        updateMap(year);
    });
}

// Update the map with GDP data for a specific year
function updateMap(year) {
    if (!map.isStyleLoaded()) {
        // Wait for the map style to load
        map.once('styledata', () => updateMap(year));
        return;
    }
    
    // Get GDP data for the selected year
    const yearData = GDPData.getGDPDataForYear(year);
    
    // Get the range of GDP values
    const gdpRange = GDPData.getGDPRange(year);
    
    // Create a better color scale using D3 - use quantize instead of quantile for more even distribution
    // Filter out null values and sort the data
    const validGdpValues = yearData
        .filter(d => d.gdp !== null)
        .map(d => d.gdp)
        .sort((a, b) => a - b);
    
    // Use a log scale to better handle the wide range of GDP values
    colorScale = d3.scaleQuantize()
        .domain([
            Math.log10(Math.max(1, gdpRange.min)), // Use log10 and ensure minimum is at least 1
            Math.log10(gdpRange.max)
        ])
        .range(CONFIG.colorScale);
    
    // Create a map of country code to GDP
    const countryGDP = {};
    yearData.forEach(country => {
        countryGDP[country.countryCode] = country.gdp;
    });
    
    // Update the country fill colors using the log scale
    map.setPaintProperty('country-fills', 'fill-color', [
        'case',
        ['has', ['get', 'iso_3166_1_alpha_3'], ['literal', countryGDP]],
        [
            'case',
            ['==', ['get', ['get', 'iso_3166_1_alpha_3'], ['literal', countryGDP]], null],
            CONFIG.noDataColor,
            [
                'interpolate',
                ['linear'],
                ['log10', ['max', 1, ['get', ['get', 'iso_3166_1_alpha_3'], ['literal', countryGDP]]]],
                Math.log10(Math.max(1, gdpRange.min)), CONFIG.colorScale[0],
                Math.log10(gdpRange.max), CONFIG.colorScale[CONFIG.colorScale.length - 1]
            ]
        ],
        CONFIG.noDataColor
    ]);
    
    // Update the extrusion heights based on GDP with the scale factor
    map.setPaintProperty('country-extrusions', 'fill-extrusion-color', [
        'case',
        ['has', ['get', 'iso_3166_1_alpha_3'], ['literal', countryGDP]],
        [
            'case',
            ['==', ['get', ['get', 'iso_3166_1_alpha_3'], ['literal', countryGDP]], null],
            CONFIG.noDataColor,
            [
                'interpolate',
                ['linear'],
                ['log10', ['max', 1, ['get', ['get', 'iso_3166_1_alpha_3'], ['literal', countryGDP]]]],
                Math.log10(Math.max(1, gdpRange.min)), CONFIG.colorScale[0],
                Math.log10(gdpRange.max), CONFIG.colorScale[CONFIG.colorScale.length - 1]
            ]
        ],
        CONFIG.noDataColor
    ]);
    
    // Set extrusion height based on GDP with the scale factor and power transformation
    const baseHeight = 10000; // Base height value
    const maxHeight = baseHeight * heightScaleFactor; // Apply scale factor
    
    // Calculate the log values once
    const logMin = Math.log10(Math.max(1, gdpRange.min));
    const logMax = Math.log10(gdpRange.max);
    
    // Use a power function to amplify differences (power > 1 emphasizes larger values)
    // powerFactor is now a global variable controlled by the slider
    
    map.setPaintProperty('country-extrusions', 'fill-extrusion-height', [
        'case',
        ['has', ['get', 'iso_3166_1_alpha_3'], ['literal', countryGDP]],
        [
            'case',
            ['==', ['get', ['get', 'iso_3166_1_alpha_3'], ['literal', countryGDP]], null],
            0,
            [
                '*',
                [
                    '+',
                    minHeightPercent, // Add minimum height percentage
                    [
                        '*',
                        [
                            '^',
                            [
                                'interpolate',
                                ['linear'],
                                ['log10', ['max', 1, ['get', ['get', 'iso_3166_1_alpha_3'], ['literal', countryGDP]]]],
                                logMin, 0, // Normalized minimum value
                                logMax, 1   // Normalized maximum value
                            ],
                            powerFactor // Apply power transformation to amplify differences
                        ],
                        (1 - minHeightPercent) // Scale the power transformation to leave room for minimum height
                    ]
                ],
                maxHeight // Scale to the maximum height
            ]
        ],
        0
    ]);
    
    // Set visibility of extrusions based on current mode
    map.setLayoutProperty('country-extrusions', 'visibility', is3DMode ? 'visible' : 'none');
    
    // Update the legend
    updateLegend(gdpRange, powerFactor);
    
    // Add country labels to the map
    addGDPLabels(yearData);
}

// Add country labels to the map
function addGDPLabels(yearData) {
    // Remove existing labels
    if (map.getLayer('country-labels-3d')) {
        map.removeLayer('country-labels-3d');
    }
    
    if (map.getLayer('country-labels')) {
        map.removeLayer('country-labels');
    }
    
    if (map.getSource('country-label-points')) {
        map.removeSource('country-label-points');
    }
    
    // Create GeoJSON for label points
    const labelFeatures = [];
    
    // Get country features from the map
    const countryFeatures = map.querySourceFeatures('countries', {
        sourceLayer: 'country_boundaries'
    });
    
    // Create a map of country code to feature for quick lookup
    const countryMap = {};
    countryFeatures.forEach(feature => {
        const countryCode = feature.properties.iso_3166_1_alpha_3;
        if (countryCode) {
            countryMap[countryCode] = feature;
        }
    });
    
    // Create a map of country code to GDP for height calculation
    const countryGDP = {};
    yearData.forEach(country => {
        countryGDP[country.countryCode] = country.gdp;
    });
    
    // Get the GDP range for the current year
    const gdpRange = GDPData.getGDPRange(currentYear);
    
    // Create label points for each country with GDP data
    yearData.forEach(country => {
        if (country.gdp !== null && countryMap[country.countryCode]) {
            const feature = countryMap[country.countryCode];
            
            // Get the center of the country polygon
            const bounds = new mapboxgl.LngLatBounds();
            if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates[0].forEach(coord => {
                    bounds.extend(coord);
                });
            } else if (feature.geometry.type === 'MultiPolygon') {
                feature.geometry.coordinates.forEach(polygon => {
                    polygon[0].forEach(coord => {
                        bounds.extend(coord);
                    });
                });
            }
            
            const center = bounds.getCenter();
            
            // Calculate the height for this country based on GDP with power transformation
            let height = 0;
            if (is3DMode && country.gdp !== null) {
                const baseHeight = 10000;
                const maxHeight = baseHeight * heightScaleFactor;
                const logMin = Math.log10(Math.max(1, gdpRange.min));
                const logMax = Math.log10(gdpRange.max);
                const logValue = Math.log10(Math.max(1, country.gdp));
                
                // Calculate normalized value (0 to 1)
                const normalizedValue = (logValue - logMin) / (logMax - logMin);
                
                // Apply power transformation to amplify differences
                const transformedValue = Math.pow(normalizedValue, powerFactor);
                
                // Apply minimum height and scale
                height = maxHeight * (minHeightPercent + transformedValue * (1 - minHeightPercent));
            }
            
            // Add a label feature with the calculated height
            labelFeatures.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [center.lng, center.lat]
                },
                properties: {
                    countryCode: country.countryCode,
                    countryName: country.countryName,
                    gdp: country.gdp,
                    height: height,
                    formattedGDP: GDPData.formatGDP(country.gdp)
                }
            });
        }
    });
    
    // Add the label source if we have features
    if (labelFeatures.length > 0) {
        map.addSource('country-label-points', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: labelFeatures
            }
        });
        
        // We don't add the labels layer by default anymore
        // Instead, we'll show labels on hover
    }
}

// Update the legend with the current color scale
function updateLegend(gdpRange, powerFactor) {
    const legendItems = document.querySelector('.legend-items');
    legendItems.innerHTML = '';
    
    // Create legend items for the color scale
    if (colorScale) {
        const colors = CONFIG.colorScale;
        const domain = colorScale.domain();
        const step = (domain[1] - domain[0]) / colors.length;
        
        // Add title for color scale
        const colorTitle = document.createElement('h4');
        colorTitle.textContent = 'GDP Color Scale (Log)';
        legendItems.appendChild(colorTitle);
        
        // Add legend items
        for (let i = 0; i < colors.length; i++) {
            const item = document.createElement('div');
            item.className = 'legend-item';
            
            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = colors[i];
            
            const label = document.createElement('span');
            
            // Calculate the GDP value for this color step using the log scale
            const logValue = domain[0] + (i * step);
            const gdpValue = Math.pow(10, logValue);
            
            if (i === 0) {
                label.textContent = `< ${GDPData.formatGDP(gdpValue)}`;
            } else if (i === colors.length - 1) {
                label.textContent = `> ${GDPData.formatGDP(gdpValue)}`;
            } else {
                label.textContent = GDPData.formatGDP(gdpValue);
            }
            
            item.appendChild(colorBox);
            item.appendChild(label);
            legendItems.appendChild(item);
        }
        
        // Add legend for extrusion height
        const heightLegend = document.createElement('div');
        heightLegend.className = 'legend-section';
        
        // Calculate height values based on the current scale factor
        const minHeight = Math.pow(10, domain[0]);
        const maxHeight = Math.pow(10, domain[1]);
        
        // Create sample values for the legend
        const logMin = Math.log10(Math.max(1, gdpRange.min));
        const logMax = Math.log10(gdpRange.max);
        const logRange = logMax - logMin;
        
        // Calculate heights for different GDP levels with power transformation
        const lowGDP = Math.pow(10, logMin);
        const mediumGDP = Math.pow(10, logMin + (logRange * 0.5));
        const highGDP = Math.pow(10, logMax);
        
        // Calculate normalized heights with power transformation and minimum height
        const lowHeight = minHeightPercent * 100; // Minimum height %
        const mediumHeight = (minHeightPercent + Math.pow(0.5, powerFactor) * (1 - minHeightPercent)) * 100;
        const highHeight = 100; // 100%
        
        heightLegend.innerHTML = `
            <h4>Height Scale (${heightScaleFactor}x)</h4>
            <div class="legend-item">
                <div class="legend-height-bar" style="height: ${Math.max(3, lowHeight * 0.3)}px;"></div>
                <span>${GDPData.formatGDP(lowGDP)} (${lowHeight.toFixed(1)}%)</span>
            </div>
            <div class="legend-item">
                <div class="legend-height-bar" style="height: ${Math.max(5, mediumHeight * 0.3)}px;"></div>
                <span>${GDPData.formatGDP(mediumGDP)} (${mediumHeight.toFixed(1)}%)</span>
            </div>
            <div class="legend-item">
                <div class="legend-height-bar" style="height: 30px;"></div>
                <span>${GDPData.formatGDP(highGDP)} (100%)</span>
            </div>
            <div class="legend-note">
                <small>Amplification: ${powerFactor.toFixed(1)}x</small>
            </div>
            <div class="legend-note">
                <small>Min Height: ${(minHeightPercent * 100).toFixed(1)}%</small>
            </div>
        `;
        legendItems.appendChild(heightLegend);
    }
}

// Show country information on hover
function showCountryInfo(e) {
    if (e.features.length === 0) return;
    
    // Get the country code
    const countryCode = e.features[0].properties.iso_3166_1_alpha_3;
    
    // Get GDP data for the current year
    const yearData = GDPData.getGDPDataForYear(currentYear);
    const countryData = yearData.find(c => c.countryCode === countryCode);
    
    if (!countryData) return;
    
    // Get country metadata
    const metadata = GDPData.getCountryInfo(countryCode);
    
    // Format the GDP value
    const formattedGDP = GDPData.formatGDP(countryData.gdp);
    
    // Update the country info panel
    const countryInfoElement = document.getElementById('country-info');
    countryInfoElement.innerHTML = `
        <p><strong>Country:</strong> ${countryData.countryName}</p>
        <p><strong>GDP (${currentYear}):</strong> ${formattedGDP}</p>
        ${metadata ? `<p><strong>Region:</strong> ${metadata.region || 'N/A'}</p>` : ''}
        ${metadata ? `<p><strong>Income Group:</strong> ${metadata.incomeGroup || 'N/A'}</p>` : ''}
    `;
    
    // Show a popup with the country name
    const coordinates = e.lngLat;
    
    // Create a popup
    if (!map.getSource('hover-label-source')) {
        map.addSource('hover-label-source', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [coordinates.lng, coordinates.lat]
                },
                properties: {
                    countryName: countryData.countryName
                }
            }
        });
        
        // Add a layer for the hover label
        map.addLayer({
            id: 'hover-label',
            type: 'symbol',
            source: 'hover-label-source',
            layout: {
                'text-field': ['get', 'countryName'],
                'text-size': 10,
                'text-anchor': 'center',
                'text-offset': [0, 0]
            },
            paint: {
                'text-color': '#000000',
                'text-halo-color': '#ffffff',
                'text-halo-width': 1.5,
                'text-opacity': 0.9
            }
        });
    } else {
        // Update the existing source
        map.getSource('hover-label-source').setData({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [coordinates.lng, coordinates.lat]
            },
            properties: {
                countryName: countryData.countryName
            }
        });
    }
    
    // Change cursor style
    map.getCanvas().style.cursor = 'pointer';
}

// Hide country information when not hovering
function hideCountryInfo() {
    // Reset the country info panel
    const countryInfoElement = document.getElementById('country-info');
    countryInfoElement.innerHTML = '<p>Hover over a country to see details</p>';
    
    // Remove the hover label if it exists
    if (map.getLayer('hover-label')) {
        map.removeLayer('hover-label');
    }
    
    if (map.getSource('hover-label-source')) {
        map.removeSource('hover-label-source');
    }
    
    // Reset cursor style
    map.getCanvas().style.cursor = '';
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 