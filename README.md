# 🌤️ AI-Powered Weather App with Dynamic Backgrounds

A beautiful, responsive weather application with integrated AI chatbot powered by Gemini AI. Features dynamic weather-themed backgrounds, animated weather effects, and real-time weather information with intelligent insights.

![Weather App Demo](https://img.shields.io/badge/Status-Live-success) ![Version](https://img.shields.io/badge/Version-2.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🌍 Weather Information

- **Current Location Weather** - Automatic geolocation-based weather display
- **City Search** - Search weather for any city worldwide
- **Detailed Metrics** - Temperature, humidity, pressure, wind speed, visibility
- **Weather Emojis** - Visual weather representation with animated icons
- **Real-time Updates** - Refresh weather data with one click
- **Day/Night Detection** - Smart background switching based on sunrise/sunset times

### 🎨 Dynamic Weather Backgrounds

- **Immersive Atmospheres** - Background changes to match current weather conditions
- **8 Weather Themes** - Sunny, Cloudy, Rainy, Stormy, Snowy, Misty, Clear Night, Partly Cloudy
- **Vibrant Color Schemes** - Rich, eye-catching gradients for each weather type
- **Smooth Transitions** - Seamless 1.5s fade between different weather backgrounds
- **Moving Gradients** - Animated background patterns that flow and shift

### 🌦️ Animated Weather Effects

- **🌧️ Rain Animation** - Realistic diagonal rain streaks with varying speeds
- **❄️ Snow Animation** - Gentle snowflakes with different sizes and falling patterns  
- **⛈️ Storm Effects** - Dynamic lightning flashes from multiple angles
- **☁️ Cloud Animation** - Floating clouds that drift across the screen
- **🌫️ Mist Effects** - Smooth fog waves with blur and transparency
- **☀️ Sunny Particles** - Floating golden light particles that dance in the air
- **🌙 Starry Night** - Twinkling stars with varying brightness
- **Performance Optimized** - CSS-only animations for smooth performance

### 🤖 AI Chat Assistant

- **Gemini AI Integration** - Powered by Google's advanced AI model
- **Weather Forecasts** - Get 5-day weather predictions through chat
- **Natural Language** - Ask weather questions in plain English
- **Smart Responses** - Context-aware answers about weather patterns
- **Mobile Optimized** - Enhanced touch targets and responsive design
- **Side Panel Design** - Non-intrusive chat interface

### 🎨 Modern UI/UX

- **Glassmorphism Design** - Beautiful frosted glass effects
- **Responsive Layout** - Perfect on mobile, tablet, and desktop
- **Smooth Animations** - CSS animations and transitions
- **Interactive Elements** - Hover effects and visual feedback
- **Adaptive Text Colors** - Text adjusts for optimal contrast on all backgrounds
- **Mobile-First Design** - Optimized touch experience with proper button sizing

## 🚀 Live Demo

Open `index.html` in your browser to see the app in action!

## 🛠️ Installation & Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- OpenWeatherMap API key
- Google Gemini API key

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Md-Arif-hasnat99/weather-app.git
   cd weather-app
   ```

2. **Get API Keys**
   - **OpenWeatherMap**: Sign up at [openweathermap.org](https://openweathermap.org/api)
   - **Google Gemini**: Get your key from [Google AI Studio](https://makersuite.google.com/)

3. **Configure API Keys**
   Open `script.js` and replace the placeholders:
   ```javascript
   const API_KEY = 'your_openweathermap_api_key_here';
   const GEMINI_API_KEY = 'your_gemini_api_key_here';
   ```

4. **Launch the App**
   - Simply open `index.html` in your browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve .
     
     # Using VS Code Live Server extension
     ```

## 📁 Project Structure

```
weather-app/
├── index.html          # Main HTML structure
├── styles.css          # Complete CSS styling
├── script.js           # JavaScript functionality
├── README.md           # Project documentation
└── assets/             # Optional: images, icons
```

## 🔧 Technologies Used

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Advanced styling with animations
- **JavaScript ES6+** - Modern JavaScript features

### APIs & Services

- **OpenWeatherMap API** - Current weather & forecasts
- **Google Gemini AI** - Intelligent chat responses
- **Geolocation API** - Automatic location detection

### Key Features Implementation

- **Responsive Design** - CSS Grid & Flexbox
- **Glassmorphism Effects** - Backdrop filters
- **Smooth Animations** - CSS keyframes & transitions
- **API Integration** - Fetch API with error handling
- **Local Storage** - User preferences (optional)

## 🎯 Usage Guide

### Getting Weather Information

1. **Automatic Location**: Click the 📍 button to get weather for your current location
2. **Search Cities**: Type any city name in the search bar and press Enter
3. **Refresh Data**: Use the refresh button in the weather card

### Dynamic Weather Backgrounds

The app automatically changes its appearance to match the current weather:

- **☀️ Sunny Weather**: Warm orange and yellow gradients with floating light particles
- **☁️ Cloudy Skies**: Purple and blue gradients with drifting cloud animations
- **🌧️ Rainy Days**: Deep blue gradients with realistic diagonal rain streaks
- **⛈️ Stormy Weather**: Dark gradients with dramatic lightning flash effects
- **❄️ Snowy Conditions**: Light blue and white gradients with gentle snowfall
- **🌫️ Misty/Foggy**: Gray gradients with smooth fog wave animations
- **🌙 Clear Nights**: Deep blue gradients with twinkling star effects
- **⛅ Partly Cloudy**: Green gradients with mixed cloud and sun elements

### Using the AI Chatbot

1. **Open Chat**: Click the 💬 chat button in the bottom-right corner
2. **Ask Questions**: Type questions like:
   - "What's the weather like today?"
   - "Will it rain tomorrow?"
   - "Show me the 5-day forecast"
   - "Should I bring an umbrella?"
   - "Tell me about weather patterns"
3. **Quick Suggestions**: Use the suggestion chips for common queries
4. **Mobile-Friendly**: Enhanced touch targets and responsive design for mobile devices

### Features Overview

- **Real-time Data**: Weather updates every time you refresh
- **Immersive Experience**: Background and animations change with weather conditions
- **Forecast Integration**: AI provides detailed forecasts through chat
- **Mobile Optimized**: Fully responsive design with optimized touch interactions
- **Smooth Transitions**: Seamless animations between different weather states
- **Error Handling**: Graceful error messages for network issues
- **Day/Night Awareness**: Different backgrounds for day vs night conditions

## ⚙️ Configuration

### API Configuration

```javascript
// In script.js
const API_KEY = 'your_openweathermap_key';
const GEMINI_API_KEY = 'your_gemini_key';

// Optional: Change units
const units = 'metric'; // metric, imperial, kelvin
```

### Customization Options

- **Colors**: Modify CSS custom properties in `:root`
- **Animations**: Adjust timing in CSS keyframes
- **Layout**: Change grid/flexbox properties
- **API Endpoints**: Switch to different weather services

## 🔒 Privacy & Security

- **Location Data**: Only used locally for weather queries
- **API Keys**: Keep your keys secure and never commit them to version control
- **No Data Storage**: App doesn't store personal information
- **HTTPS Recommended**: Use HTTPS in production for secure API calls

## 🐛 Troubleshooting

### Common Issues

**Weather data not loading?**

- Check your OpenWeatherMap API key
- Ensure you have internet connection
- Check browser console for error messages

**Geolocation not working?**

- Allow location permissions in your browser
- Use HTTPS for production deployments
- Try manual city search as fallback

**Chatbot not responding?**

- Verify your Gemini API key is correct
- Check API quota limits
- Ensure API key has proper permissions

**Styling issues?**

- Check if CSS file is properly linked
- Verify browser supports modern CSS features
- Try hard refresh (Ctrl+F5)

## 🚀 Deployment

### GitHub Pages

1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select source branch
4. Access your app at `username.github.io/weather-app`

### Netlify

1. Connect your GitHub repository
2. Set build command: `# No build needed`
3. Set publish directory: `/`
4. Deploy!

### Vercel

```bash
npm i -g vercel
vercel --public
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Areas for Contribution

- 🌍 Additional weather data sources
- 🎨 New themes and color schemes
- 📱 Progressive Web App (PWA) features
- 🔊 Voice commands integration
- 📊 Weather charts and graphs

## 📈 Future Enhancements

- [ ] **Weather Maps** - Interactive weather visualization
- [ ] **Push Notifications** - Weather alerts and reminders
- [ ] **Historical Data** - Weather history and trends
- [ ] **Multiple Locations** - Save favorite cities
- [ ] **Offline Mode** - Cached weather data
- [ ] **Weather Widgets** - Embeddable components
- [ ] **Social Sharing** - Share weather updates
- [ ] **Voice Assistant** - Voice-activated queries

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenWeatherMap** - For comprehensive weather data
- **Google Gemini** - For AI-powered chat responses
- **CSS-Tricks** - For glassmorphism design inspiration
- **MDN Web Docs** - For excellent web development resources

## 📞 Support

If you encounter any issues or have questions:

- 📧 **Email**: [your-email@domain.com](mailto:your-email@domain.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/weather-app/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-username/weather-app/discussions)

---

**Made with ❤️ by Md Arif Hasnat**

⭐ **Star this repo if you found it helpful!** ⭐

[Demo](https://your-demo-link.com) • [Report Bug](https://github.com/your-username/weather-app/issues) • [Request Feature](https://github.com/your-username/weather-app/issues)
