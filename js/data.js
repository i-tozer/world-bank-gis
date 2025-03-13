// Data processing functions
let gdpData = null;
let countryMetadata = null;
let availableYears = [];

// Function to format GDP values
function formatGDP(value) {
    if (!value || isNaN(value)) return 'No data';
    
    // Format as trillion, billion, or million based on size
    if (value >= 1e12) {
        return `$${(value / 1e12).toFixed(2)} trillion`;
    } else if (value >= 1e9) {
        return `$${(value / 1e9).toFixed(2)} billion`;
    } else if (value >= 1e6) {
        return `$${(value / 1e6).toFixed(2)} million`;
    } else {
        return `$${value.toLocaleString()}`;
    }
}

// Function to load GDP data
async function loadGDPData() {
    try {
        // Load GDP data
        const gdpResponse = await fetch('../data/API_NY.GDP.MKTP.CD_DS2_en_csv_v2_76261/API_NY.GDP.MKTP.CD_DS2_en_csv_v2_76261.csv');
        const gdpText = await gdpResponse.text();
        
        // Load country metadata
        const metadataResponse = await fetch('../data/API_NY.GDP.MKTP.CD_DS2_en_csv_v2_76261/Metadata_Country_API_NY.GDP.MKTP.CD_DS2_en_csv_v2_76261.csv');
        const metadataText = await metadataResponse.text();
        
        // Process GDP data
        gdpData = processGDPData(gdpText);
        
        // Process country metadata
        countryMetadata = processCountryMetadata(metadataText);
        
        // Extract available years
        if (gdpData.length > 0) {
            const firstCountry = gdpData[0];
            availableYears = Object.keys(firstCountry)
                .filter(key => !isNaN(parseInt(key)))
                .map(year => parseInt(year))
                .sort((a, b) => a - b);
        }
        
        return {
            gdpData,
            countryMetadata,
            availableYears
        };
    } catch (error) {
        console.error('Error loading data:', error);
        return null;
    }
}

// Function to process GDP data from CSV
function processGDPData(csvText) {
    // Split the CSV into lines
    const lines = csvText.split('\n');
    
    // Find the header line (the one that starts with "Country Name")
    let headerLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('"Country Name"')) {
            headerLineIndex = i;
            break;
        }
    }
    
    if (headerLineIndex === -1) {
        console.error('Could not find header line in GDP data');
        return [];
    }
    
    // Parse the header line to get column indices
    const headerLine = parseCSVLine(lines[headerLineIndex]);
    const countryNameIndex = 0;
    const countryCodeIndex = 1;
    
    // Create a map of year to column index
    const yearToColumnIndex = {};
    for (let i = 4; i < headerLine.length; i++) {
        const year = headerLine[i];
        if (!isNaN(parseInt(year))) {
            yearToColumnIndex[year] = i;
        }
    }
    
    // Process data lines
    const data = [];
    for (let i = headerLineIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parseCSVLine(line);
        if (values.length <= countryCodeIndex) continue;
        
        const countryName = values[countryNameIndex];
        const countryCode = values[countryCodeIndex];
        
        // Skip aggregated regions
        if (countryCode.length !== 3) continue;
        
        const countryData = {
            countryName,
            countryCode
        };
        
        // Add GDP values for each year
        for (const [year, columnIndex] of Object.entries(yearToColumnIndex)) {
            const gdpValue = values[columnIndex];
            if (gdpValue) {
                countryData[year] = parseFloat(gdpValue);
            }
        }
        
        data.push(countryData);
    }
    
    return data;
}

// Function to process country metadata from CSV
function processCountryMetadata(csvText) {
    // Split the CSV into lines
    const lines = csvText.split('\n');
    
    // Skip the header line
    const headerLine = parseCSVLine(lines[0]);
    const countryCodeIndex = 0;
    const regionIndex = 1;
    const incomeGroupIndex = 2;
    const tableNameIndex = 4;
    
    // Process data lines
    const metadata = {};
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parseCSVLine(line);
        if (values.length <= countryCodeIndex) continue;
        
        const countryCode = values[countryCodeIndex];
        const region = values[regionIndex];
        const incomeGroup = values[incomeGroupIndex];
        const tableName = values[tableNameIndex];
        
        metadata[countryCode] = {
            region,
            incomeGroup,
            tableName
        };
    }
    
    return metadata;
}

// Helper function to parse a CSV line considering quoted values
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    // Add the last value
    result.push(current);
    
    return result;
}

// Function to get GDP data for a specific year
function getGDPDataForYear(year) {
    if (!gdpData) return [];
    
    return gdpData.map(country => {
        return {
            countryCode: country.countryCode,
            countryName: country.countryName,
            gdp: country[year] || null
        };
    });
}

// Function to get min and max GDP values for a specific year
function getGDPRange(year) {
    if (!gdpData) return { min: 0, max: 0 };
    
    const values = gdpData
        .map(country => country[year])
        .filter(value => value !== undefined && value !== null && !isNaN(value));
    
    if (values.length === 0) return { min: 0, max: 0 };
    
    return {
        min: Math.min(...values),
        max: Math.max(...values)
    };
}

// Function to get country information by code
function getCountryInfo(countryCode) {
    if (!countryMetadata || !countryCode) return null;
    
    return countryMetadata[countryCode];
}

// Export functions and data
window.GDPData = {
    loadGDPData,
    getGDPDataForYear,
    getGDPRange,
    getCountryInfo,
    formatGDP,
    availableYears
}; 