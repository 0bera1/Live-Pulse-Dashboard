import { useSyncExternalStore } from "react";

export type Locale = "tr" | "en" | "es" | "zh";

export const LOCALES: { id: Locale; short: string; name: string }[] = [
  { id: "tr", short: "TR", name: "Türkçe" },
  { id: "en", short: "EN", name: "English" },
  { id: "es", short: "ES", name: "Español" },
  { id: "zh", short: "中文", name: "中文" },
];

const STORAGE_KEY = "live-pulse-locale";

export interface Dict {
  htmlLang: string;
  /** BCP 47 tag for Intl formatting. */
  intl: string;
  title: string;
  description: string;
  languageLabel: string;
  designedBy: string;

  header: {
    eyebrow: string;
    intro: string;
    booting: string;
    lastUpdate: string;
    activeSources: string;
    sessionRequests: string;
    avg: (ms: number) => string;
    sourcesAria: string;
    localTime: string;
    sources: { earthquakes: string; crypto: string; fx: string; weather: string; github: string };
  };
  log: { title: string; subtitle: string; connecting: string };
  card: {
    downTitle: string;
    downHint: string;
    source: string;
    lastKnown: string;
    badge: { loading: string; live: string; stale: string; down: string };
    paused: string;
    refreshing: string;
    refreshIn: (s: number) => string;
  };
  time: {
    now: string;
    seconds: (n: number) => string;
    minutes: (n: number) => string;
    hours: (n: number) => string;
    days: (n: number) => string;
  };
  crypto: { title: string; subtitle: string; note: string; spark: (name: string) => string };
  quake: {
    title: string;
    subtitle: string;
    count: string;
    strongest: string;
    since: string;
    legend: string;
    tiers: { strong: string; moderate: string; light: string };
    ring: string;
    latest: string;
    depth: string;
    tsunami: string;
    mapAria: (n: number) => string;
  };
  fx: {
    title: string;
    subtitle: (date: string | null) => string;
    note: string;
    spark: (pair: string, n: number) => string;
    labels: Record<string, string>;
  };
  weather: {
    title: string;
    subtitle: string;
    windUnit: string;
    cities: Record<string, string>;
    kinds: {
      clear: string;
      partly: string;
      overcast: string;
      fog: string;
      drizzle: string;
      rain: string;
      heavyRain: string;
      snow: string;
      showers: string;
      snowShowers: string;
      thunder: string;
    };
  };
  github: {
    title: string;
    subtitle: string;
    last: (n: number) => string;
    queued: (n: number) => string;
    delay: string;
    kinds: Record<"push" | "pr" | "issue" | "star" | "fork" | "create" | "release", { verb: string; short: string }>;
    actions: Record<string, string>;
  };
  tech: {
    eyebrow: string;
    heading: string;
    body: string;
    repo: string;
    stack: { k: string; v: string }[];
  };
  msg: {
    quakesLoaded: (n: number, mag: string) => string;
    quakesNone: (n: number) => string;
    quakeNew: (mag: string, place: string, extra: number) => string;
    fxLoaded: (n: number, head: string) => string;
    fxNew: (date: string, head: string) => string;
    fxCurrent: (date: string, head: string) => string;
    weatherLoaded: (n: number, list: string) => string;
    weatherChanged: (n: number, list: string) => string;
    weatherSame: (list: string) => string;
    githubLoaded: (n: number) => string;
    githubNone: string;
    githubNew: (n: number, actor: string, repo: string) => string;
    stale: string;
    failedKeep: string;
    failedRetry: string;
  };
}

