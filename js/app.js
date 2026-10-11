/* ============================================================
   Chen En-Yu — Portfolio  |  interaction layer
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var LANG = (function () {
    try { return localStorage.getItem('ceyLang') || 'zh'; } catch (e) { return 'zh'; }
  })();

  /* ---------- 1. i18n ---------- */
  function t(key) {
    var row = DATA.ui[key];
    if (!row) return '';
    return row[LANG] != null ? row[LANG] : row.zh;
  }

  function applyI18n() {
    document.documentElement.lang = LANG === 'en' ? 'en' : 'zh-Hant';
    $$('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (v) el.textContent = v;
    });
    $$('[data-i18n-html]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-html'));
      if (v) el.innerHTML = v;
    });
    $$('.lang button').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-lang') === LANG);
    });
    $('#aboutText').textContent = LANG === 'en' ? DATA.site.about_en : DATA.site.about_zh;
  }

  /* ---------- 2. Hero wordmark letters ---------- */
  function buildWordmark() {
    var el = $('#wordmark');
    var word = 'PORTFOLIO';
    el.textContent = '';
    word.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.textContent = ch;
      s.style.animationDelay = (0.25 + i * 0.062).toFixed(3) + 's';
      el.appendChild(s);
    });
  }

  /* ---------- 3. Work cards ---------- */
  var ICON_PLAY = '<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>';

  function cardMarkup(w, i) {
    var title = LANG === 'en' ? w.title_en : w.title_zh;
    var sub   = LANG === 'en' ? w.subtitle_en : w.subtitle_zh;
    var desc  = LANG === 'en' ? w.desc_en : w.desc_zh;
    var tags  = (LANG === 'en' ? w.tags_en : w.tags_zh) || [];
    var kind  = t('kind_' + w.kind);
    var n     = w.items.length;
    var countLabel = w.kind === 'video'
      ? n + ' ' + t('unit_video')
      : n + ' ' + t('unit_image');

    var html = '';
    html += '<button class="card rv' + (w.wide ? ' card--wide' : '') + '" type="button" data-id="' + w.id + '" data-cat="' + w.cat + '" aria-label="' + title + '">';
    html +=   '<div class="card__media">';
    html +=     '<img src="' + w.cover + '" alt="' + title + '" loading="lazy" decoding="async">';
    html +=     '<span class="card__idx">' + (i < 9 ? '0' : '') + (i + 1) + '</span>';
    html +=     '<span class="card__kind">' + kind + '</span>';
    if (w.kind === 'video') html += '<span class="card__play">' + ICON_PLAY + '</span>';
    html +=     '<span class="card__count">' + countLabel + ' <span aria-hidden="true">→</span></span>';
    html +=   '</div>';
    html +=   '<div class="card__body">';
    html +=     '<div class="card__sub">' + sub + '</div>';
    html +=     '<h3 class="card__title">' + title + '</h3>';
    html +=     '<p class="card__desc">' + desc + '</p>';
    html +=     '<div class="card__tags">' + tags.map(function (x) {
                  return '<span class="tag">' + x + '</span>';
                }).join('') + '</div>';
    html +=   '</div>';
    html += '</button>';
    return html;
  }

  function renderGrid(cat) {
    var grid = $('#grid');
    var list = DATA.works.filter(function (w) { return cat === 'all' || w.cat === cat; });
    grid.innerHTML = list.map(cardMarkup).join('');
    observeReveals(grid);

    var totalItems = DATA.works.reduce(function (a, w) { return a + w.items.length; }, 0);
    $('#workCount').textContent = t('work_aside')
      .replace('{p}', DATA.works.length)
      .replace('{i}', totalItems);
  }

  function renderFilters() {
    var box = $('#filters');
    box.innerHTML = DATA.cats.map(function (c, i) {
      return '<button type="button" data-cat="' + c.id + '"' + (i === 0 ? ' class="is-on"' : '') + '>' +
             (LANG === 'en' ? c.en : c.zh) + '</button>';
    }).join('');
  }

  /* ---------- 4. Process + tools ---------- */
  function renderProcess() {
    $('#steps').innerHTML = DATA.steps.map(function (s, i) {
      return '<div class="step rv">' +
             '<div class="step__n">' + (i < 9 ? '0' : '') + (i + 1) + '</div>' +
             '<div><div class="step__t">' + (LANG === 'en' ? s.t_en : s.t_zh) + '</div>' +
             '<div class="step__d">' + (LANG === 'en' ? s.d_en : s.d_zh) + '</div></div></div>';
    }).join('');

    $('#tools').innerHTML = DATA.tools.map(function (x) {
      return '<div class="tool rv"><div class="tool__ico">' + x.k + '</div>' +
             '<div class="tool__n">' + x.n + '</div></div>';
    }).join('');

    observeReveals($('#process'));
  }

  /* ---------- 5. Reveal on scroll ---------- */
  var io = null;
  function initObserver() {
    if (REDUCED || !('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var peers = Array.prototype.slice.call(el.parentNode.children);
        var idx = Math.max(0, peers.indexOf(el));
        el.style.transitionDelay = Math.min(idx * 70, 420) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  }

  function observeReveals(root) {
    var nodes = $$('.rv', root || document);
    if (REDUCED || !io) { nodes.forEach(function (n) { n.classList.add('in'); }); return; }
    nodes.forEach(function (n) { if (!n.classList.contains('in')) io.observe(n); });
  }

  /* ---------- 6. Lightbox ---------- */
  var LB = { work: null, idx: 0, lastFocus: null };

  function openLightbox(id, start) {
    var w = DATA.works.filter(function (x) { return x.id === id; })[0];
    if (!w) return;
    LB.work = w;
    LB.idx = start || 0;
    LB.lastFocus = document.activeElement;
    $('#lbTitle').textContent = LANG === 'en' ? w.title_en : w.title_zh;

    $('#lbFilm').innerHTML = w.items.map(function (it, i) {
      return '<button type="button" data-i="' + i + '"' + (i === LB.idx ? ' class="is-on"' : '') + '>' +
             '<img src="' + (it.thumb || it.poster) + '" alt="" loading="lazy"></button>';
    }).join('');

    var single = w.items.length < 2;
    $('#lbPrev').style.display = single ? 'none' : '';
    $('#lbNext').style.display = single ? 'none' : '';
    $('#lbFilm').style.display = single ? 'none' : '';

    $('#lb').classList.add('is-open');
    document.body.style.overflow = 'hidden';
    showItem(LB.idx);
    $('#lbClose').focus();
  }

  function showItem(i) {
    var w = LB.work;
    if (!w) return;
    LB.idx = (i + w.items.length) % w.items.length;
    var it = w.items[LB.idx];
    var stage = $('#lbStage');

    $$('video', stage).forEach(function (v) { v.pause(); });
    $$('img.lb-media, video.lb-media', stage).forEach(function (n) { n.remove(); });

    var node;
    if (it.type === 'video') {
      node = document.createElement('video');
      node.className = 'lb-media';
      node.src = it.src;
      node.controls = true;
      node.autoplay = true;
      node.playsInline = true;
      node.preload = 'metadata';
      if (it.poster) node.poster = it.poster;
    } else {
      node = document.createElement('img');
      node.className = 'lb-media';
      node.src = it.src;
      node.alt = (LANG === 'en' ? w.title_en : w.title_zh) + ' ' + (LB.idx + 1);
    }
    stage.appendChild(node);

    $('#lbCount').textContent = (LB.idx + 1) + ' / ' + w.items.length;
    $$('#lbFilm button').forEach(function (b, bi) {
      b.classList.toggle('is-on', bi === LB.idx);
      if (bi === LB.idx) {
        b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: REDUCED ? 'auto' : 'smooth' });
      }
    });
  }

  function closeLightbox() {
    $$('#lbStage video').forEach(function (v) { v.pause(); });
    $('#lb').classList.remove('is-open');
    document.body.style.overflow = '';
    LB.work = null;
    if (LB.lastFocus && LB.lastFocus.focus) LB.lastFocus.focus();
  }

  /* ---------- 7. Scroll chrome ---------- */
  function initScroll() {
    var nav = $('#nav');
    var prog = $('#prog');
    var sections = ['work', 'process', 'about', 'contact'].map(function (id) {
      return { id: id, el: document.getElementById(id) };
    });
    var ticking = false;

    function update() {
      var y = window.scrollY || window.pageYOffset;
      nav.classList.toggle('is-stuck', y > 60);

      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';

      var cur = '';
      sections.forEach(function (s) {
        if (s.el && s.el.offsetTop - window.innerHeight * 0.38 <= y) cur = s.id;
      });
      $$('#navLinks a').forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur);
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- 8. Events ---------- */
  function initEvents() {
    $('#grid').addEventListener('click', function (e) {
      var card = e.target.closest('.card');
      if (card) openLightbox(card.getAttribute('data-id'), 0);
    });

    $('#filters').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      $$('#filters button').forEach(function (x) { x.classList.remove('is-on'); });
      b.classList.add('is-on');
      renderGrid(b.getAttribute('data-cat'));
    });

    $('#lbFilm').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b) showItem(parseInt(b.getAttribute('data-i'), 10));
    });

    $('#lbClose').addEventListener('click', closeLightbox);
    $('#lbPrev').addEventListener('click', function () { showItem(LB.idx - 1); });
    $('#lbNext').addEventListener('click', function () { showItem(LB.idx + 1); });
    $('#lb').addEventListener('click', function (e) {
      if (e.target.id === 'lbStage' || e.target.id === 'lb') closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!$('#lb').classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showItem(LB.idx - 1);
      else if (e.key === 'ArrowRight') showItem(LB.idx + 1);
    });

    $$('.lang button').forEach(function (b) {
      b.addEventListener('click', function () {
        LANG = b.getAttribute('data-lang');
        try { localStorage.setItem('ceyLang', LANG); } catch (err) {}
        var on = $('#filters .is-on');
        var activeCat = on ? on.getAttribute('data-cat') : 'all';
        applyI18n();
        renderFilters();
        renderGrid(activeCat);
        $$('#filters button').forEach(function (x) {
          x.classList.toggle('is-on', x.getAttribute('data-cat') === activeCat);
        });
        renderProcess();
        if (LB.work) {
          $('#lbTitle').textContent = LANG === 'en' ? LB.work.title_en : LB.work.title_zh;
        }
      });
    });

    var burger = $('#burger');
    var links = $('#navLinks');
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 9. Boot ---------- */
  function boot() {
    $('#year').textContent = new Date().getFullYear();
    buildWordmark();
    initObserver();
    applyI18n();
    renderFilters();
    renderGrid('all');
    renderProcess();
    observeReveals(document);
    initScroll();
    initEvents();
    requestAnimationFrame(function () { document.body.classList.add('is-ready'); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
