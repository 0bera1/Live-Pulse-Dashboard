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

import { getDict } from "./i18n";

interface WeatherKind {
  label: string;
  icon: LucideIcon;
  nightIcon?: LucideIcon;
}

/** WMO weather interpretation codes, as used by Open-Meteo. */
export function weatherKind(code: number): WeatherKind {
  const k = getDict().weather.kinds;
  if (code === 0) return { label: k.clear, icon: Sun, nightIcon: Moon };
  if (code <= 2) return { label: k.partly, icon: CloudSun, nightIcon: Cloud };
  if (code === 3) return { label: k.overcast, icon: Cloud };
  if (code <= 48) return { label: k.fog, icon: CloudFog };
  if (code <= 57) return { label: k.drizzle, icon: CloudDrizzle };
  if (code <= 67) return { label: code >= 65 ? k.heavyRain : k.rain, icon: CloudRain };
  if (code <= 77) return { label: k.snow, icon: CloudSnow };
  if (code <= 82) return { label: k.showers, icon: CloudRain };
  if (code <= 86) return { label: k.snowShowers, icon: CloudSnow };
  return { label: k.thunder, icon: CloudLightning };
}