const tr: Dict = {
  htmlLang: "tr",
  intl: "tr-TR",
  title: "Live Pulse · Canlı Nabız Paneli",
  description:
    "Depremler, piyasalar, hava durumu ve açık kaynak aktivitesini halka açık API'lerden gerçek zamanlı izleyen operasyon merkezi.",
  languageLabel: "Dil",
  designedBy: "Tasarım: ",
  header: {
    eyebrow: "Operasyon Merkezi // 01",
    intro:
      "Dünyanın nabzını gerçek zamanlı izleyen operasyon merkezi. Depremler, piyasalar, hava durumu ve açık kaynak dünyası, beş halka açık veri kaynağından tek ekranda.",
    booting: "BAŞLATILIYOR",
    lastUpdate: "Son güncelleme",
    activeSources: "Aktif kaynak",
    sessionRequests: "Bu oturumda istek",
    avg: (ms) => ` · ort. ${ms} ms`,
    sourcesAria: "Kaynak durumları",
    localTime: "Yerel saat",
    sources: { earthquakes: "Deprem", crypto: "Kripto", fx: "Döviz", weather: "Hava", github: "GitHub" },
  },
  log: { title: "Canlı sistem günlüğü", subtitle: "tarayıcı → halka açık API", connecting: "bağlantılar kuruluyor…" },
  card: {
    downTitle: "Veri şu an alınamıyor",
    downHint: "Bağlantı otomatik olarak yeniden denenecek",
    source: "Kaynak",
    lastKnown: "son bilinen veri ·",
    badge: { loading: "BAĞLANIYOR", live: "CANLI", stale: "GECİKMELİ", down: "ÇEVRİMDIŞI" },
    paused: "duraklatıldı",
    refreshing: "yenileniyor…",
    refreshIn: (s) => `${s} sn sonra yenilenir`,
  },
  time: {
    now: "şimdi",
    seconds: (n) => `${n} sn önce`,
    minutes: (n) => `${n} dk önce`,
    hours: (n) => `${n} sa önce`,
    days: (n) => `${n} gün önce`,
  },
  crypto: {
    title: "Kripto Piyasası",
    subtitle: "USD · anlık fiyat · 5 sn",
    note: "Grafik: son 60 dakika · değişim: 24 saat",
    spark: (name) => `${name} son 1 saat`,
  },
  quake: {
    title: "Küresel Sismik Aktivite",
    subtitle: "Son 24 saat · M2.5+",
    count: "Kaydedilen deprem",
    strongest: "En büyük",
    since: "Son depremden bu yana",
    legend: "Lejant",
    tiers: { strong: "Güçlü · M6+", moderate: "Orta · M4.5–5.9", light: "Hafif · M2.5–4.4" },
    ring: "Halka: son 1 saat · boyut = büyüklük",
    latest: "En son depremler",
    depth: "Derinlik",
    tsunami: "tsunami uyarısı",
    mapAria: (n) => `Son 24 saatteki ${n} depremin dünya haritası`,
  },
  fx: {
    title: "Döviz Kurları",
    subtitle: (d) => (d ? `ECB referans · ${d}` : "ECB referans kurları"),
    note: "Değişim: önceki iş gününe göre · grafik: son 3 hafta",
    spark: (pair, n) => `${pair} son ${n} iş günü trendi`,
    labels: { "USD/TRY": "Amerikan Doları", "EUR/TRY": "Euro", "GBP/TRY": "İngiliz Sterlini", "EUR/USD": "Euro / Dolar" },
  },
  weather: {
    title: "Dünya Hava Durumu",
    subtitle: "Anlık · 6 şehir",
    windUnit: "km/s",
    cities: { istanbul: "İstanbul", ankara: "Ankara", london: "Londra", newyork: "New York", tokyo: "Tokyo", sydney: "Sidney" },
    kinds: {
      clear: "Açık",
      partly: "Parçalı bulutlu",
      overcast: "Kapalı",
      fog: "Sisli",
      drizzle: "Çisenti",
      rain: "Yağmurlu",
      heavyRain: "Şiddetli yağmur",
      snow: "Karlı",
      showers: "Sağanak",
      snowShowers: "Kar sağanağı",
      thunder: "Gök gürültülü",
    },
  },
  github: {
    title: "Açık Kaynak Nabzı",
    subtitle: "genel olay akışı",
    last: (n) => `Son ${n} olay:`,
    queued: (n) => `${n} olay akışa giriyor`,
    delay: "GitHub bu akışı kendi tarafında birkaç dakika gecikmeli yayınlar.",
    kinds: {
      push: { verb: "kod gönderdi", short: "push" },
      pr: { verb: "pull request", short: "PR" },
      issue: { verb: "issue", short: "issue" },
      star: { verb: "yıldızladı", short: "yıldız" },
      fork: { verb: "fork'ladı", short: "fork" },
      create: { verb: "oluşturdu", short: "yeni" },
      release: { verb: "sürüm yayınladı", short: "sürüm" },
    },
    actions: {
      opened: "açtı",
      closed: "kapattı",
      reopened: "yeniden açtı",
      merged: "birleştirdi",
      branch: "dal oluşturdu",
      tag: "etiket oluşturdu",
      repository: "repo oluşturdu",
    },
  },
  tech: {
    eyebrow: "Teknik not",
    heading: "Bu proje nasıl çalışıyor?",
    body: "Sahte backend ve sunucu yok. Sayfa tamamen statik; tarayıcı halka açık API'lere doğrudan bağlanıyor ve her kaynağı kendi hız limitine uygun aralıklarla yeniliyor.",
    repo: "Kaynak kodu GitHub'da incele",
    stack: [
      { k: "Framework", v: "Next.js App Router · TypeScript" },
      { k: "Veri", v: "5 halka açık API, anahtar gerektirmez" },
      { k: "Yayın", v: "Statik export · tarayıcıdan doğrudan API + sekme içi TTL önbellek" },
      { k: "Güncelleme", v: "Interval tabanlı polling, sekme gizliyken durur" },
      { k: "Dayanıklılık", v: "Kaynak düşerse son bilinen veri gösterilir" },
      { k: "Arayüz", v: "Tailwind CSS · Framer Motion · react-simple-maps" },
    ],
  },
  msg: {
    quakesLoaded: (n, mag) => `${n} deprem yüklendi · en büyük M${mag}`,
    quakesNone: (n) => `yeni deprem yok · ${n} olay izleniyor`,
    quakeNew: (mag, place, extra) => `YENİ DEPREM M${mag} · ${place}${extra > 0 ? ` (+${extra})` : ""}`,
    fxLoaded: (n, head) => `${n} kur yüklendi · ${head}`,
    fxNew: (date, head) => `yeni ECB kurları (${date}) · ${head}`,
    fxCurrent: (date, head) => `kurlar güncel · ECB ${date} · ${head}`,
    weatherLoaded: (n, list) => `${n} şehir yüklendi · ${list}`,
    weatherChanged: (n, list) => `${n} şehirde değişim · ${list}`,
    weatherSame: (list) => `ölçümler aynı · ${list}`,
    githubLoaded: (n) => `${n} olay yüklendi`,
    githubNone: "yeni olay yok",
    githubNew: (n, actor, repo) => `+${n} yeni olay akışa ekleniyor · son: ${actor} → ${repo}`,
    stale: "kaynak yanıt vermiyor · son bilinen veri korunuyor",
    failedKeep: "istek başarısız · son bilinen veri korunuyor",
    failedRetry: "istek başarısız · yeniden denenecek",
  },
};

