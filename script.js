/* ==========================================
   SMART TRAVEL
   Intelligent Trip Planner
========================================== */

const travelForm = document.getElementById("travelForm");

const destinationInput = document.getElementById("destination");
const daysInput = document.getElementById("days");
const budgetInput = document.getElementById("budget");

const choiceCards = document.querySelectorAll(".choice-card");
const interests = document.querySelectorAll(".interest");


/* ==========================================
   TRAVELLER SELECTION
========================================== */

choiceCards.forEach((card) => {
  card.addEventListener("click", () => {

    choiceCards.forEach((item) => {
      item.classList.remove("selected");
    });

    card.classList.add("selected");

    const radio = card.querySelector("input");

    if (radio) {
      radio.checked = true;
    }
  });
});


/* ==========================================
   INTEREST SELECTION
========================================== */

interests.forEach((interest) => {

  interest.addEventListener("click", () => {

    const selected = document.querySelectorAll(
      ".interest.selected"
    );

    if (
      !interest.classList.contains("selected") &&
      selected.length >= 4
    ) {
      showToast("Choose up to 4 interests.");
      return;
    }

    interest.classList.toggle("selected");

  });

});


/* ==========================================
   TRIP DATA
========================================== */

const destinations = {

  goa: {
    places: [
      "Baga Beach",
      "Calangute Beach",
      "Fort Aguada",
      "Anjuna",
      "Chapora Fort",
      "Dona Paula",
      "Palolem Beach",
      "Fontainhas"
    ],

    food: [
      "Goan fish curry",
      "Prawn curry",
      "Bebinca",
      "Chicken cafreal"
    ],

    adventure: [
      "Water sports",
      "Parasailing",
      "Jet skiing",
      "Scuba diving"
    ],

    nature: [
      "Dudhsagar Falls",
      "Palolem Beach",
      "Butterfly Beach"
    ],

    culture: [
      "Fontainhas",
      "Basilica of Bom Jesus",
      "Se Cathedral"
    ],

    relaxation: [
      "Beach sunset",
      "Spa session",
      "Café hopping"
    ]
  },


  manali: {
    places: [
      "Solang Valley",
      "Mall Road",
      "Hidimba Temple",
      "Old Manali",
      "Vashisht",
      "Atal Tunnel",
      "Sissu",
      "Jogini Falls"
    ],

    food: [
      "Siddu",
      "Thukpa",
      "Momos",
      "Trout"
    ],

    adventure: [
      "Paragliding",
      "River rafting",
      "Skiing",
      "Snow activities"
    ],

    nature: [
      "Solang Valley",
      "Sissu",
      "Jogini Falls"
    ],

    culture: [
      "Hidimba Temple",
      "Vashisht Temple",
      "Old Manali"
    ],

    relaxation: [
      "Café hopping",
      "Hot springs",
      "Mountain views"
    ]
  },


  jaipur: {
    places: [
      "Amber Fort",
      "Hawa Mahal",
      "City Palace",
      "Jantar Mantar",
      "Nahargarh Fort",
      "Jal Mahal",
      "Albert Hall Museum",
      "Bapu Bazaar"
    ],

    food: [
      "Dal Baati Churma",
      "Pyaaz Kachori",
      "Ghewar",
      "Laal Maas"
    ],

    adventure: [
      "Cycling tour",
      "Hot air balloon",
      "Fort exploration"
    ],

    nature: [
      "Jal Mahal",
      "Central Park",
      "Nahargarh Hills"
    ],

    culture: [
      "City Palace",
      "Amber Fort",
      "Hawa Mahal",
      "Jantar Mantar"
    ],

    relaxation: [
      "Rooftop cafés",
      "Heritage hotel",
      "Sunset at Nahargarh"
    ]
  },


  delhi: {
    places: [
      "India Gate",
      "Red Fort",
      "Qutub Minar",
      "Humayun's Tomb",
      "Lotus Temple",
      "Chandni Chowk",
      "Akshardham",
      "Connaught Place"
    ],

    food: [
      "Chole Bhature",
      "Parathas",
      "Chaat",
      "Butter Chicken"
    ],

    adventure: [
      "Street food walk",
      "Cycling tour",
      "Old Delhi walk"
    ],

    nature: [
      "Lodhi Garden",
      "Sunder Nursery",
      "India Gate lawns"
    ],

    culture: [
      "Red Fort",
      "Qutub Minar",
      "Humayun's Tomb",
      "Akshardham"
    ],

    relaxation: [
      "Café hopping",
      "Lodhi Garden",
      "Rooftop dinner"
    ]
  },


  mumbai: {
    places: [
      "Gateway of India",
      "Marine Drive",
      "Elephanta Caves",
      "Colaba",
      "Bandra",
      "Juhu Beach",
      "Sanjay Gandhi National Park",
      "Crawford Market"
    ],

    food: [
      "Vada Pav",
      "Pav Bhaji",
      "Misal Pav",
      "Bombay Sandwich"
    ],

    adventure: [
      "Cycling",
      "Trekking",
      "Elephanta exploration"
    ],

    nature: [
      "Marine Drive",
      "Juhu Beach",
      "Sanjay Gandhi National Park"
    ],

    culture: [
      "Gateway of India",
      "Elephanta Caves",
      "Colaba"
    ],

    relaxation: [
      "Marine Drive sunset",
      "Beach walk",
      "Rooftop dinner"
    ]
  },


  rishikesh: {
    places: [
      "Laxman Jhula",
      "Ram Jhula",
      "Triveni Ghat",
      "Beatles Ashram",
      "Neer Garh Waterfall",
      "Parmarth Niketan",
      "Ganga Aarti",
      "Tapovan"
    ],

    food: [
      "Aloo Puri",
      "North Indian thali",
      "Momos",
      "Local cafés"
    ],

    adventure: [
      "River rafting",
      "Bungee jumping",
      "Giant swing",
      "Trekking"
    ],

    nature: [
      "Neer Garh Waterfall",
      "Ganga",
      "Rajaji National Park"
    ],

    culture: [
      "Triveni Ghat",
      "Parmarth Niketan",
      "Beatles Ashram"
    ],

    relaxation: [
      "Yoga session",
      "Ganga sunset",
      "Café hopping"
    ]
  }

};


