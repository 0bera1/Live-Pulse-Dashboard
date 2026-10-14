import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";

interface WeatherKind {
  label: string;
  icon: LucideIcon;
  nightIcon?: LucideIcon;
}

/** WMO weather interpretation codes, as used by Open-Meteo. */
export function weatherKind(code: number): WeatherKind {
  if (code === 0) return { label: "Açık", icon: Sun, nightIcon: Moon };
  if (code <= 2) return { label: "Parçalı bulutlu", icon: CloudSun, nightIcon: Cloud };
  if (code === 3) return { label: "Kapalı", icon: Cloud };
  if (code <= 48) return { label: "Sisli", icon: CloudFog };
  if (code <= 57) return { label: "Çisenti", icon: CloudDrizzle };
  if (code <= 67) return { label: code >= 65 ? "Şiddetli yağmur" : "Yağmurlu", icon: CloudRain };
  if (code <= 77) return { label: "Karlı", icon: CloudSnow };
  if (code <= 82) return { label: "Sağanak", icon: CloudRain };
  if (code <= 86) return { label: "Kar sağanağı", icon: CloudSnow };
  return { label: "Gök gürültülü", icon: CloudLightning };
}
