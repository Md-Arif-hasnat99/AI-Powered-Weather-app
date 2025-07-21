// Weather App Configuration
const API_KEY = 'd20cbcfe5b9316c59f30a10982c556e0'; // Replace with your OpenWeatherMap API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// Weather emoji mapping
const weatherEmojis = {
    'clear sky': '☀️',
    'few clouds': '🌤️',
    'scattered clouds': '⛅',
    'broken clouds': '☁️',
    'shower rain': '🌦️',
    'rain': '🌧️',
    'thunderstorm': '⛈️',
    'snow': '❄️',
    'mist': '🌫️',
    'fog': '🌫️',
    'haze': '🌫️',
    'dust': '💨',
    'sand': '💨',
    'ash': '🌋',
    'squall': '💨',
    'tornado': '🌪️'
};

// DOM Elements
const loadingCard = document.getElementById('loadingCard');
const errorCard = document.getElementById('errorCard');
const weatherCard = document.getElementById('weatherCard');
const errorMessage = document.getElementById('errorMessage');
const cityInput = document.getElementById('cityInput');

// Weather data elements
const cityName = document.getElementById('cityName');
const dateTime = document.getElementById('dateTime');
const temperature = document.getElementById('temperature');
const weatherEmoji = document.getElementById('weatherEmoji');
const weatherDescription = document.getElementById('weatherDescription');
const feelsLike = document.getElementById('feelsLike');
const windSpeed = document.getElementById('windSpeed');
const humidity = document.getElementById('humidity');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
    getWeather();
    
    // Add enter key functionality to search input
    cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchCity();
        }
    });
    
    // Initialize chatbot
    initializeChatbot();
});

// Get current date and time
function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    dateTime.textContent = now.toLocaleDateString('en-US', options);
}

// Get user's current location
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            error => {
                let errorMsg = 'Unable to get your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = 'Location access denied. Please enable location services.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMsg = 'Location request timed out.';
                        break;
                }
                reject(new Error(errorMsg));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    });
}

// Fetch weather data from API
async function fetchWeatherData(latitude, longitude) {
    const url = `${API_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
        } else if (response.status === 404) {
            throw new Error('Location not found.');
        } else {
            throw new Error(`Weather service error: ${response.status}`);
        }
    }
    
    return await response.json();
}

// Fetch weather data by city name
async function fetchWeatherDataByCity(cityName) {
    const url = `${API_URL}?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
        } else if (response.status === 404) {
            throw new Error(`City "${cityName}" not found. Please check the spelling and try again.`);
        } else {
            throw new Error(`Weather service error: ${response.status}`);
        }
    }
    
    return await response.json();
}

// Fetch 5-day forecast data by coordinates
async function fetchForecastData(latitude, longitude) {
    const url = `${FORECAST_API_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Forecast service error: ${response.status}`);
    }
    
    return await response.json();
}

// Fetch forecast data by city name
async function fetchForecastDataByCity(cityName) {
    const url = `${FORECAST_API_URL}?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Forecast service error: ${response.status}`);
    }
    
    return await response.json();
}

// Format forecast data for chatbot
function formatForecastForChat(forecastData, days = 3) {
    const forecasts = [];
    
    // Group forecasts by day
    const dailyForecasts = {};
    
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();
        
        if (!dailyForecasts[dayKey]) {
            dailyForecasts[dayKey] = {
                date: date,
                temps: [],
                conditions: [],
                humidity: [],
                wind: []
            };
        }
        
        dailyForecasts[dayKey].temps.push(item.main.temp);
        dailyForecasts[dayKey].conditions.push(item.weather[0].description);
        dailyForecasts[dayKey].humidity.push(item.main.humidity);
        dailyForecasts[dayKey].wind.push(item.wind.speed);
    });
    
    // Format the daily forecasts
    Object.values(dailyForecasts).slice(0, days).forEach(dayData => {
        const avgTemp = Math.round(dayData.temps.reduce((a, b) => a + b) / dayData.temps.length);
        const minTemp = Math.round(Math.min(...dayData.temps));
        const maxTemp = Math.round(Math.max(...dayData.temps));
        const commonCondition = dayData.conditions[0];
        const avgHumidity = Math.round(dayData.humidity.reduce((a, b) => a + b) / dayData.humidity.length);
        const avgWind = (dayData.wind.reduce((a, b) => a + b) / dayData.wind.length * 3.6).toFixed(1);
        
        const dayName = dayData.date.toLocaleDateString('en-US', { weekday: 'long' });
        const emoji = getWeatherEmoji(commonCondition);
        
        forecasts.push({
            day: dayName,
            emoji: emoji,
            condition: commonCondition,
            minTemp: minTemp,
            maxTemp: maxTemp,
            avgTemp: avgTemp,
            humidity: avgHumidity,
            windSpeed: avgWind
        });
    });
    
    return forecasts;
}

