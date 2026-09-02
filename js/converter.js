/**
 * WeatherTransmutationConverter
 * Converts real Earth telemetry into Parallel Alien Planet specifications & logs
 */

import { BIOME_TYPES } from './renderer/landscape.js';
import { PLANET_SKY_FEATURES } from './renderer/planetFeatures.js';

export const PHENOMENON_TYPES = {
  CLEAR: 'CLEAR',
  CLOUDS: 'CLOUDS',
  FOG: 'FOG',
  RAIN: 'RAIN',
  SNOW: 'SNOW',
  THUNDER: 'THUNDER',
  AURORA: 'AURORA'
};

export class WeatherConverter {
  static transmute(telemetry) {
    const { temperature, humidity, pressure, windSpeed, windDirection, weatherCode, isDay, biome, skyFeature } = telemetry;

    let phenomenonType = PHENOMENON_TYPES.CLEAR;
    let phenomenonName = '星環光芒';
    let phenomenonSub = 'Celestial Radiance';
    let weatherBadge = '☀️';
    let poeticDescription = '二重太陽の光輪が天球を穏やかに照らしています。';

    if (weatherCode === 0) {
      phenomenonType = PHENOMENON_TYPES.CLEAR;
      phenomenonName = isDay ? '星環光芒' : '静寂星彩';
      phenomenonSub = isDay ? 'Solar Aether Ribbon' : 'Nocturnal Starlight';
      weatherBadge = isDay ? '☀️' : '✨';
      poeticDescription = isDay 
        ? '恒星エーテルが天球を満たし、静かな光輪を描いています。' 
        : '天の河が静かに揺らぎ、純粋な星光が降り注いでいます。';
    } else if (weatherCode >= 1 && weatherCode <= 3) {
      phenomenonType = PHENOMENON_TYPES.CLOUDS;
      phenomenonName = '霊脈星雲';
      phenomenonSub = 'Luminescent Nebula Veil';
      weatherBadge = '☁️';
      poeticDescription = '淡く脈動する発光星雲のヴェールが空を静かに覆っています。';
    } else if (weatherCode === 45 || weatherCode === 48) {
      phenomenonType = PHENOMENON_TYPES.FOG;
      phenomenonName = '深幽霊霧';
      phenomenonSub = 'Astral Ether Mist';
      weatherBadge = '🌫️';
      poeticDescription = '濃密な霊素が地表を満たし、境界が曖昧に溶けています。';
    } else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
      phenomenonType = PHENOMENON_TYPES.RAIN;
      phenomenonName = '蒼光星屑雨';
      phenomenonSub = 'Bioluminescent Spore Rain';
      weatherBadge = '💧';
      poeticDescription = '空から青く輝く微細な発光胞子が静かに降り注ぎ、波紋を生んでいます。';
    } else if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) {
      phenomenonType = PHENOMENON_TYPES.SNOW;
      phenomenonName = '反重力結晶';
      phenomenonSub = 'Zero-G Prism Crystals';
      weatherBadge = '❄️';
      poeticDescription = '多面体の光結晶が重力を失い、ゆったりと虚空を舞っています。';
    } else if (weatherCode >= 95) {
      phenomenonType = PHENOMENON_TYPES.THUNDER;
      phenomenonName = '量子共鳴放電';
      phenomenonSub = 'Quantum Arc Resonance';
      weatherBadge = '⚡';
      poeticDescription = '紫紺の星素が限界値に達し、幾何学的な共鳴放電を放っています。';
    }

    const etherCaloric = (temperature + 273.15) * 0.1;
    const astralDensity = Math.round(humidity * 1.15);
    const gravBuoyancy = Math.round((1013.25 - pressure) * 3.2 + 500);
    const vectorDrift = (windSpeed * 0.42).toFixed(1);

    let skyHue = 220;
    let skySaturation = 70;
    let skyLightness = isDay ? 15 : 6;
    let accentColor = '#00f0ff';

    if (temperature < 0) {
      skyHue = 205;
      accentColor = '#7dd3fc';
    } else if (temperature >= 0 && temperature < 18) {
      skyHue = 225;
      accentColor = '#00f0ff';
    } else if (temperature >= 18 && temperature < 28) {
      skyHue = 260;
      accentColor = '#a855f7';
    } else {
      skyHue = 330;
      accentColor = '#f59e0b';
    }

    const islandBuoyancy = (1013.25 - pressure) * 1.2;
    const particleSpeed = Math.max(0.5, windSpeed * 0.12);
    const particleCount = Math.min(260, Math.floor(60 + humidity * 1.8));

    return {
      phenomenonType,
      phenomenonName,
      phenomenonSub,
      weatherBadge,
      poeticDescription,
      biome: biome || BIOME_TYPES.MEGALOPOLIS,
      biomeLabel: telemetry.biomeLabel || '並行惑星領域',
      skyFeature: skyFeature || PLANET_SKY_FEATURES.RINGS,
      dualTelemetry: {
        raw: telemetry,
        etherCaloric: `${etherCaloric.toFixed(1)} κ`,
        astralDensity: `${Math.min(100, astralDensity)} %`,
        gravBuoyancy: `${gravBuoyancy} μ`,
        vectorDrift: `${vectorDrift} ξ/s`,
        dimensionalZone: telemetry.parallelCity || '並行観測区域',
        planetDesignation: telemetry.planetDesignation || 'EXO-001',
        gravity: telemetry.gravity || '1.00 G',
        atmosphere: telemetry.atmosphere || 'シアン希ガス'
      },
      renderParams: {
        skyHue,
        skySaturation,
        skyLightness,
        accentColor,
        isDay,
        islandBuoyancy,
        particleSpeed,
        particleCount,
        windSpeed,
        windDirection,
        humidity,
        temperature,
        pressure
      }
    };
  }

  static generateLogEntry(transmuted) {
    const biome = transmuted.biome;
    let biomeLog = '惑星探査スキャン完了。大気エーテル循環は平常です。';

    if (biome === BIOME_TYPES.MEGALOPOLIS) {
      biomeLog = '摩天楼エネルギーグリッドの微細共振音を感知。空中交通路安定。';
    } else if (biome === BIOME_TYPES.PLAINS) {
      biomeLog = '霊光草原の草葉が風速に応じ波状発光。天球鳥の微小な鳴声を検知。';
    } else if (biome === BIOME_TYPES.COAST) {
      biomeLog = '結晶海岸に打ち寄せる波光周期 8.2秒。星屑灯台の光芒照射中。';
    } else if (biome === BIOME_TYPES.GLACIER) {
      biomeLog = '極氷尖塔のプリズム屈折角が安定。ダイヤモンドダスト飛散中。';
    } else if (biome === BIOME_TYPES.VOLCANO_PLASMA) {
      biomeLog = '星核カルデラから超高熱プラズマ噴煙を観測。地熱安定。';
    } else if (biome === BIOME_TYPES.CRYSTAL_FOREST) {
      biomeLog = '巨晶クォーツ群のピエゾ共鳴音を受信。透明度極上。';
    } else if (biome === BIOME_TYPES.DESERT_RUINS) {
      biomeLog = '星屑砂漠の古代環状遺跡群に太陽風が通過。微細な砂嵐音を検知。';
    } else if (biome === BIOME_TYPES.DEEP_ABYSS_REEF) {
      biomeLog = '深淵発光サンゴ礁の触手群体が脈動中。浮遊胞子放出。';
    } else if (biome === BIOME_TYPES.SOLAR_SPIRE) {
      biomeLog = '太陽受光塔のコアレンズが恒星エネルギーを集束中。';
    }

    const ancientGlyphs = ['᚛ᚨᛊᛏᚱᚨ᚜', '⟡ ⟐ ⟡ ◈', '〈0xAE78: RESONANCE〉', '✧･ﾟ* STARDUST CYCLE *･ﾟ✧', '⎈ PLANET SYNC ⎈'];
    const hasGlyph = Math.random() < 0.22;

    const logs = [
      `[惑星観測] ${biomeLog}`,
      `[天球現象] 現象『${transmuted.phenomenonName}』を観測。重力定数 ${transmuted.dualTelemetry.gravity}。`,
      `[生体探知] 天球上層に超巨大星鯨（Astral Leviathan）の生体エーテル波紋を確認。`,
      `[大気同期] 気温 ${transmuted.dualTelemetry.raw.temperature}℃ / 湿度 ${transmuted.dualTelemetry.raw.humidity}% / 風速 ${transmuted.dualTelemetry.raw.windSpeed}km/h。音響層同期。`,
      hasGlyph ? `[古代通信] 未知の星脈シグナルを受信: ${ancientGlyphs[Math.floor(Math.random() * ancientGlyphs.length)]}` : `[天文学] 天体スカイ特徴『${transmuted.skyFeature}』が同期。天球バランス安定。`
    ];

    const randomIndex = Math.floor(Math.random() * logs.length);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return {
      timestamp: time,
      text: logs[randomIndex]
    };
  }
}
