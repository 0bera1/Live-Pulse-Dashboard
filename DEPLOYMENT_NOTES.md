# Deployment Notes

Live Pulse Dashboard'u yayına alırken ve yayından sonra ele alınacak konular.

---

## 1. Deploy öncesi yapılacaklar

- [ ] **Next.js sürümünü portfolyo sitesiyle eşleştir.** Proje Next.js `16.4.0` ile kuruldu, çünkü mevcut
      portfolyo projesi (beraekimci.com.tr) bu bilgisayarda değildi. Portfolyo farklı bir sürümdeyse taşımadan
      önce uyumluluğu kontrol et. Özellikle `cacheComponents` ayarına ve `connection()` kullanımına bak
      (`src/lib/live-pulse/server/route-handler.ts`).
- [ ] **Yayın şeklini seç:** mevcut portfolyo sitesine bir sayfa olarak mı eklenecek, yoksa ayrı bir proje
      olarak mı (ör. alt alan adı) yayınlanacak?
- [ ] **Git deposunu oluştur.** Proje henüz bir git deposu değil (`git init` yapılmadı).
- [ ] **Repo bağlantısını ayarla.** Sayfanın altındaki "Kaynak kodu GitHub'da incele" butonu şu an genel
      `https://github.com/` adresine gidiyor. `NEXT_PUBLIC_REPO_URL` ortam değişkenine gerçek repo adresini yaz.
- [ ] **`npm audit` uyarılarını incele.** Kurulumda birkaç güvenlik uyarısı çıktı. `npm audit fix --force`
      paket sürümlerini bozabileceği için çalıştırılmadı; tek tek değerlendirilmeli.

## 2. Ortam değişkenleri

| Değişken | Zorunlu mu | Açıklama |
|---|---|---|
| `NEXT_PUBLIC_REPO_URL` | Önerilir | Alttaki "Kaynak kodu" butonunun gideceği GitHub repo adresi. |
| `GITHUB_TOKEN` | İsteğe bağlı | GitHub API limitini saatte 60'tan 5000 isteğe çıkarır. Ücretsiz bir kişisel token yeterli, hiçbir yetki (scope) seçmeye gerek yok. |

## 3. Deploy sonrası yapılacak küçük düzenlemeler

- [ ] **Sistem günlüğündeki teknik açıklamayı sadeleştir.** "Canlı sistem günlüğü" panelinin sağ üstündeki
      `tarayıcı → /api/live-pulse/* → halka açık API` yazısı teknik olmayan ziyaretçiye bir şey ifade etmiyor.
      Yerine örneğin "Her satır, bu sayfanın şu an yaptığı gerçek bir veri isteği" gibi bir cümle yazılabilir.
      Dosya: `src/components/live-pulse/ActivityLog.tsx`.
- [ ] **GitHub akışının "tek tek akma" davranışına karar ver.** GitHub olayları toplu gelir; sayfa bunları
      listeye birer birer ekliyor. Olaylar ve zamanları gerçek, sadece ekrana giriş anları yayılıyor. Bu
      istenmezse `src/components/live-pulse/GithubCard.tsx` içindeki `useEventStream` kaldırılıp eski davranışa
      dönülebilir.
- [ ] **Gerçek tarayıcıda animasyonları gözden geçir.** Testler headless tarayıcı ekran görüntüleriyle yapıldı;
      günlük satırlarının akışı, yenileme çubukları ve kart parıltıları canlı ortamda bir kez izlenmeli.
- [ ] **Hata durumunu canlıda dene.** Bir kaynak çöktüğünde "son bilinen veri" ve "Veri şu an alınamıyor"
      durumları kodda var ama gerçek bir kesintiyle test edilmedi.

## 4. Barındırma ortamıyla ilgili bilinmesi gerekenler

- **Önbellek bellekte tutuluyor** (`src/lib/live-pulse/server/cache.ts`). Vercel gibi serverless ortamlarda
  trafik artınca birden fazla sunucu örneği açılabilir ve her birinin önbelleği ayrı olur. Bu durumda dış
      API'lere giden istek sayısı biraz artar ama limitlerin çok altında kalır. Ortak önbellek gerekirse ileride
      Redis/KV gibi bir çözüme geçilebilir.
- **Kaynakların yenilenme sıklıkları:**

  | Kaynak | Sunucu önbelleği | Tarayıcı isteği | Not |
  |---|---|---|---|
  | Kripto (Binance) | 4 sn | 5 sn | Binance düşerse CoinGecko'ya döner |
  | Deprem (USGS) | 60 sn | 20 sn | |
  | Hava (Open-Meteo) | 5 dk | 30 sn | Ölçümler 15 dakikada bir güncellenir |
  | GitHub | 90 sn | 30 sn | Tokensız limit: saatte 60 istek |
  | Döviz (Frankfurter/ECB) | 30 dk | 60 sn | ECB kurları günde bir kez yayınlanır |

- **Binance erişimi:** `data-api.binance.vision` yalnızca piyasa verisi sunan halka açık bir adres ve bölge
  kısıtlaması yok. Yine de sunucunun bulunduğu bölgeden erişilemezse kripto kartı otomatik olarak CoinGecko'ya
  geçer; bu durumda grafikler boş kalır ve kaynak etiketi "CoinGecko" olur.
- **Fontlar:** `next/font/google` build sırasında Google Fonts'a erişir; build ortamının internet erişimi olmalı.

## 5. Portfolyo sitesine taşıma

Kopyalanacaklar:

- `src/components/live-pulse/`
- `src/lib/live-pulse/`
- `src/app/api/live-pulse/`
- `public/geo/countries-110m.json`
- `src/app/globals.css` içindeki tema token'ları (`:root` ve `@theme inline` blokları) ile animasyon sınıfları
  (`.panel`, `.skeleton`, `.pulse-dot`, `.quake-ripple`, `.refresh-fill`, `.card-flash`, `.backdrop`)
- Fontlar: `src/app/layout.tsx` içindeki Geist ve JetBrains Mono tanımları

Kurulacak paketler: `framer-motion`, `react-simple-maps`, `lucide-react`, `server-only`.

Ardından istenen sayfada `<Dashboard />` bileşenini render etmek yeterli.

## 6. Yayın sonrası kontrol listesi

- [ ] Sayfa açılıyor ve üstte "SYSTEM STATUS: LIVE" görünüyor.
- [ ] Beş kaynağın hepsi "CANLI" durumunda.
- [ ] `/api/live-pulse/crypto`, `/earthquakes`, `/fx`, `/weather`, `/github` adresleri 200 dönüyor.
- [ ] Sistem günlüğüne birkaç saniyede bir yeni satır düşüyor.
- [ ] Mobilde (≈390px) yatay kaydırma yok ve kartlar tek sütunda.
- [ ] Sunucu loglarında `[live-pulse] ... unavailable` hatası yok.
