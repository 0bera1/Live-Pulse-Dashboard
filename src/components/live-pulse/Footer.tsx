const SITE_URL = "https://beraekimci.com.tr";

export function Footer() {
  return (
    <footer className="border-t border-line-strong pt-6 text-center font-mono text-xs text-muted">
      Designed by{" "}
      <a
        href={SITE_URL}
        target="_blank"
        rel="noreferrer"
        className="text-ink transition-colors hover:text-accent"
      >
        Bera
      </a>
    </footer>
  );
}
