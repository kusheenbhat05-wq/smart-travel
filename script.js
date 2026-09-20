/* =========================================================
   SMART TRAVEL — SMART TRIP ENGINE
   ========================================================= */

const travelForm = document.getElementById("travelForm");
const resultsSection = document.getElementById("resultsSection");

let selectedInterests = [];
let tripMap = null;
let mapMarkers = [];

/* =========================================================
   BASIC HELPERS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);

  return date.toISOString().split("T")[0];
}

function showToast(message) {
  let toast = document.querySelector(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* =========================================================
   INTEREST SELECTION
   ========================================================= */

document.querySelectorAll(".interest").forEach((button) => {
  button.addEventListener("click", () => {
    const interest = button.dataset.interest;

    if (!interest) return;

    if (selectedInterests.includes(interest)) {
      selectedInterests = selectedInterests.filter(
        (item) => item !== interest
      );

      button.classList.remove("active", "selected");
      return;
    }

    if (selectedInterests.length >= 5) {
      showToast("You can select up to 5 interests.");
      return;
    }

    selectedInterests.push(interest);
    button.classList.add("active", "selected");
  });
});
/* =========================================================
   TRAVELLER + PACE SELECTION
   ========================================================= */

document.querySelectorAll(".choice-card").forEach((card) => {
  card.addEventListener("click", () => {

    const group = card.closest(".choice-grid");

    if (group) {
      group.querySelectorAll(".choice-card").forEach((item) => {
        item.classList.remove("selected");
      });
    }

    card.classList.add("selected");

    const input = card.querySelector('input[type="radio"]');

    if (input) {
      input.checked = true;
    }
  });
});


document.querySelectorAll(".pace-card").forEach((card) => {
  card.addEventListener("click", () => {

    const group = card.closest(".pace-grid");

    if (group) {
      group.querySelectorAll(".pace-card").forEach((item) => {
        item.classList.remove("selected");
      });
    }

    card.classList.add("selected");

    const input = card.querySelector('input[type="radio"]');

    if (input) {
      input.checked = true;
    }
  });
});


/* Keyboard / radio change support */

document
  .querySelectorAll('input[name="travellers"], input[name="pace"]')
  .forEach((input) => {

    input.addEventListener("change", () => {

      const group =
        input.closest(".choice-grid") ||
        input.closest(".pace-grid");

      if (group) {
        group
          .querySelectorAll(".choice-card, .pace-card")
          .forEach((card) => {
            card.classList.remove("selected");
          });
      }

      const parentCard =
        input.closest(".choice-card, .pace-card");

      if (parentCard) {
        parentCard.classList.add("selected");
      }

    });

  });

/* =========================================================
   DEFAULT DATE
   ========================================================= */

const startDateInput = document.getElementById("startDate");

if (startDateInput && !startDateInput.value) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  startDateInput.value = tomorrow.toISOString().split("T")[0];
}

/* =========================================================
   FORM SUBMIT
   ========================================================= */

if (travelForm) {
  travelForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const destination =
      document.getElementById("destination")?.value.trim();

    const startDate =
      document.getElementById("startDate")?.value;

    const days =
      Number(document.getElementById("days")?.value);

    const budget =
      Number(document.getElementById("budget")?.value);

    const traveller =
      document.querySelector(
        'input[name="travellers"]:checked'
      )?.value || "solo";

    const pace =
      document.querySelector(
        'input[name="pace"]:checked'
      )?.value || "balanced";

    if (!destination) {
      showToast("Please enter a destination.");
      return;
    }

    if (!days || days < 1 || days > 30) {
      showToast("Trip duration should be between 1 and 30 days.");
      return;
    }

    if (!budget || budget < 1000) {
      showToast("Please enter a realistic trip budget.");
      return;
    }

    if (!startDate) {
      showToast("Please select your travel date.");
      return;
    }

    await generateTrip({
      destination,
      startDate,
      days,
      budget,
      traveller,
      pace,
      interests:
        selectedInterests.length
          ? selectedInterests
          : ["culture", "food", "nature"]
    });
  });
}

/* =========================================================
   LOADING UI
   ========================================================= */

