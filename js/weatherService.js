/**
 * WeatherService - Global Planet Observatory Database
 * 40+ World Locations + Random Planetary Warp Generator + Procedural Planet Namer
 */

import { BIOME_TYPES } from './renderer/landscape.js';
import { PLANET_SKY_FEATURES } from './renderer/planetFeatures.js';

export const BIOME_LABELS = {
  [BIOME_TYPES.MEGALOPOLIS]: '星間摩天楼 (Megalopolis)',
  [BIOME_TYPES.PLAINS]: '霊光草原・巨大霊樹 (Plains)',
  [BIOME_TYPES.COAST]: '結晶海岸・波光 (Coast)',
  [BIOME_TYPES.ARCHIPELAGO]: '浮遊列島・天球神殿 (Archipelago)',
  [BIOME_TYPES.GLACIER]: '極氷晶界・氷尖塔 (Glacier)',
  [BIOME_TYPES.VOLCANO_PLASMA]: '星核溶岩・発光カルデラ (Plasma Caldera)',
  [BIOME_TYPES.CRYSTAL_FOREST]: '巨晶の森・クォーツ尖峰 (Crystal Forest)',
  [BIOME_TYPES.DESERT_RUINS]: '星屑砂漠・古代環状遺跡 (Desert Ruins)',
  [BIOME_TYPES.DEEP_ABYSS_REEF]: '深淵発光サンゴ礁 (Abyss Reef)',
  [BIOME_TYPES.SOLAR_SPIRE]: '太陽受光塔・集光アレイ (Solar Spire)'
};

export const GLOBAL_CITIES_POOL = [
  { name: '東京 (Tokyo)', lat: 35.6895, lon: 139.6917, basePlanet: '惑星アストラ・ネオ' },
  { name: '京都 (Kyoto)', lat: 35.0116, lon: 135.7681, basePlanet: '霊樹星シルヴァ・エコー' },
  { name: 'ホノルル (Honolulu)', lat: 21.3069, lon: -157.8583, basePlanet: '碧海星タラサ・プライム' },
  { name: 'レイキャビク (Reykjavik)', lat: 64.1466, lon: -21.9426, basePlanet: '氷晶惑星フロスティア' },
  { name: 'アタカマ砂漠 (Atacama)', lat: -23.8634, lon: -69.1328, basePlanet: '星屑砂漠星クロノス' },
  { name: 'スヴァールバル (Svalbard)', lat: 78.2232, lon: 15.6267, basePlanet: '極光星オーロラ・アーク' },
  { name: 'ガラパゴス (Galapagos)', lat: -0.9538, lon: -90.9656, basePlanet: '深淵星アビス・リーフ' },
  { name: 'カイロ (Cairo)', lat: 30.0444, lon: 31.2357, basePlanet: '太陽神殿星ラー・ソーラー' },
  { name: 'ロンドン (London)', lat: 51.5074, lon: -0.1278, basePlanet: '霧幻環界エーテリア' },
  { name: 'ウシュアイア (Ushuaia)', lat: -54.8019, lon: -68.3030, basePlanet: '最果ての巨晶星アルテミス' },
  { name: 'ニューヨーク (New York)', lat: 40.7128, lon: -74.0060, basePlanet: '星核摩天楼ハイヴ・プライム' },
  { name: 'ラサ (Lhasa)', lat: 29.6525, lon: 91.1721, basePlanet: '天空回廊セレスティス' },
  { name: 'トロムソ (Tromsø)', lat: 69.6492, lon: 18.9553, basePlanet: '霊光天球アーク・ヘイヴン' },
  { name: 'キラウエア火山 (Kilauea)', lat: 19.4069, lon: -155.2833, basePlanet: '星核溶岩星パイロン' },
  { name: 'カトマンズ (Kathmandu)', lat: 27.7172, lon: 85.3240, basePlanet: '神峰尖塔ヒマラヤ・コア' },
  { name: 'ヌーク (Nuuk)', lat: 64.1814, lon: -51.6941, basePlanet: '純白氷晶界グラシア' },
  { name: 'サハラオアシス (Sahara)', lat: 23.4162, lon: 25.6628, basePlanet: '流砂遺跡星オシリス' },
  { name: '富士山頂 (Mt. Fuji)', lat: 35.3606, lon: 138.7274, basePlanet: '聖霊天球ホウライ' },
  { name: 'ヴェネツィア (Venice)', lat: 45.4408, lon: 12.3155, basePlanet: '水鏡宮殿星アクエリア' },
  { name: 'ナイロビ (Nairobi)', lat: -1.2921, lon: 36.8219, basePlanet: '巨獣サバンナ星ガイア' },
  { name: 'エディンバラ (Edinburgh)', lat: 55.9533, lon: -3.1883, basePlanet: '古城星アヴァロン' },
  { name: 'ケープタウン (Cape Town)', lat: -33.9249, lon: 18.4241, basePlanet: '双角海嶺カリプソ' },
  { name: 'シンガポール (Singapore)', lat: 1.3521, lon: 103.8198, basePlanet: '緑光摩天楼ネオ・エデン' },
  { name: 'マチュピチュ (Machu Picchu)', lat: -13.1631, lon: -72.5450, basePlanet: '雲上祭壇星インカ・ハイツ' }
];