/* ==========================================
   GENERIC DESTINATION FALLBACK
========================================== */

const genericPlaces = [
  "City Centre",
  "Local Market",
  "Historic Landmark",
  "Popular Viewpoint",
  "Local Museum",
  "Main Shopping Area",
  "Famous Food Street",
  "Sunset Spot"
];


/* ==========================================
   DESTINATION MATCHING
========================================== */

function getDestinationData(destination) {

  const text = destination.toLowerCase().trim();

  const key = Object.keys(destinations).find((city) =>
    text.includes(city)
  );

  if (key) {
    return destinations[key];
  }

  return {
    places: genericPlaces,
    food: [
      "Local street food",
      "Regional speciality",
      "Popular local restaurant"
    ],
    adventure: [
      "Local adventure activity",
      "City exploration",
      "Outdoor experience"
    ],
    nature: [
      "Local park",
      "Scenic viewpoint",
      "Nature walk"
    ],
    culture: [
      "Local museum",
      "Historic landmark",
      "Cultural district"
    ],
    relaxation: [
      "Café hopping",
      "Sunset walk",
      "Relaxing local experience"
    ]
  };
}


/* ==========================================
   GET SELECTED INTERESTS
========================================== */

function getSelectedInterests() {

  return Array.from(
    document.querySelectorAll(".interest.selected")
  ).map((item) => item.dataset.interest);

}


/* ==========================================
   GET TRAVELLER TYPE
========================================== */

function getTravellerType() {

  const selected = document.querySelector(
    'input[name="travellers"]:checked'
  );

  return selected ? selected.value : "solo";

}


/* ==========================================
   CREATE ACTIVITY LIST
========================================== */

function createActivityPool(data, selectedInterests) {

  let pool = [];

  selectedInterests.forEach((interest) => {

    if (data[interest]) {
      pool.push(...data[interest]);
    }

  });

  if (pool.length === 0) {
    pool = [...data.places];
  }

  return [...new Set(pool)];

}


/* ==========================================
   GENERATE DAILY ITINERARY
========================================== */

