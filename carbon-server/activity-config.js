const ACTIVITY_CONFIG_IN_EXTENDED = {

  electricity_residential: {
    emissionFactor: { activity_id: 'electricity-supply_grid-source_supplier_mix' },
    parameterName: 'energy', unit: 'kWh', unitType: 'Energy', category: 'energy',
    note: 'India grid mix — use region: "IN" and year when possible.'
  },
  electricity_commercial: {
    emissionFactor: { activity_id: 'electricity-supply_grid-source_supplier_mix' },
    parameterName: 'energy', unit: 'kWh', unitType: 'Energy', category: 'energy',
    note: 'Same grid mix; optionally differentiate residential vs commercial in UI.'
  },
  lpg: {
    emissionFactor: { activity_id: 'fuel-type_liquefied_petroleum_gases-fuel_use_na' },
    fallbackIds: [
      'fuel_combustion-fuel_type_lpg',
      'household_fuel-fuel_type_lpg',
      'fuel-type_lpg'
    ],
    parameterName: 'money', unit: 'inr', unitType: 'Money', category: 'household',
    note: 'LPG spend-based calculation in Indian Rupees.'
  },
  natural_gas: {
    emissionFactor: { activity_id: 'fuel-type_natural_gas_distribution-fuel_use_na' },
    fallbackIds: [
      'fuel_combustion-fuel_type_natural_gas',
      'household_fuel-fuel_type_natural_gas',
      'fuel-type_natural_gas'
    ],
    parameterName: 'money', unit: 'inr', unitType: 'Money', category: 'household',
    note: 'Natural gas spend-based calculation in Indian Rupees.'
  },


  car_petrol: {
    emissionFactor: { 
      activity_id: 'passenger_vehicle-vehicle_type_car-fuel_source_petrol-engine_size_na-vehicle_age_na-vehicle_weight_na'
    },
    parameterName: 'distance', unit: 'km', unitType: 'Distance', category: 'transport',
    note: 'If available, use engine size / age variants for accuracy.'
  },
  car_diesel: {
    emissionFactor: { activity_id: 'passenger_vehicle-vehicle_type_car-fuel_source_diesel-engine_size_na-vehicle_age_na-vehicle_weight_na' },
    parameterName: 'distance', unit: 'km', unitType: 'Distance', category: 'transport',
    note: ''
  },
  motorcycle_petrol: {
    emissionFactor: { activity_id: 'passenger_vehicle-vehicle_type_motorcycle-fuel_source_gasoline-engine_size_na-vehicle_age_na-vehicle_weight_na' },
    parameterName: 'distance', unit: 'km', unitType: 'Distance', category: 'transport',
    note: 'Motorcycle engine size variants (e.g. <150cc) may exist.'
  },


  train_urban_metro: {
    emissionFactor: { activity_id: 'passenger_train-route_type_urban-fuel_source_na' },
    parameterName: 'distance', unit: 'km', unitType: 'Distance', category: 'transport',
    note: 'Metro/urban rail — often lower per-passenger than cars.'
  },
  train_intercity: {
    emissionFactor: { activity_id: 'passenger_train-route_type_intercity-fuel_source_na' },
    parameterName: 'distance', unit: 'km', unitType: 'Distance', category: 'transport',
    note: ''
  },
  flight_domestic: {
    emissionFactor: { activity_id: 'passenger_flight-route_type_domestic-aircraft_type_na-distance_na-class_na-rf_included-distance_uplift_included' },
    parameterName: 'distance', unit: 'km', unitType: 'Distance', category: 'transport',
    note: 'Choose RF-included or excluded variant as needed.'
  },
  flight_international: {
    emissionFactor: { activity_id: 'passenger_flight-route_type_outside_uk-aircraft_type_na-distance_na-class_economy-rf_included-distance_uplift_included' },
    fallbackIds: [
      'passenger_flight-route_type_short_haul',
      'passenger_flight-route_type_long_haul'
    ],
    parameterName: 'distance', unit: 'km', unitType: 'Distance', category: 'transport',
    note: 'International flight.'
  },

  rice: {
    emissionFactor: { activity_id: 'consumer_goods-type_processed_rice' },
    fallbackIds: [
      'food-type_rice',
      'consumer_goods-type_rice',
      'food_rice'
    ],
    parameterName: 'money', unit: 'inr', unitType: 'Money', category: 'food',
    note: 'Rice spend-based calculation in Indian Rupees.'
  },
  wheat: {
    emissionFactor: { activity_id: 'food-type_wheat_grain_dried_at_farm-origin_region_multi_region' },
    fallbackIds: [
      'food-type_wheat',
      'consumer_goods-type_wheat',
      'food_wheat'
    ],
    parameterName: 'weight', unit: 'kg', unitType: 'Weight', category: 'food',
    note: 'Wheat consumption in kilograms.'
  },
  pulses: {
    emissionFactor: { activity_id: 'food-type_beans_pulses-origin_region_global' },
    fallbackIds: [
      'food-type_legumes',
      'consumer_goods-type_pulses',
      'food_pulses'
    ],
    parameterName: 'weight', unit: 'kg', unitType: 'Weight', category: 'food',
    note: 'Lentils, beans etc. consumption in kilograms.'
  },

  eggs: {
    emissionFactor: { activity_id: 'livestock_farming-type_poultry_and_egg_production' },
    fallbackIds: [
      'food-type_eggs',
      'consumer_goods-type_eggs',
      'food_eggs'
    ],
    parameterName: 'money', unit: 'inr', unitType: 'Money', category: 'food',
    note: 'Eggs spend-based calculation in Indian Rupees.'
  },
  chicken_meat: {
    emissionFactor: { activity_id: 'food-type_chicken_meat-origin_region_oceania' },
    fallbackIds: [
      'food-type_chicken',
      'consumer_goods-type_chicken',
      'food_chicken'
    ],
    parameterName: 'weight', unit: 'kg', unitType: 'Weight', category: 'food',
    note: 'Chicken meat consumption in kilograms.'
  },



};

function getActivityConfig(activity) {
  return ACTIVITY_CONFIG_IN_EXTENDED[activity] || null;
}

function getSupportedActivities() {
  return Object.keys(ACTIVITY_CONFIG_IN_EXTENDED);
}

function getActivitiesByCategory(category) {
  return Object.keys(ACTIVITY_CONFIG_IN_EXTENDED).filter(
    activity => ACTIVITY_CONFIG_IN_EXTENDED[activity].category === category
  );
}

module.exports = {
  ACTIVITY_CONFIG_IN_EXTENDED,
  getActivityConfig,
  getSupportedActivities,
  getActivitiesByCategory
};
