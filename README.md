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

## Diller

Arayüz Türkçe, İngilizce, İspanyolca ve Çince destekler (sayfanın sağ üstündeki seçici). Seçim tarayıcıda
saklanır; ilk açılışta tarayıcı dili kullanılır. Metinler `src/lib/live-pulse/i18n.ts` içinde; yeni dil için
o dosyaya bir sözlük ve `LOCALES` listesine bir giriş eklemek yeterli.

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

**Cloudflare (birincil)** · Dashboard → Workers & Pages → Create → Connect to Git. Yeni arayüz projeyi
Worker olarak kurar; `wrangler.jsonc` `./out` klasörünü statik varlık olarak yayınlar, ayarlar:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy` (varsayılan)
- Ortam değişkenleri: `NODE_VERSION=22` (`.node-version` da okunur), isteğe bağlı `NEXT_PUBLIC_REPO_URL`
- `NEXT_PUBLIC_BASE_PATH` **tanımlama** (kök dizinden yayınlanır).
- Klasik Pages projesi kullanırsanız: build output directory `out`, deploy komutu yok.
- Özel alan adı (alan adı aynı Cloudflare hesabında): proje → Settings → Domains & Routes → Add → Custom domain →
  `pulse.beraekimci.com.tr` (Pages projesinde: Custom domains). Cloudflare DNS'e gerekli kaydı (proxied) kaydını kendisi ekler;
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