function generateDays(days, data, selectedInterests) {

  const activities = createActivityPool(
    data,
    selectedInterests
  );

  const itinerary = [];

  for (let i = 0; i < days; i++) {

    const morning =
      activities[(i * 2) % activities.length];

    const afternoon =
      activities[(i * 2 + 1) % activities.length];

    const evening =
      data.relaxation[
        i % data.relaxation.length
      ];

    itinerary.push({

      day: i + 1,

      title:
        i === 0
          ? "Arrival & First Impressions"
          : i === days - 1
          ? "Final Day & Slow Down"
          : "Explore & Experience",

      morning,

      afternoon,

      evening

    });

  }

  return itinerary;
}


/* ==========================================
   BUDGET CALCULATOR
========================================== */

function calculateBudget(
  budget,
  days,
  traveller
) {

  let stayPercent = 0.35;
  let foodPercent = 0.20;
  let transportPercent = 0.20;
  let activitiesPercent = 0.15;
  let emergencyPercent = 0.10;

  if (traveller === "family") {
    stayPercent = 0.40;
    foodPercent = 0.22;
  }

  if (traveller === "solo") {
    activitiesPercent = 0.18;
    emergencyPercent = 0.07;
  }

  return {

    stay: Math.round(budget * stayPercent),

    food: Math.round(budget * foodPercent),

    transport: Math.round(budget * transportPercent),

    activities: Math.round(
      budget * activitiesPercent
    ),

    emergency: Math.round(
      budget * emergencyPercent
    )

  };
}


/* ==========================================
   FORMAT MONEY
========================================== */

function formatMoney(amount) {

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

}


/* ==========================================
   RESULT HTML
========================================== */

function createResultHTML(
  destination,
  days,
  budget,
  traveller,
  selectedInterests,
  itinerary,
  budgetData
) {

  const interestText =
    selectedInterests.length
      ? selectedInterests
          .map(
            (item) =>
              item.charAt(0).toUpperCase() +
              item.slice(1)
          )
          .join(" • ")
      : "Balanced experience";


  const travellerLabel =
    traveller.charAt(0).toUpperCase() +
    traveller.slice(1);


  const itineraryHTML =
    itinerary
      .map(
        (day) => `
          <article class="generated-day">

            <div class="generated-day-number">
              DAY ${String(day.day).padStart(2, "0")}
            </div>

            <div class="generated-day-content">

              <h3>${day.title}</h3>

              <div class="activity-row">

                <div>
                  <span>🌅 Morning</span>
                  <strong>${day.morning}</strong>
                </div>

                <div>
                  <span>☀️ Afternoon</span>
                  <strong>${day.afternoon}</strong>
                </div>

                <div>
                  <span>🌙 Evening</span>
                  <strong>${day.evening}</strong>
                </div>

              </div>

            </div>

          </article>
        `
      )
      .join("");


  return `

    <section class="trip-results" id="tripResults">

      <div class="results-header">

        <div>

          <span class="eyebrow">
            YOUR SMART ITINERARY
          </span>

          <h2>
            ${destination}
            <span>is calling.</span>
          </h2>

          <p>
            A ${days}-day ${travellerLabel.toLowerCase()}
            trip built around your preferences.
          </p>

        </div>

        <button
          class="new-trip-btn"
          onclick="scrollToPlanner()"
        >
          ← Plan another trip
        </button>

      </div>


      <div class="trip-summary">

        <div class="summary-card">

          <span>📅</span>

          <small>Duration</small>

          <strong>${days} Days</strong>

        </div>


        <div class="summary-card">

          <span>💰</span>

          <small>Total budget</small>

          <strong>${formatMoney(budget)}</strong>

        </div>


        <div class="summary-card">

          <span>👥</span>

          <small>Travelling</small>

          <strong>${travellerLabel}</strong>

        </div>


        <div class="summary-card">

          <span>❤️</span>

          <small>Interests</small>

          <strong>${interestText}</strong>

        </div>

      </div>


      <div class="results-layout">


        <div class="itinerary-box">

          <div class="results-box-heading">

            <div>
              <span class="eyebrow">
                DAY BY DAY
              </span>

              <h3>Your itinerary</h3>
            </div>

            <span class="smart-badge">
              ✦ Smart Plan
            </span>

          </div>

          <div class="generated-days">

            ${itineraryHTML}

          </div>

        </div>


        <aside class="budget-box">

          <span class="eyebrow">
            BUDGET BREAKDOWN
          </span>

          <h3>Where your money goes</h3>

          <div class="budget-list">

            <div class="budget-item">
              <span>🏨 Stay</span>
              <strong>${formatMoney(budgetData.stay)}</strong>
            </div>

            <div class="budget-item">
              <span>🍜 Food</span>
              <strong>${formatMoney(budgetData.food)}</strong>
            </div>

            <div class="budget-item">
              <span>🚕 Transport</span>
              <strong>${formatMoney(budgetData.transport)}</strong>
            </div>

            <div class="budget-item">
              <span>🎟️ Activities</span>
              <strong>${formatMoney(budgetData.activities)}</strong>
            </div>

            <div class="budget-item">
              <span>🛟 Emergency</span>
              <strong>${formatMoney(budgetData.emergency)}</strong>
            </div>

          </div>

          <div class="budget-total">

            <span>Total planned</span>

            <strong>${formatMoney(budget)}</strong>

          </div>

        </aside>

      </div>


      <div class="smart-note">

        <div class="smart-note-icon">✦</div>

        <div>

          <strong>Your trip is personalized.</strong>

          <p>
            This plan uses your destination, trip length,
            budget, traveller type and selected interests
            to create a balanced starting itinerary.
          </p>

        </div>

      </div>

    </section>

  `;

}