const en: Dict = {
  htmlLang: "en",
  intl: "en-US",
  title: "Live Pulse · Real-time Dashboard",
  description:
    "An operations-center dashboard that tracks earthquakes, markets, weather and open-source activity in real time from public APIs.",
  languageLabel: "Language",
  designedBy: "Designed by ",
  header: {
    eyebrow: "Operations Center // 01",
    intro:
      "An operations center that watches the world's pulse in real time. Earthquakes, markets, weather and the open-source world from five public data sources on one screen.",
    booting: "STARTING",
    lastUpdate: "Last update",
    activeSources: "Active sources",
    sessionRequests: "Requests this session",
    avg: (ms) => ` · avg. ${ms} ms`,
    sourcesAria: "Source status",
    localTime: "Local time",
    sources: { earthquakes: "Quakes", crypto: "Crypto", fx: "FX", weather: "Weather", github: "GitHub" },
  },
  log: { title: "Live system log", subtitle: "browser → public API", connecting: "connecting…" },
  card: {
    downTitle: "Data is unavailable right now",
    downHint: "The connection will be retried automatically",
    source: "Source",
    lastKnown: "last known data ·",
    badge: { loading: "CONNECTING", live: "LIVE", stale: "DELAYED", down: "OFFLINE" },
    paused: "paused",
    refreshing: "refreshing…",
    refreshIn: (s) => `refreshes in ${s}s`,
  },
  time: {
    now: "now",
    seconds: (n) => `${n}s ago`,
    minutes: (n) => `${n}m ago`,
    hours: (n) => `${n}h ago`,
    days: (n) => `${n}d ago`,
  },
  crypto: {
    title: "Crypto Market",
    subtitle: "USD · live price · 5 s",
    note: "Chart: last 60 minutes · change: 24 hours",
    spark: (name) => `${name} last hour`,
  },
  quake: {
    title: "Global Seismic Activity",
    subtitle: "Last 24 hours · M2.5+",
    count: "Recorded quakes",
    strongest: "Strongest",
    since: "Since last quake",
    legend: "Legend",
    tiers: { strong: "Strong · M6+", moderate: "Moderate · M4.5–5.9", light: "Light · M2.5–4.4" },
    ring: "Ring: last hour · size = magnitude",
    latest: "Latest earthquakes",
    depth: "Depth",
    tsunami: "tsunami warning",
    mapAria: (n) => `World map of ${n} earthquakes in the last 24 hours`,
  },
  fx: {
    title: "Exchange Rates",
    subtitle: (d) => (d ? `ECB reference · ${d}` : "ECB reference rates"),
    note: "Change: vs. previous business day · chart: last 3 weeks",
    spark: (pair, n) => `${pair} trend over the last ${n} business days`,
    labels: { "USD/TRY": "US Dollar", "EUR/TRY": "Euro", "GBP/TRY": "British Pound", "EUR/USD": "Euro / Dollar" },
  },
  weather: {
    title: "World Weather",
    subtitle: "Now · 6 cities",
    windUnit: "km/h",
    cities: { istanbul: "Istanbul", ankara: "Ankara", london: "London", newyork: "New York", tokyo: "Tokyo", sydney: "Sydney" },
    kinds: {
      clear: "Clear",
      partly: "Partly cloudy",
      overcast: "Overcast",
      fog: "Foggy",
      drizzle: "Drizzle",
      rain: "Rainy",
      heavyRain: "Heavy rain",
      snow: "Snowy",
      showers: "Showers",
      snowShowers: "Snow showers",
      thunder: "Thunderstorm",
    },
  },
  github: {
    title: "Open Source Pulse",
    subtitle: "public event stream",
    last: (n) => `Last ${n} events:`,
    queued: (n) => `${n} events streaming in`,
    delay: "GitHub publishes this feed with a delay of a few minutes.",
    kinds: {
      push: { verb: "pushed to", short: "push" },
      pr: { verb: "pull request", short: "PR" },
      issue: { verb: "issue", short: "issue" },
      star: { verb: "starred", short: "star" },
      fork: { verb: "forked", short: "fork" },
      create: { verb: "created", short: "new" },
      release: { verb: "published a release in", short: "release" },
    },
    actions: {
      opened: "opened",
      closed: "closed",
      reopened: "reopened",
      merged: "merged",
      branch: "created a branch in",
      tag: "created a tag in",
      repository: "created repo",
    },
  },
  tech: {
    eyebrow: "Tech note",
    heading: "How does this project work?",
    body: "No fake backend and no server. The page is fully static; the browser talks to public APIs directly and refreshes each source at an interval that respects its rate limit.",
    repo: "View the source on GitHub",
    stack: [
      { k: "Framework", v: "Next.js App Router · TypeScript" },
      { k: "Data", v: "5 public APIs, no key required" },
      { k: "Hosting", v: "Static export · direct browser-to-API calls + per-tab TTL cache" },
      { k: "Updates", v: "Interval polling, paused while the tab is hidden" },
      { k: "Resilience", v: "Last known data is shown if a source goes down" },
      { k: "UI", v: "Tailwind CSS · Framer Motion · react-simple-maps" },
    ],
  },
  msg: {
    quakesLoaded: (n, mag) => `${n} quakes loaded · strongest M${mag}`,
    quakesNone: (n) => `no new quakes · ${n} events tracked`,
    quakeNew: (mag, place, extra) => `NEW QUAKE M${mag} · ${place}${extra > 0 ? ` (+${extra})` : ""}`,
    fxLoaded: (n, head) => `${n} pairs loaded · ${head}`,
    fxNew: (date, head) => `new ECB rates (${date}) · ${head}`,
    fxCurrent: (date, head) => `rates up to date · ECB ${date} · ${head}`,
    weatherLoaded: (n, list) => `${n} cities loaded · ${list}`,
    weatherChanged: (n, list) => `${n} cities changed · ${list}`,
    weatherSame: (list) => `readings unchanged · ${list}`,
    githubLoaded: (n) => `${n} events loaded`,
    githubNone: "no new events",
    githubNew: (n, actor, repo) => `+${n} new events streaming in · latest: ${actor} → ${repo}`,
    stale: "source not responding · keeping last known data",
    failedKeep: "request failed · keeping last known data",
    failedRetry: "request failed · will retry",
  },
};

