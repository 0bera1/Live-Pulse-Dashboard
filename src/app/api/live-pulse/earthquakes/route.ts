import { pulseRoute } from "@/lib/live-pulse/server/route-handler";
import { loadEarthquakes } from "@/lib/live-pulse/server/upstream";

// USGS updates its feed every minute.
export const GET = pulseRoute("earthquakes", 60, loadEarthquakes);