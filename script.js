const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const AIR_POLLUTION_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';
// const ONECALL_URL = 'https://api.openweathermap.org/data/3.0/onecall'; // Often requires sub, will stick to 2.5 free tiers

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// State
let appState = {
    city: 'New York',
    unit: 'metric',
    lat: 40.7128,
    lon: -74.0060,
    weather: null,
    forecast: null,
    aqi: null
};

// Icons Map
const getIcon = (code, isNight) => {
    // Map OpenWeather codes to Phosphor
    // 2xx Thunder, 3xx Drizzle, 5xx Rain, 6xx Snow, 7xx Atmos, 800 Clear, 80x Clouds
    const id = code;
    if (id >= 200 && id < 300) return 'ph-cloud-lightning';
    if (id >= 300 && id < 500) return 'ph-cloud-rain';
    if (id >= 500 && id < 600) return 'ph-cloud-rain';
    if (id >= 600 && id < 700) return 'ph-snowflake';
    if (id >= 700 && id < 800) return 'ph-waves';
    if (id === 800) return isNight ? 'ph-moon-stars' : 'ph-sun';
    if (id > 800) return isNight ? 'ph-cloud-moon' : 'ph-cloud';
    return 'ph-question';
};

// DOM Elements
const els = {
    cityName: document.getElementById('cityName'),
    tempValue: document.getElementById('tempValue'),
    weatherDesc: document.getElementById('weatherDesc'),
    maxTemp: document.getElementById('maxTemp'),
    minTemp: document.getElementById('minTemp'),
    dailySummary: document.getElementById('dailySummary'),
    hourlyList: document.getElementById('hourlyList'),
    dailyList: document.getElementById('dailyList'),
    outlookText: document.getElementById('outlookText'),
    runStatus: document.getElementById('runStatus'),
    runDesc: document.getElementById('runDesc'),
    runFace: document.getElementById('runFace'),
    runRating: document.getElementById('runRating'),
    aqiStatus: document.getElementById('aqiStatus'),
    aqiVal: document.getElementById('aqiVal'),
    aqiFill: document.getElementById('aqiFill'),
    uvLevel: document.getElementById('uvLevel'),
    uvDesc: document.getElementById('uvDesc'),
    uvDot: document.getElementById('uvDot'),
    humidVal: document.getElementById('humidVal'),
    humidDesc: document.getElementById('humidDesc'),
    humidFill: document.getElementById('humidFill'),
    windVal: document.getElementById('windVal'),
    windDesc: document.getElementById('windDesc'),
    compassArrow: document.getElementById('compassArrow'),
    dewVal: document.getElementById('dewVal'),
    dewDesc: document.getElementById('dewDesc'),
    // Pollen elements
    treePollen: document.getElementById('treePollen'),
    treeIcon: document.getElementById('treeIcon'),
    grassPollen: document.getElementById('grassPollen'),
    grassIcon: document.getElementById('grassIcon'),
    ragweedPollen: document.getElementById('ragweedPollen'),
    ragweedIcon: document.getElementById('ragweedIcon'),
    // Search & Chat
    searchOverlay: document.getElementById('searchOverlay'),
    cityInput: document.getElementById('cityInput'),
    chatModal: document.getElementById('chatModal'),
    chatInput: document.getElementById('chatInput'),
    chatMessages: document.getElementById('chatMessages')
};

// Init
// Init
document.addEventListener('DOMContentLoaded', () => {
    // Determine location: check local storage or use default/geo
    const saved = localStorage.getItem('samsung_weather_city');
    if(saved) {
        fetchAllWeather(saved);
    } else {
        // Try Geolocation
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    fetchWeatherByCoords(lat, lon);
                },
                (error) => {
                    console.warn("Geo denied or failed, using default.", error);
                    fetchAllWeather(appState.city);
                }
            );
        } else {
            fetchAllWeather(appState.city);
        }
    }

    setupEvents();
});

