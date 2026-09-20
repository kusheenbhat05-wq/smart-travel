// ============================================
// SMART TRAVEL — LIVE WEATHER + TRIP PLANNER
// ============================================

const form = document.getElementById("travelForm");
const interestButtons = document.querySelectorAll(".interest");
const travellerCards = document.querySelectorAll(".choice-card");

let selectedInterests = [];

// --------------------------------------------
// TRAVELLER SELECTION
// --------------------------------------------

travellerCards.forEach((card) => {
  card.addEventListener("click", () => {
    travellerCards.forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");

    const radio = card.querySelector("input[type='radio']");
    if (radio) radio.checked = true;
  });
});

// --------------------------------------------
// INTEREST SELECTION
// --------------------------------------------

interestButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const interest = button.dataset.interest;

    if (button.classList.contains("selected")) {
      button.classList.remove("selected");
      selectedInterests = selectedInterests.filter(
        (item) => item !== interest
      );
      return;
    }

    if (selectedInterests.length >= 4) {
      showToast("You can select maximum 4 interests.");
      return;
    }

    button.classList.add("selected");
    selectedInterests.push(interest);
  });
});

// --------------------------------------------
// DESTINATION DATA
// --------------------------------------------

const destinationData = {
  goa: {
    name: "Goa",
    places: [
      "Baga Beach",
      "Calangute Beach",
      "Fort Aguada",
      "Anjuna",
      "Chapora Fort",
      "Dudhsagar Falls"
    ]
  },

  manali: {
    name: "Manali",
    places: [
      "Solang Valley",
      "Hadimba Temple",
      "Mall Road",
      "Old Manali",
      "Atal Tunnel",
      "Vashisht"
    ]
  },

  jaipur: {
    name: "Jaipur",
    places: [
      "Amber Fort",
      "Hawa Mahal",
      "City Palace",
      "Jantar Mantar",
      "Nahargarh Fort",
      "Jal Mahal"
    ]
  },

  delhi: {
    name: "Delhi",
    places: [
      "India Gate",
      "Red Fort",
      "Qutub Minar",
      "Humayun's Tomb",
      "Lotus Temple",
      "Connaught Place"
    ]
  },

  mumbai: {
    name: "Mumbai",
    places: [
      "Gateway of India",
      "Marine Drive",
      "Colaba",
      "Elephanta Caves",
      "Juhu Beach",
      "Sanjay Gandhi National Park"
    ]
  },

  rishikesh: {
    name: "Rishikesh",
    places: [
      "Laxman Jhula",
      "Ram Jhula",
      "Triveni Ghat",
      "Beatles Ashram",
      "Neer Garh Waterfall",
      "River Rafting"
    ]
  }
};

// --------------------------------------------
// INTEREST → ACTIVITY MAPPING
// --------------------------------------------

const interestActivities = {
  beaches: [
    "Spend time at a scenic beach",
    "Enjoy a sunset by the water"
  ],

  adventure: [
    "Try a local adventure activity",
    "Explore an outdoor attraction"
  ],

  food: [
    "Try popular local food",
    "Explore a local food street"
  ],

  culture: [
    "Visit an important cultural landmark",
    "Explore local history and architecture"
  ],

  nature: [
    "Visit a natural attraction",
    "Take a relaxed nature walk"
  ],

  nightlife: [
    "Explore the city's evening scene",
    "Visit a popular nightlife area"
  ],

  shopping: [
    "Explore a popular local market",
    "Shop for local products and souvenirs"
  ],

  relaxation: [
    "Keep the evening relaxed",
    "Enjoy a slow café or leisure experience"
  ]
};

// --------------------------------------------
// WEATHER CODE → TEXT
// --------------------------------------------

function getWeatherDescription(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    56: "Freezing drizzle",
    57: "Freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snowfall",
    73: "Snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy rain showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail"
  };

  return weatherCodes[code] || "Weather information available";
}

// --------------------------------------------
// WEATHER ICON
// --------------------------------------------

