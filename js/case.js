/* Case study pages: language toggle and the way back. */
(function () {
  var KEY = "myspace.lang";
  var root = document.documentElement;
  var btn = document.getElementById("caseLangBtn");

  function apply(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
    if (btn) btn.textContent = lang === "zh" ? "EN" : "中";
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  apply(saved === "en" ? "en" : "zh");

  if (btn) {
    btn.addEventListener("click", function () {
      apply(root.getAttribute("data-lang") === "zh" ? "en" : "zh");
    });
  }

  // a case study opened from the home page keeps the language it was read in
  var params = new URLSearchParams(window.location.search);
  if (params.get("lang") === "en" || params.get("lang") === "zh") {
    apply(params.get("lang"));
  }
})();
