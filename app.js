/**
 * ProphetEstate AI - House Price Prediction & Real Estate Analytics Engine
 * Version: 3.4.0
 */

// City Base Valuation Index & Metro Multipliers
const CITY_MARKET_DATA = {
  san_francisco: { name: 'San Francisco, CA', baseSqFt: 980, medianRentSqFt: 4.2, taxRate: 0.0118, growthRate: 0.065, baseSchool: 8.5 },
  new_york: { name: 'Manhattan, New York, NY', baseSqFt: 1420, medianRentSqFt: 6.1, taxRate: 0.0135, growthRate: 0.058, baseSchool: 8.8 },
  seattle: { name: 'Seattle, WA', baseSqFt: 610, medianRentSqFt: 3.2, taxRate: 0.0102, growthRate: 0.072, baseSchool: 8.2 },
  austin: { name: 'Austin, TX', baseSqFt: 410, medianRentSqFt: 2.4, taxRate: 0.0195, growthRate: 0.084, baseSchool: 7.9 },
  miami: { name: 'Miami, FL', baseSqFt: 680, medianRentSqFt: 3.8, taxRate: 0.0125, growthRate: 0.091, baseSchool: 7.4 },
  los_angeles: { name: 'Los Angeles, CA', baseSqFt: 840, medianRentSqFt: 4.0, taxRate: 0.0122, growthRate: 0.062, baseSchool: 7.8 },
  denver: { name: 'Denver, CO', baseSqFt: 460, medianRentSqFt: 2.6, taxRate: 0.0098, growthRate: 0.068, baseSchool: 8.0 },
  chicago: { name: 'Chicago, IL', baseSqFt: 340, medianRentSqFt: 2.2, taxRate: 0.0210, growthRate: 0.045, baseSchool: 7.6 },
  boston: { name: 'Boston, MA', baseSqFt: 750, medianRentSqFt: 4.1, taxRate: 0.0115, growthRate: 0.059, baseSchool: 8.9 },
  london: { name: 'London, UK (Prime)', baseSqFt: 1150, medianRentSqFt: 5.2, taxRate: 0.0105, growthRate: 0.054, baseSchool: 8.6 }
};

// Preset Properties Data
const PRESETS = {
  silicon_valley: {
    name: 'Silicon Valley Smart Villa',
    city: 'san_francisco',
    propType: 'luxury_villa',
    quality: 'ultra',
    sqft: 4200,
    lotSize: 9500,
    bedrooms: 5,
    bathrooms: 4.5,
    stories: 2,
    yearBuilt: 2022,
    renovated: true,
    schoolRating: 9,
    safetyScore: 9,
    transitDist: 1.2,
    downtownDist: 8,
    amenities: ['pool', 'smart_home', 'solar', 'chef_kitchen', 'hardwood', 'view_mountain', 'basement'],
    garage: 3
  },
  manhattan_penthouse: {
    name: 'Manhattan Skyline Penthouse',
    city: 'new_york',
    propType: 'penthouse',
    quality: 'ultra',
    sqft: 3100,
    lotSize: 0,
    bedrooms: 3,
    bathrooms: 3.5,
    stories: 1,
    yearBuilt: 2020,
    renovated: true,
    schoolRating: 9,
    safetyScore: 9,
    transitDist: 0.1,
    downtownDist: 0.5,
    amenities: ['smart_home', 'chef_kitchen', 'hardwood', 'view_city', 'waterfront'],
    garage: 1
  },
  austin_tech: {
    name: 'Austin Tech Suburban Retreat',
    city: 'austin',
    propType: 'single_family',
    quality: 'custom',
    sqft: 2850,
    lotSize: 7800,
    bedrooms: 4,
    bathrooms: 3,
    stories: 2,
    yearBuilt: 2019,
    renovated: false,
    schoolRating: 8,
    safetyScore: 8,
    transitDist: 3.5,
    downtownDist: 12,
    amenities: ['smart_home', 'solar', 'chef_kitchen', 'hardwood'],
    garage: 2
  },
  miami_waterfront: {
    name: 'Miami Beach Waterfront Haven',
    city: 'miami',
    propType: 'luxury_villa',
    quality: 'ultra',
    sqft: 4800,
    lotSize: 12000,
    bedrooms: 6,
    bathrooms: 6,
    stories: 2,
    yearBuilt: 2023,
    renovated: true,
    schoolRating: 8,
    safetyScore: 8,
    transitDist: 2.0,
    downtownDist: 6,
    amenities: ['pool', 'smart_home', 'solar', 'chef_kitchen', 'hardwood', 'view_ocean', 'waterfront'],
    garage: 4
  }
};

// Application State
let currentValuation = null;
let savedProperties = JSON.parse(localStorage.getItem('prophet_saved_properties')) || [];
let activeTrendCity = 'san_francisco';
let activeTrendTimeframe = 5; // 5 or 10 years

// DOM Elements Cache
const elements = {};

document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  initTheme();
  setupEventListeners();
  setupSliders();
  runPrediction();
  renderSavedList();
  initTrendsChart();
  initMortgageChart();
  updateComparableProperties(elements.city ? elements.city.value : 'san_francisco');
});