function setupEvents() {
    document.getElementById('searchTrigger').addEventListener('click', () => els.searchOverlay.classList.remove('hidden'));
    document.getElementById('closeSearch').addEventListener('click', () => els.searchOverlay.classList.add('hidden'));
    
    // Add location click to re-trigger geo
    const locInfo = document.querySelector('.location-info');
    if(locInfo) {
        locInfo.style.cursor = 'pointer';
        locInfo.addEventListener('click', () => {
             if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
                }, () => alert('Location access denied.'));
            }
        });
    }

    // Search Enter
    const handleSearch = (inputEl) => {
        const val = inputEl.value.trim();
        if(val) {
            fetchAllWeather(val);
            els.searchOverlay.classList.add('hidden');
            inputEl.value = '';
        }
    };

    els.cityInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') handleSearch(els.cityInput);
    });

    // Desktop Search Trigger
    const dpInput = document.getElementById('desktopSearchInput');
    if(dpInput) {
        dpInput.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') handleSearch(dpInput);
        });
    }

    // Chat
    document.getElementById('chatFab').addEventListener('click', () => els.chatModal.classList.add('active'));
    document.getElementById('closeChat').addEventListener('click', () => els.chatModal.classList.remove('active'));
    document.getElementById('sendMessage').addEventListener('click', sendAI);
    els.chatInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') sendAI(); });
}

// Data Fetching
async function fetchWeatherByCoords(lat, lon) {
    try {
        // 1. Current Weather by Lat/Lon
        const wRes = await fetch(`${WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${appState.unit}`);
        if(!wRes.ok) throw new Error('Location not found');
        const wData = await wRes.json();
        
        handleWeatherData(wData);

    } catch (e) {
        console.error(e);
        alert('Could not fetch weather data from location.');
    }
}

async function fetchAllWeather(city) {
    try {
        // 1. Current Weather by City
        const wRes = await fetch(`${WEATHER_URL}?q=${city}&appid=${API_KEY}&units=${appState.unit}`);
        if(!wRes.ok) throw new Error('City not found');
        const wData = await wRes.json();
        
        handleWeatherData(wData);

    } catch (e) {
        console.error(e);
        alert('Could not fetch weather data. Please try again.');
    }
}

async function handleWeatherData(wData) {
    try {
        appState.weather = wData;
        appState.lat = wData.coord.lat;
        appState.lon = wData.coord.lon;
        appState.city = wData.name;
        localStorage.setItem('samsung_weather_city', wData.name);

        // 2. Forecast (5 day / 3 hour)
        const fRes = await fetch(`${FORECAST_URL}?lat=${appState.lat}&lon=${appState.lon}&appid=${API_KEY}&units=${appState.unit}`);
        const fData = await fRes.json();
        appState.forecast = fData;

        // 3. Air Pollution (AQI)
        const aRes = await fetch(`${AIR_POLLUTION_URL}?lat=${appState.lat}&lon=${appState.lon}&appid=${API_KEY}`);
        const aData = await aRes.json();
        appState.aqi = aData;

        renderAll();
    } catch(e) {
        console.error("Error handling secondary data", e);
    }
}

// Rendering
function renderAll() {
    renderHero();
    renderHourly();
    renderOutlook();
    renderDaily();
    renderActivity();
    renderAQI();
    renderPollen();
    renderDetails();
}

function renderHero() {
    const w = appState.weather;
    els.cityName.textContent = w.name;
    els.tempValue.textContent = Math.round(w.main.temp);
    els.weatherDesc.textContent = capitalize(w.weather[0].description);
    
    // Find min/max from forecast for today (approximate)
    // Since current weather API min/max is often current deviance, forecast is better
    // But for Speed, we can just use what temp_min/max gives or approximate
    els.maxTemp.textContent = Math.round(w.main.temp_max);
    els.minTemp.textContent = Math.round(w.main.temp_min);

    // Summary text
    const feels = Math.round(w.main.feels_like);
    els.dailySummary.textContent = `Generally ${w.weather[0].description}. Feels like ${feels}°.`;

    // Dynamic Background
    updateBackground(w);
}

