import { ExchangeRateResponse, HistoricalRates, ChartDataPoint } from '../types';

const API_URL = 'https://open.er-api.com/v6/latest/USD';
const HISTORY_API_URL = 'https://api.frankfurter.app';

/**
 * Fetches the current exchange rate from a free, reliable public API.
 */
export const fetchExchangeRates = async (): Promise<ExchangeRateResponse> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: ExchangeRateResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch rates:', error);
    return {
      result: 'error',
      provider: 'fallback',
      time_last_update_utc: new Date().toUTCString(),
      rates: {
        MXN: 19.50, // Conservative fallback
        USD: 1,
      }
    };
  }
};

/**
 * Fetches historical rates for the last 15 days using Frankfurter API (Free, no key).
 */
export const fetchHistoricalRates = async (): Promise<ChartDataPoint[]> => {
  try {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 15); // Changed from 30 to 15 days

    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    
    const url = `${HISTORY_API_URL}/${formatDate(start)}..${formatDate(end)}?from=USD&to=MXN`;
    
    const response = await fetch(url);
    if (!response.ok) return [];

    const data: HistoricalRates = await response.json();
    
    // Convert object to array
    const points: ChartDataPoint[] = Object.entries(data.rates).map(([date, rates]) => ({
      date,
      rate: rates['MXN'] || 0
    }));

    return points;
  } catch (error) {
    console.error("Failed to fetch history", error);
    return [];
  }
};