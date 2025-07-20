document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const weatherContent = document.getElementById('weather-content');

    // --- IMPORTANT ---
    // Get your free API key from https://openweathermap.org/
    const apiKey = d08164f9fa250b3becab1e891c4959c6; 

    const locationElement = document.getElementById('location');
    const weatherEmojiElement = document.getElementById('weather-emoji');
    const temperatureElement = document.getElementById('temperature');
    const weatherDescriptionElement = document.getElementById('weather-description');
    const humidityElement = document.getElementById('humidity');
    const windSpeedElement = document.getElementById('wind-speed');

    const fetchWeather = (lat, lon) => {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Weather data not available');
                }
                return response.json();
            })
            .then(data => {
                updateUI(data);
            })
            .catch(error => {
                console.error('Error fetching weather:', error);
                loader.textContent = 'Could not fetch weather data. Please try again later.';
            });
    };

    const updateUI = (data) => {
        locationElement.textContent = `${data.name}, ${data.sys.country}`;
        weatherEmojiElement.textContent = getWeatherEmoji(data.weather[0].id);
        temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
        weatherDescriptionElement.textContent = data.weather[0].description;
        humidityElement.textContent = `${data.main.humidity}%`;
        windSpeedElement.textContent = `${data.wind.speed} m/s`;

        // Hide loader and show content
        loader.classList.add('hidden');
        weatherContent.classList.remove('hidden');
    };

    const getWeatherEmoji = (weatherId) => {
        if (weatherId >= 200 && weatherId < 300) {
            return '⛈️'; // Thunderstorm
        } else if (weatherId >= 300 && weatherId < 400) {
            return '🌦️'; // Drizzle
        } else if (weatherId >= 500 && weatherId < 600) {
            return '🌧️'; // Rain
        } else if (weatherId >= 600 && weatherId < 700) {
            return '❄️'; // Snow
        } else if (weatherId >= 700 && weatherId < 800) {
            return '🌫️'; // Atmosphere (fog, mist, etc.)
        } else if (weatherId === 800) {
            return '☀️'; // Clear
        } else if (weatherId > 800) {
            return '☁️'; // Clouds
        } else {
            return '❓'; // Unknown
        }
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(latitude, longitude);
                },
                (error) => {
                    handleLocationError(error);
                }
            );
        } else {
            loader.textContent = 'Geolocation is not supported by this browser.';
        }
    };

    const handleLocationError = (error) => {
        let message = 'An unknown error occurred.';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = 'Please allow location access to see the weather.';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Location information is unavailable.';
                break;
            case error.TIMEOUT:
                message = 'The request to get user location timed out.';
                break;
        }
        console.error('Geolocation Error:', message);
        loader.textContent = message;
    };

    // Start the process
    getLocation();
});