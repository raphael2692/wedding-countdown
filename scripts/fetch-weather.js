#!/usr/bin/env node
// Scarica le previsioni per Tragliata (Fiumicino, RM) da Open-Meteo
// e le salva in data/weather.json. Nessuna API key richiesta.

const fs = require('node:fs');
const path = require('node:path');

const LAT = 41.9345;
const LON = 12.2394;
const TZ = 'Europe/Rome';

const url =
  'https://api.open-meteo.com/v1/forecast' +
  `?latitude=${LAT}&longitude=${LON}` +
  '&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day' +
  '&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,cloud_cover,relative_humidity_2m' +
  '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,uv_index_max' +
  `&timezone=${encodeURIComponent(TZ)}&forecast_days=16`;

async function main() {
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'wedding-countdown/1.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const api = await res.json();

      const out = {
        generated_at: new Date().toISOString(),
        source: 'https://open-meteo.com/',
        location: { name: 'Tragliata', municipality: 'Fiumicino', province: 'RM', lat: LAT, lon: LON },
        timezone: api.timezone,
        current: api.current,
        current_units: api.current_units,
        hourly: api.hourly,
        hourly_units: api.hourly_units,
        daily: api.daily,
        daily_units: api.daily_units,
      };

      const dest = path.join(__dirname, '..', 'data', 'weather.json');
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, JSON.stringify(out, null, 2) + '\n');
      console.log(`OK — scritto ${dest} (${out.daily.time.length} giorni, aggiornato ${out.generated_at})`);
      return;
    } catch (err) {
      lastErr = err;
      console.error(`Tentativo ${attempt}/3 fallito: ${err.message}`);
      if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 4000));
    }
  }
  console.error('Impossibile aggiornare le previsioni.');
  process.exit(1);
}

main();