const es: Dict = {
  htmlLang: "es",
  intl: "es-ES",
  title: "Live Pulse · Panel en tiempo real",
  description:
    "Centro de operaciones que sigue en tiempo real terremotos, mercados, clima y actividad de código abierto desde APIs públicas.",
  languageLabel: "Idioma",
  designedBy: "Diseñado por ",
  header: {
    eyebrow: "Centro de operaciones // 01",
    intro:
      "Un centro de operaciones que sigue el pulso del mundo en tiempo real. Terremotos, mercados, clima y el mundo del código abierto, desde cinco fuentes públicas en una sola pantalla.",
    booting: "INICIANDO",
    lastUpdate: "Última actualización",
    activeSources: "Fuentes activas",
    sessionRequests: "Solicitudes en esta sesión",
    avg: (ms) => ` · prom. ${ms} ms`,
    sourcesAria: "Estado de las fuentes",
    localTime: "Hora local",
    sources: { earthquakes: "Sismos", crypto: "Cripto", fx: "Divisas", weather: "Clima", github: "GitHub" },
  },
  log: { title: "Registro del sistema en vivo", subtitle: "navegador → API pública", connecting: "conectando…" },
  card: {
    downTitle: "No se pueden obtener datos ahora",
    downHint: "La conexión se reintentará automáticamente",
    source: "Fuente",
    lastKnown: "últimos datos conocidos ·",
    badge: { loading: "CONECTANDO", live: "EN VIVO", stale: "RETRASADO", down: "SIN CONEXIÓN" },
    paused: "en pausa",
    refreshing: "actualizando…",
    refreshIn: (s) => `se actualiza en ${s} s`,
  },
  time: {
    now: "ahora",
    seconds: (n) => `hace ${n} s`,
    minutes: (n) => `hace ${n} min`,
    hours: (n) => `hace ${n} h`,
    days: (n) => `hace ${n} d`,
  },
  crypto: {
    title: "Mercado cripto",
    subtitle: "USD · precio en vivo · 5 s",
    note: "Gráfico: últimos 60 minutos · variación: 24 horas",
    spark: (name) => `${name} última hora`,
  },
  quake: {
    title: "Actividad sísmica global",
    subtitle: "Últimas 24 horas · M2.5+",
    count: "Sismos registrados",
    strongest: "El más fuerte",
    since: "Desde el último sismo",
    legend: "Leyenda",
    tiers: { strong: "Fuerte · M6+", moderate: "Moderado · M4.5–5.9", light: "Leve · M2.5–4.4" },
    ring: "Anillo: última hora · tamaño = magnitud",
    latest: "Últimos sismos",
    depth: "Profundidad",
    tsunami: "alerta de tsunami",
    mapAria: (n) => `Mapa mundial de ${n} sismos de las últimas 24 horas`,
  },
  fx: {
    title: "Tipos de cambio",
    subtitle: (d) => (d ? `Referencia BCE · ${d}` : "Tipos de referencia del BCE"),
    note: "Variación: frente al día hábil anterior · gráfico: últimas 3 semanas",
    spark: (pair, n) => `Tendencia de ${pair} en los últimos ${n} días hábiles`,
    labels: { "USD/TRY": "Dólar estadounidense", "EUR/TRY": "Euro", "GBP/TRY": "Libra esterlina", "EUR/USD": "Euro / Dólar" },
  },
  weather: {
    title: "Clima mundial",
    subtitle: "Ahora · 6 ciudades",
    windUnit: "km/h",
    cities: { istanbul: "Estambul", ankara: "Ankara", london: "Londres", newyork: "Nueva York", tokyo: "Tokio", sydney: "Sídney" },
    kinds: {
      clear: "Despejado",
      partly: "Parcialmente nublado",
      overcast: "Nublado",
      fog: "Niebla",
      drizzle: "Llovizna",
      rain: "Lluvioso",
      heavyRain: "Lluvia intensa",
      snow: "Nevado",
      showers: "Chubascos",
      snowShowers: "Chubascos de nieve",
      thunder: "Tormenta",
    },
  },
  github: {
    title: "Pulso del código abierto",
    subtitle: "flujo público de eventos",
    last: (n) => `Últimos ${n} eventos:`,
    queued: (n) => `${n} eventos entrando`,
    delay: "GitHub publica este flujo con unos minutos de retraso.",
    kinds: {
      push: { verb: "subió código a", short: "push" },
      pr: { verb: "pull request", short: "PR" },
      issue: { verb: "issue", short: "issue" },
      star: { verb: "destacó", short: "estrella" },
      fork: { verb: "hizo fork de", short: "fork" },
      create: { verb: "creó", short: "nuevo" },
      release: { verb: "publicó una versión en", short: "versión" },
    },
    actions: {
      opened: "abrió",
      closed: "cerró",
      reopened: "reabrió",
      merged: "fusionó",
      branch: "creó una rama en",
      tag: "creó una etiqueta en",
      repository: "creó el repo",
    },
  },
  tech: {
    eyebrow: "Nota técnica",
    heading: "¿Cómo funciona este proyecto?",
    body: "Sin backend falso ni servidor. La página es totalmente estática; el navegador se conecta directamente a las APIs públicas y actualiza cada fuente con un intervalo acorde a su límite de peticiones.",
    repo: "Ver el código en GitHub",
    stack: [
      { k: "Framework", v: "Next.js App Router · TypeScript" },
      { k: "Datos", v: "5 APIs públicas, sin clave" },
      { k: "Despliegue", v: "Exportación estática · llamadas directas a las APIs + caché TTL por pestaña" },
      { k: "Actualización", v: "Polling por intervalos, en pausa con la pestaña oculta" },
      { k: "Resiliencia", v: "Si una fuente cae, se muestran los últimos datos conocidos" },
      { k: "Interfaz", v: "Tailwind CSS · Framer Motion · react-simple-maps" },
    ],
  },
  msg: {
    quakesLoaded: (n, mag) => `${n} sismos cargados · el mayor M${mag}`,
    quakesNone: (n) => `sin sismos nuevos · ${n} eventos en seguimiento`,
    quakeNew: (mag, place, extra) => `NUEVO SISMO M${mag} · ${place}${extra > 0 ? ` (+${extra})` : ""}`,
    fxLoaded: (n, head) => `${n} pares cargados · ${head}`,
    fxNew: (date, head) => `nuevos tipos del BCE (${date}) · ${head}`,
    fxCurrent: (date, head) => `tipos al día · BCE ${date} · ${head}`,
    weatherLoaded: (n, list) => `${n} ciudades cargadas · ${list}`,
    weatherChanged: (n, list) => `cambios en ${n} ciudades · ${list}`,
    weatherSame: (list) => `mediciones sin cambios · ${list}`,
    githubLoaded: (n) => `${n} eventos cargados`,
    githubNone: "sin eventos nuevos",
    githubNew: (n, actor, repo) => `+${n} eventos nuevos entrando · último: ${actor} → ${repo}`,
    stale: "la fuente no responde · se conservan los últimos datos",
    failedKeep: "solicitud fallida · se conservan los últimos datos",
    failedRetry: "solicitud fallida · se reintentará",
  },
};