// Get weather emoji based on description
function getWeatherEmoji(description) {
    const desc = description.toLowerCase();
    
    // Check for exact matches first
    if (weatherEmojis[desc]) {
        return weatherEmojis[desc];
    }
    
    // Check for partial matches
    if (desc.includes('clear')) return '☀️';
    if (desc.includes('cloud')) return '☁️';
    if (desc.includes('rain')) return '🌧️';
    if (desc.includes('storm')) return '⛈️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('mist') || desc.includes('fog')) return '🌫️';
    if (desc.includes('wind')) return '💨';
    
    // Default emoji
    return '🌤️';
}

// Display weather data
function displayWeatherData(data) {
    // Location and basic info
    cityName.textContent = `📍 ${data.name}, ${data.sys.country}`;
    
    // Temperature
    temperature.textContent = Math.round(data.main.temp);
    feelsLike.textContent = Math.round(data.main.feels_like);
    
    // Weather description and emoji
    weatherDescription.textContent = data.weather[0].description;
    weatherEmoji.textContent = getWeatherEmoji(data.weather[0].description);
    
    // Weather details
    windSpeed.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    humidity.textContent = `${data.main.humidity}%`;
    pressure.textContent = `${data.main.pressure} hPa`;
    visibility.textContent = data.visibility ? `${(data.visibility / 1000).toFixed(1)} km` : 'N/A';
}

// Show/hide cards
function showCard(card) {
    [loadingCard, errorCard, weatherCard].forEach(c => c.classList.add('hidden'));
    card.classList.remove('hidden');
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    showCard(errorCard);
}

// Main function to get weather
async function getWeather() {
    try {
        // Show loading
        showCard(loadingCard);
        
        // Check if API key is configured
        if (API_KEY === 'YOUR_API_KEY_HERE') {
            throw new Error('Please configure your OpenWeatherMap API key in script.js');
        }
        
        // Get location
        const location = await getCurrentLocation();
        
        // Fetch weather data
        const weatherData = await fetchWeatherData(location.latitude, location.longitude);
        
        // Display data
        displayWeatherData(weatherData);
        
        // Show weather cards
        weatherCard.classList.remove('hidden');
        loadingCard.classList.add('hidden');
        
    } catch (error) {
        console.error('Weather fetch error:', error);
        showError(error.message);
    }
}

// Search city function
async function searchCity() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    try {
        // Show loading
        showCard(loadingCard);
        
        // Check if API key is configured
        if (API_KEY === 'YOUR_API_KEY_HERE') {
            throw new Error('Please configure your OpenWeatherMap API key in script.js');
        }
        
        // Fetch weather data for the city
        const weatherData = await fetchWeatherDataByCity(city);
        
        // Display data
        displayWeatherData(weatherData);
        
        // Show weather cards
        weatherCard.classList.remove('hidden');
        loadingCard.classList.add('hidden');
        
        // Clear the search input
        cityInput.value = '';
        
    } catch (error) {
        console.error('City search error:', error);
        showError(error.message);
    }
}

// Demo mode for testing without API key
function enableDemoMode() {
    const demoData = {
        name: "Demo City",
        sys: { country: "DC", sunrise: 1642665600, sunset: 1642702800, timezone: 0 },
        main: {
            temp: 22,
            feels_like: 24,
            temp_min: 18,
            temp_max: 26,
            humidity: 65,
            pressure: 1013
        },
        weather: [{ description: "partly cloudy" }],
        wind: { speed: 3.5, deg: 180 },
        visibility: 10000,
        clouds: { all: 40 },
        timezone: 7200
    };
    
    displayWeatherData(demoData);
    weatherCard.classList.remove('hidden');
    loadingCard.classList.add('hidden');
}

// Error handling for network issues
window.addEventListener('offline', () => {
    showError('No internet connection. Please check your network and try again.');
});

window.addEventListener('online', () => {
    getWeather();
});

// Add some interactive features
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        getWeather();
    }
});

