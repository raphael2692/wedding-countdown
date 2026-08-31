/* Countdown al 12 settembre 2026 + meteo di Tragliata (Fiumicino, RM) */
(function () {
  'use strict';

  // sabato 12 settembre 2026, ore 17:00 italiane (CEST = UTC+2 a settembre)
  var TARGET = new Date('2026-09-12T17:00:00+02:00').getTime();
  var WEDDING_DAY = '2026-09-12';
  var WEDDING_HOUR = '2026-09-12T17:00';

  var LAT = 41.9345, LON = 12.2394;
  var LIVE_URL =
    'https://api.open-meteo.com/v1/forecast?latitude=' + LAT + '&longitude=' + LON +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day' +
    '&hourly=temperature_2m,precipitation_probability,weather_code' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,uv_index_max' +
    '&timezone=Europe%2FRome&forecast_days=16';

  /* ---------------- countdown ---------------- */

  var els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs'),
    note: document.getElementById('cd-note')
  };

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function tick() {
    var diff = TARGET - Date.now();
    if (diff <= 0) {
      els.days.textContent = '0';
      els.hours.textContent = els.mins.textContent = els.secs.textContent = '00';
      els.note.textContent = 'È il giorno del matrimonio ✦';
      els.note.className = 'cd-note done';
      clearInterval(timer);
      return;
    }
    var s = Math.floor(diff / 1000);
    els.days.textContent = Math.floor(s / 86400);
    els.hours.textContent = pad(Math.floor(s / 3600) % 24);
    els.mins.textContent = pad(Math.floor(s / 60) % 60);
    els.secs.textContent = pad(s % 60);
  }

  tick();
  var timer = setInterval(tick, 1000);

  /* ---------------- codici meteo WMO ---------------- */

  var WMO = {
    0:  ['Sereno', 'sun'],
    1:  ['Prevalentemente sereno', 'sun-cloud'],
    2:  ['Parzialmente nuvoloso', 'sun-cloud'],
    3:  ['Coperto', 'cloud'],
    45: ['Nebbia', 'fog'],
    48: ['Nebbia con brina', 'fog'],
    51: ['Pioviggine leggera', 'rain'],
    53: ['Pioviggine', 'rain'],
    55: ['Pioviggine intensa', 'rain'],
    56: ['Pioviggine gelata', 'rain'],
    57: ['Pioviggine gelata intensa', 'rain'],
    61: ['Pioggia debole', 'rain'],
    63: ['Pioggia', 'rain'],
    65: ['Pioggia forte', 'rain'],
    66: ['Pioggia gelata', 'rain'],
    67: ['Pioggia gelata forte', 'rain'],
    71: ['Neve debole', 'snow'],
    73: ['Neve', 'snow'],
    75: ['Neve abbondante', 'snow'],
    77: ['Nevischio', 'snow'],
    80: ['Rovesci deboli', 'rain'],
    81: ['Rovesci', 'rain'],
    82: ['Rovesci violenti', 'rain'],
    85: ['Rovesci di neve', 'snow'],
    86: ['Rovesci di neve intensi', 'snow'],
    95: ['Temporale', 'storm'],
    96: ['Temporale con grandine', 'storm'],
    99: ['Temporale con grandine forte', 'storm']
  };

  function describe(code) { return (WMO[code] || ['—', 'cloud'])[0]; }
  function iconKind(code) { return (WMO[code] || ['—', 'cloud'])[1]; }

  var SUN = '<circle class="sun" cx="22" cy="20" r="9"/>';
  var CLOUD = '<path class="cloud" d="M16 40a9 9 0 0 1 1.2-17.9 13 13 0 0 1 24.6 3.2A8 8 0 0 1 41 40z"/>';

  function icon(code, size) {
    var k = iconKind(code), s = size || 34, body;
    switch (k) {
      case 'sun':
        body = '<circle class="sun" cx="26" cy="26" r="11"/>' +
          '<g stroke="currentColor" stroke-width="2.6" stroke-linecap="round">' +
          '<path d="M26 5v6M26 41v6M5 26h6M41 26h6M11 11l4 4M37 37l4 4M41 11l-4 4M15 37l-4 4"/></g>';
        break;
      case 'sun-cloud': body = SUN + CLOUD; break;
      case 'cloud': body = CLOUD; break;
      case 'fog':
        body = CLOUD + '<g class="drop"><path d="M10 45h32M16 51h26"/></g>';
        break;
      case 'rain':
        body = CLOUD + '<g class="drop"><path d="M18 44v6M27 44v8M36 44v6"/></g>';
        break;
      case 'snow':
        body = CLOUD + '<g class="flake"><path d="M18 44v7M14.5 46l7 3M21.5 46l-7 3M34 44v7M30.5 46l7 3M37.5 46l-7 3"/></g>';
        break;
      case 'storm':
        body = CLOUD + '<path class="bolt" d="M29 42l-9 12h6l-3 10 11-14h-6z"/>';
        break;
      default: body = CLOUD;
    }
    return '<svg class="wicon ico" width="' + s + '" height="' + s + '" viewBox="0 0 52 60" ' +
      'role="img" aria-label="' + describe(code) + '">' + body + '</svg>';
  }

  /* ---------------- helpers ---------------- */

  function r(n) { return n == null ? '—' : Math.round(n); }

  function fmtHm(iso) {
    if (!iso) return '—';
    var t = String(iso).split('T')[1] || '';
    return t.slice(0, 5) || '—';
  }

  function dowShort(isoDate) {
    var d = new Date(isoDate + 'T12:00:00');
    return ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'][d.getDay()];
  }

  function dayNum(isoDate) {
    var p = isoDate.split('-');
    return p[2] + '/' + p[1];
  }

  function stat(k, v) {
    return '<div class="stat"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>';
  }

  function daysUntilWedding() {
    var today = new Date();
    var a = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    var b = Date.UTC(2026, 8, 12);
    return Math.round((b - a) / 86400000);
  }

  /* ---------------- render ---------------- */

  function renderWeddingDay(d) {
    var box = document.getElementById('wedding-card');
    var i = d.daily.time.indexOf(WEDDING_DAY);

    if (i === -1) {
      var n = daysUntilWedding();
      box.innerHTML = '<p class="wd-pending">Le previsioni per il 12 settembre compariranno qui non appena ' +
        'rientreranno nei 16 giorni coperti dal modello meteo — ' +
        (n > 16 ? 'tra circa <strong>' + (n - 16) + '</strong> ' + (n - 16 === 1 ? 'giorno' : 'giorni') + '.'
                : 'a brevissimo.') + '</p>';
      return;
    }

    var code = d.daily.weather_code[i];

    // meteo puntuale all'ora della cerimonia, se i dati orari sono disponibili
    var hour = '';
    var hi = d.hourly && d.hourly.time ? d.hourly.time.indexOf(WEDDING_HOUR) : -1;
    if (hi !== -1) {
      var hcode = d.hourly.weather_code[hi];
      var hpp = d.hourly.precipitation_probability ? d.hourly.precipitation_probability[hi] : null;
      hour =
        '<div class="wd-hour">' +
          '<span class="k">Al momento del sì &middot; ore 17:00</span>' +
          '<span class="h-line">' + icon(hcode, 30) +
            '<b>' + r(d.hourly.temperature_2m[hi]) + '°</b>' +
            '<span class="h-desc">' + describe(hcode) +
            (hpp == null ? '' : ' &middot; pioggia ' + hpp + '%') + '</span>' +
          '</span>' +
        '</div>';
    }

    box.innerHTML =
      '<div class="wd-grid">' +
        '<div class="wd-main">' + icon(code, 62) +
          '<div>' +
            '<div class="wd-temps">' + r(d.daily.temperature_2m_max[i]) + '°<span class="min"> / ' +
              r(d.daily.temperature_2m_min[i]) + '°</span></div>' +
            '<p class="wd-desc">' + describe(code) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="wd-stats">' +
          stat('Pioggia', (d.daily.precipitation_probability_max[i] == null ? '—' : d.daily.precipitation_probability_max[i] + '%')) +
          stat('Accumulo', r(d.daily.precipitation_sum[i]) + ' mm') +
          stat('Vento max', r(d.daily.wind_speed_10m_max[i]) + ' km/h') +
          stat('UV max', r(d.daily.uv_index_max[i])) +
          stat('Alba', fmtHm(d.daily.sunrise[i])) +
          stat('Tramonto', fmtHm(d.daily.sunset[i])) +
        '</div>' +
      '</div>' + hour;
  }

  function renderNow(d) {
    var box = document.getElementById('now-card');
    var c = d.current;
    if (!c) { box.innerHTML = '<p class="error">Dati attuali non disponibili.</p>'; return; }
    box.innerHTML =
      icon(c.weather_code, 58) +
      '<div class="now-info">' +
        '<div class="now-temp">' + r(c.temperature_2m) + '°</div>' +
        '<p class="desc">' + describe(c.weather_code) + '</p>' +
        '<p class="feels">percepiti ' + r(c.apparent_temperature) + '°</p>' +
      '</div>' +
      '<div class="now-stats">' +
        stat('Umidità', r(c.relative_humidity_2m) + '%') +
        stat('Vento', r(c.wind_speed_10m) + ' km/h') +
        stat('Pioggia', r(c.precipitation) + ' mm') +
        stat('Rilevato', fmtHm(c.time)) +
      '</div>';
  }

  function renderForecast(d) {
    var box = document.getElementById('forecast');
    var html = '';
    // almeno 8 giorni, ma se il 12 settembre è già nei dati la striscia arriva fino a lì
    var wi = d.daily.time.indexOf(WEDDING_DAY);
    var count = Math.min(Math.max(8, wi + 1), d.daily.time.length);
    for (var i = 0; i < count; i++) {
      var date = d.daily.time[i];
      var code = d.daily.weather_code[i];
      var pp = d.daily.precipitation_probability_max[i];
      html +=
        '<div class="day' + (date === WEDDING_DAY ? ' is-wedding' : '') + '">' +
          '<div class="dow">' + (i === 0 ? 'oggi' : dowShort(date)) + '</div>' +
          '<div class="dnum">' + dayNum(date) + '</div>' +
          icon(code, 30) +
          '<div class="t">' + r(d.daily.temperature_2m_max[i]) + '°<span class="min"> ' +
            r(d.daily.temperature_2m_min[i]) + '°</span></div>' +
          '<div class="pp">' + (pp ? pp + '% ☂' : '') + '</div>' +
        '</div>';
    }
    box.innerHTML = html;
  }

  function renderUpdated(d, live) {
    var el = document.getElementById('updated');
    var t = new Date(d.generated_at);
    var ageH = (Date.now() - t.getTime()) / 3600000;
    var txt = 'Previsioni aggiornate il ' + t.toLocaleString('it-IT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome'
    });
    if (live) txt += ' (in diretta dal browser)';
    el.textContent = txt;
    el.className = (!live && ageH > 8) ? 'stale' : '';
  }

  function render(d, live) {
    renderWeddingDay(d);
    renderNow(d);
    renderForecast(d);
    renderUpdated(d, live);
  }

  function fail(msg) {
    ['wedding-card', 'now-card', 'forecast'].forEach(function (id) {
      document.getElementById(id).innerHTML = '<p class="error">' + msg + '</p>';
    });
    document.getElementById('updated').textContent = 'Previsioni non disponibili';
  }

  /* ---------------- caricamento ---------------- */

  function loadLive() {
    return fetch(LIVE_URL).then(function (res) {
      if (!res.ok) throw new Error('live ' + res.status);
      return res.json();
    }).then(function (api) {
      api.generated_at = new Date().toISOString();
      render(api, true);
    });
  }

  fetch('data/weather.json?t=' + Math.floor(Date.now() / 300000))
    .then(function (res) {
      if (!res.ok) throw new Error('json ' + res.status);
      return res.json();
    })
    .then(function (d) {
      render(d, false);
      // se il file committato è vecchio (workflow in ritardo), prova un refresh live
      var ageH = (Date.now() - new Date(d.generated_at).getTime()) / 3600000;
      if (ageH > 5) loadLive().catch(function () {});
    })
    .catch(function () {
      loadLive().catch(function () {
        fail('Impossibile caricare le previsioni. Riprova più tardi.');
      });
    });
})();
