/***************************************************
 * NEW GLOBALS
 ***************************************************/
window.allColleges = window.allColleges || [];  // Global, shared variable for all colleges
let markerClusterGlobal;      // reference to the cluster group
let allMarkers = [];          // store all markers so we can filter them

// Optional: region colors for the legend squares
const regionColors = {
  "Northeast": "#FF9999",
  "Midwest":   "#FFD700",
  "South":     "#FFA500",
  "West":      "#87CEFA"
};

// Global mapping for state abbreviations
const stateAbbreviations = {
  "Alabama": "AL",
  "Alaska": "AK",
  "Arizona": "AZ",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "District of Columbia": "DC",
  "Florida": "FL",
  "Georgia": "GA",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY",
  "Virgin Islands": "VI"
};

// ---------- PREDEFINED REGION MAPPING ----------
// 1) Base mapping: only with full state names (for the dropdown display)
const baseRegionMapping = {
  "Northeast": [
    "Connecticut", "Delaware", "District of Columbia", "Maine", "Maryland", 
    "Massachusetts", "New Hampshire", "New Jersey", "New York", "Pennsylvania", 
    "Rhode Island", "Vermont", "Virgin Islands", "Virginia", "West Virginia"
  ],
  "Midwest": [
    "Illinois", "Indiana", "Iowa", "Kansas", "Michigan", 
    "Minnesota", "Missouri", "Nebraska", "North Dakota", "Ohio", 
    "South Dakota", "Wisconsin"
  ],
  "South": [
    "Alabama", "Arkansas", "Florida", "Georgia", "Kentucky", 
    "Louisiana", "Mississippi", "North Carolina", "Oklahoma", "South Carolina", 
    "Tennessee", "Texas"
  ],
  "West": [
    "Arizona", "Colorado", "Idaho", "Montana", "Nevada", 
    "New Mexico", "Utah", "Washington", "Oregon", "California", 
    "Alaska", "Hawaii"
  ]
};

// 2) regionMapping for filtering: includes full names + abbreviations
const regionMapping = {};
for (const region in baseRegionMapping) {
  regionMapping[region] = baseRegionMapping[region].reduce((arr, state) => {
    arr.push(state);
    if (stateAbbreviations[state]) {
      arr.push(stateAbbreviations[state]);
    }
    return arr;
  }, []);
}

/***************************************************
 * Utility Functions
 ***************************************************/
function normalizeState(raw) {
  if (!raw) return null;
  const trimmed = raw.trim(), upper = trimmed.toUpperCase();
  for (const [full, abbr] of Object.entries(stateAbbreviations)) {
    if (full.toUpperCase() === trimmed.toUpperCase() || abbr === upper) return full;
  }
  return null;
}

function sanitizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

// Checks if the college's state matches the target state (full name or abbreviation)
function locationMatchesState(collegeState, targetState) {
  if (!collegeState) return false;
  const lowerCollegeState = collegeState.toLowerCase();
  const lowerTargetState = targetState.toLowerCase();
  if (lowerCollegeState === lowerTargetState) return true;
  if (stateAbbreviations[targetState] && lowerCollegeState === stateAbbreviations[targetState].toLowerCase()) return true;
  return false;
}

/***************************************************
 * MAP INITIALIZATION (Leaflet, Clustering, etc.)
 ***************************************************/
