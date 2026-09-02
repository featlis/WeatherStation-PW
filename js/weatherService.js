/**
 * WeatherService - Unlimited Global Coordinate Random Planetary Warp
 * 16 Planetary Biomes + Full Coordinates Sampler
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
  [BIOME_TYPES.SOLAR_SPIRE]: '太陽受光塔・集光アレイ (Solar Spire)',
  [BIOME_TYPES.NEBULA_CANYON]: '星雲峡谷・大断崖 (Nebula Canyon)',
  [BIOME_TYPES.MUSHROOM_GROVE]: '発光茸の森・胞子樹林 (Mushroom Grove)',
  [BIOME_TYPES.ETHEREAL_SWAMP]: '幽霊沼沢・水鏡湿原 (Ethereal Swamp)',
  [BIOME_TYPES.FLOATING_CITADEL]: '天空要塞・幾何学モノリス (Floating Citadel)',
  [BIOME_TYPES.LAVA_OCEAN]: '溶融プラズマ海・紅蓮波 (Lava Ocean)',
  [BIOME_TYPES.AURORA_TUNDRA]: '極光ツンドラ・発光苔原 (Aurora Tundra)'
};

export const PRESET_CITIES = [
  { name: '東京 (Tokyo)', lat: 35.6895, lon: 139.6917, basePlanet: '惑星アストラ・ネオ' },
  { name: '京都 (Kyoto)', lat: 35.0116, lon: 135.7681, basePlanet: '霊樹星シルヴァ・エコー' },
  { name: 'ホノルル (Honolulu)', lat: 21.3069, lon: -157.8583, basePlanet: '碧海星タラサ・プライム' },
  { name: 'レイキャビク (Reykjavik)', lat: 64.1466, lon: -21.9426, basePlanet: '氷晶惑星フロスティア' },
  { name: 'アタカマ砂漠 (Atacama)', lat: -23.8634, lon: -69.1328, basePlanet: '星屑砂漠星クロノス' },
  { name: 'スヴァールバル (Svalbard)', lat: 78.2232, lon: 15.6267, basePlanet: '極光星オーロラ・アーク' },
  { name: 'ガラパゴス (Galapagos)', lat: -0.9538, lon: -90.9656, basePlanet: '深淵星アビス・リーフ' },
  { name: 'カイロ (Cairo)', lat: 30.0444, lon: 31.2357, basePlanet: '太陽神殿星ラー・ソーラー' }
];

export class WeatherService {
  constructor() {
    this.currentCity = PRESET_CITIES[0];
    this.sessionCityMap = new Map();
  }

  async getRandomWorldLocation() {
    const isLandZone = Math.random() < 0.65;
    let lat, lon;

    if (isLandZone) {
      const zones = [
        { latMin: 25, latMax: 55, lonMin: 120, lonMax: 145 },
        { latMin: 35, latMax: 68, lonMin: -10, lonMax: 35 },
        { latMin: 25, latMax: 50, lonMin: -125, lonMax: -70 },
        { latMin: -35, latMax: 10, lonMin: -75, lonMax: -35 },
        { latMin: -35, latMax: 35, lonMin: 10, lonMax: 45 },
        { latMin: -40, latMax: -12, lonMin: 115, lonMax: 150 },
        { latMin: 50, latMax: 75, lonMin: 60, lonMax: 170 },
        { latMin: -80, latMax: -65, lonMin: -180, lonMax: 180 }
      ];
      const z = zones[Math.floor(Math.random() * zones.length)];
      lat = +(z.latMin + Math.random() * (z.latMax - z.latMin)).toFixed(4);
      lon = +(z.lonMin + Math.random() * (z.lonMax - z.lonMin)).toFixed(4);
    } else {
      lat = +((Math.random() * 150) - 75).toFixed(4);
      lon = +((Math.random() * 360) - 180).toFixed(4);
    }

    const localityName = await this.resolveCoordinateName(lat, lon);
    const planetName = `第${Math.abs(Math.floor(lat * 7 + lon * 3)) % 89 + 10}星系『${localityName.split(' ')[0]}』`;

    return {
      name: localityName,
      lat,
      lon,
      basePlanet: planetName
    };
  }

  async resolveCoordinateName(lat, lon) {
    const latStr = `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ja`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const city = data.locality || data.city || data.principalSubdivision;
        const country = data.countryName;
        if (city && country) {
          return `${city} (${country}) [${latStr}, ${lonStr}]`;
        } else if (country) {
          return `${country}領域 [${latStr}, ${lonStr}]`;
        }
      }
    } catch (e) {
      // Network timeout / fallback
    }

    if (lat > 66.5) return `北極圏・極光界 [${latStr}, ${lonStr}]`;
    if (lat < -60.0) return `南極氷原・最果て観測点 [${latStr}, ${lonStr}]`;
    if (lon > 100 && lon < 180 && lat > -20 && lat < 50) return `西太平洋 観測海域 [${latStr}, ${lonStr}]`;
    if (lon > -180 && lon < -100 && lat > -40 && lat < 40) return `東太平洋 観測宙域 [${latStr}, ${lonStr}]`;
    if (lon > -60 && lon < 0 && lat > -40 && lat < 50) return `大西洋 観測海嶺 [${latStr}, ${lonStr}]`;
    if (lon > 40 && lon < 100 && lat > -40 && lat < 20) return `インド洋 観測諸島 [${latStr}, ${lonStr}]`;
    if (lat > 15 && lat < 30 && lon > -15 && lon < 40) return `サハラ砂漠 観測帯 [${latStr}, ${lonStr}]`;

    return `地球観測座標 [${latStr}, ${lonStr}]`;
  }

  getCitySessionInfo(lat, lon, cityName = '') {
    const key = `${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`;
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
