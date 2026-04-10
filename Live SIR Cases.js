// ╔══════════════════════════════════════════════════════════╗
// ║  Live SIR Cases – Bookmarklet                          ║
// ║  Version : 1.5.0                                        ║
// ║  Released: 2026-04-10                                   ║
// ╚══════════════════════════════════════════════════════════╝
javascript: (function () {

  // ─── TOAST HELPER ─────────────────────────────────────────────────────────
  function showToast(msg) {
    var t = document.getElementById("__bmToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "__bmToast";
      t.style.position = "fixed";
      t.style.bottom = "32px";
      t.style.left = "50%";
      t.style.transform = "translateX(-50%)";
      t.style.background = "#1e2130";
      t.style.border = "1px solid #e8710a";
      t.style.color = "#e8710a";
      t.style.padding = "12px 24px";
      t.style.borderRadius = "10px";
      t.style.fontSize = "13px";
      t.style.fontWeight = "600";
      t.style.fontFamily = "Segoe UI,sans-serif";
      t.style.zIndex = "999999";
      t.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)";
      t.style.transition = "opacity 0.4s";
      document.body.appendChild(t);
    }
    t.style.opacity = "1";
    t.innerText = msg;
    clearTimeout(window.__bmToastTimer);
    window.__bmToastTimer = setTimeout(function () { t.style.opacity = "0"; }, 3500);
  }

  // ─── TOGGLE OFF ───────────────────────────────────────────────────────────
  if (window.__autoSIR) {
    clearInterval(window.__autoSIRInt);
    window.__autoSIR = false;
    var b = document.getElementById("__autoBadgeSIR");
    if (b) {
      b.innerText = "Refresh OFF";
      b.style.background = "#e8710a";
      b.style.color = "white";
    }
    var c = document.getElementById("__autoContainerSIR");
    if (c) c.remove();
    return;
  }

  // ─── MUTUAL EXCLUSION ─────────────────────────────────────────────────────
  if (window.__auto) {
    showToast("⚠️ Live Unassigned Cases is running — please stop it first before starting Live SIR Cases.");
    return;
  }

  // ─── FILTER HELPERS ───────────────────────────────────────────────────────
  function findClearButton() {
    return document.querySelector('button[test-element="clear-btn"]') ||
      document.querySelector('button[data-automation="search-cases-filter-clear-btn"]') ||
      document.querySelector('tn-search-filter-cases button:first-of-type') ||
      document.querySelector('tn-search-filter-cases button');
  }

  function findCollapseButton() {
    var btns = document.querySelectorAll('button[iconbutton][size="small"]');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].className.indexOf('shape--round') !== -1) return btns[i];
    }
    return document.querySelector('button[iconbutton].shape--round') ||
      document.querySelector('button[iconbutton=""].size--small');
  }

  function clearFilters(callback) {
    var cb = findClearButton();
    if (cb) {
      cb.click();
      setTimeout(function () {
        var col = findCollapseButton();
        if (col) {
          col.click();
          setTimeout(callback, 400);
        } else {
          callback();
        }
      }, 400);
    } else {
      callback();
    }
  }

  // ─── CREATE BADGE CONTAINER ───────────────────────────────────────────────
  var old = document.getElementById("__autoContainerSIR");
  if (old) old.remove();

  var badge = document.getElementById("__autoBadgeSIR");
  if (!badge) {
    var hdr = document.querySelector(".search-result--header");

    var container = document.createElement("div");
    container.id = "__autoContainerSIR";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.gap = "6px";
    container.style.zIndex = "99999";

    if (hdr) {
      container.style.position = "absolute";
      container.style.top = "50%";
      container.style.right = "12px";
      container.style.transform = "translateY(-50%)";
    } else {
      container.style.position = "fixed";
      container.style.top = "60px";
      container.style.right = "20px";
    }

    var label = document.createElement("div");
    label.id = "__autoLabelSIR";
    label.style.padding = "4px 10px";
    label.style.background = "#7c3aed";
    label.style.color = "white";
    label.style.borderRadius = "6px";
    label.style.fontSize = "11px";
    label.style.fontWeight = "bold";
    label.style.whiteSpace = "nowrap";
    label.innerText = "Live SIR Cases";

    badge = document.createElement("div");
    badge.id = "__autoBadgeSIR";
    badge.style.padding = "4px 10px";
    badge.style.color = "white";
    badge.style.borderRadius = "6px";
    badge.style.fontSize = "11px";
    badge.style.fontWeight = "bold";
    badge.style.cursor = "pointer";
    badge.style.userSelect = "none";
    badge.style.whiteSpace = "nowrap";

    container.appendChild(label);
    container.appendChild(badge);

    if (hdr) {
      hdr.style.position = "relative";
      hdr.appendChild(container);
    } else {
      document.body.appendChild(container);
    }
  }

  badge.innerText = "Refresh: Starting...";
  badge.style.background = "#66b68b";
  badge.style.color = "white";
  window.__autoSIR = true;
  document.title = "Live SIR Cases";

  // ─── ACCORDION HELPERS ────────────────────────────────────────────────────

  /** Returns the smp-accordion-item for a given header title */
  function getSection(title) {
    var headers = document.querySelectorAll(".accordion-header-content");
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].textContent.trim() === title) {
        return headers[i].closest("smp-accordion-item");
      }
    }
    return null;
  }

  /** Expands an accordion section if not already open */
  function expand(title) {
    var headers = document.querySelectorAll(".accordion-header-content");
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].textContent.trim() === title) {
        var el = headers[i].closest("smp-accordion-header");
        if (el && el.getAttribute("aria-expanded") !== "true") el.click();
        return;
      }
    }
  }

  /** Checks a single checkbox by label text within a section */
  function check(section, value) {
    var sec = getSection(section);
    if (!sec) return;
    var labels = sec.querySelectorAll("label.smp-checkbox");
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].innerText.trim() === value) {
        var input = labels[i].querySelector('input[type="checkbox"]');
        if (input && input.getAttribute("aria-checked") !== "true") input.click();
        return;
      }
    }
  }

  /**
   * Checks ALL checkboxes in a section, except the specified item(s).
   * `except` can be a string or an array of strings.
   */
  function checkAll(section, except) {
    var sec = getSection(section);
    if (!sec) return;
    var labels = sec.querySelectorAll("label.smp-checkbox");
    for (var i = 0; i < labels.length; i++) {
      var txt = labels[i].innerText.trim();
      var input = labels[i].querySelector('input[type="checkbox"]');
      if (!input) continue;
      var isExcluded = except && (Array.isArray(except) ? except.indexOf(txt) !== -1 : txt === except);
      if (isExcluded) {
        if (input.getAttribute("aria-checked") === "true") input.click();
      } else {
        if (input.getAttribute("aria-checked") !== "true") input.click();
      }
    }
  }

  /**
   * Checks ONLY the specified checkboxes in a section; unchecks everything else.
   * `values` is an array of label strings to keep checked.
   */
  function checkOnly(section, values) {
    var sec = getSection(section);
    if (!sec) return;
    var labels = sec.querySelectorAll("label.smp-checkbox");
    for (var i = 0; i < labels.length; i++) {
      var txt = labels[i].innerText.trim();
      var input = labels[i].querySelector('input[type="checkbox"]');
      if (!input) continue;
      var shouldCheck = values.indexOf(txt) !== -1;
      var isChecked = input.getAttribute("aria-checked") === "true";
      if (shouldCheck && !isChecked) input.click();
      else if (!shouldCheck && isChecked) input.click();
    }
  }

  /** Types text character-by-character into an input to trigger search */
  function typeSearch(input, text, callback) {
    input.focus();
    input.value = "";
    var i = 0;
    function type() {
      if (i < text.length) {
        input.value += text[i];
        input.dispatchEvent(new Event("input", { bubbles: true }));
        i++;
        setTimeout(type, 50);
      } else {
        input.dispatchEvent(new Event("change", { bubbles: true }));
        if (callback) setTimeout(callback, 100);
      }
    }
    type();
  }

  /** Searches for a user in the Users accordion and selects the first match */
  function searchUser(value) {
    var sec = getSection("Users");
    if (!sec) return;
    var input =
      sec.querySelector('input[test-element="search-input-component"]') ||
      sec.querySelector('input[placeholder*="search"]') ||
      sec.querySelector('input[type="text"]') ||
      sec.querySelector('.search-input input');
    if (!input) return;

    typeSearch(input, value, function () {
      var tries = 0;
      var timer = setInterval(function () {
        var labels = sec.querySelectorAll("label.smp-checkbox");
        var found = false;
        for (var i = 0; i < labels.length; i++) {
          if (labels[i].innerText.trim().toLowerCase().includes(value.toLowerCase())) {
            var inp = labels[i].querySelector('input[type="checkbox"]');
            if (inp && inp.getAttribute("aria-checked") !== "true") {
              inp.click();
              found = true;
              break;
            }
          }
        }
        if (found) clearInterval(timer);
        tries++;
        if (tries > 10) clearInterval(timer);
      }, 300);
    });
  }

  /** Finds the Apply/Search button using multiple selector strategies */
  function findApplyButton() {
    var selectors = [
      'button[test-element="apply-btn"]',
      'button[aria-label*="Apply"]',
      'button[aria-label*="apply"]',
      '.apply-btn',
      'button[type="submit"]',
      'ion-button[aria-label*="apply" i]',
      'button[title*="apply" i]'
    ];
    for (var i = 0; i < selectors.length; i++) {
      var btn = document.querySelector(selectors[i]);
      if (btn) return btn;
    }
    // Fallback: scan all buttons for relevant text
    var btns = document.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var text = btns[i].innerText.toLowerCase();
      if (text.includes('apply') || text.includes('search') || text.includes('filter')) {
        return btns[i];
      }
    }
    return null;
  }

  /** Returns true if any row in the results table is currently selected */
  function isSelected() {
    var t =
      document.querySelector("#pr_id_1-table") ||
      document.querySelector('[role="table"]') ||
      document.querySelector('p-table table') ||
      document.querySelector('.p-datatable-table');
    return t && t.querySelector('[role="checkbox"][aria-checked="true"]');
  }

  // ─── CORE ACTIONS ─────────────────────────────────────────────────────────

  /** Clicks the Apply button to trigger a search refresh */
  function refresh() {
    var b = findApplyButton();
    if (b && b.offsetParent !== null) {
      b.scrollIntoView({ behavior: 'instant', block: 'center' });
      setTimeout(function () { b.focus(); b.click(); }, 100);
    }
  }

  /** Starts the auto-refresh interval once the Apply button is confirmed present */
  function start() {
    if (!findApplyButton()) {
      badge.innerText = "NO APPLY BTN";
      badge.style.background = "#c0392b";
      badge.style.color = "white";
      setTimeout(start, 2000);
      return;
    }

    badge.innerText = "Refresh ON";
    badge.style.background = "#66b68b";
    badge.style.color = "white";

    window.__autoSIRInt = setInterval(function () {
      if (isSelected()) {
        badge.innerText = "Refresh Paused";
        badge.style.background = "#c9a800";
        badge.style.color = "white";
        return;
      }
      badge.innerText = "Refresh ON";
      badge.style.background = "#66b68b";
      badge.style.color = "white";
      refresh();
    }, 5000);
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────
  var sirStages = ["Draft", "Analysis", "Contain", "Eradicate", "Recover"];

  var initTries = 0;
  var wait = setInterval(function () {
    initTries++;
    if (document.querySelector("label.smp-checkbox") || initTries > 20) {
      clearInterval(wait);
      clearFilters(function () {
        expand("Status");
        expand("Users");
        expand("Case Stages");
        expand("Environments");

        setTimeout(function () {
          check("Status", "Open");
          checkOnly("Case Stages", sirStages);                                          // Draft → Recover only
          checkAll("Environments", ["Default Environment", "CP Development", "Brand Protection"]); // exclude these three
          searchUser("@L1");

          setTimeout(function () {
            refresh(); // immediate first refresh
            start();   // begin interval
          }, 1500);
        }, 500);
      });
    }
  }, 200);

})();
