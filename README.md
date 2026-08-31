# Countdown 12 settembre 2026 + meteo Tragliata

Sito statico che mostra:

- il **countdown** al 12 settembre 2026, ore 00:00 (ora italiana);
- le **previsioni meteo** per **Tragliata** (Fiumicino, Roma — 41.9345 N, 12.2394 E):
  condizioni attuali, i prossimi 8 giorni e una scheda dedicata al giorno del matrimonio
  (compare quando la data rientra nei 16 giorni coperti dal modello).

Dati da [Open-Meteo](https://open-meteo.com/) — gratuito, senza API key.

## Struttura

```
index.html                       pagina
assets/style.css                 stile
assets/app.js                    countdown + rendering meteo
scripts/fetch-weather.js         scarica le previsioni → data/weather.json
data/weather.json                dati aggiornati dal workflow
.github/workflows/weather.yml    aggiornamento automatico ogni 4 ore
```

## Messa online (una volta sola)

1. Crea un repository su GitHub (per esempio `wedding-countdown`), **pubblico**
   (GitHub Pages su repo privati richiede un piano a pagamento).
2. Dalla cartella del progetto:

   ```bash
   git remote add origin https://github.com/<TUO-UTENTE>/<TUO-REPO>.git
   git push -u origin main
   ```

3. Su GitHub: **Settings → Pages → Build and deployment**
   - *Source*: **Deploy from a branch**
   - *Branch*: **main**, cartella **/ (root)** → **Save**

   Dopo un minuto il sito è su `https://<TUO-UTENTE>.github.io/<TUO-REPO>/`.

4. Su GitHub: **Settings → Actions → General → Workflow permissions**
   → seleziona **Read and write permissions** → **Save**.
   Serve al workflow per ricommittare `data/weather.json`.

5. Vai su **Actions → Aggiorna previsioni meteo → Run workflow** per la prima
   esecuzione manuale e verificare che tutto funzioni.

## Aggiornamento automatico

Il workflow gira alle **04, 08, 12, 16, 20 UTC**, cioè **06:00, 10:00, 14:00, 18:00 e 22:00**
ora italiana durante l'ora legale (quindi anche a settembre 2026): un aggiornamento ogni 4 ore
nella fascia 6:00 – 24:00, come richiesto. In ora solare (da fine ottobre) gli stessi cron
cadono un'ora prima (05–21), perché GitHub Actions non conosce i fusi orari locali.

Due cose da sapere sugli scheduled workflow di GitHub:

- possono partire **con qualche minuto di ritardo** nei momenti di carico;
- su repository pubblici vengono **disattivati dopo 60 giorni senza commit**;
  GitHub manda un'email e basta un click su *Enable workflow* per riattivarli
  (i commit del meteo stesso contano come attività, quindi in pratica non succede).

Come rete di sicurezza, se il file `data/weather.json` risulta più vecchio di 5 ore
la pagina interroga Open-Meteo direttamente dal browser, così i dati mostrati
restano freschi anche se un'esecuzione salta.

## Sviluppo locale

```bash
node scripts/fetch-weather.js     # aggiorna i dati
python3 -m http.server 8000       # poi apri http://localhost:8000
```

## Personalizzazioni rapide

- **Data/ora**: `TARGET` e `WEDDING_DAY` in `assets/app.js`, più il titolo in `index.html`.
- **Luogo**: `LAT`/`LON` in `scripts/fetch-weather.js` **e** in `assets/app.js`.
- **Frequenza**: la riga `cron:` in `.github/workflows/weather.yml`.
