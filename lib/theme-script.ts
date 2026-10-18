// Inline script that executes synchronously in <head> before first paint to prevent FOUC.
export const THEME_STORAGE_KEY = "portfolio-theme";
export const THEME_COOKIE_NAME = "portfolio-theme";

export const themeInitScript = `(function() {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var match = document.cookie.match(new RegExp("(^|; )" + "${THEME_COOKIE_NAME}" + "=([^;]+)"));
    var cookieVal = match ? decodeURIComponent(match[2]) : null;
    var theme = stored || cookieVal;

    if (theme === "light" || theme === "dark") {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
      document.documentElement.removeAttribute("data-gate");
    } else {
      // First visit: no saved preference
      document.documentElement.dataset.theme = "dark";
      document.documentElement.dataset.gate = "open";
      document.documentElement.style.colorScheme = "dark";
    }
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
})();`;