/* ==========================================
   ADD RESULT STYLES
========================================== */

function addResultStyles() {

  if (document.getElementById("resultStyles")) {
    return;
  }

  const style = document.createElement("style");

  style.id = "resultStyles";

  style.textContent = `

    .trip-results {
      width: min(1180px, calc(100% - 40px));
      margin: 20px auto 110px;
      animation: resultAppear 0.7s ease;
    }

    @keyframes resultAppear {
      from {
        opacity: 0;
        transform: translateY(25px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 30px;
      margin-bottom: 35px;
    }

    .results-header h2 {
      font-family: "Playfair Display", serif;
      color: var(--green);
      font-size: clamp(42px, 5vw, 64px);
      line-height: 1;
      letter-spacing: -2px;
    }

    .results-header h2 span {
      color: var(--orange);
      font-style: italic;
    }

    .results-header p {
      color: var(--muted);
      margin-top: 15px;
    }

    .new-trip-btn {
      border: 1px solid var(--border);
      background: white;
      color: var(--green);
      padding: 12px 18px;
      border-radius: 50px;
      font-weight: 600;
    }

    .trip-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 18px;
    }

    .summary-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 20px;
    }

    .summary-card > span {
      display: block;
      font-size: 23px;
      margin-bottom: 15px;
    }

    .summary-card small {
      display: block;
      color: var(--muted);
      font-size: 10px;
      margin-bottom: 5px;
    }

    .summary-card strong {
      display: block;
      color: var(--green);
      font-size: 14px;
      line-height: 1.4;
    }

    .results-layout {
      display: grid;
      grid-template-columns: 1.5fr 0.8fr;
      gap: 18px;
    }

    .itinerary-box,
    .budget-box {
      background: white;
      border: 1px solid var(--border);
      border-radius: 25px;
      padding: 30px;
    }

    .results-box-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }

    .results-box-heading h3,
    .budget-box h3 {
      color: var(--green);
      font-size: 24px;
    }

    .smart-badge {
      background: var(--green-light);
      color: var(--green);
      padding: 8px 12px;
      border-radius: 50px;
      font-size: 10px;
      font-weight: 700;
    }

    .generated-days {
      display: grid;
      gap: 10px;
    }

    .generated-day {
      display: grid;
      grid-template-columns: 80px 1fr;
      gap: 15px;
      padding: 18px;
      border-radius: 15px;
      background: var(--bg);
    }

    .generated-day-number {
      color: var(--orange);
      font-size: 10px;
      font-weight: 800;
      padding-top: 3px;
    }

    .generated-day-content h3 {
      color: var(--green);
      font-size: 15px;
      margin-bottom: 15px;
    }

    .activity-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .activity-row div {
      background: white;
      padding: 12px;
      border-radius: 10px;
    }

    .activity-row span {
      display: block;
      color: var(--muted);
      font-size: 9px;
      margin-bottom: 5px;
    }

    .activity-row strong {
      color: var(--green);
      font-size: 11px;
      line-height: 1.35;
    }

    .budget-box {
      align-self: start;
    }

    .budget-box > h3 {
      margin-bottom: 25px;
    }

    .budget-list {
      display: grid;
      gap: 15px;
    }

    .budget-item {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 13px;
      border-bottom: 1px solid var(--border);
      color: var(--muted);
      font-size: 12px;
    }

    .budget-item strong {
      color: var(--green);
    }

    .budget-total {
      margin-top: 20px;
      padding-top: 5px;
      display: flex;
      justify-content: space-between;
      color: var(--green);
      font-weight: 700;
    }

    .smart-note {
      margin-top: 18px;
      padding: 20px 24px;
      border-radius: 18px;
      background: var(--green);
      color: white;
      display: flex;
      align-items: flex-start;
      gap: 15px;
    }

    .smart-note-icon {
      font-size: 22px;
      color: var(--orange-light);
    }

    .smart-note strong {
      display: block;
      margin-bottom: 5px;
    }

    .smart-note p {
      color: rgba(255,255,255,0.65);
      font-size: 11px;
      line-height: 1.6;
    }

    @media (max-width: 800px) {

      .results-header {
        display: block;
      }

      .new-trip-btn {
        margin-top: 20px;
      }

      .trip-summary {
        grid-template-columns: 1fr 1fr;
      }

      .results-layout {
        grid-template-columns: 1fr;
      }

      .activity-row {
        grid-template-columns: 1fr;
      }

    }

    @media (max-width: 500px) {

      .trip-results {
        width: calc(100% - 28px);
      }

      .trip-summary {
        grid-template-columns: 1fr;
      }

      .itinerary-box,
      .budget-box {
        padding: 20px;
      }

      .generated-day {
        grid-template-columns: 1fr;
      }

    }

  `;

  document.head.appendChild(style);

}