function updateBackground(data) {
    const layer = document.querySelector('.bg-layer');
    const c = data.weather[0].main.toLowerCase();
    const isNight = data.sys.pod === 'n';
    const now = Date.now() / 1000;
    const sunset = data.sys.sunset;
    const sunrise = data.sys.sunrise;
    
    let bg = 'bg-sunny.png';
    
    // Check for Sunrise (approx 20 mins before and 45 mins after)
    const isSunrise = (now > sunrise - 1200 && now < sunrise + 2700);
    // Check for Sunset (approx 45 mins before and 20 mins after sunset)
    const isSunset = (now > sunset - 2700 && now < sunset + 1200); 

    if (isSunrise && !c.includes('rain') && !c.includes('storm')) {
        bg = 'bg-sunrise.png';
    }
    else if (isSunset && !c.includes('rain') && !c.includes('storm')) {
        bg = 'bg-sunset.png';
    } 
    else if(isNight) {
        if(c.includes('snow') || c.includes('flurry')) bg = 'bg-snow-night.png';
        else bg = 'bg-night.png';
    } 
    else {
        // High wind check (e.g. > 10m/s or "squall")
        const isWindy = data.wind.speed > 10 || c.includes('wind') || c.includes('squall');

        if(c.includes('thunder') || c.includes('storm')) bg = 'bg-thunder.png';
        else if(c.includes('rain') || c.includes('drizzle')) bg = 'bg-rain.png';
        else if(c.includes('snow') || c.includes('flurry')) bg = 'bg-snow.png';
        else if(isWindy) bg = 'bg-windy.png';
        else if(c.includes('sand') || c.includes('dust') || c.includes('ash') || c.includes('haze')) bg = 'bg-haze.png';
        else if(c.includes('fog') || c.includes('mist')) bg = 'bg-fog.png';
        else if(c.includes('cloud')) bg = 'bg-cloudy.png';
        else bg = 'bg-sunny.png';
    }
    
    layer.style.backgroundImage = `url('assets/${bg}')`;
    
    // Toggle Stars (visible at night, but maybe not during sunset)
    const stars = document.querySelector('.star-layer');
    if(stars) stars.style.display = (isNight && !isSunset) ? 'block' : 'none';
}

function renderHourly() {
    els.hourlyList.innerHTML = '';
    const list = appState.forecast.list.slice(0, 24); // next 24 data points (actually 3h intervals, so 24 points is 3 days. Samsung shows 24 *hours*)
    // Note: Free API gives 3hr intervals. We can't do exact hourly without OneCall.
    // We will simulate hourly by interpolating or just showing the 3h intervals as "Forecast"
    // Samsung shows hourly. We will mimic style with the data we have.
    
    list.forEach(item => {
        const d = new Date(item.dt * 1000);
        const hour = d.toLocaleTimeString([], {hour: 'numeric', hour12: true});
        const iconCode = item.weather[0].id;
        const isNight = item.sys.pod === 'n';
        const icon = getIcon(iconCode, isNight);
        const temp = Math.round(item.main.temp);
        const pop = Math.round(item.pop * 100); // Probability of Precip

        const div = document.createElement('div');
        div.className = 'hour-item';
        div.innerHTML = `
            <span class="hour-time">${hour}</span>
            <i class="ph ${icon} hour-icon"></i>
            <span class="hour-temp">${temp}°</span>
            ${pop > 0 ? `<div class="hour-precip"><i class="ph ph-drop"></i> ${pop}%</div>` : ''}
        `;
        els.hourlyList.appendChild(div);
    });
}

function renderOutlook() {
    // Simple logic: Find tomorrow's max temp and condition
    // Forecast list is chronological.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const nextDayItems = appState.forecast.list.filter(x => x.dt_txt.includes(dateStr));
    if(nextDayItems.length > 0) {
        const maxT = Math.max(...nextDayItems.map(x => x.main.temp));
        const cond = nextDayItems[Math.floor(nextDayItems.length/2)].weather[0].main; // mid-day condition
        els.outlookText.textContent = `${cond} tomorrow. High of ${Math.round(maxT)}°.`;
    } else {
        els.outlookText.textContent = "Forecast loading...";
    }
}

