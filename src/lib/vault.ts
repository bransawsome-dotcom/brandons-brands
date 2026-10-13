// The vault-door intro on the Collection page plays only right after someone clicks a Collection button,
// not on refresh or when coming back from another page. The button sets a one-time flag; the page uses it up.
const FLAG = "bb-vault-play";

export const vaultFilm = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 700px)").matches ? "/redesign/video/vault-640.mp4" : "/redesign/video/vault.mp4";

export function requestVault(): void {
  try {
    sessionStorage.setItem(FLAG, String(Date.now()));
  } catch {}
  // Start downloading the vault film while the Collection page loads.
  try {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) void fetch(vaultFilm(), { priority: "high" } as RequestInit).catch(() => {});
  } catch {}
}

// True (once) if a Collection button was clicked in the last few seconds.
export function takeVaultRequest(): boolean {
  try {
    const at = Number(sessionStorage.getItem(FLAG) || 0);
    sessionStorage.removeItem(FLAG);
    return at > 0 && Date.now() - at < 10_000;
  } catch {
    return false;
  }
}
