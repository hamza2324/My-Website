(function () {
  const key = "hj_cookie_consent_v1";
  try {
    if (localStorage.getItem(key)) return;
  } catch (_e) {
    return;
  }

  const isPost = window.location.pathname.includes("/posts/");
  const cookiePath = isPost ? "../cookie-policy.html" : "cookie-policy.html";
  const privacyPath = isPost ? "../privacy-policy.html" : "privacy-policy.html";

  const wrap = document.createElement("aside");
  wrap.setAttribute("aria-label", "Cookie consent");
  wrap.style.position = "fixed";
  wrap.style.left = "16px";
  wrap.style.right = "16px";
  wrap.style.bottom = "16px";
  wrap.style.zIndex = "9999";
  wrap.style.maxWidth = "760px";
  wrap.style.margin = "0 auto";
  wrap.style.padding = "14px 16px";
  wrap.style.borderRadius = "10px";
  wrap.style.border = "1px solid rgba(148,163,184,0.35)";
  wrap.style.background = "rgba(15,23,42,0.95)";
  wrap.style.color = "#e5e7eb";
  wrap.style.boxShadow = "0 8px 24px rgba(2,6,23,0.3)";
  wrap.style.fontFamily = "system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif";
  wrap.style.fontSize = "14px";
  wrap.style.lineHeight = "1.5";

  const text = document.createElement("p");
  text.style.margin = "0 0 10px";
  text.innerHTML = "We use cookies for analytics and advertising. See our <a href=\"" + cookiePath + "\" style=\"color:#93c5fd\">Cookie Policy</a> and <a href=\"" + privacyPath + "\" style=\"color:#93c5fd\">Privacy Policy</a>.";

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = "8px";
  actions.style.flexWrap = "wrap";

  const accept = document.createElement("button");
  accept.type = "button";
  accept.textContent = "Accept";
  accept.style.border = "0";
  accept.style.borderRadius = "8px";
  accept.style.padding = "8px 12px";
  accept.style.cursor = "pointer";
  accept.style.fontWeight = "600";
  accept.style.background = "#ef4444";
  accept.style.color = "#fff";

  const reject = document.createElement("button");
  reject.type = "button";
  reject.textContent = "Reject";
  reject.style.border = "1px solid rgba(148,163,184,0.45)";
  reject.style.borderRadius = "8px";
  reject.style.padding = "8px 12px";
  reject.style.cursor = "pointer";
  reject.style.fontWeight = "600";
  reject.style.background = "transparent";
  reject.style.color = "#e5e7eb";

  function save(value) {
    try {
      localStorage.setItem(key, value);
      wrap.remove();
    } catch (_e) {
      wrap.remove();
    }
  }

  accept.addEventListener("click", function () { save("accepted"); });
  reject.addEventListener("click", function () { save("rejected"); });

  actions.appendChild(accept);
  actions.appendChild(reject);
  wrap.appendChild(text);
  wrap.appendChild(actions);
  document.body.appendChild(wrap);
})();