function showLoading(destination) {
  resultsSection.innerHTML = `
    <div class="container">
      <div class="loading-state">
        <div class="loading-spinner"></div>

        <h3>Building your ${escapeHTML(destination)} trip...</h3>

        <p>
          Finding the destination, checking weather,
          discovering places and creating your itinerary.
        </p>
      </div>
    </div>
  `;

  resultsSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* =========================================================
   MAIN TRIP GENERATOR
   ========================================================= */

async function generateTrip(config) {
  showLoading(config.destination);

  try {
    const location = await geocodeDestination(config.destination);

    if (!location) {
      throw new Error(
        "Destination could not be found. Try a city or popular destination."
      );
    }

    const weather = await getWeather(
      location.latitude,
      location.longitude
    );

    let places = [];

    try {
      places = await getNearbyPlaces(
        location.latitude,
        location.longitude
      );
    } catch (error) {
      console.warn("Place discovery failed:", error);
    }

    if (!places.length) {
      places = getFallbackPlaces(
        location.name,
        config.interests
      );
    }

    const itinerary = buildItinerary(
      config,
      places,
      location
    );

    const budgetPlan = buildBudget(
      config.budget,
      config.days,
      config.traveller
    );

    const packing = buildPackingList(
      config.interests,
      weather
    );

    const tips = buildTravelTips(
      config,
      weather
    );

    renderResults({
      config,
      location,
      weather,
      places,
      itinerary,
      budgetPlan,
      packing,
      tips
    });

    updateMap(location, places);

  } catch (error) {
    console.error(error);

    resultsSection.innerHTML = `
      <div class="container">
        <div class="error-state">
          <h3>We couldn't build this trip.</h3>

          <p>
            ${escapeHTML(
              error.message ||
              "Something went wrong. Please try again."
            )}
          </p>
        </div>
      </div>
    `;

    resultsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

async function geocodeDestination(destination) {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search` +
    `?name=${encodeURIComponent(destination)}` +
    `&count=10` +
    `&language=en` +
    `&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Destination search failed.");
  }

  const data = await response.json();

  if (!data.results || !data.results.length) {
    return null;
  }

  const results = data.results;

  // Prefer India when the destination has an Indian match.
  // This prevents names like "Kashmir" from matching an unrelated
  // location in another country.
  const indianResult = results.find(
    (result) =>
      String(result.country_code || "").toUpperCase() === "IN"
  );

  const result = indianResult || results[0];

  return {
    name: result.name,
    country: result.country || "",
    admin1: result.admin1 || "",
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone || "auto"
  };
}
/* =========================================================
   WEATHER — OPEN-METEO
   ========================================================= */

async function getWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&forecast_days=7` +
    `&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Weather service is unavailable.");
  }

  return await response.json();
}

/* =========================================================
   WEATHER CODE
   ========================================================= */

function weatherInfo(code) {
  const map = {
    0: ["☀️", "Clear sky"],
    1: ["🌤️", "Mainly clear"],
    2: ["⛅", "Partly cloudy"],
    3: ["☁️", "Overcast"],

    45: ["🌫️", "Fog"],
    48: ["🌫️", "Rime fog"],

    51: ["🌦️", "Light drizzle"],
    53: ["🌦️", "Drizzle"],
    55: ["🌧️", "Heavy drizzle"],

    61: ["🌧️", "Light rain"],
    63: ["🌧️", "Rain"],
    65: ["🌧️", "Heavy rain"],

    71: ["🌨️", "Light snow"],
    73: ["❄️", "Snow"],
    75: ["❄️", "Heavy snow"],

    80: ["🌦️", "Rain showers"],
    81: ["🌧️", "Rain showers"],
    82: ["⛈️", "Heavy showers"],

    95: ["⛈️", "Thunderstorm"],
    96: ["⛈️", "Thunderstorm + hail"],
    99: ["⛈️", "Severe thunderstorm"]
  };

  return map[code] || ["🌤️", "Variable weather"];
}

/* =========================================================
   OPENSTREETMAP / OVERPASS
   ========================================================= */

