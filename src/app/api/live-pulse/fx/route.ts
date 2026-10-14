import { pulseRoute } from "@/lib/live-pulse/server/route-handler";
import { loadFx } from "@/lib/live-pulse/server/upstream";

// ECB reference rates change once per business day.
export const GET = pulseRoute("fx", 1800, loadFx);