function cacheElements() {
  elements.form = document.getElementById('predictionForm');
  elements.city = document.getElementById('citySelect');
  elements.propType = document.getElementsByName('propType');
  elements.quality = document.getElementsByName('qualityGrade');
  elements.sqft = document.getElementById('sqftRange');
  elements.sqftVal = document.getElementById('sqftVal');
  elements.lotSize = document.getElementById('lotSize');
  elements.bedrooms = document.getElementById('bedrooms');
  elements.bathrooms = document.getElementById('bathrooms');
  elements.yearBuilt = document.getElementById('yearBuilt');
  elements.yearBuiltVal = document.getElementById('yearBuiltVal');
  elements.garage = document.getElementById('garage');
  elements.stories = document.getElementById('stories');
  elements.schoolRating = document.getElementById('schoolRating');
  elements.schoolRatingVal = document.getElementById('schoolRatingVal');
  elements.safetyScore = document.getElementById('safetyScore');
  elements.safetyScoreVal = document.getElementById('safetyScoreVal');
  elements.renovated = document.getElementById('renovated');
  
  // Results
  elements.priceDisplay = document.getElementById('predictedPrice');
  elements.priceRangeMin = document.getElementById('priceRangeMin');
  elements.priceRangeMax = document.getElementById('priceRangeMax');
  elements.pricePerSqFt = document.getElementById('pricePerSqFt');
  elements.confidenceScore = document.getElementById('confidenceScore');
  elements.marketSentiment = document.getElementById('marketSentiment');
  
  // Breakdown Bars
  elements.barBase = document.getElementById('barBase');
  elements.barSqFt = document.getElementById('barSqFt');
  elements.barLocation = document.getElementById('barLocation');
  elements.barAmenities = document.getElementById('barAmenities');
  elements.barQuality = document.getElementById('barQuality');
  elements.valBase = document.getElementById('valBase');
  elements.valSqFt = document.getElementById('valSqFt');
  elements.valLocation = document.getElementById('valLocation');
  elements.valAmenities = document.getElementById('valAmenities');
  elements.valQuality = document.getElementById('valQuality');
  
  // Investment
  elements.estRent = document.getElementById('estMonthlyRent');
  elements.capRate = document.getElementById('capRate');
  elements.capRateCard = document.getElementById('capRateCard');
  elements.grossYield = document.getElementById('grossYield');
  elements.growth5yr = document.getElementById('growth5yr');
  elements.investGrowth5yr = document.getElementById('investGrowth5yr');
  
  // Mortgage Controls
  elements.downPaymentPct = document.getElementById('downPaymentPct');
  elements.downPaymentVal = document.getElementById('downPaymentVal');
  elements.interestRate = document.getElementById('interestRate');
  elements.interestRateVal = document.getElementById('interestRateVal');
  elements.loanTerm = document.getElementById('loanTerm');
  elements.monthlyTotal = document.getElementById('monthlyTotal');
  elements.mortgageDonut = document.getElementById('mortgageDonut');
  
  // Modals & UI
  elements.themeToggle = document.getElementById('themeToggleBtn');
  elements.savedCountBadge = document.getElementById('savedCountBadge');
  elements.savedContainer = document.getElementById('savedPropertiesContainer');
  elements.savedEmptyState = document.getElementById('savedEmptyState');
  elements.certificateModal = document.getElementById('certificateModal');
  elements.compareModal = document.getElementById('compareModal');
  elements.toastContainer = document.getElementById('toastContainer');
}

/* ==========================================================================
   Theme Management
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('prophet_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('prophet_theme', next);
  updateThemeIcon(next);
  renderTrendsChart();
  renderMortgageChart();
}

function updateThemeIcon(theme) {
  if (!elements.themeToggle) return;
  elements.themeToggle.innerHTML = theme === 'dark' 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
}

/* ==========================================================================
   Event Listeners & Slider Sync
   ========================================================================== */
function setupEventListeners() {
  if (elements.themeToggle) {
    elements.themeToggle.addEventListener('click', toggleTheme);
  }

  // Live auto-calculation on form input changes
  if (elements.form) {
    elements.form.addEventListener('input', () => {
      runPrediction();
    });
    elements.form.addEventListener('change', () => {
      runPrediction();
    });
  }

  // Presets click handling
  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const presetKey = card.getAttribute('data-preset');
      loadPreset(presetKey);
    });
  });

  // Mortgage slider listeners
  if (elements.downPaymentPct) {
    elements.downPaymentPct.addEventListener('input', (e) => {
      elements.downPaymentVal.innerText = `${e.target.value}%`;
      calculateMortgage();
    });
  }
  if (elements.interestRate) {
    elements.interestRate.addEventListener('input', (e) => {
      elements.interestRateVal.innerText = `${parseFloat(e.target.value).toFixed(1)}%`;
      calculateMortgage();
    });
  }
  if (elements.loanTerm) {
    elements.loanTerm.addEventListener('change', calculateMortgage);
  }

  // City change for trends chart sync
  if (elements.city) {
    elements.city.addEventListener('change', (e) => {
      activeTrendCity = e.target.value;
      renderTrendsChart();
      updateComparableProperties(e.target.value);
    });
  }

  // Trend timeframe filters
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeTrendTimeframe = parseInt(pill.getAttribute('data-years'), 10);
      renderTrendsChart();
    });
  });

  // Quick Action Buttons
  const btnSave = document.getElementById('btnSaveProperty');
  if (btnSave) btnSave.addEventListener('click', saveCurrentValuation);

  const btnPrint = document.getElementById('btnPrintCertificate');
  if (btnPrint) btnPrint.addEventListener('click', openCertificateModal);

  const btnCompare = document.getElementById('btnComparePortfolio');
  if (btnCompare) btnCompare.addEventListener('click', openCompareModal);

  const btnReset = document.getElementById('btnResetForm');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      elements.form.reset();
      setupSliders();
      runPrediction();
      showToast('Form reset to default values', 'info');
    });
  }

  // Close modals on backdrop click or close button
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('.modal-close-btn')) {
        modal.classList.remove('open');
      }
    });
  });
}

