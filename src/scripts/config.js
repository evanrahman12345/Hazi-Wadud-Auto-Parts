const DEFAULT_CONFIG = {
  address: 'Comilla, Chittagong, Bangladesh',
  phone: '+880 15483159',
  email: 'info@hajiwadudparts.com',
  csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQX5mMXfl-gxvEPGLJ-MB4ySw_-8xSNaCeImbFpBwvRF33NphvgTjIaKQ-I8Loc6t4SIEt3UiAv5lEz/pub?gid=2052837076&single=true&output=csv'
};

const STORAGE_KEY = 'hw_store_config';

export function getStoreConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch (err) {
    console.error('Error reading store config from localStorage', err);
  }
  return { ...DEFAULT_CONFIG };
}

export function saveStoreConfig(address, phone, email, csvUrl) {
  try {
    const config = { address, phone, email, csvUrl };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (err) {
    console.error('Error saving store config to localStorage', err);
    return false;
  }
}
