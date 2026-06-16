/**
 * Toggleable debug logging for the background-removal pipeline.
 *
 * Flip `BG_DEBUG` to false (or run `localStorage.setItem("bgDebug","0")` in the
 * console) to silence. Logs are prefixed with `[bg]` so they're easy to filter
 * in the browser devtools console.
 */
export const BG_DEBUG = true;

const enabled = () => {
  if (!BG_DEBUG) return false;
  if (
    typeof window !== "undefined" &&
    window.localStorage?.getItem("bgDebug") === "0"
  )
    return false;
  return true;
};

const stamp = () =>
  typeof performance !== "undefined"
    ? `${Math.round(performance.now())}ms`
    : "";

export const bgLog = (event: string, data?: unknown) => {
  if (!enabled()) return;
  console.log(
    `%c[bg ${stamp()}]%c ${event}`,
    "color:#0bb;font-weight:bold",
    "color:inherit",
    data ?? "",
  );
};

export const bgWarn = (event: string, data?: unknown) => {
  if (!enabled()) return;
  console.warn(`[bg] ${event}`, data ?? "");
};

export const bgError = (event: string, err: unknown) => {
  if (!enabled()) return;
  console.error(`[bg] ${event}`, err);
};