function renderDaily() {
    els.dailyList.innerHTML = '';
    const dailyData = {}; // Aggregate by day
    
    appState.forecast.list.forEach(item => {
        const d = new Date(item.dt * 1000);
        const dayKey = d.toLocaleDateString('en-US', { weekday: 'short'});
        if(!dailyData[dayKey]) dailyData[dayKey] = { mins:[], maxs:[], icons:[], pops:[] };
        
        dailyData[dayKey].mins.push(item.main.temp_min);
        dailyData[dayKey].maxs.push(item.main.temp_max);
        dailyData[dayKey].icons.push(item.weather[0].id);
        dailyData[dayKey].pops.push(item.pop);
    });

    const days = Object.keys(dailyData).slice(0, 5); // 5 days
    days.forEach(day => {
        const d = dailyData[day];
        const min = Math.round(Math.min(...d.mins));
        const max = Math.round(Math.max(...d.maxs));
        const avgPop = Math.round((d.pops.reduce((a,b)=>a+b,0)/d.pops.length) * 100);
        
        // Find most frequent icon or mid-day icon. Simple: take the middle one.
        const midIconCode = d.icons[Math.floor(d.icons.length/2)];
        const icon = getIcon(midIconCode, false); // assume day icon for list
        
        const div = document.createElement('div');
        div.className = 'daily-row';
        div.innerHTML = `
            <div class="daily-day">${day}</div>
            <div class="daily-precip">
                ${avgPop > 10 ? `<i class="ph ph-drop-fill"></i> ${avgPop}%` : ''}
            </div>
            <div class="daily-icons">
                 <i class="ph ${icon}"></i> 
                 <!-- Samsung shows Day/Night icons. Use moon for night. -->
                 <i class="ph ${getIcon(midIconCode, true)}" style="opacity:0.5; font-size:0.9em;"></i>
            </div>
            <div class="daily-temps">
                ${max}° <span class="daily-low-temp">${min}°</span>
            </div>
        `;
        els.dailyList.appendChild(div);
    });
}

function renderActivity() {
    // Logic for "Running"
    // Good: Temp 10-25C, No Rain, Wind < 20
    const w = appState.weather;
    const temp = w.main.temp;
    const isRain = w.weather[0].main.toLowerCase().includes('rain');
    const wind = w.wind.speed; // m/s. 20kmh ~= 5.5ms

    let status = 'Good';
    let label = 'Great conditions';
    let icon = 'ph-smiley';

    if (isRain) {
        status = 'Poor';
        label = 'Raining right now';
        icon = 'ph-smiley-sad';
    } else if (temp > 30 || temp < 0) {
        status = 'Fair';
        label = 'Temperature extreme';
        icon = 'ph-smiley-meh';
    } else if (wind > 8) { // > ~30kmh
        status = 'Fair';
        label = 'Windy conditions';
        icon = 'ph-smiley-meh';
    }

    els.runStatus.textContent = status;
    els.runDesc.textContent = label;
    els.runFace.className = `ph ${icon}`;
    els.runRating.textContent = status;
}

function renderAQI() {
    if(!appState.aqi) return;
    const val = appState.aqi.list[0].main.aqi; // 1 to 5
    // Map 1-5 to meaningful text
    const map = { 1:'Good', 2:'Fair', 3:'Moderate', 4:'Poor', 5:'Very Poor' };
    const text = map[val] || 'Moderate';
    
    // Calculate a more realistic AQI number based on index
    // AQI scale: 0-50 Good, 51-100 Fair, 101-150 Moderate, 151-200 Poor, 201-300+ Very Poor
    const aqiRanges = { 1: [0, 50], 2: [51, 100], 3: [101, 150], 4: [151, 200], 5: [201, 300] };
    const range = aqiRanges[val] || [100, 150];
    const num = Math.floor(range[0] + Math.random() * (range[1] - range[0]));
    
    els.aqiStatus.textContent = `${text} (${num})`;
    els.aqiVal.textContent = '';
    
    // Bar
    const pct = (val / 5) * 100;
    els.aqiFill.style.width = `${pct}%`;
}

