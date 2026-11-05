(function () {
  'use strict';

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-detail]'));
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-tab]'));
  var counter = document.getElementById('counter');
  var progress = document.getElementById('progress');
  var deck = document.getElementById('deck');
  var total = cards.length;
  var current = 0;

  function cardStyle(card, d) {
    if (d < 0) {
      card.style.transform = 'translateX(-112%) rotate(-8deg)';
      card.style.opacity = '0';
      card.style.zIndex = String(50 + d);
      card.style.pointerEvents = 'none';
      return;
    }
    card.style.transform = 'translate(' + (d * 14) + 'px, ' + (d * 14) + 'px) scale(' + (1 - d * 0.04).toFixed(3) + ')';
    card.style.opacity = d > 2 ? '0' : '1';
    card.style.zIndex = String(100 - d);
    card.style.pointerEvents = d === 0 ? 'auto' : 'none';
  }

  function render() {
    cards.forEach(function (card, k) { cardStyle(card, k - current); });
    panels.forEach(function (panel, k) { panel.hidden = k !== current; });
    tabs.forEach(function (tab, k) {
      tab.setAttribute('aria-selected', k === current ? 'true' : 'false');
      if (k === current && tab.scrollIntoView && tab.parentElement.scrollWidth > tab.parentElement.clientWidth) {
        tab.parentElement.scrollTo({ left: tab.offsetLeft - 24, behavior: 'smooth' });
      }
    });
    if (counter) counter.textContent = String(current + 1).padStart(2, '0');
    if (progress) progress.style.width = ((current + 1) / total * 100).toFixed(1) + '%';
  }

  function go(delta) {
    current = (current + delta + total) % total;
    render();
  }

  document.getElementById('prevBtn').addEventListener('click', function () { go(-1); });
  document.getElementById('nextBtn').addEventListener('click', function () { go(1); });
  tabs.forEach(function (tab, k) {
    tab.addEventListener('click', function () { current = k; render(); });
  });

  // Свайп по колоде
  var sx = null, sy = null;
  deck.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; });
  deck.addEventListener('pointercancel', function () { sx = null; });
  deck.addEventListener('pointerup', function (e) {
    if (sx === null) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    sx = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? 1 : -1);
  });

  // Стрелки на клавиатуре, когда фокус на вкладках или кнопках колоды
  document.querySelector('[role="tablist"]').addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { go(1); tabs[current].focus(); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { go(-1); tabs[current].focus(); e.preventDefault(); }
  });

  // Видео геймплея: беззвучный автозапуск
  var video = document.getElementById('gameVideo');
  if (video) {
    video.muted = true;
    video.playsInline = true;
    var play = function () { var p = video.play(); if (p && p.catch) p.catch(function () {}); };
    if (video.readyState >= 2) play(); else video.addEventListener('loadeddata', play, { once: true });
  }

  render();
})();