function getWeatherIcon(code) {
  if (code === 0) return "☀️";

  if ([1, 2].includes(code)) return "🌤️";

  if ([3, 45, 48].includes(code)) return "☁️";

  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";

  if (
    [61, 63, 65, 66, 67, 80, 81, 82].includes(code)
  ) {
    return "🌧️";
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "❄️";
  }

  if ([95, 96, 99].includes(code)) {
    return "⛈️";
  }

  return "🌍";
}

// --------------------------------------------
// GEOCODE DESTINATION
// --------------------------------------------

async function getCoordinates(destination) {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?` +
    `name=${encodeURIComponent(destination)}` +
    `count=1&language=en&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not find destination.");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(
      `We couldn't find "${destination}". Try a city name like Goa, Delhi or Manali.`
    );
  }

  const result = data.results[0];

  return {
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    country: result.country || ""
  };
}

// --------------------------------------------
// GET LIVE WEATHER
// --------------------------------------------

async function getWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code` +
    `&forecast_days=7` +
    `&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Weather service is currently unavailable.");
  }

  return await response.json();
}

// --------------------------------------------
// WEATHER TRAVEL NOTE
// --------------------------------------------

function getTravelWeatherNote(weatherCode, temperature) {
  if ([95, 96, 99].includes(weatherCode)) {
    return "⛈️ Thunderstorms are possible. Keep outdoor activities flexible.";
  }

  if (
    [61, 63, 65, 80, 81, 82].includes(weatherCode)
  ) {
    return "☔ Rain is possible. Keep an umbrella and a backup indoor plan.";
  }

  if (temperature >= 35) {
    return "🌡️ It is quite warm. Plan outdoor activities during cooler hours.";
  }

  if (temperature <= 10) {
    return "🧥 It is cold. Carry warm layers for outdoor activities.";
  }

  if ([0, 1].includes(weatherCode)) {
    return "☀️ Clear conditions look comfortable for outdoor exploration.";
  }

  return "🌤️ Conditions look fairly comfortable. Keep checking the forecast before heading out.";
}

// --------------------------------------------
// GENERATE DAY PLAN
// --------------------------------------------

function generateDayPlan(destination, days) {
  const key = destination.toLowerCase().trim();
  const data = destinationData[key];

  const places = data
    ? data.places
    : [
        `Explore ${destination}`,
        `Visit a popular attraction in ${destination}`,
        `Explore the local market`,
        `Discover a cultural landmark`,
        `Enjoy a scenic location`,
        `Try a local food experience`
      ];

  const selectedActivities = [];

  selectedInterests.forEach((interest) => {
    if (interestActivities[interest]) {
      selectedActivities.push(...interestActivities[interest]);
    }
  });

  const itinerary = [];

  for (let i = 0; i < days; i++) {
    const place = places[i % places.length];

    let activity =
      selectedActivities.length > 0
        ? selectedActivities[i % selectedActivities.length]
        : "Explore the destination and discover local experiences";

    itinerary.push({
      day: i + 1,
      title: place,
      activity
    });
  }

  return itinerary;
}

// --------------------------------------------
// BUDGET CALCULATOR
// --------------------------------------------

function generateBudget(totalBudget, travellers, days) {
  const budget = Number(totalBudget);

  let accommodation = 0.30;
  let food = 0.20;
  let transport = 0.20;
  let activities = 0.15;
  let buffer = 0.15;

  if (travellers === "solo") {
    accommodation = 0.28;
    food = 0.20;
    transport = 0.18;
    activities = 0.17;
    buffer = 0.17;
  }

  if (travellers === "family") {
    accommodation = 0.35;
    food = 0.25;
    transport = 0.18;
    activities = 0.10;
    buffer = 0.12;
  }

  return {
    accommodation: Math.round(budget * accommodation),
    food: Math.round(budget * food),
    transport: Math.round(budget * transport),
    activities: Math.round(budget * activities),
    buffer: Math.round(budget * buffer)
  };
}

// --------------------------------------------
// FORMAT MONEY
// --------------------------------------------