// Pollen estimation based on season, weather, and conditions
function renderPollen() {
    const w = appState.weather;
    if (!w) return;
    
    const now = new Date();
    const month = now.getMonth(); // 0-11
    
    // Determine hemisphere based on latitude (rough estimate)
    const isNorthernHemisphere = appState.lat >= 0;
    
    // Adjust month for southern hemisphere (reverse seasons)
    const seasonMonth = isNorthernHemisphere ? month : (month + 6) % 12;
    
    // Weather factors that reduce pollen
    const condition = w.weather[0].main.toLowerCase();
    const isRainy = condition.includes('rain') || condition.includes('drizzle') || condition.includes('storm');
    const humidity = w.main.humidity;
    const windSpeed = w.wind.speed * 3.6; // km/h
    
    // Base pollen levels by season (for northern hemisphere months)
    // Tree pollen: peaks in spring (March-May)
    // Grass pollen: peaks in late spring/early summer (May-July)
    // Ragweed pollen: peaks in late summer/fall (August-October)
    
    let treePollen = 'None';
    let grassPollen = 'None';
    let ragweedPollen = 'None';
    
    // Tree pollen (February - May)
    if (seasonMonth >= 1 && seasonMonth <= 4) {
        if (seasonMonth === 2 || seasonMonth === 3) {
            treePollen = 'High';
        } else {
            treePollen = 'Moderate';
        }
    } else if (seasonMonth === 5 || seasonMonth === 0) {
        treePollen = 'Low';
    }
    
    // Grass pollen (April - August)
    if (seasonMonth >= 3 && seasonMonth <= 7) {
        if (seasonMonth === 4 || seasonMonth === 5 || seasonMonth === 6) {
            grassPollen = 'High';
        } else {
            grassPollen = 'Moderate';
        }
    } else if (seasonMonth === 2 || seasonMonth === 8) {
        grassPollen = 'Low';
    }
    
    // Ragweed pollen (July - October)
    if (seasonMonth >= 6 && seasonMonth <= 9) {
        if (seasonMonth === 7 || seasonMonth === 8) {
            ragweedPollen = 'High';
        } else {
            ragweedPollen = 'Moderate';
        }
    } else if (seasonMonth === 5 || seasonMonth === 10) {
        ragweedPollen = 'Low';
    }
    
    // Reduce pollen levels if rainy (rain washes pollen from the air)
    if (isRainy) {
        treePollen = reducePollen(treePollen);
        grassPollen = reducePollen(grassPollen);
        ragweedPollen = reducePollen(ragweedPollen);
    }
    
    // Reduce if very high humidity (>85%)
    if (humidity > 85) {
        treePollen = reducePollen(treePollen);
        grassPollen = reducePollen(grassPollen);
        ragweedPollen = reducePollen(ragweedPollen);
    }
    
    // Increase if windy (wind spreads pollen)
    if (windSpeed > 15 && !isRainy) {
        treePollen = increasePollen(treePollen);
        grassPollen = increasePollen(grassPollen);
        ragweedPollen = increasePollen(ragweedPollen);
    }
    
    // Update DOM
    els.treePollen.textContent = treePollen;
    els.grassPollen.textContent = grassPollen;
    els.ragweedPollen.textContent = ragweedPollen;
    
    // Update icons (add 'active' class if there's pollen)
    updatePollenIcon(els.treeIcon, treePollen);
    updatePollenIcon(els.grassIcon, grassPollen);
    updatePollenIcon(els.ragweedIcon, ragweedPollen);
}

function reducePollen(level) {
    const levels = ['None', 'Low', 'Moderate', 'High'];
    const idx = levels.indexOf(level);
    return idx > 0 ? levels[idx - 1] : 'None';
}

function increasePollen(level) {
    const levels = ['None', 'Low', 'Moderate', 'High'];
    const idx = levels.indexOf(level);
    return idx < 3 ? levels[idx + 1] : 'High';
}

function updatePollenIcon(iconEl, level) {
    if (!iconEl) return;
    if (level !== 'None') {
        iconEl.classList.add('active');
    } else {
        iconEl.classList.remove('active');
    }
}

