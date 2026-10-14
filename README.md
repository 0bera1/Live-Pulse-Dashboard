# Live Pulse · Canlı Nabız Paneli

Dünyanın nabzını gerçek zamanlı izleyen operasyon merkezi tarzı dashboard. Sahte backend ve sunucu yok;
tüm veriler ücretsiz, anahtar gerektirmeyen halka açık API'lerden geliyor.

| Modül | Kaynak | Önbellek (sekme) | Tarayıcı polling |
|---|---|---|---|
| Deprem haritası | USGS Earthquake API | 60 sn | 20 sn |
| Kripto | Binance (yedek: CoinGecko) | 4 sn | 5 sn |
| Döviz | Frankfurter (ECB) | 30 dk | 60 sn |
| Hava durumu | Open-Meteo | 5 dk | 30 sn |
| GitHub akışı | GitHub REST `/events` | 90 sn | 90 sn |

## Çalıştırma

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # statik çıktı: ./out
```

İsteğe bağlı ortam değişkenleri (build sırasında okunur):

- `NEXT_PUBLIC_REPO_URL`: alt kısımdaki "Kaynak kodu" bağlantısı.
- `NEXT_PUBLIC_BASE_PATH`: site bir alt yoldan yayınlanacaksa (GitHub Pages proje sitesi: `/live-pulse-dashboard`).

## Yayınlama (sunucusuz)

Proje tamamen statik (`output: "export"`); çalışma anında sunucu yok. Tarayıcı, CORS'a izin veren
halka açık API'lere doğrudan bağlanıyor.

**Cloudflare Pages (birincil)** · Dashboard → Workers & Pages → Create → Pages → Connect to Git:

- Framework preset: `Next.js (Static HTML Export)` (ya da None)
- Build command: `npm run build`
- Build output directory: `out`
- Ortam değişkenleri: `NODE_VERSION=22` (`.node-version` da okunur), isteğe bağlı `NEXT_PUBLIC_REPO_URL`
- `NEXT_PUBLIC_BASE_PATH` **tanımlama** (kök dizinden yayınlanır).
- Özel alan adı (alan adı aynı Cloudflare hesabında): Pages projesi → Custom domains → Set up a domain →
  `pulse.beraekimci.com.tr`. Cloudflare DNS'e `CNAME pulse → <proje>.pages.dev` (proxied) kaydını kendisi ekler;
  elle eklemek için DNS → Records bölümünden aynı kaydı girin. SSL otomatik gelir, durum birkaç dakikada "Active" olur.

**GitHub Pages (ikincil)** · `.github/workflows/pages.yml`:

1. Repo → Settings → Pages → Source: **GitHub Actions**.
2. `main`'e push veya Actions → "GitHub Pages" → Run workflow.
3. Adres: `https://<kullanıcı>.github.io/live-pulse-dashboard/`. Özel alan adı kullanılacaksa (Cloudflare yerine) Settings → Pages →
   Custom domain'i girin ve repo variable `PAGES_BASE_PATH` değerini `/` yapın.

## Mimari

- `src/lib/live-pulse/sources.ts`: her kaynak için tarayıcıdan çağrılan yükleyici ve kaynak tablosu (`loadSource`).
- `src/lib/live-pulse/cache.ts`: sekme içi TTL önbellek. Eşzamanlı istekleri birleştirir;
  dış API düşerse son bilinen veriyi `stale: true` ile döner.
- `src/lib/live-pulse/usePolling.ts`: interval tabanlı fetch. Sekme gizliyken durur, aynı veri gelirse
  yeniden render etmez.
- `src/lib/live-pulse/status-store.ts`: üst başlıktaki SYSTEM STATUS göstergesini besleyen küçük store.
- `src/components/live-pulse/*`: her veri kartı ayrı bir component.

Not: istekler ziyaretçinin tarayıcısından gittiği için hız limitleri ziyaretçi başınadır. GitHub
(`/events`, anahtarsız) saatte 60 istek verir; bu yüzden 90 sn'de bir sorgulanır (≈40/saat). Token
kullanılmıyor, çünkü statik sitede gizli tutulamaz.
