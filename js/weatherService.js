/**
 * WeatherService
 * Open-Meteo API client with Biome Mapping for procedural worlds
 */

import { BIOME_TYPES } from './renderer/landscape.js';

export const PRESET_CITIES = [
  { 
    name: '東京 (Tokyo)', 
    parallelName: '第7観測区『アストラ・ネオ』', 
    lat: 35.6895, lon: 139.6917, tz: 'Asia/Tokyo',
    biome: BIOME_TYPES.MEGALOPOLIS,
    biomeLabel: '星間摩天楼 (Megalopolis)'
  },
  { 
    name: '京都 (Kyoto)', 
    parallelName: '星幽古都『霊光の平原』', 
    lat: 35.0116, lon: 135.7681, tz: 'Asia/Tokyo',
    biome: BIOME_TYPES.PLAINS,
    biomeLabel: '霊光草原・巨大霊樹 (Plains)'
  },
  { 
    name: 'ホノルル (Honolulu)', 
    parallelName: '青輝浮島『セレスティア海溝』', 
    lat: 21.3069, lon: -157.8583, tz: 'Pacific/Honolulu',
    biome: BIOME_TYPES.COAST,
    biomeLabel: '結晶海岸・波光 (Coast)'
  },
  { 
    name: 'レイキャビク (Reykjavik)', 
    parallelName: '極氷次元『フロスト・ヴェール』', 
    lat: 64.1466, lon: -21.9426, tz: 'Atlantic/Reykjavik',
    biome: BIOME_TYPES.GLACIER,
    biomeLabel: '極氷晶界・尖塔 (Glacier)'
  },
  { 
    name: 'ロンドン (London)', 
    parallelName: '霧幻環界『エーテル・ミスト』', 
    lat: 51.5074, lon: -0.1278, tz: 'Europe/London',
    biome: BIOME_TYPES.ARCHIPELAGO,
    biomeLabel: '浮遊列島・神殿 (Archipelago)'
  },
  { 
    name: 'ニューヨーク (New York)', 
    parallelName: '星屑回廊『クロノス・ハイヴ』', 
    lat: 40.7128, lon: -74.0060, tz: 'America/New_York',
    biome: BIOME_TYPES.MEGALOPOLIS,
    biomeLabel: '星間摩天楼 (Megalopolis)'
  },
  { 
    name: 'トロムソ (Tromsø)', 
    parallelName: '霊光天球『オーロラ・アーク』', 
    lat: 69.6492, lon: 18.9553, tz: 'Europe/Oslo',
    biome: BIOME_TYPES.GLACIER,
    biomeLabel: '極氷晶界・尖塔 (Glacier)'
  },
  { 
    name: 'カイロ (Cairo)', 
    parallelName: '太陽神殿区『ソーラー・プラズマ』', 
    lat: 30.0444, lon: 31.2357, tz: 'Africa/Cairo',
    biome: BIOME_TYPES.PLAINS,
    biomeLabel: '霊光草原 (Plains)'
  }
];

export class WeatherService {
  constructor() {
    this.currentCity = PRESET_CITIES[0];
  }

  /**
   * Fetch current real-time weather from Open-Meteo
   */
  async fetchWeather(city = this.currentCity) {
    this.currentCity = city;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code,is_day&timezone=auto`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Weather fetch failed: ${response.statusText}`);
      const data = await response.json();
      
      return {
        city: city.name,
        parallelCity: city.parallelName,
        biome: city.biome || this.pickBiomeByCoords(city.lat, city.lon),
        biomeLabel: city.biomeLabel || '並行世界領域',
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        pressure: data.current.surface_pressure || 1013.25,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day === 1,
        time: new Date().toLocaleTimeString(),
        raw: data
      };
    } catch (err) {
      console.warn('Network request fallback:', err);
      return this.getSimulatedWeather(city);
    }
  }

  pickBiomeByCoords(lat, lon) {
    const biomes = Object.values(BIOME_TYPES);
    const hash = Math.abs(Math.floor(lat * 100 + lon * 100));
    return biomes[hash % biomes.length];
  }

  async searchCities(query) {
    if (!query || query.trim().length < 2) return [];
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=ja&format=json`;

    try {
      const response = await fetch(url);
      if (!response.ok) return [];
      const data = await response.json();
      if (!data.results) return [];

      const biomes = Object.values(BIOME_TYPES);
      const biomeLabels = {
        [BIOME_TYPES.MEGALOPOLIS]: '星間摩天楼 (Megalopolis)',
        [BIOME_TYPES.PLAINS]: '霊光草原 (Plains)',
        [BIOME_TYPES.COAST]: '結晶海岸 (Coast)',
        [BIOME_TYPES.ARCHIPELAGO]: '浮遊列島 (Archipelago)',
        [BIOME_TYPES.GLACIER]: '極氷晶界 (Glacier)'
      };

      return data.results.map(r => {
        const hash = Math.abs(Math.floor(r.latitude * 100 + r.longitude * 100));
        const pickedBiome = biomes[hash % biomes.length];
        return {
          name: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''} (${r.country || ''})`,
          parallelName: `第${(hash % 89) + 10}観測区『${r.name}・エーテル』`,
          lat: r.latitude,
          lon: r.longitude,
          tz: r.timezone || 'auto',
          biome: pickedBiome,
          biomeLabel: biomeLabels[pickedBiome]
        };
      });
    } catch (err) {
      console.error('Geocoding error:', err);
      return [];
    }
  }

  getSimulatedWeather(city = this.currentCity) {
    return {
      city: city.name,
      parallelCity: city.parallelName,
      biome: city.biome || BIOME_TYPES.ARCHIPELAGO,
      biomeLabel: city.biomeLabel || '浮遊列島 (Archipelago)',
      temperature: 18.5,
      humidity: 78,
      pressure: 1011.5,
      windSpeed: 14.2,
      windDirection: 120,
      weatherCode: 61,
      isDay: true,
      time: new Date().toLocaleTimeString(),
      simulated: true
    };
  }
}