function initMap() {
  // Create map centered on USA
  const map = L.map('map').setView([39.8283, -98.5795], 4);
  
  // Restrict the map view to the USA boundaries (approximate)
  const southWest = L.latLng(24.396308, -124.848974);
  const northEast = L.latLng(49.384358, -66.885444);
  const bounds = L.latLngBounds(southWest, northEast);
  map.setMaxBounds(bounds);
  map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
  }).addTo(map);

  if (typeof statesData !== 'undefined') {
    statesLayer = L.geoJson(statesData, {
      style: styleStates
    }).addTo(map);
  }

  const markerCluster = L.markerClusterGroup({
    iconCreateFunction: function(cluster) {
      const count = cluster.getChildCount();
      return L.divIcon({
        html: `<div class="cluster-count">${count}</div>`,
        className: 'custom-cluster-icon',
        iconSize: L.point(40, 40)
      });
    }
  });
  markerClusterGlobal = markerCluster;

  fetch("http://localhost:3000/api/colleges")
    .then(response => response.json())
    .then(data => {
      window.allColleges = data;
      data.forEach(college => {
        if (college.lat && college.lng) {
          let sanitizedCollegeName = college.colleges.toLowerCase()
            .replace(/[^a-z0-9_\s]/g, "")
            .trim()
            .replace(/\s+/g, "_");

          const exceptions = {
            "minnesota_state_university_mankato": "Minnesota_State_Mankato_University",
            "mount_st_marys_university": "Mount_St_Marys_University"
          };
          if (exceptions[sanitizedCollegeName]) {
            sanitizedCollegeName = exceptions[sanitizedCollegeName];
          }
          const logoPath = `./logos/${sanitizedCollegeName}.png`;
          fetch(logoPath, { method: 'HEAD' })
            .then(logoResponse => {
              const finalLogo = logoResponse.ok ? logoPath : './logos/default.png';
              const collegeIcon = L.icon({
                iconUrl: finalLogo,
                iconSize: [50, 50],
                iconAnchor: [25, 25],
                popupAnchor: [0, -25]
              });
              const marker = L.marker(
                [parseFloat(college.lat), parseFloat(college.lng)],
                { icon: collegeIcon }
              ).bindPopup(`<strong>${college.colleges}</strong><br>${college.state}`);
              marker.on('click', function() {
                displayCollegeDetails(college);
              });
              markerCluster.addLayer(marker);
              allMarkers.push({ marker, college });
            })
            .catch(err => {
              console.error(`Error checking logo for ${college.colleges}:`, err);
              const fallbackIcon = L.icon({
                iconUrl: './logos/default.png',
                iconSize: [50, 50],
                iconAnchor: [25, 25],
                popupAnchor: [0, -25]
              });
              const marker = L.marker(
                [parseFloat(college.lat), parseFloat(college.lng)],
                { icon: fallbackIcon }
              ).bindPopup(`<strong>${college.colleges}</strong><br>${college.state}`);
              marker.on('click', function() {
                displayCollegeDetails(college);
              });
              markerCluster.addLayer(marker);
              allMarkers.push({ marker, college });
            });
        }
      });
      map.addLayer(markerCluster);
    })
    .catch(error => console.error("❌ Error fetching college map data:", error));
}

/***************************************************
 * SIDEBAR FUNCTIONS
 ***************************************************/
function displayCollegeDetails(college) {
  const container = document.getElementById('collegeDetails');
  container.innerHTML += createCollegeCard(college);
}

// Sets up region and state search controls.
// When a region is selected, all colleges in that region (across all states) are shown.
// When a state is selected, the list is filtered to that state only.
function setupRegionSearchSidebar() {
  const regionSearchContainer = document.getElementById('regionSearchContainer');
  if (!regionSearchContainer) return;
  regionSearchContainer.innerHTML = "";
  const purpleContainer = document.createElement('div');
  purpleContainer.id = 'searchcontainer';

  // Region Dropdown
  const regionLabel = document.createElement('label');
  regionLabel.textContent = "Search by Region:";
  regionLabel.style.display = 'block';
  regionLabel.style.marginBottom = '5px';
  purpleContainer.appendChild(regionLabel);

  const regionSelect = document.createElement('select');
  regionSelect.id = 'regionSelect';
  const defaultRegionOption = document.createElement('option');
  defaultRegionOption.value = "";
  defaultRegionOption.textContent = "Select Region";
  regionSelect.appendChild(defaultRegionOption);
  Object.keys(baseRegionMapping).forEach(region => {
    const color = regionColors[region] || "#ccc";
    const option = document.createElement('option');
    option.value = region;
    option.innerHTML = `<span style="display:inline-block;width:12px;height:12px;background-color:${color};margin-right:5px;"></span>${region}`;
    regionSelect.appendChild(option);
  });
  purpleContainer.appendChild(regionSelect);

  // State Dropdown (populated dynamically based on selected region)
  const stateLabel = document.createElement('label');
  stateLabel.textContent = "Search by State:";
  stateLabel.style.display = 'block';
  stateLabel.style.marginTop = '10px';
  purpleContainer.appendChild(stateLabel);

  const stateSelect = document.createElement('select');
  stateSelect.id = 'stateSelect';
  const defaultStateOption = document.createElement('option');
  defaultStateOption.value = "";
  defaultStateOption.textContent = "Select State";
  stateSelect.appendChild(defaultStateOption);
  purpleContainer.appendChild(stateSelect);

  regionSearchContainer.appendChild(purpleContainer);

  regionSelect.addEventListener('change', function() {
    const selectedRegion = regionSelect.value;
    stateSelect.innerHTML = "";
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Select State";
    stateSelect.appendChild(defaultOption);

    if (selectedRegion) {
      // Populate state dropdown with states (full names) from the selected region
      const statesForRegion = baseRegionMapping[selectedRegion];
      statesForRegion.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
      });
      // Show all colleges from the region
      displayCollegesByRegion(selectedRegion);
      highlightOnlySelectedRegion(selectedRegion);
      filterMarkersByRegion(selectedRegion);
    } else {
      const collegeDetails = document.getElementById('collegeDetails');
      if (collegeDetails) collegeDetails.innerHTML = "";
      highlightAllRegions();
      markerClusterGlobal.clearLayers();
      allMarkers.forEach(obj => markerClusterGlobal.addLayer(obj.marker));
    }
  });

  stateSelect.addEventListener('change', function() {
    const selectedState = stateSelect.value;
    if (selectedState) {
      displayCollegesByState(selectedState);
      filterMarkersByState(selectedState);
    }
  });
}

