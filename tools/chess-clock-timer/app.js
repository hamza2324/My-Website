(function () {
  function injectHreflangTags() {
    var locales = ['en','es','de','fr','pt','it','ru','ar','ja','ko','nl','pl','tr','id','zh'];
    var base = 'https://hamzajadoon.cloud/tools/chess-clock-timer';
    var existing = document.querySelector('link[hreflang="en"]');
    if (existing) return;

    locales.forEach(function (lang) {
      var link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = lang === 'en' ? base + '/' : base + '/' + lang + '/';
      document.head.appendChild(link);
    });

    var xDefault = document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    xDefault.href = base + '/';
    document.head.appendChild(xDefault);
  }

  injectHreflangTags();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/tools/chess-clock-timer/sw.js');
    });
  }
})();