const zh: Dict = {
  htmlLang: "zh-CN",
  intl: "zh-CN",
  title: "Live Pulse · 实时脉搏面板",
  description: "通过公开 API 实时追踪地震、市场、天气和开源动态的指挥中心式仪表盘。",
  languageLabel: "语言",
  designedBy: "设计：",
  header: {
    eyebrow: "指挥中心 // 01",
    intro: "实时监测世界脉搏的指挥中心。地震、市场、天气与开源世界，来自五个公开数据源，一屏尽览。",
    booting: "启动中",
    lastUpdate: "最后更新",
    activeSources: "活跃数据源",
    sessionRequests: "本次会话请求",
    avg: (ms) => ` · 平均 ${ms} ms`,
    sourcesAria: "数据源状态",
    localTime: "本地时间",
    sources: { earthquakes: "地震", crypto: "加密", fx: "汇率", weather: "天气", github: "GitHub" },
  },
  log: { title: "实时系统日志", subtitle: "浏览器 → 公开 API", connecting: "正在连接…" },
  card: {
    downTitle: "暂时无法获取数据",
    downHint: "将自动重新尝试连接",
    source: "来源",
    lastKnown: "最近已知数据 ·",
    badge: { loading: "连接中", live: "实时", stale: "延迟", down: "离线" },
    paused: "已暂停",
    refreshing: "刷新中…",
    refreshIn: (s) => `${s} 秒后刷新`,
  },
  time: {
    now: "刚刚",
    seconds: (n) => `${n} 秒前`,
    minutes: (n) => `${n} 分钟前`,
    hours: (n) => `${n} 小时前`,
    days: (n) => `${n} 天前`,
  },
  crypto: {
    title: "加密货币市场",
    subtitle: "USD · 实时价格 · 5 秒",
    note: "图表：最近 60 分钟 · 涨跌：24 小时",
    spark: (name) => `${name} 最近 1 小时`,
  },
  quake: {
    title: "全球地震活动",
    subtitle: "最近 24 小时 · M2.5+",
    count: "记录的地震",
    strongest: "最强",
    since: "距上次地震",
    legend: "图例",
    tiers: { strong: "强震 · M6+", moderate: "中等 · M4.5–5.9", light: "轻微 · M2.5–4.4" },
    ring: "圆环：最近 1 小时 · 大小 = 震级",
    latest: "最新地震",
    depth: "深度",
    tsunami: "海啸预警",
    mapAria: (n) => `最近 24 小时 ${n} 次地震的世界地图`,
  },
  fx: {
    title: "汇率",
    subtitle: (d) => (d ? `欧洲央行参考汇率 · ${d}` : "欧洲央行参考汇率"),
    note: "涨跌：相较上一工作日 · 图表：最近 3 周",
    spark: (pair, n) => `${pair} 最近 ${n} 个工作日走势`,
    labels: { "USD/TRY": "美元", "EUR/TRY": "欧元", "GBP/TRY": "英镑", "EUR/USD": "欧元 / 美元" },
  },
  weather: {
    title: "世界天气",
    subtitle: "当前 · 6 座城市",
    windUnit: "公里/时",
    cities: { istanbul: "伊斯坦布尔", ankara: "安卡拉", london: "伦敦", newyork: "纽约", tokyo: "东京", sydney: "悉尼" },
    kinds: {
      clear: "晴",
      partly: "多云间晴",
      overcast: "阴",
      fog: "有雾",
      drizzle: "毛毛雨",
      rain: "有雨",
      heavyRain: "大雨",
      snow: "有雪",
      showers: "阵雨",
      snowShowers: "阵雪",
      thunder: "雷暴",
    },
  },
  github: {
    title: "开源脉搏",
    subtitle: "公开事件流",
    last: (n) => `最近 ${n} 个事件：`,
    queued: (n) => `${n} 个事件正在进入`,
    delay: "GitHub 发布此事件流时会有几分钟的延迟。",
    kinds: {
      push: { verb: "推送了代码到", short: "推送" },
      pr: { verb: "拉取请求", short: "PR" },
      issue: { verb: "议题", short: "议题" },
      star: { verb: "收藏了", short: "星标" },
      fork: { verb: "派生了", short: "派生" },
      create: { verb: "创建了", short: "新建" },
      release: { verb: "发布了版本于", short: "版本" },
    },
    actions: {
      opened: "打开了",
      closed: "关闭了",
      reopened: "重新打开了",
      merged: "合并了",
      branch: "创建了分支于",
      tag: "创建了标签于",
      repository: "创建了仓库",
    },
  },
  tech: {
    eyebrow: "技术说明",
    heading: "这个项目如何运作？",
    body: "没有假后端，也没有服务器。页面完全静态；浏览器直接连接公开 API，并按各数据源的速率限制定时刷新。",
    repo: "在 GitHub 上查看源码",
    stack: [
      { k: "框架", v: "Next.js App Router · TypeScript" },
      { k: "数据", v: "5 个公开 API，无需密钥" },
      { k: "部署", v: "静态导出 · 浏览器直连 API + 标签页内 TTL 缓存" },
      { k: "更新", v: "定时轮询，标签页隐藏时暂停" },
      { k: "容错", v: "数据源故障时显示最近已知数据" },
      { k: "界面", v: "Tailwind CSS · Framer Motion · react-simple-maps" },
    ],
  },
  msg: {
    quakesLoaded: (n, mag) => `已加载 ${n} 次地震 · 最强 M${mag}`,
    quakesNone: (n) => `暂无新地震 · 正在跟踪 ${n} 个事件`,
    quakeNew: (mag, place, extra) => `新地震 M${mag} · ${place}${extra > 0 ? ` (+${extra})` : ""}`,
    fxLoaded: (n, head) => `已加载 ${n} 个货币对 · ${head}`,
    fxNew: (date, head) => `欧洲央行新汇率 (${date}) · ${head}`,
    fxCurrent: (date, head) => `汇率最新 · ECB ${date} · ${head}`,
    weatherLoaded: (n, list) => `已加载 ${n} 座城市 · ${list}`,
    weatherChanged: (n, list) => `${n} 座城市有变化 · ${list}`,
    weatherSame: (list) => `读数未变 · ${list}`,
    githubLoaded: (n) => `已加载 ${n} 个事件`,
    githubNone: "暂无新事件",
    githubNew: (n, actor, repo) => `+${n} 个新事件进入 · 最新：${actor} → ${repo}`,
    stale: "数据源无响应 · 保留最近已知数据",
    failedKeep: "请求失败 · 保留最近已知数据",
    failedRetry: "请求失败 · 将重试",
  },
};

