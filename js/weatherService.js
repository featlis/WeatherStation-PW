/**
 * WeatherService
 * Open-Meteo API client for real-time weather & geocoding
 * Zero API key required, high reliability
 */

export const PRESET_CITIES = [
  { name: '東京 (Tokyo)', parallelName: '第7観測区『アストラ・ネオ』', lat: 35.6895, lon: 139.6917, tz: 'Asia/Tokyo' },
  { name: 'レイキャビク (Reykjavik)', parallelName: '極氷次元『フロスト・ヴェール』', lat: 64.1466, lon: -21.9426, tz: 'Atlantic/Reykjavik' },
  { name: 'ロンドン (London)', parallelName: '霧幻環界『エーテル・ミスト』', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
  { name: 'カイロ (Cairo)', parallelName: '太陽神殿区『ソーラー・プラズマ』', lat: 30.0444, lon: 31.2357, tz: 'Africa/Cairo' },
  { name: 'ニューヨーク (New York)', parallelName: '星屑回廊『クロノス・ハイヴ』', lat: 40.7128, lon: -74.0060, tz: 'America/New_York' },
  { name: 'トロムソ (Tromsø)', parallelName: '霊光天球『オーロラ・アーク』', lat: 69.6492, lon: 18.9553, tz: 'Europe/Oslo' },
  { name: 'ホノルル (Honolulu)', parallelName: '青輝浮島『セレスティア海溝』', lat: 21.3069, lon: -157.8583, tz: 'Pacific/Honolulu' },
  { name: '京都 (Kyoto)', parallelName: '星幽古都『ミヤコ・エコー』', lat: 35.0116, lon: 135.7681, tz: 'Asia/Tokyo' }
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
        temperature: data.current.temperature_2m, // Celsius
        humidity: data.current.relative_humidity_2m, // %
        pressure: data.current.surface_pressure || 1013.25, // hPa
        windSpeed: data.current.wind_speed_10m, // km/h
        windDirection: data.current.wind_direction_10m, // deg
        weatherCode: data.current.weather_code, // WMO code
        isDay: data.current.is_day === 1,
        time: new Date().toLocaleTimeString(),
        raw: data
      };
    } catch (err) {
      console.warn('Network request failed, using high-fidelity offline simulation fallback:', err);
      return this.getSimulatedWeather(city);
    }
  }

  /**
   * Geocode search for arbitrary city query
   */
  async searchCities(query) {
    if (!query || query.trim().length < 2) return [];
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=ja&format=json`;

    try {
      const response = await fetch(url);
      if (!response.ok) return [];
      const data = await response.json();
      if (!data.results) return [];

      return data.results.map(r => ({
        name: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''} (${r.country || ''})`,
        parallelName: `第${Math.floor(Math.random() * 90 + 10)}観測区『${r.name}・エーテル』`,
        lat: r.latitude,
        lon: r.longitude,
        tz: r.timezone || 'auto'
      }));
    } catch (err) {
      console.error('Geocoding error:', err);
      return [];
    }
  }

  /**
   * Offline mock fallback
   */
  getSimulatedWeather(city = this.currentCity) {
    const isDay = new Date().getHours() >= 6 && new Date().getHours() <= 18;
    return {
      city: city.name,
      parallelCity: city.parallelName,
      temperature: 18.5,
      humidity: 78,
      pressure: 1011.5,
      windSpeed: 14.2,
      windDirection: 120,
      weatherCode: 61, // Rain
      isDay: isDay,
      time: new Date().toLocaleTimeString(),
      simulated: true
    };
  }
}
