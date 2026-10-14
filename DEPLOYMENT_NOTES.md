# Deployment Notes

Live Pulse Dashboard'u yayına alırken ve yayından sonra ele alınacak konular.

---

## 0. Yayın

Statik export; adımlar için README'deki "Yayınlama (sunucusuz)" bölümüne bakın (Cloudflare Pages birincil, GitHub Pages ikincil).
Hedef adres: `https://pulse.beraekimci.com.tr`.

## 1. Deploy öncesi yapılacaklar

- [ ] **Next.js sürümünü portfolyo sitesiyle eşleştir.** Proje Next.js `16.4.0` ile kuruldu, çünkü mevcut
      portfolyo projesi (beraekimci.com.tr) bu bilgisayarda değildi. Portfolyo farklı bir sürümdeyse taşımadan
      önce uyumluluğu kontrol et. Özellikle statik export gerektiğinden `cacheComponents` kapatıldı ve API route'ları kaldırıldı.
- [ ] **Yayın şeklini seç:** mevcut portfolyo sitesine bir sayfa olarak mı eklenecek, yoksa ayrı bir proje
      olarak mı (ör. alt alan adı) yayınlanacak?
- [ ] **`npm audit` uyarılarını incele.** Kurulumda birkaç güvenlik uyarısı çıktı. `npm audit fix --force`
      paket sürümlerini bozabileceği için çalıştırılmadı; tek tek değerlendirilmeli.

## 2. Ortam değişkenleri

| Değişken | Zorunlu mu | Açıklama |
|---|---|---|
| `NEXT_PUBLIC_REPO_URL` | Önerilir | Alttaki "Kaynak kodu" butonunun gideceği GitHub repo adresi. |
| `NEXT_PUBLIC_BASE_PATH` | Yalnızca alt yolda | GitHub Pages proje sitesi için `/live-pulse-dashboard`. Kök alan adında boş bırakın. |

## 3. Deploy sonrası yapılacak küçük düzenlemeler

- [ ] **GitHub akışının "tek tek akma" davranışına karar ver.** GitHub olayları toplu gelir; sayfa bunları
      listeye birer birer ekliyor. Olaylar ve zamanları gerçek, sadece ekrana giriş anları yayılıyor. Bu
      istenmezse `src/components/live-pulse/GithubCard.tsx` içindeki `useEventStream` kaldırılıp eski davranışa
      dönülebilir.
- [ ] **Gerçek tarayıcıda animasyonları gözden geçir.** Testler headless tarayıcı ekran görüntüleriyle yapıldı;
      günlük satırlarının akışı, yenileme çubukları ve kart parıltıları canlı ortamda bir kez izlenmeli.
- [ ] **Hata durumunu canlıda dene.** Bir kaynak çöktüğünde "son bilinen veri" ve "Veri şu an alınamıyor"
      durumları kodda var ama gerçek bir kesintiyle test edilmedi.

## 4. Barındırma ortamıyla ilgili bilinmesi gerekenler

- **Sunucu yok.** API route'ları kaldırıldı; tarayıcı dış API'lere doğrudan bağlanıyor (hepsi CORS'a izin veriyor).
  Hız limitleri ziyaretçi (IP) başınadır; ortak önbellek yoktur. GitHub `/events` anahtarsız saatte 60 istek verdiği
  için 90 sn'de bir sorgulanıyor.
- **Kaynakların yenilenme sıklıkları:**

  | Kaynak | Sekme önbelleği | Tarayıcı isteği | Not |
  |---|---|---|---|
  | Kripto (Binance) | 4 sn | 5 sn | Binance düşerse CoinGecko'ya döner |
  | Deprem (USGS) | 60 sn | 20 sn | |
  | Hava (Open-Meteo) | 5 dk | 30 sn | Ölçümler 15 dakikada bir güncellenir |
  | GitHub | 90 sn | 90 sn | Tokensız limit: saatte 60 istek |
  | Döviz (Frankfurter/ECB) | 30 dk | 60 sn | ECB kurları günde bir kez yayınlanır |

- **Binance erişimi:** `data-api.binance.vision` yalnızca piyasa verisi sunan halka açık bir adres ve bölge
  kısıtlaması yok. Yine de ziyaretçinin bulunduğu bölgeden erişilemezse kripto kartı otomatik olarak CoinGecko'ya
  geçer; bu durumda grafikler boş kalır ve kaynak etiketi "CoinGecko" olur.
- **Fontlar:** `next/font/google` build sırasında Google Fonts'a erişir; build ortamının internet erişimi olmalı.

## 5. Portfolyo sitesine taşıma

Kopyalanacaklar:

- `src/components/live-pulse/`
- `src/lib/live-pulse/`
- `public/geo/countries-110m.json`
- `src/app/globals.css` içindeki tema token'ları (`:root` ve `@theme inline` blokları) ile animasyon sınıfları
  (`.panel`, `.skeleton`, `.pulse-dot`, `.quake-ripple`, `.refresh-fill`, `.card-flash`, `.backdrop`)
- Fontlar: `src/app/layout.tsx` içindeki Geist ve JetBrains Mono tanımları

Kurulacak paketler: `framer-motion`, `react-simple-maps`, `lucide-react`.

Ardından istenen sayfada `<Dashboard />` bileşenini render etmek yeterli.

## 6. Yayın sonrası kontrol listesi

- [ ] Sayfa açılıyor ve üstte "SYSTEM STATUS: LIVE" görünüyor.
- [ ] Beş kaynağın hepsi "CANLI" durumunda.
- [ ] Tarayıcı konsolunda CORS hatası yok (Network sekmesinde 5 dış API de 200 dönüyor).
- [ ] Sistem günlüğüne birkaç saniyede bir yeni satır düşüyor.
- [ ] Mobilde (≈390px) yatay kaydırma yok ve kartlar tek sütunda.