/***************************************************
 * DISPLAY COLLEGES BY REGION / STATE
 ***************************************************/
function displayCollegesByRegion(region) {
  const collegeDetails = document.getElementById('collegeDetails');
  if (!collegeDetails) return;
  const statesForRegion = regionMapping[region];
  if (!statesForRegion) {
    collegeDetails.innerHTML = `<p>No region mapping found for ${region}</p>`;
    return;
  }
  const filtered = window.allColleges.filter(college => {
    if (!college.state) return false;
    return statesForRegion.some(st => locationMatchesState(college.state, st));
  });
  if (filtered.length === 0) {
    collegeDetails.innerHTML = `<p>No colleges found in ${region}</p>`;
    return;
  }
  let html = "";
  filtered.forEach(college => {
    html += createCollegeCard(college);
  });
  collegeDetails.innerHTML = html;
}

function displayCollegesByState(state) {
  const collegeDetails = document.getElementById('collegeDetails');
  if (!collegeDetails) return;
  const filtered = window.allColleges.filter(college => {
    return college.state && locationMatchesState(college.state, state);
  });
  if (filtered.length === 0) {
    collegeDetails.innerHTML = `<p>No colleges found in ${state}</p>`;
    return;
  }
  let html = "";
  filtered.forEach(college => {
    html += createCollegeCard(college);
  });
  collegeDetails.innerHTML = html;
}

/***************************************************
 * FILTER THE MAP PINS
 ***************************************************/
function filterMarkersByRegion(region) {
  markerClusterGlobal.clearLayers();
  const statesForRegion = regionMapping[region];
  const regionMarkers = allMarkers.filter(({ college }) => {
    if (!college.state) return false;
    return statesForRegion.some(st => locationMatchesState(college.state, st));
  });
  regionMarkers.forEach(obj => markerClusterGlobal.addLayer(obj.marker));
}

function filterMarkersByState(state) {
  markerClusterGlobal.clearLayers();
  const filteredMarkers = allMarkers.filter(({ college }) => {
    return college.state && locationMatchesState(college.state, state);
  });
  filteredMarkers.forEach(obj => markerClusterGlobal.addLayer(obj.marker));
}

/***************************************************
 * STATE COLORING (if statesData is loaded)
 ***************************************************/
function styleStates(feature) {
  const stateName = feature.properties.name;
  const region = findRegionForState(stateName);
  if (region) {
    return {
      fillColor: regionColors[region],
      fillOpacity: 0.6,
      color: "#555",
      weight: 1
    };
  } else {
    return {
      fillColor: "#ccc",
      fillOpacity: 0.4,
      color: "#999",
      weight: 1
    };
  }
}

function findRegionForState(stateName) {
  for (const region in baseRegionMapping) {
    if (baseRegionMapping[region].some(st => st.toLowerCase() === stateName.toLowerCase())) {
      return region;
    }
  }
  return null;
}

function highlightOnlySelectedRegion(region) {
  if (!window.statesLayer) return;
  statesLayer.setStyle(function(feature) {
    const name = feature.properties.name;
    const belongsToRegion = findRegionForState(name) === region;
    if (belongsToRegion) {
      return {
        fillColor: regionColors[region],
        fillOpacity: 0.6,
        color: "#555",
        weight: 1
      };
    } else {
      return {
        fillColor: "#ccc",
        fillOpacity: 0.2,
        color: "#999",
        weight: 1
      };
    }
  });
}

function highlightAllRegions() {
  if (!window.statesLayer) return;
  statesLayer.setStyle(function(feature) {
    const region = findRegionForState(feature.properties.name);
    if (region) {
      return {
        fillColor: regionColors[region],
        fillOpacity: 0.6,
        color: "#555",
        weight: 1
      };
    } else {
      return {
        fillColor: "#ccc",
        fillOpacity: 0.4,
        color: "#999",
        weight: 1
      };
    }
  });
}
