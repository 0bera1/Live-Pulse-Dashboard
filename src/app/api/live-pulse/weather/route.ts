import { pulseRoute } from "@/lib/live-pulse/server/route-handler";
import { loadWeather } from "@/lib/live-pulse/server/upstream";

// Open-Meteo "current" values refresh every 15 minutes.
export const GET = pulseRoute("weather", 300, loadWeather);