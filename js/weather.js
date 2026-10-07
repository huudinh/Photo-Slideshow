/**
 * Định vị GPS trình duyệt + thời tiết thời gian thực.
 *
 * Dùng W3C Geolocation API và Open-Meteo (miễn phí, không cần API key, phủ tốt
 * ở Việt Nam). Mọi lỗi đều rơi về dữ liệu dự phòng chứ không ném ra ngoài —
 * khung tranh treo tường thà hiện số liệu cũ còn hơn hiện ô trống.
 */

/** Quy mã WMO sang mô tả tiếng Việt. */
export function getWeatherDescription(code, isDay = true) {
  switch (code) {
    case 0:
      return {
        text: isDay ? 'Trời quang, nắng đẹp' : 'Trời quang, đêm mát mẻ',
        iconType: isDay ? 'sun' : 'cloud-sun',
      };
    case 1:
      return {
        text: isDay ? 'Nắng nhẹ, ít mây' : 'Trời trong, ít mây',
        iconType: 'cloud-sun',
      };
    case 2:
      return {text: 'Nhiều mây, trời dịu', iconType: 'cloud-sun'};
    case 3:
      return {text: 'Trời âm u, nhiều mây', iconType: 'cloud'};
    case 45:
    case 48:
      return {text: 'Có sương mù', iconType: 'fog'};
    case 51:
    case 53:
    case 55:
      return {text: 'Mưa phùn lất phất', iconType: 'rain'};
    case 61:
    case 63:
    case 65:
      return {text: 'Mưa rào nhẹ', iconType: 'rain'};
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return {text: 'Mưa rào rải rác', iconType: 'rain'};
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return {text: 'Có tuyết rơi nhẹ', iconType: 'snow'};
    case 95:
    case 96:
    case 99:
      return {text: 'Có dông sét, mưa rào', iconType: 'thunder'};
    default:
      return {text: 'Thời tiết mát mẻ', iconType: 'cloud-sun'};
  }
}

class WeatherLocationService {
  constructor() {
    this.cachedData = null;
    this.lastFetchTime = 0;
    this.CACHE_DURATION = 15 * 60 * 1000; // 15 phút
  }

  /** Lấy tọa độ GPS từ trình duyệt. */
  getBrowserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Trình duyệt không hỗ trợ Geolocation GPS'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        (error) => {
          console.warn('Geolocation access error:', error.message);
          reject(error);
        },
        {
          enableHighAccuracy: false, // tiết kiệm pin cho iPad cũ
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  }

  /** Đổi tọa độ thành tên tỉnh/thành (reverse geocoding). */
  async getCityNameFromCoords(lat, lon) {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`
      );
      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.principalSubdivision || data.locality || data.countryName;
        if (city) return city.replace(/^(Thành phố|Tỉnh)\s+/i, '');
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    }
    return 'Vị trí hiện tại';
  }

  /** Thời tiết theo tọa độ GPS, có nhớ đệm 15 phút. */
  async fetchWeatherByGPS() {
    const now = Date.now();
    if (this.cachedData && now - this.lastFetchTime < this.CACHE_DURATION) {
      return this.cachedData;
    }

    try {
      const coords = await this.getBrowserLocation();
      const [cityName, weatherRes] = await Promise.all([
        this.getCityNameFromCoords(coords.latitude, coords.longitude),
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}` +
            '&current=temperature_2m,relative_humidity_2m,weather_code,is_day,wind_speed_10m&timezone=auto'
        ),
      ]);

      if (!weatherRes.ok) throw new Error('Không thể tải dữ liệu thời tiết');

      const weatherData = await weatherRes.json();
      const current = weatherData.current;
      const desc = getWeatherDescription(current.weather_code, current.is_day === 1);

      const result = {
        cityName: cityName || 'Vị trí của bạn',
        temperature: Math.round(current.temperature_2m),
        condition: desc.text,
        weatherCode: current.weather_code,
        humidity: current.relative_humidity_2m || 65,
        windSpeed: Math.round(current.wind_speed_10m || 10),
        isDay: current.is_day === 1,
        lastUpdated: new Date(),
      };

      this.cachedData = result;
      this.lastFetchTime = now;
      return result;
    } catch (error) {
      return this.getFallbackWeather('Hà Nội');
    }
  }

  /** Thời tiết theo tên thành phố nhập tay. */
  async fetchWeatherByCityName(cityName) {
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityName
        )}&count=1&language=vi&format=json`
      );
      if (!geoRes.ok) throw new Error('Geocoding failed');
      const geoData = await geoRes.json();

      if (geoData.results && geoData.results.length > 0) {
        const place = geoData.results[0];
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
            '&current=temperature_2m,relative_humidity_2m,weather_code,is_day,wind_speed_10m&timezone=auto'
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
            lastUpdated: new Date(),
          };
        }
      }
    } catch (e) {
      console.warn('City weather fetch error:', e);
    }

    return this.getFallbackWeather(cityName);
  }

  getFallbackWeather(cityName) {
    return {
      cityName: cityName || 'Hà Nội',
      temperature: 28,
      condition: 'Nắng nhẹ & mát mẻ',
      weatherCode: 1,
      humidity: 68,
      windSpeed: 12,
      isDay: true,
      lastUpdated: new Date(),
    };
  }
}

export const weatherService = new WeatherLocationService();
