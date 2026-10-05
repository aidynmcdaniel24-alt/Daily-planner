// ===== Pop-up boxes that match the app (instead of the browser's plain ones) =====
// ui.confirm(...) and ui.ask(...) give back a promise: await them.
(function () {
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function open(o) {
    return new Promise(function (done) {
      var d = document.createElement("dialog"), result = o.input ? null : false;
      d.className = "dlg ui-dlg" + (o.danger ? " danger" : "");
      d.innerHTML = '<form method="dialog">' +
        (o.icon !== false ? '<span class="ui-ic" aria-hidden="true">' + (o.danger ? "!" : "?") + "</span>" : "") +
        "<h2>" + esc(o.title) + "</h2>" + (o.text ? '<p class="mute">' + esc(o.text) + "</p>" : "") +
        (o.input ? '<input type="text" class="ui-in" autocomplete="off" aria-label="' + esc(o.input) + '" placeholder="' + esc(o.input) + '">' : "") +
        '<div class="row">' + (o.cancel === false ? "" : '<button type="button" class="ui-no">' + esc(o.cancel || "Cancel") + "</button>") +
        '<button type="submit" class="pri ui-ok">' + esc(o.ok || "OK") + "</button></div></form>";
      document.body.appendChild(d);
      var ok = d.querySelector(".ui-ok"), no = d.querySelector(".ui-no"), inp = d.querySelector(".ui-in");
      if (inp && o.match) { ok.disabled = true; inp.oninput = function () { ok.disabled = inp.value.trim() !== o.match; }; }
      if (no) no.onclick = function () { d.close(); };
      d.querySelector("form").onsubmit = function () { result = inp ? inp.value.trim() : true; };
      d.addEventListener("close", function () { d.remove(); done(result); });
      d.showModal();
      (inp || (o.danger && no) || ok).focus();
    });
  }
  window.ui = {
    // ui.confirm("Log out?", "Your data stays saved.", { ok: "Log out", danger: true }) → true / false
    confirm: function (title, text, opts) { return open(Object.assign({ title: title, text: text }, opts || {})); },
    // ui.alert("Couldn't join.", "Check your internet.") → shows a message with one button
    alert: function (title, text, opts) { return open(Object.assign({ title: title, text: text, cancel: false, icon: false, ok: "Got it" }, opts || {})); },
    // ui.ask("Delete account?", "...", { input: "Type DELETE", match: "DELETE" }) → the typed text, or null
    ask: function (title, text, opts) { return open(Object.assign({ title: title, text: text }, opts || {})); }
  };
})();