function setupSliders() {
  const syncRangeWithLabel = (input, labelEl, suffix = '') => {
    if (!input || !labelEl) return;
    const update = () => {
      const val = Number(input.value).toLocaleString();
      labelEl.innerText = `${val}${suffix}`;
    };
    input.addEventListener('input', update);
    update();
  };

  syncRangeWithLabel(elements.sqft, elements.sqftVal, ' sq ft');
  syncRangeWithLabel(elements.yearBuilt, elements.yearBuiltVal, '');
  syncRangeWithLabel(elements.schoolRating, elements.schoolRatingVal, ' / 10');
  syncRangeWithLabel(elements.safetyScore, elements.safetyScoreVal, ' / 10');
}

/* ==========================================================================
   Prediction Algorithm (Hedonic Multi-Factor Valuation Model)
   ========================================================================== */
function getFormValues() {
  const cityKey = elements.city.value;
  const propType = document.querySelector('input[name="propType"]:checked')?.value || 'single_family';
  const quality = document.querySelector('input[name="qualityGrade"]:checked')?.value || 'custom';
  const sqft = parseFloat(elements.sqft.value) || 2400;
  const lotSize = parseFloat(elements.lotSize.value) || 5000;
  const bedrooms = parseFloat(elements.bedrooms.value) || 3;
  const bathrooms = parseFloat(elements.bathrooms.value) || 2;
  const yearBuilt = parseInt(elements.yearBuilt.value) || 2016;
  const garage = parseInt(elements.garage.value) || 2;
  const stories = parseInt(elements.stories.value) || 2;
  const schoolRating = parseFloat(elements.schoolRating.value) || 8;
  const safetyScore = parseFloat(elements.safetyScore.value) || 8;
  const isRenovated = elements.renovated ? elements.renovated.checked : false;

  const amenities = [];
  document.querySelectorAll('.amenity-chip input[type="checkbox"]:checked').forEach(cb => {
    amenities.push(cb.value);
  });

  return {
    cityKey,
    propType,
    quality,
    sqft,
    lotSize,
    bedrooms,
    bathrooms,
    yearBuilt,
    garage,
    stories,
    schoolRating,
    safetyScore,
    isRenovated,
    amenities
  };
}