/* ==========================================
   FORM SUBMISSION
========================================== */

travelForm.addEventListener("submit", (event) => {

  event.preventDefault();

  const destination =
    destinationInput.value.trim();

  const days =
    Number(daysInput.value);

  const budget =
    Number(budgetInput.value);

  const traveller =
    getTravellerType();

  const selectedInterests =
    getSelectedInterests();


  /* Validation */

  if (!destination) {
    showToast("Please enter a destination.");
    destinationInput.focus();
    return;
  }

  if (!days || days < 1) {
    showToast("Please enter a valid trip duration.");
    daysInput.focus();
    return;
  }

  if (!budget || budget < 500) {
    showToast("Please enter a valid budget.");
    budgetInput.focus();
    return;
  }


  /* Generate */

  const data =
    getDestinationData(destination);

  const itinerary =
    generateDays(
      days,
      data,
      selectedInterests
    );

  const budgetData =
    calculateBudget(
      budget,
      days,
      traveller
    );


  addResultStyles();


  const oldResults =
    document.getElementById("tripResults");

  if (oldResults) {
    oldResults.remove();
  }


  const resultHTML =
    createResultHTML(
      destination,
      days,
      budget,
      traveller,
      selectedInterests,
      itinerary,
      budgetData
    );


  document
    .querySelector(".planner-section")
    .insertAdjacentHTML(
      "afterend",
      resultHTML
    );


  const results =
    document.getElementById("tripResults");


  setTimeout(() => {

    results.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }, 100);

});


/* ==========================================
   SCROLL TO PLANNER
========================================== */

function scrollToPlanner() {

  const planner =
    document.getElementById("planner");

  if (!planner) return;

  planner.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/* ==========================================
   TOAST
========================================== */

function showToast(message) {

  let toast =
    document.getElementById("smartToast");


  if (!toast) {

    toast =
      document.createElement("div");

    toast.id = "smartToast";

    toast.style.cssText = `
      position: fixed;
      left: 50%;
      bottom: 25px;
      transform: translateX(-50%);
      z-index: 9999;
      background: #173f35;
      color: white;
      padding: 13px 20px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 12px 30px rgba(0,0,0,0.18);
      transition: opacity 0.25s ease;
    `;

    document.body.appendChild(toast);

  }


  toast.textContent = message;

  toast.style.opacity = "1";


  clearTimeout(window.smartToastTimer);


  window.smartToastTimer =
    setTimeout(() => {

      toast.style.opacity = "0";

    }, 2500);

}


/* ==========================================
   INITIAL STATE
========================================== */

console.log(
  "✈️ Smart Travel initialized successfully."
);
