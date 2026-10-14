import { pulseRoute } from "@/lib/live-pulse/server/route-handler";
import { loadGithub } from "@/lib/live-pulse/server/upstream";

// Unauthenticated GitHub API allows 60 req/h → 40 req/h here.
export const GET = pulseRoute("github", 90, loadGithub);