function calculateValuation(params) {
  const cityData = CITY_MARKET_DATA[params.cityKey] || CITY_MARKET_DATA.san_francisco;
  
  // 1. Base Square Footage Value (With progressive luxury curve)
  let sqftRate = cityData.baseSqFt;
  if (params.sqft > 3500) {
    sqftRate *= 1 + ((params.sqft - 3500) / 10000) * 0.25; // Luxury scale bonus
  } else if (params.sqft < 1000) {
    sqftRate *= 1.08; // High density efficiency premium
  }
  const rawSpaceValue = params.sqft * sqftRate;

  // 2. Property Type Multiplier
  const propTypeMultipliers = {
    single_family: 1.0,
    luxury_villa: 1.32,
    penthouse: 1.45,
    townhouse: 0.96,
    condo: 0.91,
    duplex: 1.08
  };
  const typeMult = propTypeMultipliers[params.propType] || 1.0;

  // 3. Craftsmanship / Quality Multiplier
  const qualityMultipliers = {
    standard: 0.88,
    custom: 1.15,
    ultra: 1.48
  };
  const qualityMult = qualityMultipliers[params.quality] || 1.15;

  // 4. Age Depreciation & Renovation Factor
  const currentYear = 2026;
  const age = Math.max(0, currentYear - params.yearBuilt);
  let ageMultiplier = 1.0 - (age * 0.007); // ~0.7% decay per year
  if (ageMultiplier < 0.65) ageMultiplier = 0.65;
  if (params.isRenovated) {
    ageMultiplier = Math.min(1.15, ageMultiplier + 0.22); // Renovation restores value
  }

  // 5. Bedrooms & Bathrooms Harmony Index
  const idealBaths = Math.max(1, Math.round(params.bedrooms * 0.75));
  let roomBonus = (params.bedrooms * 18000) + (params.bathrooms * 24000);
  if (params.bathrooms >= idealBaths) {
    roomBonus += 15000;
  }

  // 6. Lot Size Contribution
  let lotValue = 0;
  if (params.propType !== 'condo' && params.propType !== 'penthouse') {
    lotValue = Math.min(params.lotSize, 25000) * (cityData.baseSqFt * 0.055);
  }

  // 7. School District & Neighborhood Safety Multiplier
  const schoolBonus = (params.schoolRating - 5) * 0.035; // e.g. 10 rating = +17.5%
  const safetyBonus = (params.safetyScore - 5) * 0.025; // e.g. 10 rating = +12.5%
  const locationScoreMult = 1.0 + schoolBonus + safetyBonus;

  // 8. Granular Amenities Value
  let amenityValue = 0;
  let viewMultiplier = 1.0;

  params.amenities.forEach(item => {
    switch (item) {
      case 'pool': amenityValue += 55000; break;
      case 'smart_home': amenityValue += 28000; break;
      case 'solar': amenityValue += 35000; break;
      case 'chef_kitchen': amenityValue += 58000; break;
      case 'hardwood': amenityValue += 32000; break;
      case 'basement': amenityValue += 42000; break;
      case 'view_ocean': viewMultiplier += 0.22; break;
      case 'view_city': viewMultiplier += 0.14; break;
      case 'view_mountain': viewMultiplier += 0.12; break;
      case 'waterfront': viewMultiplier += 0.26; break;
    }
  });

  // Garage Value
  amenityValue += (params.garage * 19000);

  // Total Base Calculation
  const subtotal = (rawSpaceValue + roomBonus + lotValue) * typeMult * ageMultiplier;
  const totalValuation = (subtotal * qualityMult * locationScoreMult + amenityValue) * viewMultiplier;

  // Clean rounding
  const finalPrice = Math.round(totalValuation / 1000) * 1000;
  const priceRangeSpread = 0.045; // +/- 4.5% confidence band
  const minPrice = Math.round((finalPrice * (1 - priceRangeSpread)) / 1000) * 1000;
  const maxPrice = Math.round((finalPrice * (1 + priceRangeSpread)) / 1000) * 1000;
  const pricePerSqFt = Math.round(finalPrice / params.sqft);

  // Breakdown Component Decomposition
  const baseLandSpaceVal = Math.round((rawSpaceValue * 0.5) / 1000) * 1000;
  const structuralVal = Math.round((rawSpaceValue * 0.5 * typeMult * ageMultiplier + roomBonus + lotValue) / 1000) * 1000;
  const locationPremium = Math.round((subtotal * (locationScoreMult - 1.0)) / 1000) * 1000;
  const qualityPremium = Math.round((subtotal * (qualityMult - 1.0)) / 1000) * 1000;
  const amenitiesTotal = Math.round((amenityValue + (subtotal * (viewMultiplier - 1.0))) / 1000) * 1000;

  // Investment Metrics
  const monthlyRent = Math.round(params.sqft * cityData.medianRentSqFt * (qualityMult * 0.95 + (params.amenities.length * 0.03)));
  const annualRent = monthlyRent * 12;
  const grossYield = ((annualRent / finalPrice) * 100).toFixed(2);
  const estOperatingCosts = annualRent * 0.35; // 35% expenses (tax, maintenance, management)
  const netOperatingIncome = annualRent - estOperatingCosts;
  const capRate = ((netOperatingIncome / finalPrice) * 100).toFixed(2);
  const growth5yr = (cityData.growthRate * 5 * 100).toFixed(1);

  // Confidence Score
  const confidence = Math.min(99.4, 95.0 + (params.schoolRating > 6 ? 1.5 : 0) + (params.amenities.length > 2 ? 1.2 : 0) + (params.yearBuilt > 2000 ? 1.3 : 0)).toFixed(1);

  return {
    cityName: cityData.name,
    finalPrice,
    minPrice,
    maxPrice,
    pricePerSqFt,
    confidence,
    monthlyRent,
    annualRent,
    grossYield,
    capRate,
    growth5yr,
    components: {
      base: baseLandSpaceVal,
      structural: structuralVal,
      location: locationPremium,
      amenities: amenitiesTotal,
      quality: qualityPremium
    },
    params
  };
}

/* ==========================================================================
   UI Update & Live Estimation Engine
   ========================================================================== */
function runPrediction() {
  const params = getFormValues();
  currentValuation = calculateValuation(params);

  // Animate Price Output
  animateNumber(elements.priceDisplay, currentValuation.finalPrice, '$');
  elements.priceRangeMin.innerText = `$${currentValuation.minPrice.toLocaleString()}`;
  elements.priceRangeMax.innerText = `$${currentValuation.maxPrice.toLocaleString()}`;
  elements.pricePerSqFt.innerText = `$${currentValuation.pricePerSqFt.toLocaleString()}/sq ft`;
  elements.confidenceScore.innerText = `${currentValuation.confidence}%`;
  
  if (elements.marketSentiment) {
    elements.marketSentiment.innerText = currentValuation.params.schoolRating >= 8 ? 'High Demand Market' : 'Balanced Market';
  }

  // Value Breakdown Bars
  updateBreakdownBars(currentValuation);

  // Investment Metrics
  if (elements.estRent) elements.estRent.innerText = `$${currentValuation.monthlyRent.toLocaleString()}/mo`;
  if (elements.capRate) elements.capRate.innerText = `${currentValuation.capRate}%`;
  if (elements.capRateCard) elements.capRateCard.innerText = `${currentValuation.capRate}%`;
  if (elements.grossYield) elements.grossYield.innerText = `${currentValuation.grossYield}%`;
  if (elements.growth5yr) elements.growth5yr.innerText = `+${currentValuation.growth5yr}%`;
  if (elements.investGrowth5yr) elements.investGrowth5yr.innerText = `+${currentValuation.growth5yr}%`;

  // Calculate Mortgage for current price
  calculateMortgage();
}

