import { ActivityLog } from "./ActivityLog";
import { CryptoCard } from "./CryptoCard";
import { EarthquakeCard } from "./EarthquakeCard";
import { Footer } from "./Footer";
import { FxCard } from "./FxCard";
import { GithubCard } from "./GithubCard";
import { LanguageSwitch } from "./LanguageSwitch";
import { StatusHeader } from "./StatusHeader";
import { TechNotes } from "./TechNotes";
import { WeatherCard } from "./WeatherCard";

/**
 * Self-contained Live Pulse page body. To embed in another Next.js site, copy
 * `components/live-pulse`, `lib/live-pulse`,
 * `public/geo` and the theme tokens in globals.css.
 */
export function Dashboard() {
  return (
    <div className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <div className="flex flex-col gap-5">
        <LanguageSwitch />
        <StatusHeader />
        <ActivityLog />
      </div>

      <main className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <EarthquakeCard className="lg:col-span-8 lg:row-span-2" />
        <CryptoCard className="lg:col-span-4" />
        <FxCard className="lg:col-span-4" />
        <GithubCard className="lg:col-span-7" />
        <WeatherCard className="lg:col-span-5" />
      </main>

      <TechNotes />
      <Footer />
    </div>
  );
}