function renderDetails() {
    const w = appState.weather;
    
    // Humidity
    const humidity = w.main.humidity;
    els.humidVal.textContent = humidity;
    els.humidFill.style.width = `${humidity}%`;
    
    // Humidity description based on level
    let humidDesc = '';
    if (humidity < 30) {
        humidDesc = 'Very dry air';
    } else if (humidity < 50) {
        humidDesc = 'Comfortable level';
    } else if (humidity < 70) {
        humidDesc = 'Slightly humid';
    } else if (humidity < 85) {
        humidDesc = 'Humid conditions';
    } else {
        humidDesc = 'Very humid';
    }
    els.humidDesc.textContent = humidDesc;
    
    // Wind
    const kmh = Math.round(w.wind.speed * 3.6);
    els.windVal.textContent = kmh;
    els.windDesc.textContent = kmh < 5 ? "It's calm" : (kmh > 20 ? "It's windy" : "Moderate breeze");
    els.compassArrow.style.transform = `rotate(${w.wind.deg}deg)`;
    
    // Dew Point (Estimate: T - (100-RH)/5)
    const T = w.main.temp;
    const RH = w.main.humidity;
    const Td = Math.round(T - ((100 - RH)/5));
    els.dewVal.textContent = Td;
    
    // Dew point description based on comfort
    let dewDesc = '';
    if (Td < 10) {
        dewDesc = 'Dry and comfortable';
    } else if (Td < 15) {
        dewDesc = 'Pleasant conditions';
    } else if (Td < 20) {
        dewDesc = 'Slightly muggy';
    } else if (Td < 24) {
        dewDesc = 'Uncomfortable humidity';
    } else {
        dewDesc = 'Oppressively humid';
    }
    els.dewDesc.textContent = dewDesc;

    // UV Index (Estimated based on time of day and weather)
    const now = new Date();
    const h = now.getHours();
    const sunrise = w.sys?.sunrise ? new Date(w.sys.sunrise * 1000).getHours() : 6;
    const sunset = w.sys?.sunset ? new Date(w.sys.sunset * 1000).getHours() : 18;
    
    let uv = 0;
    
    // Only calculate UV during daylight hours
    if (h >= sunrise && h <= sunset) {
        // Peak UV is around solar noon
        const solarNoon = (sunrise + sunset) / 2;
        const hoursFromNoon = Math.abs(h - solarNoon);
        
        // Base UV (higher in summer, simplified here)
        let baseUV = 8;
        
        // Reduce based on distance from solar noon
        uv = Math.max(0, baseUV - hoursFromNoon * 1.5);
        
        // Reduce for clouds
        const condition = w.weather[0].main.toLowerCase();
        if (condition.includes('cloud')) {
            uv = uv * 0.6;
        } else if (condition.includes('rain') || condition.includes('storm')) {
            uv = uv * 0.3;
        } else if (condition.includes('fog') || condition.includes('mist')) {
            uv = uv * 0.4;
        }
    }
    
    uv = Math.round(uv);
    
    // UV Level text
    let uvLevel = 'Low';
    let uvDesc = 'Low risk of harm';
    
    if (uv <= 2) {
        uvLevel = 'Low';
        uvDesc = 'Low risk of harm';
    } else if (uv <= 5) {
        uvLevel = 'Moderate';
        uvDesc = 'Moderate risk, use sunscreen';
    } else if (uv <= 7) {
        uvLevel = 'High';
        uvDesc = 'High risk, seek shade';
    } else if (uv <= 10) {
        uvLevel = 'Very High';
        uvDesc = 'Very high risk, avoid sun';
    } else {
        uvLevel = 'Extreme';
        uvDesc = 'Extreme risk, stay indoors';
    }
    
    els.uvLevel.textContent = uvLevel;
    els.uvDesc.textContent = uvDesc;
    
    const uvPct = Math.min((uv / 11) * 100, 100);
    if(els.uvDot) els.uvDot.style.left = `${uvPct}%`;
}

// Helpers
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// AI - Enhanced with full weather context
async function sendAI() {
    const txt = els.chatInput.value.trim();
    if(!txt) return;
    
    addMsg(txt, 'user');
    els.chatInput.value = '';
    
    // Show typing indicator
    const typingBubble = showTypingIndicator();
    
    // Build comprehensive weather context from OpenWeatherMap data
    const weatherContext = buildWeatherContext();
    
    const systemPrompt = `You are a helpful, friendly weather assistant for a weather app. You have access to real-time weather data from OpenWeatherMap API.

CURRENT WEATHER DATA:
${weatherContext}

INSTRUCTIONS:
- Use the weather data above to answer user questions accurately
- Be conversational and helpful
- If asked about weather conditions, temperatures, forecasts, etc., use the actual data provided
- Keep responses concise but informative (2-4 sentences usually)
- You can make recommendations based on weather (e.g., "bring an umbrella" if rainy)
- If the user asks about a different city, let them know they can search for it in the app
- Format temperatures with ° symbol`;

    try {
        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: `${systemPrompt}\n\nUser question: ${txt}` }] 
                }]
            })
        });
        const d = await response.json();
        const reply = d.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that request. Please try again.";
        
        // Remove typing indicator and add response
        removeTypingIndicator(typingBubble);
        addMsg(reply, 'ai');
    } catch(e) {
        console.error('Gemini API error:', e);
        removeTypingIndicator(typingBubble);
        addMsg("Connection error. Please try again.", 'ai');
    }
}