function animateNumber(element, targetValue, prefix = '', suffix = '') {
  if (!element) return;
  const duration = 650;
  const start = parseInt(element.getAttribute('data-current') || '0', 10);
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (targetValue - start) * easeProgress);

    element.innerHTML = `<span class="currency">${prefix}</span>${current.toLocaleString()}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.setAttribute('data-current', targetValue);
    }
  }
  requestAnimationFrame(update);
}

function updateBreakdownBars(val) {
  const total = val.finalPrice;
  const comp = val.components;

  const calcPct = (amount) => Math.max(8, Math.min(100, Math.round((Math.max(0, amount) / total) * 100)));

  if (elements.barBase) elements.barBase.style.width = `${calcPct(comp.base)}%`;
  if (elements.barSqFt) elements.barSqFt.style.width = `${calcPct(comp.structural)}%`;
  if (elements.barLocation) elements.barLocation.style.width = `${calcPct(comp.location)}%`;
  if (elements.barAmenities) elements.barAmenities.style.width = `${calcPct(comp.amenities)}%`;
  if (elements.barQuality) elements.barQuality.style.width = `${calcPct(comp.quality)}%`;

  if (elements.valBase) elements.valBase.innerText = `$${comp.base.toLocaleString()}`;
  if (elements.valSqFt) elements.valSqFt.innerText = `$${comp.structural.toLocaleString()}`;
  if (elements.valLocation) elements.valLocation.innerText = `$${comp.location.toLocaleString()}`;
  if (elements.valAmenities) elements.valAmenities.innerText = `$${comp.amenities.toLocaleString()}`;
  if (elements.valQuality) elements.valQuality.innerText = `$${comp.quality.toLocaleString()}`;
}

/* ==========================================================================
   Preset Loader
   ========================================================================== */
function loadPreset(presetKey) {
  const data = PRESETS[presetKey];
  if (!data) return;

  elements.city.value = data.city;
  activeTrendCity = data.city;
  
  // Set Property Type
  const typeRadio = document.querySelector(`input[name="propType"][value="${data.propType}"]`);
  if (typeRadio) typeRadio.checked = true;

  // Set Quality Grade
  const qualRadio = document.querySelector(`input[name="qualityGrade"][value="${data.quality}"]`);
  if (qualRadio) qualRadio.checked = true;

  // Set Numeric Values
  elements.sqft.value = data.sqft;
  elements.lotSize.value = data.lotSize;
  elements.bedrooms.value = data.bedrooms;
  elements.bathrooms.value = data.bathrooms;
  elements.stories.value = data.stories;
  elements.yearBuilt.value = data.yearBuilt;
  elements.garage.value = data.garage;
  elements.schoolRating.value = data.schoolRating;
  elements.safetyScore.value = data.safetyScore;
  if (elements.renovated) elements.renovated.checked = data.renovated;

  // Set Amenities Checkboxes
  document.querySelectorAll('.amenity-chip input[type="checkbox"]').forEach(cb => {
    cb.checked = data.amenities.includes(cb.value);
  });

  setupSliders();
  runPrediction();
  renderTrendsChart();
  updateComparableProperties(data.city);
  showToast(`Loaded Preset: ${data.name}`, 'success');
}

/* ==========================================================================
   Mortgage & Monthly Cost Calculator & Donut Canvas
   ========================================================================== */
let mortgageChartData = {
  principal: 0,
  tax: 0,
  insurance: 0,
  hoa: 0,
  total: 0
};

function calculateMortgage() {
  if (!currentValuation) return;

  const price = currentValuation.finalPrice;
  const downPct = parseFloat(elements.downPaymentPct?.value || 20) / 100;
  const downPayment = price * downPct;
  const loanAmount = price - downPayment;
  
  const annualInterest = parseFloat(elements.interestRate?.value || 6.5) / 100;
  const monthlyRate = annualInterest / 12;
  const termYears = parseInt(elements.loanTerm?.value || 30, 10);
  const totalMonths = termYears * 12;

  // Monthly Principal & Interest: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
  let monthlyPI = 0;
  if (monthlyRate > 0) {
    monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  } else {
    monthlyPI = loanAmount / totalMonths;
  }

  // Monthly Property Tax (~1.2% per year)
  const cityData = CITY_MARKET_DATA[currentValuation.params.cityKey] || CITY_MARKET_DATA.san_francisco;
  const monthlyTax = (price * cityData.taxRate) / 12;

  // Monthly Homeowners Insurance (~0.45% per year)
  const monthlyInsurance = (price * 0.0045) / 12;

  // HOA / Maintenance Estimate
  let monthlyHOA = 0;
  if (currentValuation.params.propType === 'condo' || currentValuation.params.propType === 'penthouse') {
    monthlyHOA = Math.round(currentValuation.params.sqft * 0.65);
  } else if (currentValuation.params.propType === 'townhouse') {
    monthlyHOA = 220;
  } else {
    monthlyHOA = 85;
  }

  const totalMonthly = Math.round(monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA);

  mortgageChartData = {
    principal: Math.round(monthlyPI),
    tax: Math.round(monthlyTax),
    insurance: Math.round(monthlyInsurance),
    hoa: Math.round(monthlyHOA),
    total: totalMonthly
  };

  if (elements.monthlyTotal) {
    elements.monthlyTotal.innerText = `$${totalMonthly.toLocaleString()}`;
  }

  // Update Legend Values
  const legPI = document.getElementById('legPI');
  const legTax = document.getElementById('legTax');
  const legIns = document.getElementById('legIns');
  const legHOA = document.getElementById('legHOA');
  if (legPI) legPI.innerText = `$${mortgageChartData.principal.toLocaleString()}`;
  if (legTax) legTax.innerText = `$${mortgageChartData.tax.toLocaleString()}`;
  if (legIns) legIns.innerText = `$${mortgageChartData.insurance.toLocaleString()}`;
  if (legHOA) legHOA.innerText = `$${mortgageChartData.hoa.toLocaleString()}`;

  renderMortgageChart();
}

function initMortgageChart() {
  calculateMortgage();
}

function renderMortgageChart() {
  const canvas = elements.mortgageDonut;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 140;

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);

  const total = mortgageChartData.total || 1;
  const slices = [
    { value: mortgageChartData.principal, color: '#6366F1' }, // Indigo
    { value: mortgageChartData.tax, color: '#06B6D4' },       // Cyan
    { value: mortgageChartData.insurance, color: '#10B981' }, // Emerald
    { value: mortgageChartData.hoa, color: '#F59E0B' }        // Amber
  ];

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = 56;
  const innerRadius = 40;

  ctx.clearRect(0, 0, size, size);

  let currentAngle = -Math.PI / 2;

  slices.forEach(slice => {
    const sliceAngle = (slice.value / total) * (Math.PI * 2);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    currentAngle += sliceAngle;
  });
}

/* ==========================================================================
   Interactive Trends Chart (Canvas Line Chart)
   ========================================================================== */
function initTrendsChart() {
  const canvas = document.getElementById('trendLineChart');
  if (!canvas) return;

  // Handle high-DPI canvas rendering
  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    renderTrendsChart();
  };

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Mouse hover tooltip
  canvas.addEventListener('mousemove', (e) => {
    handleTrendHover(e, canvas);
  });
  canvas.addEventListener('mouseleave', () => {
    renderTrendsChart();
  });
}

function getTrendDataPoints(cityKey, years) {
  const city = CITY_MARKET_DATA[cityKey] || CITY_MARKET_DATA.san_francisco;
  const baseRate = city.growthRate;
  const currentYear = 2026;
  const startYear = currentYear - years;
  
  const points = [];
  let basePrice = currentValuation ? currentValuation.finalPrice : 850000;
  
  // Calculate historical prices by working backwards
  const rawHist = [];
  let tempVal = basePrice;
  for (let i = 0; i <= years; i++) {
    rawHist.unshift({
      year: currentYear - i,
      price: Math.round(tempVal)
    });
    // Add realistic market variance to annual growth rate
    const variance = 0.96 + (Math.sin(i * 1.5) * 0.04);
    tempVal = tempVal / (1 + (baseRate * variance));
  }
  return rawHist;
}

function renderTrendsChart(hoverIndex = -1) {
  const canvas = document.getElementById('trendLineChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  const data = getTrendDataPoints(activeTrendCity, activeTrendTimeframe);
  const padding = { top: 35, right: 30, bottom: 40, left: 70 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.92;
  const maxPrice = Math.max(...prices) * 1.08;

  const getX = (idx) => padding.left + (idx / (data.length - 1)) * graphWidth;
  const getY = (val) => padding.top + graphHeight - ((val - minPrice) / (maxPrice - minPrice)) * graphHeight;

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)';
  const textColor = isDark ? '#64748B' : '#94A3B8';

  // Draw Horizontal Gridlines & Y-Axis Labels
  const yTicks = 4;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = '11px Plus Jakarta Sans, sans-serif';
  ctx.fillStyle = textColor;

  for (let i = 0; i <= yTicks; i++) {
    const val = minPrice + ((maxPrice - minPrice) / yTicks) * i;
    const y = getY(val);

    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillText(`$${(Math.round(val / 1000)).toLocaleString()}k`, padding.left - 12, y);
  }

  // Draw X-Axis Labels (Years)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  data.forEach((d, i) => {
    const x = getX(i);
    ctx.fillText(d.year, x, height - padding.bottom + 12);
  });

  // Draw Area Gradient Fill under line
  const grad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  grad.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
  grad.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

  ctx.beginPath();
  data.forEach((d, i) => {
    const x = getX(i);
    const y = getY(d.price);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevX = getX(i - 1);
      const prevY = getY(data[i - 1].price);
      const cpX = (prevX + x) / 2;
      ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
    }
  });
  ctx.lineTo(getX(data.length - 1), height - padding.bottom);
  ctx.lineTo(getX(0), height - padding.bottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Draw Smooth Curve Line
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = getX(i);
    const y = getY(d.price);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevX = getX(i - 1);
      const prevY = getY(data[i - 1].price);
      const cpX = (prevX + x) / 2;
      ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
    }
  });
  ctx.strokeStyle = '#6366F1';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Draw Data Points & Highlight Hover
  data.forEach((d, i) => {
    const x = getX(i);
    const y = getY(d.price);
    const isHovered = i === hoverIndex;

    ctx.beginPath();
    ctx.arc(x, y, isHovered ? 7 : 4.5, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? '#06B6D4' : '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw Tooltip if hovered
    if (isHovered) {
      const tooltipText = `${d.year}: $${d.price.toLocaleString()}`;
      ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
      const textWidth = ctx.measureText(tooltipText).width;
      const boxW = textWidth + 20;
      const boxH = 28;
      let boxX = x - boxW / 2;
      let boxY = y - 38;

      if (boxX < padding.left) boxX = padding.left;
      if (boxX + boxW > width - padding.right) boxX = width - padding.right - boxW;

      ctx.fillStyle = isDark ? '#0F172A' : '#1E293B';
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 6);
      ctx.fill();
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tooltipText, boxX + boxW / 2, boxY + boxH / 2);
    }
  });
}

function handleTrendHover(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const padding = { left: 70, right: 30 };
  const graphWidth = rect.width - padding.left - padding.right;
  const data = getTrendDataPoints(activeTrendCity, activeTrendTimeframe);

  let closestIndex = -1;
  let minDistance = Infinity;

  data.forEach((d, i) => {
    const pointX = padding.left + (i / (data.length - 1)) * graphWidth;
    const dist = Math.abs(mouseX - pointX);
    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = i;
    }
  });

  if (minDistance < 40) {
    renderTrendsChart(closestIndex);
  } else {
    renderTrendsChart(-1);
  }
}

function updateComparableProperties(cityKey) {
  const compsGrid = document.getElementById('compsGrid');
  if (!compsGrid) return;

  const cityName = CITY_MARKET_DATA[cityKey]?.name || 'San Francisco, CA';
  const basePrice = currentValuation ? currentValuation.finalPrice : 950000;

  const comps = [
    {
      title: 'Modern Architectural Haven',
      address: `142 Summit Ridge, ${cityName}`,
      price: Math.round(basePrice * 1.04),
      beds: currentValuation?.params.bedrooms || 4,
      baths: currentValuation?.params.bathrooms || 3,
      sqft: Math.round((currentValuation?.params.sqft || 2500) * 1.05),
      tag: 'Sold 8 Days Ago'
    },
    {
      title: 'Contemporary Smart Residence',
      address: `880 Highland Way, ${cityName}`,
      price: Math.round(basePrice * 0.97),
      beds: currentValuation?.params.bedrooms || 3,
      baths: currentValuation?.params.bathrooms || 2.5,
      sqft: Math.round((currentValuation?.params.sqft || 2500) * 0.95),
      tag: 'Sold 2 Weeks Ago'
    },
    {
      title: 'Luxury Designer Estate',
      address: `415 Parkside Boulevard, ${cityName}`,
      price: Math.round(basePrice * 1.12),
      beds: (currentValuation?.params.bedrooms || 4) + 1,
      baths: (currentValuation?.params.bathrooms || 3) + 0.5,
      sqft: Math.round((currentValuation?.params.sqft || 2500) * 1.18),
      tag: 'Sold Last Month'
    }
  ];

  compsGrid.innerHTML = comps.map(comp => `
    <div class="comp-card">
      <div class="comp-thumb">
        <div class="comp-tag">${comp.tag}</div>
        <div class="comp-thumb-gradient"></div>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </div>
      <div class="comp-content">
        <div class="comp-price">$${comp.price.toLocaleString()}</div>
        <div class="comp-address">${comp.address}</div>
        <div class="comp-specs">
          <span><strong>${comp.beds}</strong> Beds</span>
          <span><strong>${comp.baths}</strong> Baths</span>
          <span><strong>${comp.sqft.toLocaleString()}</strong> sq ft</span>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   Saved Valuations Portfolio & Compare Modal
   ========================================================================== */