// Add click handlers for interactive elements
weatherCard.addEventListener('click', (e) => {
    if (e.target.classList.contains('weather-icon')) {
        e.target.style.transform = 'scale(1.2) rotate(360deg)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 500);
    }
});

// Uncomment the line below to enable demo mode for testing
// enableDemoMode();

// Chatbot Functionality
const chatButton = document.querySelector('.chat-button');
const chatModal = document.getElementById('chatModal');
const chatClose = document.querySelector('.chat-close');
const chatInput = document.getElementById('chatInput');
const chatSend = document.querySelector('.chat-send');
const chatMessages = document.getElementById('chatMessages');
const suggestionChips = document.querySelectorAll('.suggestion-chip');

// Gemini AI Configuration
const GEMINI_API_KEY = 'AIzaSyAgkq5B70MobbNv7sFP73unkvsQBVUM30k'; // Replace with your actual API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Open chat modal
function toggleChat() {
    chatModal.classList.toggle('active');
    if (chatModal.classList.contains('active')) {
        chatInput.focus();
    }
}

// Close chat modal
function closeChat() {
    chatModal.classList.remove('active');
}

// Add message to chat
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${isUser ? '👤' : '🤖'}
        </div>
        <div class="message-content">
            <p>${message}</p>
            <span class="message-time">${currentTime}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-message';
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

// Remove typing indicator
function removeTypingIndicator(typingElement) {
    if (typingElement && typingElement.parentNode) {
        typingElement.parentNode.removeChild(typingElement);
    }
}

// Send message to Gemini AI
async function sendToGeminiAI(userMessage) {
    const weatherContext = getCurrentWeatherContext();
    
    // Check if user is asking for forecast
    const isForecastRequest = /forecast|tomorrow|next.*days?|week|upcoming|future.*weather/i.test(userMessage);
    
    let forecastContext = '';
    if (isForecastRequest) {
        console.log('Forecast request detected:', userMessage);
        try {
            // Get current city from weather data
            const cityElement = document.getElementById('cityName');
            if (cityElement) {
                const cityText = cityElement.textContent.replace('📍 ', '');
                const cityName = cityText.split(',')[0]; // Get just city name without country
                console.log('Fetching forecast for city:', cityName);
                
                const forecastData = await fetchForecastDataByCity(cityName);
                console.log('Forecast data received:', forecastData);
                
                const formattedForecast = formatForecastForChat(forecastData, 3);
                console.log('Formatted forecast:', formattedForecast);
                
                forecastContext = `\n\nForecast data:\n${formattedForecast.map(day => 
                    `${day.day}: ${day.emoji} ${day.condition}, ${day.minTemp}°-${day.maxTemp}°C, Humidity: ${day.humidity}%, Wind: ${day.windSpeed} km/h`
                ).join('\n')}`;
                console.log('Forecast context:', forecastContext);
            } else {
                console.log('No city element found');
            }
        } catch (error) {
            console.error('Error fetching forecast:', error);
            forecastContext = '\n\n(Forecast data temporarily unavailable)';
        }
    }
    
    const prompt = `You are WeatherBot, a friendly and knowledgeable AI weather assistant with a warm, conversational personality. You love helping people understand weather and making conversations enjoyable.

    Current weather information: ${weatherContext}${forecastContext}
    
    User's message: "${userMessage}"
    
    Instructions for your response:
    - Be conversational, friendly, and natural in your tone
    - Use weather-related emojis to make responses more engaging
    - If the user asks about current weather, use the current weather data
    - If the user asks about forecast/future weather, use the forecast data provided above
    - For general questions, be helpful while keeping a weather-focused personality
    - Keep responses concise (1-3 sentences) but informative and personal
    - Show enthusiasm about weather topics
    - Give practical tips when relevant
    - Use casual, natural language like you're chatting with a friend
    
    Respond naturally and helpfully:`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 250,
                    candidateCount: 1
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Check if we have a valid response
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Unexpected API response structure:', data);
            return getWeatherBasedResponse(userMessage);
        }
    } catch (error) {
        console.error('Gemini AI Error:', error);
        return getWeatherBasedResponse(userMessage);
    }
}

// Get current weather context for AI
function getCurrentWeatherContext() {
    const currentWeatherElement = document.getElementById('cityName');
    const tempElement = document.getElementById('temperature');
    const descElement = document.getElementById('weatherDescription');
    
    if (currentWeatherElement && tempElement && descElement) {
        const city = currentWeatherElement.textContent;
        const temp = tempElement.textContent + '°C';
        const desc = descElement.textContent;
        return `Current weather in ${city}: ${temp}, ${desc}`;
    }
    return "No current weather data available";
}