async function getNearbyPlaces(latitude, longitude) {
  const query = `
    [out:json][timeout:20];

    (
      node(around:5000,${latitude},${longitude})[tourism];
      way(around:5000,${latitude},${longitude})[tourism];

      node(around:5000,${latitude},${longitude})[amenity~"restaurant|cafe|bar"];
      way(around:5000,${latitude},${longitude})[amenity~"restaurant|cafe|bar"];

      node(around:5000,${latitude},${longitude})[leisure~"park|nature_reserve"];
      way(around:5000,${latitude},${longitude})[leisure~"park|nature_reserve"];
    );

    out center tags;
  `;

  const url =
    "https://overpass-api.de/api/interpreter?data=" +
    encodeURIComponent(query);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Places service unavailable.");
  }

  const data = await response.json();

  if (!data.elements) {
    return [];
  }

  return data.elements
    .map((element) => {
      const tags = element.tags || {};

      const latitudeValue =
        element.lat ??
        element.center?.lat;

      const longitudeValue =
        element.lon ??
        element.center?.lon;

      if (
        typeof latitudeValue !== "number" ||
        typeof longitudeValue !== "number"
      ) {
        return null;
      }

      const type =
        tags.tourism ||
        tags.amenity ||
        tags.leisure ||
        "place";

      return {
        id: element.id,
        name:
          tags.name ||
          tags["name:en"] ||
          "Unnamed place",
        type,
        latitude: latitudeValue,
        longitude: longitudeValue
      };
    })
    .filter(Boolean)
    .filter(
      (place) =>
        place.name &&
        place.name !== "Unnamed place"
    )
    .slice(0, 40);
}

/* =========================================================
   FALLBACK PLACES
   ========================================================= */

function getFallbackPlaces(destination, interests) {
  const city = destination;

  const base = [
    {
      name: `${city} Main Market`,
      type: "shopping",
      emoji: "🛍️"
    },
    {
      name: `${city} Old Town`,
      type: "culture",
      emoji: "🏛️"
    },
    {
      name: `${city} Local Food Street`,
      type: "food",
      emoji: "🍜"
    },
    {
      name: `${city} Nature Spot`,
      type: "nature",
      emoji: "🌿"
    },
    {
      name: `${city} Viewpoint`,
      type: "nature",
      emoji: "🌄"
    },
    {
      name: `${city} Adventure Zone`,
      type: "adventure",
      emoji: "🥾"
    },
    {
      name: `${city} Relaxation Spot`,
      type: "relaxation",
      emoji: "🧘"
    },
    {
      name: `${city} Evening District`,
      type: "nightlife",
      emoji: "🌙"
    }
  ];

  const preferred = base.filter((place) =>
    interests.includes(place.type)
  );

  return preferred.length
    ? preferred
    : base;
}

/* =========================================================
   PLACE CATEGORY
   ========================================================= */

function normalizePlaceType(place) {
  const type = String(place.type || "").toLowerCase();

  if (
    type.includes("beach")
  ) {
    return "beaches";
  }

  if (
    type.includes("restaurant") ||
    type.includes("food") ||
    type.includes("cafe")
  ) {
    return "food";
  }

  if (
    type.includes("museum") ||
    type.includes("gallery") ||
    type.includes("historic") ||
    type.includes("monument") ||
    type.includes("castle") ||
    type.includes("archaeological")
  ) {
    return "culture";
  }

  if (
    type.includes("park") ||
    type.includes("nature") ||
    type.includes("garden")
  ) {
    return "nature";
  }

  if (
    type.includes("bar") ||
    type.includes("nightclub")
  ) {
    return "nightlife";
  }

  if (
    type.includes("shop") ||
    type.includes("market")
  ) {
    return "shopping";
  }

  return "general";
}

/* =========================================================
   ITINERARY ENGINE
   ========================================================= */

function buildItinerary(config, places, location) {
  const usablePlaces = [...places];

  const preferredPlaces = usablePlaces.sort((a, b) => {
    const aType = normalizePlaceType(a);
    const bType = normalizePlaceType(b);

    const aScore =
      config.interests.includes(aType) ? 0 : 1;

    const bScore =
      config.interests.includes(bType) ? 0 : 1;

    return aScore - bScore;
  });

  const days = [];

  for (let day = 0; day < config.days; day++) {
    const first =
      preferredPlaces[
        (day * 2) % preferredPlaces.length
      ];

    const second =
      preferredPlaces[
        (day * 2 + 1) % preferredPlaces.length
      ];

    const third =
      preferredPlaces[
        (day * 2 + 2) % preferredPlaces.length
      ];

    const activities = [];

    if (first) {
      activities.push({
        icon: "🌅",
        title: "Morning",
        place: first.name,
        description:
          "Start the day exploring a highlighted local spot."
      });
    }

    if (second) {
      activities.push({
        icon: "🍽️",
        title: "Afternoon",
        place: second.name,
        description:
          "Take a relaxed break and experience something local."
      });
    }

    if (third) {
      activities.push({
        icon: "🌆",
        title: "Evening",
        place: third.name,
        description:
          "Finish the day with a scenic or cultural experience."
      });
    }

    if (config.pace === "relaxed") {
      activities.splice(2);
    }

    if (config.pace === "packed" && preferredPlaces.length > 3) {
      const fourth =
        preferredPlaces[
          (day * 2 + 3) % preferredPlaces.length
        ];

      if (fourth) {
        activities.push({
          icon: "✨",
          title: "Extra",
          place: fourth.name,
          description:
            "Optional extra stop for a fuller travel day."
        });
      }
    }

    days.push({
      number: day + 1,
      date: addDays(config.startDate, day),
      activities
    });
  }

  return days;
}