const DICTS: Record<Locale, Dict> = { tr, en, es, zh };

// ── Store ──────────────────────────────────────────────────────
// Server HTML (and the first client render) is always Turkish so hydration
// matches; the saved or browser language is applied right after mount.
let current: Locale = "tr";
const listeners = new Set<() => void>();

const isLocale = (v: unknown): v is Locale => typeof v === "string" && v in DICTS;

function apply(next: Locale) {
  current = next;
  if (typeof document !== "undefined") {
    document.documentElement.lang = DICTS[next].htmlLang;
    document.title = DICTS[next].title;
  }
  listeners.forEach((l) => l());
}

export function setLocale(next: Locale) {
  if (next === current) return;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // storage can be blocked; the choice just won't persist
  }
  apply(next);
}

/** Picks the saved language, else the browser's, else keeps Turkish. */
export function initLocale() {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  const fromBrowser = navigator.languages
    ?.map((l) => l.slice(0, 2).toLowerCase())
    .find(isLocale);
  const next = isLocale(saved) ? saved : (fromBrowser ?? "tr");
  if (next !== current) apply(next);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getLocale = () => current;
/** Dictionary for non-React callers (formatters, activity-log messages). */
export const getDict = () => DICTS[current];

export function useLocale() {
  return useSyncExternalStore(subscribe, getLocale, () => "tr" as Locale);
}

/** Current dictionary; re-renders the component when the language changes. */
export function useT() {
  return DICTS[useLocale()];
}