function formatMoney(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

// --------------------------------------------
// WEATHER FORECAST HTML
// --------------------------------------------

function createForecastHTML(weather) {
  if (!weather.daily || !weather.daily.time) {
    return "";
  }

  const days = Math.min(weather.daily.time.length, 5);

  let html = "";

  for (let i = 0; i < days; i++) {
    const date = new Date(weather.daily.time[i]);

    const dayName = date.toLocaleDateString("en-IN", {
      weekday: "short"
    });

    const max = Math.round(weather.daily.temperature_2m_max[i]);
    const min = Math.round(weather.daily.temperature_2m_min[i]);

    const rain =
      weather.daily.precipitation_probability_max?.[i] ?? 0;

    const code = weather.daily.weather_code[i];

    html += `
      <div class="forecast-item">
        <span class="forecast-day">${dayName}</span>
        <span class="forecast-icon">${getWeatherIcon(code)}</span>
        <span class="forecast-temp">${min}° / ${max}°</span>
        <span class="forecast-rain">💧 ${rain}%</span>
      </div>
    `;
  }

  return html;
}

// --------------------------------------------
// WEATHER CARD
// --------------------------------------------

function createWeatherCard(weather, location) {
  const current = weather.current;

  if (!current) {
    return `
      <div class="weather-card">
        <p>Weather information is currently unavailable.</p>
      </div>
    `;
  }

  const temperature = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);
  const humidity = current.relative_humidity_2m;
  const wind = Math.round(current.wind_speed_10m);
  const precipitation = current.precipitation || 0;
  const code = current.weather_code;

  const condition = getWeatherDescription(code);
  const icon = getWeatherIcon(code);

  const note = getTravelWeatherNote(code, temperature);

  return `
    <div class="weather-card">

      <div class="weather-header">
        <div>
          <p class="weather-label">LIVE DESTINATION WEATHER</p>
          <h3>${icon} ${location.name}</h3>
          <span>${location.country}</span>
        </div>

        <div class="weather-temperature">
          ${temperature}°C
        </div>
      </div>

      <div class="weather-condition">
        <strong>${condition}</strong>
        <span>Feels like ${feelsLike}°C</span>
      </div>

      <div class="weather-stats">

        <div class="weather-stat">
          <span>💧</span>
          <div>
            <small>Humidity</small>
            <strong>${humidity}%</strong>
          </div>
        </div>

        <div class="weather-stat">
          <span>💨</span>
          <div>
            <small>Wind</small>
            <strong>${wind} km/h</strong>
          </div>
        </div>

        <div class="weather-stat">
          <span>🌧️</span>
          <div>
            <small>Precipitation</small>
            <strong>${precipitation} mm</strong>
          </div>
        </div>

      </div>

      <div class="weather-note">
        ${note}
      </div>

      <div class="forecast-title">
        5-Day Forecast
      </div>

      <div class="forecast-list">
        ${createForecastHTML(weather)}
      </div>

      <div class="weather-source">
        Weather data powered by Open-Meteo
      </div>

    </div>
  `;
}

// --------------------------------------------
// RESULT STYLES
// --------------------------------------------