/* =========================================================
   BUDGET
   ========================================================= */

function buildBudget(totalBudget, days, traveller) {
  let accommodation = 0.32;
  let food = 0.20;
  let transport = 0.20;
  let activities = 0.18;
  let emergency = 0.10;

  if (traveller === "solo") {
    accommodation += 0.04;
    transport += 0.03;
    emergency -= 0.03;
    food -= 0.02;
    activities -= 0.02;
  }

  const items = [
    {
      label: "Stay",
      percent: accommodation
    },
    {
      label: "Food",
      percent: food
    },
    {
      label: "Transport",
      percent: transport
    },
    {
      label: "Activities",
      percent: activities
    },
    {
      label: "Buffer",
      percent: emergency
    }
  ];

  return {
    total: totalBudget,
    perDay: totalBudget / days,
    items: items.map((item) => ({
      ...item,
      amount: Math.round(totalBudget * item.percent)
    }))
  };
}

/* =========================================================
   PACKING
   ========================================================= */

function buildPackingList(interests, weather) {
  const list = [
    "Comfortable walking shoes",
    "Phone charger / power bank",
    "Reusable water bottle",
    "Basic medicines",
    "ID and travel documents"
  ];

  const currentTemp =
    weather?.current?.temperature_2m;

  if (typeof currentTemp === "number") {
    if (currentTemp >= 28) {
      list.push("Light breathable clothes");
      list.push("Sunscreen and sunglasses");
    }

    if (currentTemp <= 18) {
      list.push("Light jacket or warm layer");
    }
  }

  if (interests.includes("adventure")) {
    list.push("Small backpack");
  }

  if (interests.includes("beaches")) {
    list.push("Swimwear and quick-dry clothes");
  }

  if (interests.includes("nature")) {
    list.push("Insect repellent");
  }

  if (interests.includes("nightlife")) {
    list.push("One smart-casual outfit");
  }

  return [...new Set(list)].slice(0, 10);
}

/* =========================================================
   TRAVEL TIPS
   ========================================================= */

function buildTravelTips(config, weather) {
  const tips = [
    "Keep some budget aside for unexpected expenses.",
    "Save important bookings and documents offline.",
    "Avoid planning every hour of the trip.",
    "Check local transport before heading to distant places."
  ];

  const rainChance =
    weather?.daily?.precipitation_probability_max?.[0];

  if (
    typeof rainChance === "number" &&
    rainChance >= 50
  ) {
    tips.unshift(
      "Rain is possible around the forecast period, so keep a compact umbrella or rain layer."
    );
  }

  if (config.pace === "packed") {
    tips.push(
      "A packed itinerary can be tiring—keep small breaks between major activities."
    );
  }

  if (config.pace === "relaxed") {
    tips.push(
      "Use the extra time to explore local cafés, markets and neighbourhoods."
    );
  }

  return tips.slice(0, 7);
}

/* =========================================================
   RENDER RESULTS
   ========================================================= */