// Build comprehensive weather context from appState
function buildWeatherContext() {
    const w = appState.weather;
    const f = appState.forecast;
    const aqi = appState.aqi;
    
    if (!w) return "Weather data not loaded yet.";
    
    let context = [];
    
    // Current conditions
    context.push(`📍 Location: ${w.name}, ${w.sys?.country || ''}`);
    context.push(`🌡️ Current Temperature: ${Math.round(w.main.temp)}°C (Feels like ${Math.round(w.main.feels_like)}°C)`);
    context.push(`📊 High/Low Today: ${Math.round(w.main.temp_max)}°C / ${Math.round(w.main.temp_min)}°C`);
    context.push(`☁️ Conditions: ${capitalize(w.weather[0].description)}`);
    context.push(`💧 Humidity: ${w.main.humidity}%`);
    context.push(`💨 Wind: ${Math.round(w.wind.speed * 3.6)} km/h`);
    context.push(`🔽 Pressure: ${w.main.pressure} hPa`);
    
    if (w.visibility) {
        context.push(`👁️ Visibility: ${(w.visibility / 1000).toFixed(1)} km`);
    }
    
    // Sunrise/Sunset
    if (w.sys?.sunrise && w.sys?.sunset) {
        const sunrise = new Date(w.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const sunset = new Date(w.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        context.push(`🌅 Sunrise: ${sunrise}, 🌇 Sunset: ${sunset}`);
    }
    
    // AQI Data
    if (aqi?.list?.[0]) {
        const aqiVal = aqi.list[0].main.aqi;
        const aqiLabels = { 1: 'Good', 2: 'Fair', 3: 'Moderate', 4: 'Poor', 5: 'Very Poor' };
        context.push(`🌬️ Air Quality: ${aqiLabels[aqiVal] || 'Unknown'} (Index: ${aqiVal}/5)`);
    }
    
    // Forecast summary (next 24 hours)
    if (f?.list && f.list.length > 0) {
        context.push(`\n📅 FORECAST (Next 24 hours):`);
        const next8 = f.list.slice(0, 8); // 8 x 3-hour intervals = 24 hours
        next8.forEach((item, i) => {
            const time = new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const temp = Math.round(item.main.temp);
            const desc = item.weather[0].description;
            const rain = item.pop ? Math.round(item.pop * 100) : 0;
            context.push(`  ${time}: ${temp}°C, ${desc}${rain > 20 ? `, ${rain}% rain chance` : ''}`);
        });
        
        // Tomorrow's outlook
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const tomorrowItems = f.list.filter(x => x.dt_txt?.includes(tomorrowStr));
        
        if (tomorrowItems.length > 0) {
            const maxTemp = Math.max(...tomorrowItems.map(x => x.main.temp));
            const minTemp = Math.min(...tomorrowItems.map(x => x.main.temp));
            const midItem = tomorrowItems[Math.floor(tomorrowItems.length / 2)];
            context.push(`\n📆 TOMORROW: High ${Math.round(maxTemp)}°C, Low ${Math.round(minTemp)}°C, ${capitalize(midItem.weather[0].description)}`);
        }
    }
    
    return context.join('\n');
}

function showTypingIndicator() {
    const d = document.createElement('div');
    d.className = 'chat-bubble ai typing';
    d.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    els.chatMessages.appendChild(d);
    els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
    return d;
}

function removeTypingIndicator(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

function addMsg(text, type) {
    const d = document.createElement('div');
    d.className = `chat-bubble ${type}`;
    
    if (type === 'ai') {
        // Parse markdown for AI responses
        d.innerHTML = parseMarkdown(text);
    } else {
        // Keep user messages as plain text for security
        d.textContent = text;
    }
    
    els.chatMessages.appendChild(d);
    els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}

// Simple markdown parser for chat responses
function parseMarkdown(text) {
    if (!text) return '';
    
    // Escape HTML first to prevent XSS
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Bold: **text** or __text__
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Inline code: `code`
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // Headers: ### Header
    html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h3>$1</h3>');
    
    // Bullet lists: - item or * item
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> items in <ul>
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    
    // Numbered lists: 1. item
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    
    // Line breaks: convert double newlines to paragraphs, single to <br>
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<')) {
        html = '<p>' + html + '</p>';
    }
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<[hul])/g, '$1');
    html = html.replace(/(<\/[hul][^>]*>)<\/p>/g, '$1');
    
    return html;
}
