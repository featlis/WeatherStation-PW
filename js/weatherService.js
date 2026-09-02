/**
 * WeatherService
 * Open-Meteo API client with Session-Fixed Biome & Seed caching
 * Real-time global weather data fetching with zero API keys
 */

import { BIOME_TYPES } from './renderer/landscape.js';

export const BIOME_LABELS = {
  [BIOME_TYPES.MEGALOPOLIS]: '星間摩天楼 (Megalopolis)',
  [BIOME_TYPES.PLAINS]: '霊光草原・巨大霊樹 (Plains)',
  [BIOME_TYPES.COAST]: '結晶海岸・波光 (Coast)',
  [BIOME_TYPES.ARCHIPELAGO]: '浮遊列島・神殿 (Archipelago)',
  [BIOME_TYPES.GLACIER]: '極氷晶界・尖塔 (Glacier)'
};

export const PRESET_CITIES = [
  { name: '東京 (Tokyo)', parallelName: '第7観測区『アストラ・ネオ』', lat: 35.6895, lon: 139.6917, tz: 'Asia/Tokyo' },
  { name: '京都 (Kyoto)', parallelName: '星幽古都『ミヤコ・エコー』', lat: 35.0116, lon: 135.7681, tz: 'Asia/Tokyo' },
  { name: 'ホノルル (Honolulu)', parallelName: '青輝浮島『セレスティア海溝』', lat: 21.3069, lon: -157.8583, tz: 'Pacific/Honolulu' },
  { name: 'レイキャビク (Reykjavik)', parallelName: '極氷次元『フロスト・ヴェール』', lat: 64.1466, lon: -21.9426, tz: 'Atlantic/Reykjavik' },
  { name: 'ロンドン (London)', parallelName: '霧幻環界『エーテル・ミスト』', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
  { name: 'ニューヨーク (New York)', parallelName: '星屑回廊『クロノス・ハイヴ』', lat: 40.7128, lon: -74.0060, tz: 'America/New_York' },
  { name: 'トロムソ (Tromsø)', parallelName: '霊光天球『オーロラ・アーク』', lat: 69.6492, lon: 18.9553, tz: 'Europe/Oslo' },
  { name: 'カイロ (Cairo)', parallelName: '太陽神殿区『ソーラー・プラズマ』', lat: 30.0444, lon: 31.2357, tz: 'Africa/Cairo' }
];

export class WeatherService {
  constructor() {
    this.currentCity = PRESET_CITIES[0];
    // Session Cache: Map<cityKey, { biome, seed, biomeLabel }>
    this.sessionCityMap = new Map();
    this.initPresetSessionBiomes();
  }

  /**
   * Distribute distinct biomes across presets for this session
   */
  initPresetSessionBiomes() {
    const biomes = [
      BIOME_TYPES.MEGALOPOLIS,
      BIOME_TYPES.PLAINS,
      BIOME_TYPES.COAST,
      BIOME_TYPES.GLACIER,
      BIOME_TYPES.ARCHIPELAGO,
      BIOME_TYPES.MEGALOPOLIS,
      BIOME_TYPES.GLACIER,
      BIOME_TYPES.PLAINS
    ];

    PRESET_CITIES.forEach((city, idx) => {
      const key = `${city.lat.toFixed(3)},${city.lon.toFixed(3)}`;
      const biome = biomes[idx % biomes.length];
      const seed = Math.floor(Math.random() * 899999) + 100000;
      this.sessionCityMap.set(key, {
        biome,
        seed,
        biomeLabel: BIOME_LABELS[biome]
      });
    });
  }

  getCitySessionInfo(lat, lon) {
    const key = `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;
    if (!this.sessionCityMap.has(key)) {
      const allBiomes = Object.values(BIOME_TYPES);
      const biome = allBiomes[Math.floor(Math.random() * allBiomes.length)];
      const seed = Math.floor(Math.random() * 899999) + 100000;
      this.sessionCityMap.set(key, {
        biome,
        seed,
        biomeLabel: BIOME_LABELS[biome]
      });
    }
    return this.sessionCityMap.get(key);
  }

  /**
   * Fetch current live weather from Open-Meteo API
   */
  async fetchWeather(city = this.currentCity) {
    this.currentCity = city;
    const sessionInfo = this.getCitySessionInfo(city.lat, city.lon);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code,is_day&timezone=auto`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Weather fetch failed: ${response.statusText}`);
      const data = await response.json();
      
      const current = data.current;
      return {
        city: city.name,
        parallelCity: city.parallelName || `第${Math.abs(Math.floor(city.lat * 7)) % 90 + 10}観測区『${city.name}・エーテル』`,
        biome: sessionInfo.biome,
        biomeLabel: sessionInfo.biomeLabel,
        seed: sessionInfo.seed,
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        pressure: current.surface_pressure || 1013.25,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        weatherCode: current.weather_code,
        isDay: current.is_day === 1,
        time: new Date().toLocaleTimeString(),
        raw: data
      };
    } catch (err) {
      console.warn('Network request fallback to simulated live data:', err);
      return this.getSimulatedWeather(city, sessionInfo);
    }
  }

  async searchCities(query) {
    if (!query || query.trim().length < 2) return [];
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=ja&format=json`;

    try {
      const response = await fetch(url);
      if (!response.ok) return [];
      const data = await response.json();
      if (!data.results) return [];

      return data.results.map(r => {
        const sessionInfo = this.getCitySessionInfo(r.latitude, r.longitude);
        return {
          name: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''} (${r.country || ''})`,
          parallelName: `第${Math.abs(Math.floor(r.latitude * 5)) % 89 + 10}観測区『${r.name}』`,
          lat: r.latitude,
          lon: r.longitude,
          tz: r.timezone || 'auto',
          biome: sessionInfo.biome,
          biomeLabel: sessionInfo.biomeLabel,
          seed: sessionInfo.seed
        };
      });
    } catch (err) {
      console.error('Geocoding search error:', err);
      return [];
    }
  }

  getSimulatedWeather(city = this.currentCity, sessionInfo) {
    const info = sessionInfo || this.getCitySessionInfo(city.lat, city.lon);
    return {
      city: city.name,
      parallelCity: city.parallelName || '並行世界観測区',
      biome: info.biome,
      biomeLabel: info.biomeLabel,
      seed: info.seed,
      temperature: 20.5,
      humidity: 65,
      pressure: 1012.0,
      windSpeed: 10.0,
      windDirection: 90,
      weatherCode: 0,
      isDay: true,
      time: new Date().toLocaleTimeString(),
      simulated: true
    };
  }
}