function injectResultStyles() {
  if (document.getElementById("smartTravelResultStyles")) return;

  const style = document.createElement("style");

  style.id = "smartTravelResultStyles";

  style.textContent = `
    .trip-result {
      margin-top: 70px;
      animation: resultFade 0.6s ease;
    }

    @keyframes resultFade {
      from {
        opacity: 0;
        transform: translateY(20px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .result-header {
      margin-bottom: 30px;
    }

    .result-header span {
      display: inline-block;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #e8894f;
      margin-bottom: 8px;
    }

    .result-header h2 {
      font-size: clamp(30px, 5vw, 48px);
      margin: 0;
      color: #173f35;
    }

    .result-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
    }

    .result-card {
      background: #ffffff;
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 15px 45px rgba(23, 63, 53, 0.08);
    }

    .result-card h3 {
      margin-top: 0;
      color: #173f35;
    }

    .itinerary-list {
      display: grid;
      gap: 14px;
    }

    .itinerary-item {
      display: grid;
      grid-template-columns: 55px 1fr;
      gap: 15px;
      align-items: center;
      padding: 16px;
      border-radius: 16px;
      background: #f6f1e8;
    }

    .day-number {
      width: 45px;
      height: 45px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: #173f35;
      color: white;
      font-weight: 800;
    }

    .itinerary-item h4 {
      margin: 0 0 5px;
      color: #173f35;
    }

    .itinerary-item p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .budget-list {
      display: grid;
      gap: 14px;
    }

    .budget-row {
      display: flex;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid #eee;
    }

    .budget-row strong {
      color: #173f35;
    }

    .weather-card {
      grid-column: 1 / -1;
      background: #173f35;
      color: white;
      border-radius: 28px;
      padding: 30px;
      box-shadow: 0 20px 50px rgba(23, 63, 53, 0.18);
    }

    .weather-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }

    .weather-label {
      font-size: 11px;
      letter-spacing: 1.5px;
      opacity: 0.65;
      margin: 0 0 7px;
      font-weight: 800;
    }

    .weather-header h3 {
      color: white;
      margin: 0 0 5px;
      font-size: 28px;
    }

    .weather-header span {
      opacity: 0.7;
    }

    .weather-temperature {
      font-size: 58px;
      font-weight: 800;
      white-space: nowrap;
    }

    .weather-condition {
      margin-top: 22px;
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .weather-condition strong {
      font-size: 18px;
    }

    .weather-condition span {
      opacity: 0.7;
    }

    .weather-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-top: 25px;
    }

    .weather-stat {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 15px;
      background: rgba(255,255,255,0.08);
      border-radius: 16px;
    }

    .weather-stat > span {
      font-size: 22px;
    }

    .weather-stat small {
      display: block;
      opacity: 0.6;
      margin-bottom: 3px;
    }

    .weather-stat strong {
      display: block;
    }

    .weather-note {
      margin-top: 20px;
      padding: 15px 18px;
      border-radius: 14px;
      background: rgba(232, 137, 79, 0.16);
      color: #fff4ec;
    }

    .forecast-title {
      margin-top: 28px;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    .forecast-list {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin-top: 12px;
    }

    .forecast-item {
      display: flex;
      flex-direction: column;
      gap: 7px;
      align-items: center;
      padding: 13px 8px;
      background: rgba(255,255,255,0.08);
      border-radius: 14px;
      text-align: center;
    }

    .forecast-day {
      font-size: 12px;
      opacity: 0.65;
    }

    .forecast-icon {
      font-size: 22px;
    }

    .forecast-temp {
      font-size: 12px;
      font-weight: 700;
    }

    .forecast-rain {
      font-size: 10px;
      opacity: 0.7;
    }

    .weather-source {
      margin-top: 18px;
      font-size: 10px;
      opacity: 0.45;
      text-align: right;
    }

    .trip-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 15px;
    }

    .trip-tag {
      background: #dce9df;
      color: #173f35;
      padding: 8px 13px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }

    @media (max-width: 800px) {
      .result-grid {
        grid-template-columns: 1fr;
      }

      .weather-card {
        grid-column: auto;
      }

      .weather-stats {
        grid-template-columns: 1fr;
      }

      .forecast-list {
        grid-template-columns: repeat(2, 1fr);
      }

      .weather-header {
        align-items: flex-start;
      }

      .weather-temperature {
        font-size: 42px;
      }
    }

    @media (max-width: 500px) {
      .weather-header {
        flex-direction: column;
      }

      .forecast-list {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `;

  document.head.appendChild(style);
}

// --------------------------------------------
// TOAST
// --------------------------------------------

function showToast(message) {
  let toast = document.getElementById("travelToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "travelToast";

    Object.assign(toast.style, {
      position: "fixed",
      bottom: "25px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#173f35",
      color: "#fff",
      padding: "13px 20px",
      borderRadius: "999px",
      zIndex: "9999",
      fontSize: "14px",
      boxShadow: "0 10px 30px rgba(0,0,0,.2)"
    });

    document.body.appendChild(toast);
  }

  toast.textContent = message;

  clearTimeout(window.travelToastTimer);

  window.travelToastTimer = setTimeout(() => {
    toast.remove();
  }, 3000);
}

