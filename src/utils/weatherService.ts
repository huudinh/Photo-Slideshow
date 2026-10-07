/**
 * Dịch vụ Định vị GPS Trình duyệt & Thời tiết Thời gian thực
 * Sử dụng W3C Geolocation API + Open-Meteo Free API (Không cần API key, độ chính xác cao tại Việt Nam)
 */

export interface RealWeatherData {
  cityName: string;
  temperature: number;
  condition: string;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  isDay: boolean;
  lastUpdated: Date;
}

// Map WMO Weather Codes to Vietnamese descriptions
export function getWeatherDescription(code: number, isDay: boolean = true): { text: string; iconType: 'sun' | 'cloud-sun' | 'cloud' | 'rain' | 'thunder' | 'snow' | 'fog' } {
  switch (code) {
    case 0:
      return { text: isDay ? 'Trời quang, nắng đẹp' : 'Trời quang, đêm mát mẻ', iconType: isDay ? 'sun' : 'cloud-sun' };
    case 1:
      return { text: isDay ? 'Nắng nhẹ, ít mây' : 'Trời trong, ít mây', iconType: 'cloud-sun' };
    case 2:
      return { text: 'Nhiều mây, trời dịu', iconType: 'cloud-sun' };
    case 3:
      return { text: 'Trời âm u, nhiều mây', iconType: 'cloud' };
    case 45:
    case 48:
      return { text: 'Có sương mù', iconType: 'fog' };
    case 51:
    case 53:
    case 55:
      return { text: 'Mưa phùn lất phất', iconType: 'rain' };
    case 61:
    case 63:
    case 65:
      return { text: 'Mưa rào nhẹ', iconType: 'rain' };
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return { text: 'Mưa rào rải rác', iconType: 'rain' };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return { text: 'Có tuyết rơi nhẹ', iconType: 'snow' };
    case 95:
    case 96:
    case 99:
      return { text: 'Có dông sét, mưa rào', iconType: 'thunder' };
    default:
      return { text: 'Thời tiết mát mẻ', iconType: 'cloud-sun' };
  }
}

class WeatherLocationService {
  private cachedData: RealWeatherData | null = null;
  private lastFetchTime: number = 0;
  private CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache

  /**
   * Lấy tọa độ GPS từ trình duyệt
   */
  public getBrowserLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        reject(new Error('Trình duyệt không hỗ trợ Geolocation GPS'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation access error:', error.message);
          reject(error);
        },
        {
          enableHighAccuracy: false, // Low power for older iPads
          timeout: 10000,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  }

  /**
   * Lấy tên thành phố/tỉnh từ tọa độ GPS (Reverse Geocoding)
   */
  private async getCityNameFromCoords(lat: number, lon: number): Promise<string> {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`
      );
      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.principalSubdivision || data.locality || data.countryName;
        if (city) {
          return city.replace(/^(Thành phố|Tỉnh)\s+/i, '');
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    }
    return 'Vị trí hiện tại';
  }

  /**
   * Tải thời tiết theo tọa độ GPS thời gian thực
   */
  public async fetchWeatherByGPS(): Promise<RealWeatherData> {
    // Return cache if still fresh
    const now = Date.now();
    if (this.cachedData && now - this.lastFetchTime < this.CACHE_DURATION) {
      return this.cachedData;
    }

    try {
      const coords = await this.getBrowserLocation();
      const [cityName, weatherRes] = await Promise.all([
        this.getCityNameFromCoords(coords.latitude, coords.longitude),
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,is_day,wind_speed_10m&timezone=auto`
        )
      ]);

      if (!weatherRes.ok) {
        throw new Error('Không thể tải dữ liệu thời tiết');
      }

      const weatherData = await weatherRes.json();
      const current = weatherData.current;
      const desc = getWeatherDescription(current.weather_code, current.is_day === 1);

      const result: RealWeatherData = {
        cityName: cityName || 'Vị trí của bạn',
        temperature: Math.round(current.temperature_2m),
        condition: desc.text,
        weatherCode: current.weather_code,
        humidity: current.relative_humidity_2m || 65,
        windSpeed: Math.round(current.wind_speed_10m || 10),
        isDay: current.is_day === 1,
        lastUpdated: new Date()
      };

      this.cachedData = result;
      this.lastFetchTime = now;
      return result;
    } catch (error) {
      // Fallback data
      return this.getFallbackWeather('Hà Nội');
    }
  }

  /**
   * Tải thời tiết theo tên thành phố thủ công
   */
  public async fetchWeatherByCityName(cityName: string): Promise<RealWeatherData> {
    try {
      // Geocoding city name via Open-Meteo
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=vi&format=json`
      );
      if (!geoRes.ok) throw new Error('Geocoding failed');
      const geoData = await geoRes.json();
      
      if (geoData.results && geoData.results.length > 0) {
        const place = geoData.results[0];
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,is_day,wind_speed_10m&timezone=auto`
        );
        if (weatherRes.ok) {
          const weatherData = await weatherRes.json();
          const current = weatherData.current;
          const desc = getWeatherDescription(current.weather_code, current.is_day === 1);

          return {
            cityName: place.name || cityName,
            temperature: Math.round(current.temperature_2m),
            condition: desc.text,
            weatherCode: current.weather_code,
            humidity: current.relative_humidity_2m || 65,
            windSpeed: Math.round(current.wind_speed_10m || 10),
            isDay: current.is_day === 1,
            lastUpdated: new Date()
          };
        }
      }
    } catch (e) {
      console.warn('City weather fetch error:', e);
    }

    return this.getFallbackWeather(cityName);
  }

  public getFallbackWeather(cityName: string): RealWeatherData {
    return {
      cityName: cityName || 'Hà Nội',
      temperature: 28,
      condition: 'Nắng nhẹ & mát mẻ',
      weatherCode: 1,
      humidity: 68,
      windSpeed: 12,
      isDay: true,
      lastUpdated: new Date()
    };
  }
}

export const weatherLocationService = new WeatherLocationService();
