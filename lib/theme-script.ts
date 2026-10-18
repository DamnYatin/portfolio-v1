// Inline script that executes synchronously in <head> before first paint to prevent FOUC.
export const themeInitScript = `(function() {
  try {
    var params = new URLSearchParams(window.location.search);
    var devTheme = params.get("theme");
    var isDevOverride = devTheme === "dark" || devTheme === "light";
    var theme = isDevOverride ? devTheme : "dark";
    var gate = isDevOverride ? "closed" : "pending";
    var intro = isDevOverride ? "active" : "pending";

    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.gate = gate;
    document.documentElement.dataset.intro = intro;
    document.documentElement.style.colorScheme = theme;

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#0D0B09" : "#EBE2CC");
    }
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.dataset.gate = "pending";
    document.documentElement.dataset.intro = "pending";
  }
})();`;
