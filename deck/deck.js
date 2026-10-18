/* ============================================================
   Builds the 16:9 deck from the live portfolio data.
   ?p=N renders a single slide (used by the screenshot export);
   no parameter renders every slide for review.
   ============================================================ */
(function () {
  'use strict';

  var A = '../';                       // asset root, relative to /deck/
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function img(src, cls) {
    return '<img src="' + A + src + '"' + (cls ? ' class="' + cls + '"' : '') + ' alt="">';
  }

  /* ---------- chrome shared by every slide ---------- */
  function frame(body, head, foot) {
    return '<section class="slide">' +
           '<div class="slide__glow"></div><div class="slide__grain"></div>' +
           (head || '') +
           '<div class="slide__in">' + body + '</div>' +
           (foot || '') +
           '</section>';
  }
  function railTop(left, right) {
    return '<div class="rail rail--top"><b>' + left + '</b>' +
           '<div class="rail__line"></div><span>' + (right || '') + '</span></div>';
  }
  function railBot(left, n) {
    return '<div class="rail rail--bot"><span>' + left + '</span>' +
           '<div class="rail__line"></div>' +
           '<span class="num">' + (n < 10 ? '0' : '') + n + '</span></div>';
  }

  /* ---------- slide builders ---------- */
  function cover() {
    var s = DATA.site;
    return frame(
      '<div class="cover slide__in">' +
        '<h1 class="cover__word">' +
          'PORTFOLIO'.split('').map(function (c) { return '<span>' + c + '</span>'; }).join('') +
        '</h1>' +
        '<div class="cover__row">' +
          '<p class="cover__lead">' + esc(s.hero_tagline_zh).replace('故事', '<em>故事</em>') + '</p>' +
          '<div class="cover__meta">' +
            '<div class="cover__sig">Chen En-Yu</div>' +
            '<div>陳恩語 · ' + esc(s.role_zh) + '</div>' +
            '<div>enyuc352@gmail.com</div>' +
          '</div>' +
        '</div>' +
      '</div>', '', '');
  }

  function about(n) {
    var s = DATA.site;
    var vids = DATA.works.reduce(function (a, w) { return a + w.items.length; }, 0);
    var folders = [];
    DATA.gallery.forEach(function (g) {
      if (folders.indexOf(g.folder_zh) < 0) folders.push(g.folder_zh);
    });
    return frame(
      '<div class="about">' +
        '<div>' +
          '<div class="kicker">About</div>' +
          '<h2 class="h1">關於<em>我</em></h2>' +
          '<p class="about__body" style="margin-top:34px">' + esc(s.about_zh) + '</p>' +
          '<div class="stats">' +
            '<div class="stat"><b>' + DATA.works.length + '</b><span>動態專案</span></div>' +
            '<div class="stat"><b>' + vids + '</b><span>支影片</span></div>' +
            '<div class="stat"><b>' + folders.length + '</b><span>靜態專案</span></div>' +
            '<div class="stat"><b>' + DATA.gallery.length + '</b><span>張作品</span></div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="kicker">Tools</div>' +
          '<h3 class="h2" style="font-size:44px">常用<em>工具</em></h3>' +
          '<div class="tools">' +
            DATA.tools.map(function (t) {
              return '<div class="tool"><i>' + esc(t.k) + '</i><span>' + esc(t.n) + '</span></div>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>',
      railTop('Chen En-Yu · Portfolio', '關於'),
      railBot(esc(s.role_zh), n));
  }

  function work(w, n) {
    var items = w.items;
    var many  = items.length > 1;
    var role  = w.credits_zh || [];

    // main media, plus a contact strip when the project holds several clips
    var media = '<div class="work__media">' + img(w.cover) + '</div>';
    if (many) {
      var cls = items.length >= 6 ? 'strip--6' : (items.length >= 3 ? 'strip--3' : 'strip--2');
      media = '<div class="work__stack">' +
                '<div class="work__media">' + img(w.cover) + '</div>' +
                '<div class="strip ' + cls + '">' +
                  items.map(function (it) {
                    return '<figure>' + img(it.poster || it.thumb) + '</figure>';
                  }).join('') +
                '</div>' +
              '</div>';
    }

    var panel =
      '<div class="work__panel">' +
        '<div class="sub">' + esc(w.subtitle_zh) + '</div>' +
        '<h2 class="h2">' + esc(w.title_zh) + '</h2>' +
        '<div style="font-size:16px;letter-spacing:.12em;color:var(--bone-faint);margin-top:10px">' +
          esc(w.title_en) + '</div>' +
        '<p class="work__desc">' + esc(w.desc_zh) + '</p>' +
        '<div class="work__tags">' +
          w.tags_zh.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') +
        '</div>' +
        (role.length
          ? '<div class="role' + (role.length > 7 ? ' role--dense' : '') + '"><b>我負責的項目</b>' +
            '<div class="role__list">' +
              role.map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') +
            '</div></div>'
          : '') +
      '</div>';

    return frame(
      '<div class="work">' + media + panel + '</div>',
      railTop('動態作品 · Motion', esc(w.tags_zh[0] || '')),
      railBot(esc(w.title_en), n));
  }

  function gallery(group, chunk, n, part, parts) {
    var k = chunk.length;
    // portrait-heavy sets look wrong cropped to landscape cells
    var portrait = chunk.filter(function (g) { return g.h > g.w * 1.2; }).length > chunk.length / 2;
    var cls;
    if (portrait && k <= 6) {
      cls = 'gp' + Math.max(2, k);           // one row, full stage height
    } else {
      cls = k <= 1 ? 'g1' : k === 2 ? 'g2' : k <= 4 ? 'g4' : k <= 6 ? 'g6' : k <= 8 ? 'g8' : 'g9';
    }

    return frame(
      '<div class="gal">' +
        '<div class="gal__head">' +
          '<div>' +
            '<div class="kicker">' + esc(group.cat_label) + '</div>' +
            '<h2 class="h2">' + esc(group.folder_zh) + '</h2>' +
          '</div>' +
          '<div style="text-align:right;font-size:15px;letter-spacing:.14em;color:var(--bone-faint)">' +
            esc(group.folder_en) +
            '<div style="margin-top:7px">' + group.items.length + ' 張' +
              (parts > 1 ? ' · ' + part + '/' + parts : '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="gal__grid ' + cls + (portrait ? ' gal__grid--portrait' : '') + '">' +
          chunk.map(function (g) { return '<figure>' + img(g.src) + '</figure>'; }).join('') +
        '</div>' +
      '</div>',
      railTop('靜態作品 · Stills', esc(group.cat_label)),
      railBot(esc(group.folder_en), n));
  }

  function closing(n) {
    var mail = '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/>' +
               '<path d="m2 7 10 7 10-7"/></svg>';
    var pin  = '<svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/>' +
               '<circle cx="12" cy="10" r="2.6"/></svg>';
    return frame(
      '<div class="close">' +
        '<div class="kicker" style="justify-content:center">Thank you</div>' +
        '<h2 class="close__h">一起做點<em>有意思的東西</em></h2>' +
        '<div class="close__rows">' +
          '<div class="close__row">' + mail + 'enyuc352@gmail.com</div>' +
          '<div class="close__row">' + pin + '台灣 · 可遠端合作</div>' +
        '</div>' +
        '<div style="font-family:var(--script);font-style:italic;font-size:58px;' +
          'color:var(--rose);margin-top:16px">Chen En-Yu</div>' +
      '</div>',
      railTop('Chen En-Yu · Portfolio', '聯絡'),
      railBot('enyuc352@gmail.com', n));
  }

  /* ---------- assemble ---------- */
  function chunks(arr, size) {
    var out = [];
    for (var i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }
  function balanced(arr, max) {
    // split into near-equal pages rather than a full page plus a stub
    if (arr.length <= max) return [arr];
    var pages = Math.ceil(arr.length / max);
    var per = Math.ceil(arr.length / pages);
    return chunks(arr, per);
  }

  function build() {
    var catLabel = {};
    DATA.galleryCats.forEach(function (c) { catLabel[c.id] = c.zh; });

    var groups = [];
    DATA.gallery.forEach(function (g) {
      if (!groups.length || groups[groups.length - 1].folder_zh !== g.folder_zh) {
        groups.push({ folder_zh: g.folder_zh, folder_en: g.folder_en,
                      cat_label: catLabel[g.cat] || g.cat, items: [] });
      }
      groups[groups.length - 1].items.push(g);
    });

    var slides = [];
    slides.push(function (n) { return cover(n); });
    slides.push(function (n) { return about(n); });
    DATA.works.forEach(function (w) {
      slides.push(function (n) { return work(w, n); });
    });
    groups.forEach(function (grp) {
      var pages = balanced(grp.items, 9);
      pages.forEach(function (chunk, i) {
        slides.push(function (n) { return gallery(grp, chunk, n, i + 1, pages.length); });
      });
    });
    slides.push(function (n) { return closing(n); });
    return slides;
  }

  var SLIDES = build();
  window.DECK_COUNT = SLIDES.length;

  var p = new URLSearchParams(location.search).get('p');
  var root = document.getElementById('deck');

  if (p !== null) {
    var i = Math.max(1, Math.min(SLIDES.length, parseInt(p, 10) || 1));
    root.innerHTML = SLIDES[i - 1](i);
  } else {
    document.body.classList.add('review');
    root.innerHTML = SLIDES.map(function (fn, i) { return fn(i + 1); }).join('');
  }

  // signal readiness once fonts and images have settled, for the exporter
  function ready() {
    var imgs = Array.prototype.slice.call(document.images);
    var pending = imgs.filter(function (im) { return !im.complete; });
    Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      Promise.all(pending.map(function (im) {
        return new Promise(function (res) {
          im.addEventListener('load', res); im.addEventListener('error', res);
        });
      }))
    ]).then(function () {
      document.documentElement.setAttribute('data-ready', '1');
    });
  }
  ready();
})();
