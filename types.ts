export enum CurrencyCode {
  USD = 'USD',
  MXN = 'MXN',
}

export interface ExchangeRateResponse {
  result: string;
  provider: string;
  time_last_update_utc: string;
  rates: {
    [key: string]: number;
  };
}

export interface HistoricalRates {
  start_date: string;
  end_date: string;
  base: string;
  rates: {
    [date: string]: {
      [currency: string]: number;
    };
  };
}

export interface ConversionState {
  amount: string;
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number | null;
  lastUpdated: string | null;
}

export interface ChartDataPoint {
  date: string;
  rate: number;
}