function renderResults(data) {
  const {
    config,
    location,
    weather,
    places,
    itinerary,
    budgetPlan,
    packing,
    tips
  } = data;

  const current =
    weather.current || {};

  const [weatherEmoji, weatherText] =
    weatherInfo(current.weather_code);

  const forecast =
    weather.daily?.time
      ?.slice(0, 5)
      .map((date, index) => ({
        date,
        max:
          weather.daily.temperature_2m_max?.[index],
        min:
          weather.daily.temperature_2m_min?.[index],
        code:
          weather.daily.weather_code?.[index],
        rain:
          weather.daily.precipitation_probability_max?.[index]
      })) || [];

  const placeCards = places
    .slice(0, 6)
    .map((place) => {
      const type =
        normalizePlaceType(place);

      const emojiMap = {
        beaches: "🏖️",
        adventure: "🥾",
        food: "🍜",
        culture: "🏛️",
        nature: "🌿",
        nightlife: "🌙",
        shopping: "🛍️",
        relaxation: "🧘",
        general: "📍"
      };

      return `
        <div class="place-card">
          <div class="place-icon">
            ${emojiMap[type] || "📍"}
          </div>

          <h4>${escapeHTML(place.name)}</h4>

          <p>
            ${escapeHTML(
              type.charAt(0).toUpperCase() +
              type.slice(1)
            )}
          </p>
        </div>
      `;
    })
    .join("");

  const itineraryHTML =
    itinerary
      .map((day) => {
        const activities =
          day.activities
            .map(
              (activity) => `
                <div class="activity">
                  <div class="activity-icon">
                    ${activity.icon}
                  </div>

                  <div class="activity-text">
                    <strong>
                      ${escapeHTML(activity.title)}
                      · ${escapeHTML(activity.place)}
                    </strong>

                    <span>
                      ${escapeHTML(activity.description)}
                    </span>
                  </div>
                </div>
              `
            )
            .join("");

        return `
          <div class="day-card">
            <div class="day-number">
              ${day.number}
            </div>

            <h4>
              Day ${day.number}
            </h4>

            <div class="day-date">
              ${formatDate(day.date)}
            </div>

            <div class="day-items">
              ${activities}
            </div>
          </div>
        `;
      })
      .join("");

  const budgetHTML =
    budgetPlan.items
      .map(
        (item) => `
          <div class="budget-row">
            <div class="budget-label">
              ${escapeHTML(item.label)}
            </div>

            <div class="budget-bar">
              <span
                style="width:${Math.round(item.percent * 100)}%"
              ></span>
            </div>

            <div class="budget-value">
              ${formatMoney(item.amount)}
            </div>
          </div>
        `
      )
      .join("");

  const forecastHTML =
    forecast
      .map((item) => {
        const [emoji] =
          weatherInfo(item.code);

        const date =
          new Date(
            `${item.date}T00:00:00`
          );

        const dayName =
          date.toLocaleDateString("en-IN", {
            weekday: "short"
          });

        return `
          <div class="forecast-item">
            <div class="forecast-day">
              ${dayName}
            </div>

            <div class="forecast-icon">
              ${emoji}
            </div>

            <div class="forecast-temp">
              ${Math.round(item.max)}°
              /
              ${Math.round(item.min)}°
            </div>
          </div>
        `;
      })
      .join("");

  const packingHTML =
    packing
      .map(
        (item) =>
          `<li>${escapeHTML(item)}</li>`
      )
      .join("");

  const tipsHTML =
    tips
      .map(
        (item) =>
          `<li>${escapeHTML(item)}</li>`
      )
      .join("");

  resultsSection.innerHTML = `
    <div class="container results-wrapper visible">

      <div class="results-header">
        <div>
          <div class="section-kicker">
            Your smart trip
          </div>

          <h2>
            ${escapeHTML(location.name)}
          </h2>

          <p>
            ${escapeHTML(location.country)}
            ${location.admin1
              ? ` · ${escapeHTML(location.admin1)}`
              : ""}
          </p>
        </div>

        <div class="result-actions">
          <button
            class="result-btn"
            id="shareTripBtn"
            type="button"
          >
            🔗 Share trip
          </button>

          <button
            class="result-btn"
            id="printTripBtn"
            type="button"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      <!-- TOP RESULT -->
      <div class="result-top-grid">

        <div class="result-card weather-card">
          <div class="result-card-header">
            <h3>Current weather</h3>

            <div class="result-meta">
              <span class="meta-pill">
                ${escapeHTML(config.pace)}
              </span>
            </div>
          </div>

          <div class="weather-main">

            <div class="weather-icon">
              ${weatherEmoji}
            </div>

            <div>
              <div class="weather-temp">
                ${Math.round(
                  current.temperature_2m ?? 0
                )}°
              </div>

              <div class="weather-description">
                ${escapeHTML(weatherText)}
              </div>
            </div>

          </div>

          <div class="weather-details">

            <div class="weather-stat">
              <small>Feels like</small>
              <strong>
                ${Math.round(
                  current.apparent_temperature ?? 0
                )}°
              </strong>
            </div>

            <div class="weather-stat">
              <small>Humidity</small>
              <strong>
                ${Math.round(
                  current.relative_humidity_2m ?? 0
                )}%
              </strong>
            </div>

            <div class="weather-stat">
              <small>Wind</small>
              <strong>
                ${Math.round(
                  current.wind_speed_10m ?? 0
                )} km/h
              </strong>
            </div>

            <div class="weather-stat">
              <small>Rain</small>
              <strong>
                ${current.precipitation ?? 0} mm
              </strong>
            </div>

          </div>
        </div>

        <div class="result-card">

          <h3>Trip snapshot</h3>

          <div class="result-meta">

            <span class="meta-pill">
              📅 ${formatDate(config.startDate)}
            </span>

            <span class="meta-pill">
              🗓️ ${config.days} days
            </span>

            <span class="meta-pill">
              💰 ${formatMoney(config.budget)}
            </span>

            <span class="meta-pill">
              👤 ${escapeHTML(config.traveller)}
            </span>

          </div>

          <div style="margin-top:22px;">
            <p style="color:var(--muted);font-size:13px;">
              Interests
            </p>

            <p style="
              margin-top:7px;
              color:var(--green);
              font-weight:700;
              font-size:14px;
            ">
              ${
                config.interests
                  .map(
                    (item) =>
                      item.charAt(0).toUpperCase() +
                      item.slice(1)
                  )
                  .join(" · ")
              }
            </p>
          </div>

          <div style="margin-top:22px;">
            <p style="color:var(--muted);font-size:13px;">
              Estimated daily budget
            </p>

            <strong style="
              display:block;
              margin-top:5px;
              color:var(--green);
              font-size:27px;
            ">
              ${formatMoney(budgetPlan.perDay)}
            </strong>
          </div>

        </div>

      </div>

      <!-- FORECAST -->
      <div class="result-card" style="margin-top:22px;">

        <div class="result-card-header">
          <h3>5-day forecast</h3>

          <span style="
            color:var(--muted);
            font-size:11px;
          ">
            Weather can change
          </span>
        </div>

        <div class="forecast-grid">
          ${forecastHTML}
        </div>

      </div>

      <!-- MAP -->
      <div class="result-card map-card">

        <div class="result-card-header">
          <h3>Explore the destination</h3>

          <span style="
            color:var(--muted);
            font-size:11px;
          ">
            OpenStreetMap
          </span>
        </div>

        <div id="tripMap"></div>

        <div class="map-note">
          Map places are sourced from OpenStreetMap data when
          available.
        </div>

      </div>

      <!-- PLACES -->
      <div class="result-card" style="margin-top:22px;">

        <div class="result-card-header">
          <h3>Places around you</h3>

          <span style="
            color:var(--muted);
            font-size:11px;
          ">
            ${places.length} discovered
          </span>
        </div>

        <div class="places-grid">
          ${placeCards}
        </div>

      </div>

      <!-- ITINERARY -->
      <div class="result-card" style="margin-top:22px;">

        <div class="result-card-header">
          <h3>Your day-by-day plan</h3>

          <span style="
            color:var(--muted);
            font-size:11px;
          ">
            ${escapeHTML(config.pace)} pace
          </span>
        </div>

        <div class="itinerary-list">
          ${itineraryHTML}
        </div>

      </div>

      <!-- BUDGET -->
      <div class="result-card" style="margin-top:22px;">

        <div class="result-card-header">
          <h3>Budget breakdown</h3>

          <span style="
            color:var(--muted);
            font-size:11px;
          ">
            ${formatMoney(budgetPlan.total)} total
          </span>
        </div>

        <div class="budget-layout">

          <div class="budget-total">

            <small>
              Your trip budget
            </small>

            <strong>
              ${formatMoney(budgetPlan.total)}
            </strong>

            <span>
              Approximately
              ${formatMoney(budgetPlan.perDay)}
              per day
            </span>

          </div>

          <div class="budget-bars">
            ${budgetHTML}
          </div>

        </div>

      </div>

      <!-- PACKING + TIPS -->
      <div class="tips-grid">

        <div class="result-card">

          <h3>🎒 Packing list</h3>

          <ul class="tip-list">
            ${packingHTML}
          </ul>

        </div>

        <div class="result-card">

          <h3>💡 Smart travel tips</h3>

          <ul class="tip-list">
            ${tipsHTML}
          </ul>

        </div>

      </div>

    </div>
  `;

  attachResultActions();

  resultsSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* =========================================================
   LEAFLET MAP
   ========================================================= */

function updateMap(location, places) {
  if (!window.L) {
    console.warn("Leaflet is not loaded.");
    return;
  }

  const mapElement =
    document.getElementById("tripMap");

  if (!mapElement) return;

  if (tripMap) {
    tripMap.remove();
    tripMap = null;
    mapMarkers = [];
  }

  tripMap = L.map("tripMap").setView(
    [
      location.latitude,
      location.longitude
    ],
    12
  );

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; OpenStreetMap contributors'
    }
  ).addTo(tripMap);

  const destinationMarker =
    L.marker([
      location.latitude,
      location.longitude
    ])
      .addTo(tripMap)
      .bindPopup(
        `<strong>${escapeHTML(location.name)}</strong>`
      );

  mapMarkers.push(destinationMarker);

  places
    .filter(
      (place) =>
        typeof place.latitude === "number" &&
        typeof place.longitude === "number"
    )
    .slice(0, 20)
    .forEach((place) => {
      const marker = L.marker([
        place.latitude,
        place.longitude
      ])
        .addTo(tripMap)
        .bindPopup(
          `<strong>${escapeHTML(
            place.name
          )}</strong><br>${escapeHTML(
            place.type
          )}`
        );

      mapMarkers.push(marker);
    });

  setTimeout(() => {
    tripMap.invalidateSize();
  }, 250);
}