function saveCurrentValuation() {
  if (!currentValuation) return;

  const newEntry = {
    id: 'prop_' + Date.now(),
    title: `${currentValuation.cityName} Residence`,
    cityName: currentValuation.cityName,
    price: currentValuation.finalPrice,
    pricePerSqFt: currentValuation.pricePerSqFt,
    sqft: currentValuation.params.sqft,
    bedrooms: currentValuation.params.bedrooms,
    bathrooms: currentValuation.params.bathrooms,
    propType: currentValuation.params.propType,
    quality: currentValuation.params.quality,
    monthlyRent: currentValuation.monthlyRent,
    capRate: currentValuation.capRate,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  savedProperties.unshift(newEntry);
  if (savedProperties.length > 8) savedProperties.pop();

  localStorage.setItem('prophet_saved_properties', JSON.stringify(savedProperties));
  renderSavedList();
  showToast('Valuation saved to your portfolio!', 'success');

  const btnSave = document.getElementById('btnSaveProperty');
  if (btnSave) {
    btnSave.classList.add('saved');
    setTimeout(() => btnSave.classList.remove('saved'), 2000);
  }
}

function deleteSavedProperty(id) {
  savedProperties = savedProperties.filter(item => item.id !== id);
  localStorage.setItem('prophet_saved_properties', JSON.stringify(savedProperties));
  renderSavedList();
  showToast('Property removed from portfolio', 'warning');
}

function renderSavedList() {
  if (!elements.savedContainer || !elements.savedEmptyState) return;

  if (elements.savedCountBadge) {
    elements.savedCountBadge.innerText = savedProperties.length;
  }

  if (savedProperties.length === 0) {
    elements.savedEmptyState.style.display = 'block';
    elements.savedContainer.innerHTML = '';
    return;
  }

  elements.savedEmptyState.style.display = 'none';

  elements.savedContainer.innerHTML = savedProperties.map(item => `
    <div class="saved-card">
      <div class="saved-card-header">
        <div>
          <h4 class="saved-card-title">${item.title}</h4>
          <span class="saved-card-date">Valued on ${item.date}</span>
        </div>
        <button class="btn-delete-saved" onclick="deleteSavedProperty('${item.id}')" title="Delete">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
      <div class="saved-card-price">$${item.price.toLocaleString()}</div>
      <div class="saved-card-specs">
        <span class="spec-pill">${item.sqft.toLocaleString()} sq ft</span>
        <span class="spec-pill">${item.bedrooms} Beds / ${item.bathrooms} Baths</span>
        <span class="spec-pill">$${item.pricePerSqFt}/sq ft</span>
        <span class="spec-pill">${item.capRate}% Cap Rate</span>
      </div>
    </div>
  `).join('');
}

function openCompareModal() {
  if (savedProperties.length === 0) {
    showToast('Please save at least one property to compare', 'warning');
    return;
  }

  const tableBody = document.getElementById('compareTableBody');
  if (!tableBody) return;

  // Compare up to 3 saved properties + current prediction
  const itemsToCompare = [...savedProperties.slice(0, 3)];

  tableBody.innerHTML = `
    <tr>
      <th>Metric</th>
      ${itemsToCompare.map((item, idx) => `<th>Property #${idx + 1} (${item.cityName})</th>`).join('')}
    </tr>
    <tr>
      <td><strong>Valuation</strong></td>
      ${itemsToCompare.map(item => `<td style="color:var(--accent-secondary);font-weight:800;font-size:1.1rem;">$${item.price.toLocaleString()}</td>`).join('')}
    </tr>
    <tr>
      <td><strong>Price / Sq Ft</strong></td>
      ${itemsToCompare.map(item => `<td>$${item.pricePerSqFt}</td>`).join('')}
    </tr>
    <tr>
      <td><strong>Living Area</strong></td>
      ${itemsToCompare.map(item => `<td>${item.sqft.toLocaleString()} sq ft</td>`).join('')}
    </tr>
    <tr>
      <td><strong>Bed / Bath</strong></td>
      ${itemsToCompare.map(item => `<td>${item.bedrooms} bd / ${item.bathrooms} ba</td>`).join('')}
    </tr>
    <tr>
      <td><strong>Est. Rent</strong></td>
      ${itemsToCompare.map(item => `<td>$${item.monthlyRent.toLocaleString()}/mo</td>`).join('')}
    </tr>
    <tr>
      <td><strong>Cap Rate</strong></td>
      ${itemsToCompare.map(item => `<td>${item.capRate}%</td>`).join('')}
    </tr>
  `;

  elements.compareModal.classList.add('open');
}

/* ==========================================================================
   Valuation Certificate Modal & PDF/Print Action
   ========================================================================== */
function openCertificateModal() {
  if (!currentValuation) return;

  const certContent = document.getElementById('certificateContent');
  if (!certContent) return;

  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const certId = 'PE-' + Math.floor(100000 + Math.random() * 900000);

  certContent.innerHTML = `
    <div class="certificate-paper">
      <div class="cert-header">
        <div>
          <div class="cert-brand">ProphetEstate AI</div>
          <div style="font-size: 0.8rem; color: #64748B;">Automated Real Estate Appraisal & Market Valuation</div>
        </div>
        <div class="cert-stamp">Verified AI Appraisal</div>
      </div>

      <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#475569; margin-bottom:1rem;">
        <div><strong>Certificate ID:</strong> ${certId}</div>
        <div><strong>Valuation Date:</strong> ${dateStr}</div>
      </div>

      <div class="cert-val-box">
        <div style="font-size:0.85rem; text-transform:uppercase; letter-spacing:0.06em; color:#64748B; font-weight:700;">Fair Market Estimated Value</div>
        <div class="cert-price">$${currentValuation.finalPrice.toLocaleString()}</div>
        <div style="font-size:0.9rem; color:#475569;">Confidence Interval: $${currentValuation.minPrice.toLocaleString()} - $${currentValuation.maxPrice.toLocaleString()} (±4.5%)</div>
      </div>

      <div class="cert-grid">
        <div class="cert-item"><span>Target Metro:</span> <strong>${currentValuation.cityName}</strong></div>
        <div class="cert-item"><span>Property Style:</span> <strong>${currentValuation.params.propType.replace('_', ' ').toUpperCase()}</strong></div>
        <div class="cert-item"><span>Gross Living Area:</span> <strong>${currentValuation.params.sqft.toLocaleString()} sq ft</strong></div>
        <div class="cert-item"><span>Bedrooms / Bathrooms:</span> <strong>${currentValuation.params.bedrooms} / ${currentValuation.params.bathrooms}</strong></div>
        <div class="cert-item"><span>Craftsmanship Grade:</span> <strong>${currentValuation.params.quality.toUpperCase()}</strong></div>
        <div class="cert-item"><span>Year Built:</span> <strong>${currentValuation.params.yearBuilt}</strong></div>
        <div class="cert-item"><span>School Rating Score:</span> <strong>${currentValuation.params.schoolRating} / 10</strong></div>
        <div class="cert-item"><span>Price per Sq Ft:</span> <strong>$${currentValuation.pricePerSqFt}</strong></div>
      </div>

      <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px dashed #CBD5E1; font-size: 0.75rem; color: #94A3B8; text-align: center;">
        This automated valuation is generated using ProphetEstate's multi-variable neural regression model based on current macroeconomic real estate metrics. Valid for initial portfolio screening and appraisal advisory.
      </div>
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
      <button class="btn-secondary" onclick="document.getElementById('certificateModal').classList.remove('open')">Close</button>
      <button class="btn-primary" onclick="window.print()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        Print / Save as PDF
      </button>
    </div>
  `;

  elements.certificateModal.classList.add('open');
}

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
function showToast(message, type = 'info') {
  if (!elements.toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
    <span>${message}</span>
  `;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
