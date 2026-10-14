import { pulseRoute } from "@/lib/live-pulse/server/route-handler";
import { loadCrypto } from "@/lib/live-pulse/server/upstream";

// Binance market data is real-time; a 4 s shared cache keeps us far below its
// limits while every browser polling at 5 s still sees each new tick.
export const GET = pulseRoute("crypto", 4, loadCrypto);
