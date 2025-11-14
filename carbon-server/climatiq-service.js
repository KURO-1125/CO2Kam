const axios = require('axios');
const { getActivityConfig } = require('./activity-config');

class ClimatiqService {
  constructor() {
    this.baseURL = 'https://api.climatiq.io/data/v1';
    this.timeout = 10000;
  }

  async calculateEmissions(activity, value) {
    this.validateInputs(activity, value);

    const config = getActivityConfig(activity);
    if (!config) {
      throw new Error(`Unsupported activity: ${activity}`);
    }

    if (!process.env.CLIMATIQ_API_KEY) {
      throw new Error('Climatiq API key not configured');
    }

    // Try primary activity ID first
    let requestData = this.prepareRequestData(config, value);

    try {
      const response = await this.makeApiRequest(requestData);
      return this.formatResponse(response.data, activity, value, config);
    } catch (error) {
      // If primary ID fails and we have fallbacks, try them
      if (config.fallbackIds && error.response?.status === 422) {
        console.log(`Primary activity ID failed for ${activity}, trying fallbacks...`);
        
        for (const fallbackId of config.fallbackIds) {
          try {
            const fallbackConfig = {
              ...config,
              emissionFactor: { ...config.emissionFactor, activity_id: fallbackId }
            };
            requestData = this.prepareRequestData(fallbackConfig, value);
            const response = await this.makeApiRequest(requestData);
            console.log(`Success with fallback ID: ${fallbackId}`);
            return this.formatResponse(response.data, activity, value, config);
          } catch (fallbackError) {
            console.log(`Fallback ID ${fallbackId} also failed`);
            continue;
          }
        }
      }
      
      const enhancedError = this.handleApiError(error);
      enhancedError.message = `${enhancedError.message}. Activity: ${activity}. This might be due to an incorrect activity ID or missing emission factors for your region.`;
      throw enhancedError;
    }
  }

  validateInputs(activity, value) {
    if (!activity || value === undefined || value === null) {
      const error = new Error('Activity and value are required');
      error.code = 'INVALID_INPUT';
      throw error;
    }

    if (typeof value !== 'number' || value <= 0) {
      const error = new Error('Value must be a positive number');
      error.code = 'INVALID_VALUE';
      throw error;
    }
  }

  prepareRequestData(config, value) {
    const requestData = {
      emission_factor: {
        ...config.emissionFactor,
        data_version: "27.27"
      },
      parameters: {
        [config.parameterName]: value,
        [`${config.parameterName}_unit`]: config.unit
      }
    };

    // Add region if specified in config
    if (config.emissionFactor.region) {
      requestData.emission_factor.region = config.emissionFactor.region;
    }

    return requestData;
  }

  async makeApiRequest(requestData) {
    console.log('Climatiq API Request:', JSON.stringify(requestData, null, 2));
    
    try {
      const response = await axios.post(`${this.baseURL}/estimate`, requestData, {
        headers: {
          'Authorization': `Bearer ${process.env.CLIMATIQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });
      return response;
    } catch (error) {
      console.log('Climatiq API Error Response:', error.response?.data);
      throw error;
    }
  }

  formatResponse(apiData, activity, value, config) {
    return {
      co2e: apiData.co2e,
      activity: activity,
      value: value,
      unit: config.unit,
      timestamp: new Date().toISOString()
    };
  }

  handleApiError(error) {
    if (error.response?.status) {
      const status = error.response.status;
      const message = error.response.data?.message || 'External API error';
      
      const apiError = new Error(
        status === 401 ? 'Invalid API credentials' :
        status === 429 ? 'API rate limit exceeded. Please try again later.' :
        `External API error: ${message}`
      );
      apiError.code = status === 401 ? 'API_AUTH_ERROR' : 
                     status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'EXTERNAL_API_ERROR';
      apiError.statusCode = status === 429 ? 429 : 500;
      return apiError;
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      const timeoutError = new Error('Request timeout. Please try again.');
      timeoutError.code = 'TIMEOUT_ERROR';
      timeoutError.statusCode = 504;
      return timeoutError;
    }

    const genericError = new Error('Internal server error');
    genericError.code = 'INTERNAL_ERROR';
    genericError.statusCode = 500;
    return genericError;
  }

}


module.exports = new ClimatiqService();