// Fallback weather-based responses with forecast support
async function getWeatherBasedResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Check if it's a forecast request
    const isForecastRequest = /forecast|tomorrow|next.*days?|week|upcoming|future.*weather/i.test(message);
    
    if (isForecastRequest) {
        console.log('Fallback forecast request detected:', message);
        try {
            // Try to get actual forecast data
            const cityElement = document.getElementById('cityName');
            if (cityElement) {
                const cityText = cityElement.textContent.replace('📍 ', '');
                const cityName = cityText.split(',')[0];
                console.log('Fetching fallback forecast for:', cityName);
                
                const forecastData = await fetchForecastDataByCity(cityName);
                const formattedForecast = formatForecastForChat(forecastData, 3);
                console.log('Fallback forecast data:', formattedForecast);
                
                // Return formatted forecast response
                if (message.includes('tomorrow')) {
                    const tomorrow = formattedForecast[1] || formattedForecast[0];
                    return `Tomorrow's weather looks like: ${tomorrow.emoji} ${tomorrow.condition} with temperatures between ${tomorrow.minTemp}°C and ${tomorrow.maxTemp}°C. Humidity will be around ${tomorrow.humidity}% with winds at ${tomorrow.windSpeed} km/h! 🌤️`;
                } else {
                    const forecastText = formattedForecast.slice(0, 3).map(day => 
                        `${day.day}: ${day.emoji} ${day.condition} (${day.minTemp}°-${day.maxTemp}°C)`
                    ).join('\n');
                    return `Here's your 3-day forecast! 📅\n\n${forecastText}\n\nPerfect for planning your activities! What do you think? 😊`;
                }
            } else {
                console.log('No city element found for fallback forecast');
            }
        } catch (error) {
            console.error('Error in fallback forecast:', error);
        }
    }
    
    const weatherResponses = {
        'hello': [
            'Hey there! 👋 I\'m WeatherBot, your friendly weather companion! What\'s on your mind today?',
            'Hello! 🌟 Great to chat with you! Want to know something about the weather or just have a friendly chat?',
            'Hi friend! ☀️ I\'m here to help with all things weather-related. How can I brighten your day?'
        ],
        'weather': [
            'I absolutely love talking about weather! 🌤️ Check out the current conditions above - what would you like to know more about?',
            'Weather is my passion! ⛅ From sunny days to stormy nights, I\'ve got you covered. What\'s your weather question?',
            'Oh, weather talk - my favorite! 🌈 Take a look at today\'s conditions and let me know what interests you!'
        ],
        'temperature': [
            'Temperature is fascinating! 🌡️ Did you know it affects everything from how we dress to how we feel? Check the current temp above!',
            'Ah, temperature! 🔥❄️ It\'s amazing how a few degrees can completely change our day. What about today\'s temperature catches your attention?',
            'Temperature matters so much! 🌡️ Whether it\'s planning your outfit or activities, I love how it shapes our daily decisions!'
        ],
        'rain': [
            'Rain has such a special charm! ☔ There\'s something magical about the sound of raindrops. Are you hoping for rain or sunshine today?',
            'I find rain absolutely delightful! 🌧️ It nourishes everything and creates the most beautiful atmosphere. Don\'t forget your umbrella if it\'s coming!',
            'Rain is nature\'s way of refreshing the world! �️ Perfect for cozy indoor moments or dancing in puddles - what\'s your rain vibe?'
        ],
        'sunny': [
            'Sunny weather is pure happiness! ☀️ Perfect for outdoor adventures, vitamin D, and just feeling amazing. How are you planning to enjoy it?',
            'Nothing beats a beautiful sunny day! 🌞 Time to get outside, soak up some rays, and enjoy nature\'s free mood booster!',
            'Sunshine is like nature\'s smile! ☀️ Great for picnics, walks, or just opening the windows wide. Don\'t forget your sunscreen though!'
        ],
        'cloudy': [
            'Cloudy skies have their own beauty! ☁️ They create the most dramatic and artistic skies. Plus, they\'re perfect for comfortable temperatures!',
            'I love cloudy days! 🌥️ They\'re like nature\'s soft lighting - everything looks so peaceful and dreamy under those clouds.',
            'Clouds are like nature\'s artwork! ☁️ Each one is unique, and they make the sky so much more interesting than plain blue!'
        ],
        'wind': [
            'Wind is such a fascinating force! 💨 It can cool us down, power turbines, and make trees dance. How\'s the breeze treating you today?',
            'Love feeling the wind! 🌪️ It\'s like nature\'s way of keeping things moving and fresh. Great for kite flying too!',
            'Wind adds so much character to the day! 💨 From gentle breezes to powerful gusts, it really shapes how the weather feels!'
        ],
        'humidity': [
            'Humidity is the invisible game-changer! 💧 It can make 70°F feel like 80°F or make your hair do crazy things! Nature\'s own special effect.',
            'Ah, humidity - the weather\'s secret ingredient! 🌫️ It\'s amazing how much it affects our comfort without us even seeing it.',
            'Humidity is so interesting! 💦 It\'s like the atmosphere\'s moisture level - completely invisible but totally felt!'
        ],
        'forecast': [
            'I\'d love to share the forecast with you! 🌤️ Let me check the upcoming weather conditions for your area.',
            'Great question about the forecast! 📅 I can help you plan ahead with weather predictions.',
            'The forecast is so useful for planning! 🗓️ I\'ll get you the upcoming weather details.'
        ],
        'tomorrow': [
            'Tomorrow\'s weather is important for planning! 🌅 Let me check what\'s coming up for you.',
            'Planning for tomorrow? Smart thinking! 📋 I\'ll help you prepare for tomorrow\'s conditions.',
            'Tomorrow is a new day with new weather! 🆕 Let me see what Mother Nature has in store.'
        ],
        'week': [
            'A weekly forecast helps you plan so much better! 📊 I love helping people prepare for the week ahead.',
            'The week ahead looks interesting weather-wise! 📈 Planning is so much easier with a good forecast.',
            'Weekly weather patterns tell such a great story! 📖 Let me help you understand what\'s coming.'
        ]
    };
    
    // Check for keywords in user message
    for (const [key, responses] of Object.entries(weatherResponses)) {
        if (message.includes(key)) {
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }
    
    // More engaging default responses
    const defaultResponses = [
        'That\'s really interesting! 🤔 I\'d love to chat more about that. Feel free to ask me anything about weather or just keep the conversation going!',
        'You know what? I really enjoy our chat! 😊 Whether it\'s weather-related or just life in general, I\'m here to help and have fun!',
        'Great question! 💭 I\'m always excited to learn what people are curious about. What else would you like to explore together?',
        'Thanks for chatting with me! 🌟 I love connecting with people - whether about weather patterns or just having a good conversation!',
        'That\'s fascinating! 🎉 I enjoy these conversations so much. What else is on your mind today?'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Send message function
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, true);
    chatInput.value = '';
    
    // Show typing indicator
    const typingIndicator = showTypingIndicator();
    
    try {
        // Simulate thinking time for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Get AI response
        let response;
        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY') {
            console.log('Sending message to Gemini AI:', message);
            response = await sendToGeminiAI(message);
            console.log('Gemini AI response:', response);
        } else {
            console.log('Using fallback response system');
            response = await getWeatherBasedResponse(message);
        }
        
        // Remove typing indicator and add response
        removeTypingIndicator(typingIndicator);
        addMessage(response, false);
        
    } catch (error) {
        console.error('Error sending message:', error);
        removeTypingIndicator(typingIndicator);
        addMessage('Oops! I had a little hiccup there. 😅 Let me try to help you in a different way - what would you like to know about the weather?', false);
    }
}

// Handle chat input keypress
function handleChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Send suggestion
function sendSuggestion(suggestion) {
    chatInput.value = suggestion;
    sendMessage();
}

// Initialize chatbot
function initializeChatbot() {
    // Log elements to debug
    console.log('Chatbot elements:', {
        chatButton: chatButton,
        chatModal: chatModal,
        chatClose: chatClose,
        chatInput: chatInput,
        chatSend: chatSend,
        chatMessages: chatMessages
    });
    
    // Set up event listeners
    if (chatButton) {
        chatButton.addEventListener('click', toggleChat);
        console.log('Chat button event listener added');
    } else {
        console.error('Chat button not found');
    }
    
    if (chatClose) {
        chatClose.addEventListener('click', toggleChat);
    }
    
    if (chatSend) {
        chatSend.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', handleChatKeyPress);
    }
    
    // Close modal when clicking outside - removed since it's now a side panel
    // No need for outside click to close as it doesn't block other operations
    
    // Add click events to suggestion chips
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            sendSuggestion(chip.textContent);
        });
    });
}
