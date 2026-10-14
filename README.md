# Live Pulse · Canlı Nabız Paneli

Dünyanın nabzını gerçek zamanlı izleyen operasyon merkezi tarzı dashboard. Sahte backend yok;
tüm veriler ücretsiz, anahtar gerektirmeyen halka açık API'lerden geliyor.

| Modül | Kaynak | Sunucu önbelleği | Tarayıcı polling |
|---|---|---|---|
| Deprem haritası | USGS Earthquake API | 60 sn | 30 sn |
| Kripto | CoinGecko | 30 sn | 30 sn |
| Döviz | Frankfurter (ECB) | 30 dk | 60 sn |
| Hava durumu | Open-Meteo | 5 dk | 60 sn |
| GitHub akışı | GitHub REST `/events` | 90 sn | 30 sn |

## Çalıştırma

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

İsteğe bağlı ortam değişkenleri:

- `GITHUB_TOKEN`: GitHub hız limitini 60'tan 5000 istek/saate çıkarır (ücretsiz kişisel token).
- `NEXT_PUBLIC_REPO_URL`: alt kısımdaki "Kaynak kodu" bağlantısı.

## Mimari

- `src/app/api/live-pulse/*/route.ts`: her kaynak için sunucu tarafı proxy (CORS ve hız limiti koruması).
- `src/lib/live-pulse/server/cache.ts`: paylaşımlı TTL önbellek. Eşzamanlı istekleri birleştirir;
  dış API düşerse son bilinen veriyi `stale: true` ile döner.
- `src/lib/live-pulse/usePolling.ts`: interval tabanlı fetch. Sekme gizliyken durur, aynı veri gelirse
  yeniden render etmez.
- `src/lib/live-pulse/status-store.ts`: üst başlıktaki SYSTEM STATUS göstergesini besleyen küçük store.
- `src/components/live-pulse/*`: her veri kartı ayrı bir component.

## Portfolyo sitesine taşıma

`src/components/live-pulse`, `src/lib/live-pulse`, `src/app/api/live-pulse`, `public/geo` klasörlerini ve
`globals.css` içindeki tema token'larını kopyalayın. Ardından istediğiniz sayfada `<Dashboard />` render edin.
Bağımlılıklar: `framer-motion`, `react-simple-maps`, `lucide-react`, `server-only`.
