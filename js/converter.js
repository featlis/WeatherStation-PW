/**
 * WeatherTransmutationConverter
 * Converts real Earth weather telemetry into Parallel Astral World parameters
 */

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
  /**
   * Convert raw telemetry into parallel universe state
   */
  static transmute(telemetry) {
    const { temperature, humidity, pressure, windSpeed, windDirection, weatherCode, isDay } = telemetry;

    // 1. Determine Phenomenon Category
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

    // 2. Transmuted Dimension Values (Dual Telemetry)
    // Temperature -> Ether Caloric (κ: Kappa)
    const etherCaloric = (temperature + 273.15) * 0.1; // Kelvin scaled
    // Humidity -> Astral Density (%)
    const astralDensity = Math.round(humidity * 1.15);
    // Pressure -> Gravitational Buoyancy (μ: Mu)
    const gravBuoyancy = Math.round((1013.25 - pressure) * 3.2 + 500);
    // Wind Speed -> Vector Drift (ξ: Xi)
    const vectorDrift = (windSpeed * 0.42).toFixed(1);

    // 3. Visual Render Tuning Parameters
    // Color Palette Shift based on Temperature
    let skyHue = 220; // Default cool deep space blue
    let skySaturation = 70;
    let skyLightness = isDay ? 15 : 6;
    let accentColor = '#00f0ff'; // Cyan default

    if (temperature < 0) {
      skyHue = 205; // Frost ice
      accentColor = '#7dd3fc';
    } else if (temperature >= 0 && temperature < 18) {
      skyHue = 225; // Deep teal / cyan
      accentColor = '#00f0ff';
    } else if (temperature >= 18 && temperature < 28) {
      skyHue = 260; // Violet celestial
      accentColor = '#a855f7';
    } else {
      skyHue = 330; // Plasma crimson/amber
      accentColor = '#f59e0b';
    }

    // Island Height based on Pressure (Lower pressure = Higher floating)
    const islandBuoyancy = (1013.25 - pressure) * 1.2;

    // Particle Physics
    const particleSpeed = Math.max(0.5, windSpeed * 0.12);
    const particleCount = Math.min(260, Math.floor(60 + humidity * 1.8));

    return {
      phenomenonType,
      phenomenonName,
      phenomenonSub,
      weatherBadge,
      poeticDescription,
      dualTelemetry: {
        raw: telemetry,
        etherCaloric: `${etherCaloric.toFixed(1)} κ`,
        astralDensity: `${Math.min(100, astralDensity)} %`,
        gravBuoyancy: `${gravBuoyancy} μ`,
        vectorDrift: `${vectorDrift} ξ/s`,
        dimensionalZone: `第${Math.abs(Math.round((pressure * 17) % 89) + 1)}霊域`
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

  /**
   * Generates a poetic log entry for observatory records
   */
  static generateLogEntry(transmuted) {
    const logs = [
      `[天球観測] 気圧変動(${transmuted.dualTelemetry.raw.pressure}hPa)を検知。浮遊島群が高度 ${transmuted.dualTelemetry.gravBuoyancy} へシフト。`,
      `[星素霊脈] 湿度 ${transmuted.dualTelemetry.raw.humidity}%。大気中の発光粒子が凝集を開始。`,
      `[エーテル流] 風速 ${transmuted.dualTelemetry.raw.windSpeed}km/h の偏西流動。オーロラリボンが共鳴中。`,
      `[次元同期] 現象『${transmuted.phenomenonName}』を記録。静謐レベル安定。`,
      `[深層通信] 観測局応答あり。外宇宙ノイズ指数 0.042 を維持。`
    ];

    const randomIndex = Math.floor(Math.random() * logs.length);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return {
      timestamp: time,
      text: logs[randomIndex]
    };
  }
}