/* =========================================================
   SHARE / PRINT
   ========================================================= */

function attachResultActions() {
  const shareButton =
    document.getElementById("shareTripBtn");

  const printButton =
    document.getElementById("printTripBtn");

  if (shareButton) {
    shareButton.addEventListener(
      "click",
      async () => {
        const destination =
          document.getElementById("destination")
            ?.value || "";

        const url =
          window.location.href.split("#")[0] +
          `#trip=${encodeURIComponent(
            destination
          )}`;

        try {
          if (
            navigator.share
          ) {
            await navigator.share({
              title: "My Smart Travel Plan",
              text:
                `My Smart Travel plan for ${destination}`,
              url
            });
          } else if (
            navigator.clipboard
          ) {
            await navigator.clipboard.writeText(url);
            showToast(
              "Trip link copied to clipboard."
            );
          } else {
            showToast(
              "Share is not supported on this browser."
            );
          }
        } catch (error) {
          console.log("Share cancelled.");
        }
      }
    );
  }

  if (printButton) {
    printButton.addEventListener(
      "click",
      () => {
        window.print();
      }
    );
  }
}

/* =========================================================
   NAVIGATION
   ========================================================= */

document
  .querySelectorAll('a[href^="#"]')
  .forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId =
        link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target =
        document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

/* =========================================================
   SCROLL REVEAL
   ========================================================= */

const revealElements =
  document.querySelectorAll(
    ".feature-card, .step-card, .planner-card, .section-heading"
  );

if ("IntersectionObserver" in window) {
  const observer =
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12
      }
    );

  revealElements.forEach((element) => {
    element.classList.add("reveal");
    observer.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}

/* =========================================================
   PRINT STYLES
   ========================================================= */

const printStyles = document.createElement("style");

printStyles.textContent = `
@media print {

  .navbar,
  .hero,
  .planner-section,
  .cta-section,
  .footer,
  .result-actions {
    display: none !important;
  }

  body {
    background: white !important;
  }

  #resultsSection {
    padding: 0 !important;
  }

  .results-wrapper {
    display: block !important;
  }

  .result-card {
    box-shadow: none !important;
    break-inside: avoid;
  }

  #tripMap {
    height: 350px !important;
  }
}
`;

document.head.appendChild(printStyles);

/* =========================================================
   INITIAL LOG
   ========================================================= */

console.log(
  "Smart Travel planner loaded successfully ✈️"
);