// --------------------------------------------
// GENERATE TRIP
// --------------------------------------------

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const destinationInput = document.getElementById("destination");
  const daysInput = document.getElementById("days");
  const budgetInput = document.getElementById("budget");

  const destination = destinationInput.value.trim();
  const days = Number(daysInput.value);
  const budget = Number(budgetInput.value);

  const travellerInput = document.querySelector(
    "input[name='travellers']:checked"
  );

  const travellerType = travellerInput
    ? travellerInput.value
    : "solo";

  if (!destination) {
    showToast("Please enter your destination.");
    destinationInput.focus();
    return;
  }

  if (!days || days < 1 || days > 30) {
    showToast("Trip duration should be between 1 and 30 days.");
    daysInput.focus();
    return;
  }

  if (!budget || budget <= 0) {
    showToast("Please enter a valid budget.");
    budgetInput.focus();
    return;
  }

  const button = form.querySelector(".generate-btn");

  const originalButtonText = button
    ? button.innerHTML
    : "";

  if (button) {
    button.disabled = true;
    button.innerHTML = "🌍 Building your trip...";
  }

  try {
    injectResultStyles();

    // Get coordinates first
    const location = await getCoordinates(destination);

    // Get live weather
    const weather = await getWeather(
      location.latitude,
      location.longitude
    );

    // Generate itinerary
    const itinerary = generateDayPlan(
      location.name,
      days
    );

    // Generate budget
    const budgetBreakdown = generateBudget(
      budget,
      travellerType,
      days
    );

    const resultHTML = `
      <section class="trip-result" id="tripResult">

        <div class="result-header">
          <span>YOUR SMART TRAVEL PLAN</span>

          <h2>
            ${location.name} is ready. ✈️
          </h2>

          <div class="trip-meta">
            <span class="trip-tag">
              ${days} Days
            </span>

            <span class="trip-tag">
              ${formatMoney(budget)}
            </span>

            <span class="trip-tag">
              ${travellerType}
            </span>

            ${
              selectedInterests.length
                ? `
                  <span class="trip-tag">
                    ${selectedInterests.length} interests
                  </span>
                `
                : ""
            }
          </div>
        </div>

        <div class="result-grid">

          ${createWeatherCard(weather, location)}

          <div class="result-card">
            <h3>🗓️ Your Itinerary</h3>

            <div class="itinerary-list">
              ${itinerary
                .map(
                  (item) => `
                    <div class="itinerary-item">

                      <div class="day-number">
                        ${item.day}
                      </div>

                      <div>
                        <h4>
                          ${item.title}
                        </h4>

                        <p>
                          ${item.activity}
                        </p>
                      </div>

                    </div>
                  `
                )
                .join("")}
            </div>
          </div>

          <div class="result-card">

            <h3>💰 Smart Budget</h3>

            <div class="budget-list">

              <div class="budget-row">
                <span>🏨 Accommodation</span>
                <strong>
                  ${formatMoney(
                    budgetBreakdown.accommodation
                  )}
                </strong>
              </div>

              <div class="budget-row">
                <span>🍴 Food</span>
                <strong>
                  ${formatMoney(
                    budgetBreakdown.food
                  )}
                </strong>
              </div>

              <div class="budget-row">
                <span>🚕 Transport</span>
                <strong>
                  ${formatMoney(
                    budgetBreakdown.transport
                  )}
                </strong>
              </div>

              <div class="budget-row">
                <span>🎟️ Activities</span>
                <strong>
                  ${formatMoney(
                    budgetBreakdown.activities
                  )}
                </strong>
              </div>

              <div class="budget-row">
                <span>🛟 Emergency Buffer</span>
                <strong>
                  ${formatMoney(
                    budgetBreakdown.buffer
                  )}
                </strong>
              </div>

            </div>

          </div>

        </div>

      </section>
    `;

    const existingResult =
      document.getElementById("tripResult");

    if (existingResult) {
      existingResult.remove();
    }

    form.insertAdjacentHTML(
      "afterend",
      resultHTML
    );

    document
      .getElementById("tripResult")
      .scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

  } catch (error) {
    console.error(error);

    showToast(
      error.message ||
      "Something went wrong while creating your trip."
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = originalButtonText;
    }
  }
});

// --------------------------------------------
// SMOOTH NAVIGATION
// --------------------------------------------

document.querySelectorAll("a[href^='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);

    if (target) {
      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth"
      });
    }
  });
});