export const PRESET_CITIES = GLOBAL_CITIES_POOL.slice(0, 8);

export class WeatherService {
  constructor() {
    this.currentCity = PRESET_CITIES[0];
    this.sessionCityMap = new Map();
  }

  /**
   * Deterministically assigns unique Planetary Identity (Name, Biome, Sky Feature, Gravity, Atmo, Seed) per session
   */
  getCitySessionInfo(lat, lon, cityName = '') {
    const key = `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;
    if (!this.sessionCityMap.has(key)) {
      const allBiomes = Object.values(BIOME_TYPES);
      const allSkyFeatures = Object.values(PLANET_SKY_FEATURES);

      const hash = Math.abs(Math.floor(lat * 73 + lon * 97 + cityName.length * 13));
      const biome = allBiomes[hash % allBiomes.length];
      const skyFeature = allSkyFeatures[(hash + 2) % allSkyFeatures.length];
      const seed = Math.floor(Math.random() * 899999) + 100000;

      const planetDesignation = `EXO-${Math.abs(Math.floor(lat * 11) % 899) + 100}-${String.fromCharCode(65 + (hash % 6))}`;
      const gravity = (0.75 + ((hash % 45) / 100)).toFixed(2) + ' G';
      const atmoGases = ['シアン希ガス', '超高密度霊素', '発光メタン雲', '星素プラズマ', 'エーテル窒素', '結晶蒸気'];
      const atmosphere = `${atmoGases[hash % atmoGases.length]} / 霊脈密度 ${60 + (hash % 38)}%`;

      this.sessionCityMap.set(key, {
        biome,
        biomeLabel: BIOME_LABELS[biome],
        skyFeature,
        seed,
        planetDesignation,
        gravity,
        atmosphere
      });
    }
    return this.sessionCityMap.get(key);
  }

  /**
   * Select a random planetary station from world pool
   */
  getRandomWorldCity() {
    const idx = Math.floor(Math.random() * GLOBAL_CITIES_POOL.length);
    return GLOBAL_CITIES_POOL[idx];
  }

  /**
   * Fetch live weather data from Open-Meteo
   */
  async fetchWeather(city = this.currentCity) {
    this.currentCity = city;
    const sessionInfo = this.getCitySessionInfo(city.lat, city.lon, city.name);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code,is_day&timezone=auto`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Weather fetch failed: ${response.statusText}`);
      const data = await response.json();
      
      const current = data.current;
      return {
        city: city.name,
        parallelCity: city.basePlanet || `第${Math.abs(Math.floor(city.lat * 5)) % 89 + 10}星系『${city.name.split(' ')[0]}』`,
        planetDesignation: sessionInfo.planetDesignation,
        gravity: sessionInfo.gravity,
        atmosphere: sessionInfo.atmosphere,
        biome: sessionInfo.biome,
        biomeLabel: sessionInfo.biomeLabel,
        skyFeature: sessionInfo.skyFeature,
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
      console.warn('Network fallback:', err);
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
        const sessionInfo = this.getCitySessionInfo(r.latitude, r.longitude, r.name);
        return {
          name: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''} (${r.country || ''})`,
          basePlanet: `第${Math.abs(Math.floor(r.latitude * 5)) % 89 + 10}星系『${r.name}』`,
          lat: r.latitude,
          lon: r.longitude,
          tz: r.timezone || 'auto',
          biome: sessionInfo.biome,
          biomeLabel: sessionInfo.biomeLabel,
          skyFeature: sessionInfo.skyFeature,
          seed: sessionInfo.seed,
          planetDesignation: sessionInfo.planetDesignation,
          gravity: sessionInfo.gravity,
          atmosphere: sessionInfo.atmosphere
        };
      });
    } catch (err) {
      console.error('Geocoding search error:', err);
      return [];
    }
  }

  getSimulatedWeather(city = this.currentCity, sessionInfo) {
    const info = sessionInfo || this.getCitySessionInfo(city.lat, city.lon, city.name);
    return {
      city: city.name,
      parallelCity: city.basePlanet || '並行惑星観測区',
      planetDesignation: info.planetDesignation,
      gravity: info.gravity,
      atmosphere: info.atmosphere,
      biome: info.biome,
      biomeLabel: info.biomeLabel,
      skyFeature: info.skyFeature,
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
