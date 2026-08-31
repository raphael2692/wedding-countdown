/* Countdown al 12 settembre 2026 + meteo di Tragliata (Fiumicino, RM) */
(function () {
  'use strict';

  // sabato 12 settembre 2026, ore 17:00 italiane (CEST = UTC+2 a settembre)
  var TARGET = new Date('2026-09-12T17:00:00+02:00').getTime();
  var WEDDING_DAY = '2026-09-12';
  var WEDDING_HOUR = '2026-09-12T17:00';
  // la cerimonia va dalle 17:00 all'01:00 della notte successiva
  var WINDOW_START = '2026-09-12T17:00';
  var WINDOW_END = '2026-09-13T01:00';

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

    var dayCode = d.daily.weather_code[i];
    var w = windowSlice(d);

    // il titolo descrive la finestra della cerimonia, non le 24 ore:
    // un temporale alle 4 del mattino non dice nulla sulle 17:00
    var headCode = w ? modeCode(w.code) : dayCode;
    var tHi = w ? maxOf(w.temp) : d.daily.temperature_2m_max[i];
    var tLo = w ? minOf(w.temp) : d.daily.temperature_2m_min[i];
    var scope = w ? 'durante la cerimonia &middot; 17:00 – 01:00' : 'sull’intera giornata';

    var stats;
    if (w) {
      stats =
        stat('Pioggia max', (maxOf(w.pop) == null ? '—' : maxOf(w.pop) + '%')) +
        stat('Accumulo', (Math.round(sumOf(w.prec) * 10) / 10) + ' mm') +
        stat('Vento max', r(maxOf(w.wind)) + ' km/h') +
        stat('Nuvolosità', r(avgOf(w.cloud)) + '%') +
        stat('Umidità', r(avgOf(w.hum)) + '%') +
        stat('Tramonto', fmtHm(d.daily.sunset[i]));
    } else {
      stats =
        stat('Pioggia', (d.daily.precipitation_probability_max[i] == null ? '—' : d.daily.precipitation_probability_max[i] + '%')) +
        stat('Accumulo', r(d.daily.precipitation_sum[i]) + ' mm') +
        stat('Vento max', r(d.daily.wind_speed_10m_max[i]) + ' km/h') +
        stat('UV max', r(d.daily.uv_index_max[i])) +
        stat('Alba', fmtHm(d.daily.sunrise[i])) +
        stat('Tramonto', fmtHm(d.daily.sunset[i]));
    }

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

    // contesto onesto sulle 24 ore, così l'etichetta del giorno non spaventa a vuoto
    var context = '';
    if (w) {
      var worstIn = maxOf(w.code);
      var dayLine = 'Sull’intera giornata il modello sintetizza «' + describe(dayCode).toLowerCase() + '», ' +
        r(d.daily.temperature_2m_max[i]) + '° / ' + r(d.daily.temperature_2m_min[i]) + '°';
      context = '<p class="wd-context">' + dayLine +
        (dayCode > worstIn
          ? ': quel fenomeno è previsto <b>fuori</b> dalla finestra della cerimonia.'
          : '.') +
        '</p>';
    }

    box.innerHTML =
      '<div class="wd-grid">' +
        '<div class="wd-main">' + icon(headCode, 62) +
          '<div>' +
            '<div class="wd-temps">' + r(tHi) + '°<span class="min"> / ' + r(tLo) + '°</span></div>' +
            '<p class="wd-desc">' + describe(headCode) + '</p>' +
            '<p class="wd-scope">' + scope + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="wd-stats">' + stats + '</div>' +
      '</div>' + hour + context;
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

  /* ---------------- finestra della cerimonia ---------------- */

  function windowSlice(d) {
    if (!d.hourly || !d.hourly.time) return null;
    var a = d.hourly.time.indexOf(WINDOW_START);
    if (a === -1) return null;
    var b = d.hourly.time.indexOf(WINDOW_END);
    if (b === -1 || b < a) b = Math.min(a + 8, d.hourly.time.length - 1);
    if (b - a < 1) return null;

    var h = d.hourly;
    var w = { time: [], temp: [], feels: [], pop: [], prec: [], code: [], wind: [], cloud: [], hum: [] };
    var pick = function (arr, i) { return arr ? arr[i] : null; };
    for (var i = a; i <= b; i++) {
      w.time.push(h.time[i]);
      w.temp.push(pick(h.temperature_2m, i));
      w.feels.push(pick(h.apparent_temperature, i));
      w.pop.push(pick(h.precipitation_probability, i));
      w.prec.push(pick(h.precipitation, i));
      w.code.push(pick(h.weather_code, i));
      w.wind.push(pick(h.wind_speed_10m, i));
      w.cloud.push(pick(h.cloud_cover, i));
      w.hum.push(pick(h.relative_humidity_2m, i));
    }
    return w;
  }

  function nums(a) { return a.filter(function (v) { return typeof v === 'number'; }); }
  function maxOf(a) { var v = nums(a); return v.length ? Math.max.apply(null, v) : null; }
  function minOf(a) { var v = nums(a); return v.length ? Math.min.apply(null, v) : null; }
  function sumOf(a) { return nums(a).reduce(function (x, y) { return x + y; }, 0); }
  function avgOf(a) { var v = nums(a); return v.length ? sumOf(v) / v.length : null; }

  function modeCode(codes) {
    var count = {}, best = codes[0], bestN = 0;
    codes.forEach(function (c) {
      count[c] = (count[c] || 0) + 1;
      if (count[c] > bestN) { bestN = count[c]; best = c; }
    });
    return best;
  }

  function hourLabel(iso) { return (String(iso).split('T')[1] || '').slice(0, 2); }

  /* ---------------- grafici SVG (una serie per grafico) ---------------- */

  function niceTicks(lo, hi) {
    var step = Math.max(1, Math.ceil((hi - lo) / 3));
    var start = Math.floor(lo / step) * step;
    var out = [];
    for (var v = start; v <= hi + 0.001; v += step) out.push(v);
    if (out[out.length - 1] < hi) out.push(out[out.length - 1] + step);
    return out;
  }

  function topRoundedBar(x, y, w, h, r) {
    if (h <= 0) return '';
    var rr = Math.min(r, w / 2, h);
    var bottom = y + h;
    return '<path d="M' + x + ',' + bottom +
      ' L' + x + ',' + (y + rr) +
      ' Q' + x + ',' + y + ' ' + (x + rr) + ',' + y +
      ' L' + (x + w - rr) + ',' + y +
      ' Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + rr) +
      ' L' + (x + w) + ',' + bottom + ' Z"/>';
  }

  // o = { kind:'column'|'line', values, labels, tips, yMin, yMax, ticks, fmtTick, cls, aria }
  function svgChart(o) {
    var W = Math.max(280, Math.round(o.width || 660));
    var H = 186, PL = 40, PR = 16, PT = 18, PB = 30;
    var pw = W - PL - PR, ph = H - PT - PB;
    var n = o.values.length, band = pw / n;
    var span = (o.yMax - o.yMin) || 1;
    var base = PT + ph;
    var yOf = function (v) { return PT + ph - ((v - o.yMin) / span) * ph; };
    var xMid = function (i) { return PL + band * i + band / 2; };

    var g = '';

    o.ticks.forEach(function (t) {
      var y = yOf(t);
      if (y < PT - 1 || y > base + 1) return;
      g += '<line class="grid" x1="' + PL + '" y1="' + y + '" x2="' + (W - PR) + '" y2="' + y + '"/>';
      g += '<text class="ax" x="' + (PL - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + o.fmtTick(t) + '</text>';
    });

    if (o.kind === 'column') {
      var bw = Math.min(24, band - 10);
      o.values.forEach(function (v, i) {
        if (typeof v !== 'number') return;
        var y = yOf(v);
        g += '<g class="mark">' + topRoundedBar(xMid(i) - bw / 2, y, bw, base - y, 4) + '</g>';
      });
    } else {
      var pts = [], areaD = '';
      o.values.forEach(function (v, i) {
        if (typeof v !== 'number') return;
        pts.push(xMid(i) + ',' + yOf(v));
      });
      if (pts.length > 1) {
        areaD = 'M' + pts[0].split(',')[0] + ',' + base + ' L' + pts.join(' L') +
          ' L' + pts[pts.length - 1].split(',')[0] + ',' + base + ' Z';
        g += '<path class="area" d="' + areaD + '"/>';
        g += '<polyline class="line" points="' + pts.join(' ') + '"/>';
      }
      o.values.forEach(function (v, i) {
        if (typeof v !== 'number') return;
        g += '<circle class="dot" cx="' + xMid(i) + '" cy="' + yOf(v) + '" r="4"/>';
      });
    }

    // etichette dirette: solo primo, ultimo ed estremo — mai un numero su ogni punto
    var vals = o.values;
    var hiIdx = -1, hiVal = -Infinity;
    vals.forEach(function (v, i) { if (typeof v === 'number' && v > hiVal) { hiVal = v; hiIdx = i; } });
    var labelled = {};
    [0, vals.length - 1, hiIdx].forEach(function (i) {
      if (i < 0 || labelled[i] || typeof vals[i] !== 'number') return;
      labelled[i] = 1;
      var y = yOf(vals[i]) - 12;
      g += '<text class="val" x="' + xMid(i) + '" y="' + Math.max(y, PT + 4) + '" text-anchor="middle">' +
        o.fmtTick(vals[i]) + '</text>';
    });

    o.labels.forEach(function (l, i) {
      g += '<text class="ax" x="' + xMid(i) + '" y="' + (H - 9) + '" text-anchor="middle">' + l + '</text>';
    });

    g += '<line class="axis" x1="' + PL + '" y1="' + base + '" x2="' + (W - PR) + '" y2="' + base + '"/>';

    // aree di hover: più larghe dei segni, così il puntatore le prende sempre
    o.values.forEach(function (v, i) {
      g += '<rect class="hit" x="' + (PL + band * i) + '" y="' + PT + '" width="' + band + '" height="' + ph +
        '" data-tip="' + o.tips[i] + '"/>';
    });

    return '<svg class="chart ' + o.cls + '" viewBox="0 0 ' + W + ' ' + H + '" ' +
      'role="img" aria-label="' + o.aria + '">' + g + '</svg>';
  }

  function attachTips(root) {
    var tip = root.querySelector('.chart-tip');
    if (!tip) return;
    root.querySelectorAll('.hit').forEach(function (hit) {
      var show = function () {
        tip.textContent = hit.getAttribute('data-tip');
        tip.hidden = false;
        var box = root.getBoundingClientRect();
        var hb = hit.getBoundingClientRect();
        var x = hb.left + hb.width / 2 - box.left;
        // il tooltip si ancora alla colonna, non al cursore
        tip.style.left = Math.max(4, Math.min(box.width - 4, x)) + 'px';
      };
      hit.addEventListener('mouseenter', show);
      hit.addEventListener('mousemove', show);
      hit.addEventListener('mouseleave', function () { tip.hidden = true; });
    });
  }

  /* ---------------- dettaglio ora per ora ---------------- */

  var resizeBound = false, redrawCharts = null;

  function renderHourly(d) {
    var box = document.getElementById('hourly-detail');
    var w = windowSlice(d);

    if (!w) {
      var n = daysUntilWedding();
      box.innerHTML = '<p class="wd-pending">Il dettaglio ora per ora della serata comparirà qui quando ' +
        'il 12 settembre entrerà nei 16 giorni coperti dal modello' +
        (n > 16 ? ' — tra circa <strong>' + (n - 16) + '</strong> ' + (n - 16 === 1 ? 'giorno' : 'giorni') + '.' : '.') +
        '</p>';
      return;
    }

    var labels = w.time.map(hourLabel);
    var popTips = w.time.map(function (t, i) {
      return hourLabel(t) + ':00 — ' + (w.pop[i] == null ? 'n.d.' : w.pop[i] + '% di pioggia') +
        (w.prec[i] ? ' · ' + w.prec[i] + ' mm' : '');
    });
    var tempTips = w.time.map(function (t, i) {
      return hourLabel(t) + ':00 — ' + r(w.temp[i]) + '° (percepiti ' + r(w.feels[i]) + '°)';
    });

    var tLo = minOf(w.temp), tHi = maxOf(w.temp);
    var tTicks = niceTicks(Math.floor(tLo - 1), Math.ceil(tHi + 1));

    var rows = '';
    for (var k = 0; k < w.time.length; k++) {
      rows += '<tr' + (w.time[k] === WEDDING_HOUR ? ' class="is-ceremony"' : '') + '>' +
        '<th scope="row">' + hourLabel(w.time[k]) + ':00</th>' +
        '<td class="c-ico">' + icon(w.code[k], 24) + '<span>' + describe(w.code[k]) + '</span></td>' +
        '<td>' + r(w.temp[k]) + '°</td>' +
        '<td>' + (w.pop[k] == null ? '—' : w.pop[k] + '%') + '</td>' +
        '<td>' + r(w.wind[k]) + '</td>' +
        '<td>' + r(w.cloud[k]) + '%</td>' +
        '</tr>';
    }

    box.innerHTML =
      '<div class="chart-card"><div class="chart-head">' +
        '<h3>Probabilità di pioggia</h3><p>ora per ora, dalle 17:00 all’01:00</p></div>' +
        '<div class="chart-box" id="chart-rain"></div></div>' +
      '<div class="chart-card"><div class="chart-head">' +
        '<h3>Temperatura</h3><p>passa il dito o il mouse per i gradi percepiti</p></div>' +
        '<div class="chart-box" id="chart-temp"></div></div>' +
      '<div class="table-wrap"><table class="hourly">' +
        '<caption class="visually-hidden">Previsioni ora per ora dalle 17:00 all’01:00 a Tragliata</caption>' +
        '<thead><tr><th scope="col">Ora</th><th scope="col">Cielo</th><th scope="col">Temp.</th>' +
        '<th scope="col">Pioggia</th><th scope="col">Vento km/h</th><th scope="col">Nuvole</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>';

    var tTicks = niceTicks(Math.floor(minOf(w.temp) - 1), Math.ceil(maxOf(w.temp) + 1));

    // disegna alla larghezza reale del contenitore, così le etichette non si deformano
    function draw() {
      var mount = function (id, opts) {
        var host = document.getElementById(id);
        if (!host) return;
        opts.width = host.clientWidth || 660;
        host.innerHTML = svgChart(opts) + '<div class="chart-tip" hidden></div>';
        attachTips(host);
      };

      mount('chart-rain', {
        kind: 'column', values: w.pop, labels: labels, tips: popTips,
        yMin: 0, yMax: 100, ticks: [0, 25, 50, 75, 100],
        fmtTick: function (v) { return v + '%'; }, cls: 'c-rain',
        aria: 'Probabilità di pioggia ora per ora dalle 17 all’1, da ' + w.pop[0] + '% a ' + w.pop[w.pop.length - 1] + '%'
      });

      mount('chart-temp', {
        kind: 'line', values: w.temp, labels: labels, tips: tempTips,
        yMin: tTicks[0], yMax: tTicks[tTicks.length - 1], ticks: tTicks,
        fmtTick: function (v) { return Math.round(v) + '°'; }, cls: 'c-temp',
        aria: 'Temperatura ora per ora dalle 17 all’1, da ' + r(w.temp[0]) + ' a ' + r(w.temp[w.temp.length - 1]) + ' gradi'
      });
    }

    draw();

    // renderHourly può girare due volte (file locale, poi refresh live):
    // il listener resta uno solo e ridisegna sempre l'ultimo grafico costruito
    redrawCharts = draw;
    if (!resizeBound) {
      resizeBound = true;
      var pending;
      window.addEventListener('resize', function () {
        clearTimeout(pending);
        pending = setTimeout(function () { if (redrawCharts) redrawCharts(); }, 150);
      });
    }
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
    renderHourly(d);
    renderNow(d);
    renderUpdated(d, live);
  }

  function fail(msg) {
    ['wedding-card', 'hourly-detail', 'now-card'].forEach(function (id) {
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
