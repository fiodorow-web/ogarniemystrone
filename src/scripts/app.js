(function () {
  'use strict';

  /* ── Ustawienia ───────────────────────────────────────────────
     FORM_ENDPOINT: adres, pod który formularz wysyła JSON (funkcja na Vercelu,
     api/kontakt.js). Puste = tryb pokazowy: wysyłka jest udawana. */
  var FORM_ENDPOINT = '/api/kontakt';

  var d = document;
  var root = d.documentElement;
  var page = d.body.getAttribute('data-page') || '';

  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var mqCar = window.matchMedia('(max-width: 699px)');
  var mqDark = window.matchMedia('(prefers-color-scheme: dark)');
  function reduce() { return mqReduce.matches; }
  var hasIO = 'IntersectionObserver' in window;

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var session = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  /* ── Komunikat ── */
  var toastEl = $('[data-toast]');
  var toastT = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 2800);
  }

  /* ── Motyw ── */
  var themeBtn = $('[data-theme-btn]');
  function theme() {
    var t = root.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t;
    return mqDark.matches ? 'dark' : 'light';
  }
  function syncTheme() {
    var t = theme();
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Włącz jasny motyw' : 'Włącz ciemny motyw');
    $$('meta[name="theme-color"]').forEach(function (m) { m.setAttribute('content', t === 'dark' ? '#0d120f' : '#f4f6f2'); });
  }
  themeBtn.addEventListener('click', function () {
    var next = theme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store.set('os-motyw', next);
    syncTheme();
    toast(next === 'dark' ? 'Ciemny motyw. Oczy odpoczywają.' : 'Jasny motyw. Pełne słońce.');
  });
  if (mqDark.addEventListener) mqDark.addEventListener('change', syncTheme);
  syncTheme();

  /* ── Menu pełnoekranowe (telefon) ── */
  var sheet = $('[data-sheet]');
  var openBtn = $('[data-menu-open]');
  var closeBtn = $('[data-menu-close]');
  var lastFocus = null;
  var closeT = 0;
  function openSheet() {
    clearTimeout(closeT);
    var r = openBtn.getBoundingClientRect();
    sheet.style.setProperty('--ox', Math.round(r.left + r.width / 2) + 'px');
    sheet.style.setProperty('--oy', Math.round(r.top + r.height / 2) + 'px');
    lastFocus = d.activeElement;
    sheet.hidden = false;
    root.classList.add('locked');
    openBtn.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { requestAnimationFrame(function () { sheet.classList.add('open'); }); });
    setTimeout(function () { closeBtn.focus(); }, 40);
  }
  function closeSheet() {
    if (sheet.hidden) return;
    sheet.classList.remove('open');
    root.classList.remove('locked');
    openBtn.setAttribute('aria-expanded', 'false');
    if (reduce()) sheet.hidden = true;
    else closeT = setTimeout(function () { sheet.hidden = true; }, 520);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  openBtn.addEventListener('click', openSheet);
  closeBtn.addEventListener('click', closeSheet);
  sheet.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return; }
    if (e.key !== 'Tab') return;
    var f = $$('a[href], button:not([disabled])', sheet);
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  /* Powrót przyciskiem „wstecz” z zamkniętym menu */
  window.addEventListener('pageshow', function () {
    sheet.classList.remove('open');
    sheet.hidden = true;
    root.classList.remove('locked');
    openBtn.setAttribute('aria-expanded', 'false');
  });

  /* ── Dok z głównym przyciskiem ── */
  var dock = $('[data-dock]');
  var dockCta = $('[data-dock-cta]');
  var heroCta = $('[data-hero-cta]');
  var heroCtaVisible = !!heroCta;
  function updateDock() {
    var on = page !== 'kontakt' && !heroCtaVisible;
    dock.classList.toggle('cta-on', on);
    if (on) { dockCta.removeAttribute('tabindex'); dockCta.removeAttribute('aria-hidden'); }
    else { dockCta.setAttribute('tabindex', '-1'); dockCta.setAttribute('aria-hidden', 'true'); }
  }
  if (hasIO && heroCta) {
    new IntersectionObserver(function (es) { heroCtaVisible = es[es.length - 1].isIntersecting; updateDock(); }).observe(heroCta);
  }
  updateDock();

  /* ── Zakres do wiadomości: z cennika na stronę kontaktu ── */
  var PREFILL = 'os-zakres';
  $$('[data-pkg-ask]').forEach(function (a) {
    a.addEventListener('click', function () {
      session.set(PREFILL, 'Dzień dobry, interesuje mnie pakiet ' + a.getAttribute('data-pkg-ask') + '. ');
    });
  });

  /* ── Przyciski magnetyczne ── */
  if (mqFine.matches && !reduce()) {
    $$('.mag').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        var y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        b.style.setProperty('--mx', (x * 6).toFixed(1) + 'px');
        b.style.setProperty('--my', (y * 5).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', function () {
        b.style.setProperty('--mx', '0px');
        b.style.setProperty('--my', '0px');
      });
    });
  }

  /* ── Kinetyczny nagłówek: litery chudną przy kursorze ── */
  var kin = $('[data-kinetic]');
  if (kin) {
    var chars = [];
    var k = 0;
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = d.createDocumentFragment();
          n.textContent.split('').forEach(function (c) {
            if (c === ' ' || c === ' ' || c === '\n') { frag.appendChild(d.createTextNode(c)); return; }
            var s = d.createElement('span');
            s.className = 'ch';
            s.textContent = c;
            s.style.setProperty('--k', k++);
            frag.appendChild(s);
            chars.push(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName.toLowerCase() !== 'svg' && !n.classList.contains('ac')) {
          split(n);
        }
      });
    })(kin);

    if (!reduce()) {
      kin.classList.add('wave');
      setTimeout(function () { kin.classList.remove('wave'); }, 1200 + k * 18);
    }

    if (mqFine.matches && !reduce()) {
      var heroEl = $('.hero');
      var acEl = kin.querySelector('.ac');
      var px = 0, py = 0, kinOn = false, kinRaf = 0;
      var kinFrame = function () {
        kinRaf = 0;
        var rects = chars.map(function (c) { return c.getBoundingClientRect(); });
        chars.forEach(function (c, i) {
          var r = rects[i];
          var f = 0;
          if (kinOn) {
            var dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
            f = clamp(1 - Math.sqrt(dx * dx + dy * dy) / 230, 0, 1);
            f = f * f * (3 - 2 * f);
          }
          if (f > 0.01) c.style.fontWeight = String(Math.round(760 - f * 440));
          else if (c.style.fontWeight) c.style.fontWeight = '';
        });
        if (acEl) {
          var ar = acEl.getBoundingClientRect();
          var fa = 0;
          if (kinOn) {
            var ax = clamp(px, ar.left, ar.right) - px, ay = clamp(py, ar.top, ar.bottom) - py;
            fa = clamp(1 - Math.sqrt(ax * ax + ay * ay) / 200, 0, 1);
          }
          acEl.style.setProperty('--soft', String(Math.round(100 - fa * 100)));
          acEl.style.setProperty('--fw', String(Math.round(380 + fa * 300)));
        }
      };
      heroEl.addEventListener('pointermove', function (e) {
        px = e.clientX; py = e.clientY; kinOn = true;
        if (!kinRaf) kinRaf = requestAnimationFrame(kinFrame);
      });
      heroEl.addEventListener('pointerleave', function () {
        kinOn = false;
        if (!kinRaf) kinRaf = requestAnimationFrame(kinFrame);
      });
    }
  }

  /* ── Bałagan → ogarnięte ── */
  var mess = $('[data-mess]');
  var messBtn = $('[data-mess-btn]');
  var messLabel = $('[data-mess-label]');
  var messTouched = false;
  var messVisible = false;
  function setMess(order) {
    mess.classList.toggle('is-order', order);
    messBtn.setAttribute('aria-pressed', order ? 'true' : 'false');
    messLabel.textContent = order ? 'Pokaż, jak było' : 'Ogarnij ten bałagan';
  }
  if (mess) {
    messBtn.addEventListener('click', function () {
      messTouched = true;
      setMess(!mess.classList.contains('is-order'));
    });
    if (hasIO) new IntersectionObserver(function (es) { messVisible = es[es.length - 1].intersectionRatio > 0.5; }, { threshold: [0, 0.5, 0.75] }).observe(mess);
  }

  /* ── Kafelki: wyszukiwarka, godziny, terminy, szybkość ── */
  var typer = $('[data-typer]');
  if (typer) {
    var tw = typer.getAttribute('data-typer').split('|');
    var wi = 0, ci = tw[0].length, del = true, tTimer = 0, tRun = false;
    var typeTick = function () {
      if (!tRun) return;
      if (del) {
        ci--;
        if (ci <= 0) { ci = 0; del = false; wi = (wi + 1) % tw.length; typer.textContent = ''; tTimer = setTimeout(typeTick, 320); return; }
      } else {
        ci++;
        if (ci >= tw[wi].length) { typer.textContent = tw[wi]; del = true; tTimer = setTimeout(typeTick, 1700); return; }
      }
      typer.textContent = tw[wi].slice(0, ci);
      tTimer = setTimeout(typeTick, del ? 30 : 70);
    };
    if (hasIO && !reduce()) {
      new IntersectionObserver(function (es) {
        var vis = es[es.length - 1].isIntersecting;
        if (vis && !tRun) { tRun = true; tTimer = setTimeout(typeTick, 1200); }
        else if (!vis && tRun) { tRun = false; clearTimeout(tTimer); }
      }).observe(typer);
    }
  }

  var hoursBtn = $('[data-hours-btn]');
  if (hoursBtn) {
    var hSets = [['8:00–16:00', '9:00–13:00'], ['9:00–17:00', '10:00–14:00'], ['7:30–15:30', 'nieczynne']];
    var hIdx = 0;
    var h1 = $('[data-h1]'), h2 = $('[data-h2]');
    hoursBtn.addEventListener('click', function () {
      hIdx = (hIdx + 1) % hSets.length;
      [h1, h2].forEach(function (el, i) {
        el.classList.remove('flip');
        void el.offsetWidth;
        el.classList.add('flip');
        setTimeout(function () { el.textContent = hSets[hIdx][i]; }, reduce() ? 0 : 200);
      });
      toast('Zapisane. Bez dzwonienia do nas.');
    });
  }

  var speed = $('[data-speed]');
  function runSpeed() {
    speed.classList.remove('run', 'done');
    void speed.offsetWidth;
    speed.classList.add('run');
    setTimeout(function () { speed.classList.add('done'); }, reduce() ? 0 : 1100);
  }
  if (speed) {
    $('[data-speed-btn]').addEventListener('click', runSpeed);
    if (hasIO) {
      var spIO = new IntersectionObserver(function (es) {
        if (es[es.length - 1].isIntersecting) { runSpeed(); spIO.disconnect(); }
      }, { threshold: 0.6 });
      spIO.observe(speed);
    } else { runSpeed(); }
  }

  /* ── Kafel z telefonem: „Otwarte teraz” według zegara i próbne połączenie ── */
  var ph = $('[data-ph]');
  if (ph) {
    var hm = function (m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); };
    var OPEN = [null, [480, 960], [480, 960], [480, 960], [480, 960], [480, 960], [540, 780]];
    var now = new Date(), day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
    var today = OPEN[day], openTxt;
    if (today && mins >= today[0] && mins < today[1]) openTxt = 'Otwarte teraz · do ' + hm(today[1]);
    else if (today && mins < today[0]) openTxt = 'Zamknięte · od ' + hm(today[0]);
    else openTxt = 'Zamknięte · ' + (day === 6 ? 'w pon.' : 'jutro') + ' od ' + hm(OPEN[day === 6 ? 1 : day + 1][0]);
    $('[data-ph-open-txt]').textContent = openTxt;
    $('[data-ph-open]').classList.toggle('shut', openTxt.indexOf('Zamknięte') === 0);

    var phTime = $('[data-ph-time]');
    var phTimers = [];
    var phCall = function () {
      phTimers.forEach(clearTimeout);
      phTimers = [];
      phTime.textContent = 'Łączenie…';
      ph.classList.add('calling', 'ringing');
      var at = function (ms, fn) { phTimers.push(setTimeout(fn, ms)); };
      for (var s = 1; s <= 4; s++) {
        (function (s) {
          at(1300 + (s - 1) * 1000, function () { ph.classList.remove('ringing'); phTime.textContent = '00:0' + s; });
        })(s);
      }
      at(5300, function () { phTime.textContent = 'Rozmowa zakończona'; });
      at(6500, function () { ph.classList.remove('calling', 'ringing'); });
    };
    $('[data-ph-btn]').addEventListener('click', function () {
      phCall();
      toast('Jedno dotknięcie i klient już do Ciebie dzwoni.');
    });
    $('[data-ph-call]').addEventListener('click', phCall);
  }

  /* Pasek kafelków na telefonie */
  var car = $('[data-car]');
  if (car) {
    var carCount = $('[data-car-count]');
    var carTiles = function () { return $$('.tile', car); };
    var carIndex = function () {
      var cl = car.getBoundingClientRect().left + parseFloat(getComputedStyle(car).paddingLeft || 0);
      var best = 0, bd = Infinity;
      carTiles().forEach(function (t, i) {
        var dd = Math.abs(t.getBoundingClientRect().left - cl);
        if (dd < bd) { bd = dd; best = i; }
      });
      return best;
    };
    var carGo = function (dir) {
      var ts = carTiles();
      var i = clamp(carIndex() + dir, 0, ts.length - 1);
      car.scrollTo({ left: ts[i].offsetLeft - ts[0].offsetLeft, behavior: reduce() ? 'auto' : 'smooth' });
    };
    var carSync = function () {
      if (mqCar.matches) car.setAttribute('tabindex', '0'); else car.removeAttribute('tabindex');
    };
    var carT = 0;
    car.addEventListener('scroll', function () {
      clearTimeout(carT);
      carT = setTimeout(function () { carCount.textContent = (carIndex() + 1) + ' / ' + carTiles().length; }, 90);
    }, { passive: true });
    $('[data-car-prev]').addEventListener('click', function () { carGo(-1); });
    $('[data-car-next]').addEventListener('click', function () { carGo(1); });
    car.addEventListener('keydown', function (e) {
      if (!mqCar.matches || e.target !== car) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); carGo(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); carGo(-1); }
    });
    if (mqCar.addEventListener) mqCar.addEventListener('change', carSync);
    carSync();
  }

  /* ── Zdanie rozjaśniane słowo po słowie ── */
  var say = $('[data-words]');
  var sayWords = [];
  if (say) {
    Array.prototype.slice.call(say.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = d.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(part)); return; }
          var s = d.createElement('span');
          s.className = 'wd';
          s.textContent = part;
          frag.appendChild(s);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) {
        n.classList.add('wd');
      }
    });
    sayWords = $$('.wd', say);
    say.classList.add('split');

    // Nierozjaśnione słowa są węższe (font-stretch), więc przy przewijaniu wiersze by się przełamywały.
    // Podział liczymy raz dla pełnej szerokości i blokujemy go <br>-ami; liczymy od nowa przy zmianie szerokości.
    var sayW = 0;
    var lockLines = function () {
      if (say.clientWidth === sayW) return;
      sayW = say.clientWidth;
      $$('br.say-br', say).forEach(function (br) { br.remove(); });
      say.classList.add('measure');
      var half = parseFloat(getComputedStyle(say).lineHeight) / 2 || 20;
      var starts = [], top = null;
      sayWords.forEach(function (w) {
        var t = w.getBoundingClientRect().top;
        if (top !== null && t > top + half) starts.push(w);
        if (top === null || t > top + half) top = t;
      });
      say.classList.remove('measure');
      starts.forEach(function (w) {
        var br = d.createElement('br');
        br.className = 'say-br';
        w.parentNode.insertBefore(br, w);
      });
    };
    lockLines();
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { sayW = 0; lockLines(); });
    var sayT = 0;
    window.addEventListener('resize', function () { clearTimeout(sayT); sayT = setTimeout(lockLines, 120); });
  }

  /* ── Liczenie ceny ── */
  var countEl = $('[data-count]');
  if (countEl && hasIO && !reduce()) {
    var target = +countEl.getAttribute('data-count');
    var cIO = new IntersectionObserver(function (es) {
      if (!es[es.length - 1].isIntersecting) return;
      cIO.disconnect();
      var t0 = performance.now();
      var step = function (now) {
        var p = clamp((now - t0) / 1100, 0, 1);
        countEl.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    cIO.observe(countEl);
  }

  /* ── Pojawianie się przy przewijaniu ── */
  var revealEls = $$('.rv, .kin');
  var foot = $('.site-foot');
  if (hasIO) {
    var revIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revIO.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    revealEls.forEach(function (el) { revIO.observe(el); });
    var footIO = new IntersectionObserver(function (es) {
      if (es[es.length - 1].isIntersecting) { foot.classList.add('in'); footIO.disconnect(); }
    }, { threshold: 0.2 });
    footIO.observe(foot);
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
    foot.classList.add('in');
  }

  /* ── Przewijanie: nagłówek, postęp, paralaksa, rysowane linie ── */
  var head = $('[data-head]');
  var totop = $('[data-totop]');
  var stepsWrap = $('[data-steps]');
  var stepsLine = stepsWrap ? $('.steps-line', stepsWrap) : null;
  var tl = $('[data-tl]');
  var parEls = $$('[data-par]');
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;
    var max = root.scrollHeight - vh;
    head.classList.toggle('scrolled', y > 8);
    totop.hidden = y < 700;
    totop.style.setProperty('--p', (max > 0 ? clamp(y / max, 0, 1) : 0).toFixed(3));
    if (mess && !messTouched && messVisible && y > 40) { messTouched = true; setMess(true); }
    if (say && !reduce()) {
      var r = say.getBoundingClientRect();
      if (r.bottom > -50 && r.top < vh + 50) {
        var p = clamp((vh * 0.84 - r.top) / (r.height + vh * 0.28), 0, 1);
        var n = Math.round(p * sayWords.length);
        sayWords.forEach(function (w, i) { w.classList.toggle('lit', i < n); });
      }
    }
    if (stepsLine) {
      var sr = stepsWrap.getBoundingClientRect();
      var sp = reduce() ? 1 : clamp((vh * 0.88 - sr.top) / (sr.height * 0.9), 0, 1);
      stepsLine.style.setProperty('--draw', (1.01 - sp * 1.01).toFixed(3));
    }
    if (tl) {
      var tr = tl.getBoundingClientRect();
      var tp = reduce() ? 1 : clamp((vh * 0.62 - tr.top) / tr.height, 0, 1);
      tl.style.setProperty('--fill', tp.toFixed(3));
    }
    if (mqFine.matches && !reduce() && window.innerWidth >= 980) {
      parEls.forEach(function (el) {
        var er = el.getBoundingClientRect();
        if (er.bottom < -100 || er.top > vh + 100) return;
        var c = er.top + er.height / 2 - vh / 2;
        el.style.setProperty('--py', (c * parseFloat(el.getAttribute('data-par'))).toFixed(1) + 'px');
      });
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  totop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce() ? 'auto' : 'smooth' });
  });
  onScroll();

  /* ── Realizacje: kafle lekko przechylają się za kursorem ── */
  var works = $$('[data-works] .work');
  if (works.length) {
    if (mqFine.matches && !reduce()) {
      works.forEach(function (w) {
        w.addEventListener('pointermove', function (e) {
          var r = w.getBoundingClientRect();
          w.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 6).toFixed(2) + 'deg');
          w.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -5).toFixed(2) + 'deg');
        });
        w.addEventListener('pointerleave', function () { w.style.setProperty('--rx', '0deg'); w.style.setProperty('--ry', '0deg'); });
      });
    }
  }

  /* ── Dobór pakietu ── */
  var konf = $('[data-konf]');
  if (konf) {
    var kEmpty = $('[data-konf-empty]'), kRes = $('[data-konf-res]'), kProg = $('[data-konf-progress]');
    var kName = $('[data-konf-name]'), kPrice = $('[data-konf-price]'), kWhy = $('[data-konf-why]');
    var kDots = $$('.konf-dots i');
    var pkgs = $$('[data-pkg]');
    var NAMES = { wizytowka: 'Wizytówka', firma: 'Firma', rezerwacje: 'Firma z rezerwacjami' };
    var PRICES = { wizytowka: 'od 999 zł', firma: 'od 1 999 zł', rezerwacje: 'od 2 999 zł' };
    var kSummary = '';
    var val = function (n) { var el = konf.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; };
    var konfUpdate = function () {
      var a = [val('q1'), val('q2'), val('q3')];
      var answered = a.filter(Boolean).length;
      kDots.forEach(function (dot, i) { dot.classList.toggle('on', i < answered); });
      if (answered < 3) {
        kRes.hidden = true;
        kEmpty.hidden = false;
        kProg.textContent = answered === 0 ? 'Odpowiedz na trzy pytania, a podświetlimy pasujący pakiet.' : (answered === 1 ? 'Dobrze idzie. Jeszcze dwa pytania.' : 'Ostatnie pytanie i gotowe.');
        pkgs.forEach(function (p) { p.classList.remove('is-match'); });
        return;
      }
      var pkg = a[1] === 'tak' ? 'rezerwacje' : ((a[0] === 'kilka' || a[2] === 'tak') ? 'firma' : 'wizytowka');
      var why = [
        a[0] === 'kilka' ? 'kilka podstron' : 'jedna strona',
        a[1] === 'tak' ? 'rezerwacje online' : 'bez rezerwacji online',
        a[2] === 'tak' ? 'sam zmieniam godziny i cennik' : 'zmiany rzadko'
      ];
      kName.textContent = NAMES[pkg];
      kPrice.textContent = PRICES[pkg];
      kWhy.textContent = 'Twój zakres: ' + why.join(', ') + '.';
      kSummary = 'Dzień dobry, interesuje mnie pakiet ' + NAMES[pkg] + '. Mój zakres: ' + why.join(', ') + '. ';
      kEmpty.hidden = true;
      kRes.hidden = false;
      pkgs.forEach(function (p) { p.classList.toggle('is-match', p.getAttribute('data-pkg') === pkg); });
    };
    konf.addEventListener('change', konfUpdate);
    $('[data-konf-send]').addEventListener('click', function () {
      session.set(PREFILL, kSummary);
      window.location.href = '/kontakt';
    });
    $('[data-konf-reset]').addEventListener('click', function () {
      konf.reset();
      konfUpdate();
      var f = konf.querySelector('input');
      if (f) f.focus();
    });
    konfUpdate();
  }

  /* ── Pytania: płynne rozwijanie ── */
  $$('.faq details').forEach(function (dt) {
    var sum = dt.querySelector('summary');
    var body = dt.querySelector('.faq-a');
    var busy = false;
    sum.addEventListener('click', function (e) {
      if (reduce() || !body.animate) return;
      e.preventDefault();
      if (busy) return;
      busy = true;
      if (dt.open) {
        var h = body.offsetHeight;
        var an = body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 300, easing: 'cubic-bezier(.65,0,.35,1)' });
        an.onfinish = function () { dt.open = false; busy = false; };
      } else {
        dt.open = true;
        var h2v = body.offsetHeight;
        var an2 = body.animate([{ height: '0px', opacity: 0 }, { height: h2v + 'px', opacity: 1 }], { duration: 400, easing: 'cubic-bezier(.16,1,.3,1)' });
        an2.onfinish = function () { busy = false; };
      }
    });
  });

  /* ── Lista „pod ręką” ── */
  var ck = $('[data-check]');
  if (ck) {
    var boxes = $$('input[type="checkbox"]', ck);
    var ckCount = $('[data-check-count]'), ckMsg = $('[data-check-msg]'), ckRing = $('[data-check-ring]');
    var saved = (store.get('os-lista') || '').split(',').filter(Boolean);
    boxes.forEach(function (b) { b.checked = saved.indexOf(b.value) > -1; });
    var ckUpdate = function (save) {
      var on = boxes.filter(function (b) { return b.checked; });
      var n = on.length;
      ckCount.textContent = n + ' z ' + boxes.length;
      ckRing.style.setProperty('--p', (n / boxes.length).toFixed(2));
      ckMsg.textContent = n === 0 ? 'Nic jeszcze? Spokojnie, i tak zaczniemy od rozmowy.' : (n < 3 ? 'Dobry początek.' : (n < boxes.length ? 'Prawie komplet.' : 'Wszystko gotowe. Możemy działać.'));
      if (save) store.set('os-lista', on.map(function (b) { return b.value; }).join(','));
    };
    boxes.forEach(function (b) { b.addEventListener('change', function () { ckUpdate(true); }); });
    ckUpdate(false);
  }

  /* ── Formularz kontaktowy ── */
  var form = $('[data-form]');
  if (form) {
    var fImie = $('#f-imie'), fKontakt = $('#f-kontakt'), fFirma = $('#f-firma'), fWiad = $('#f-wiad');
    var submitBtn = $('[data-submit]');
    var alertEl = $('[data-form-alert]');
    var sent = $('[data-sent]');
    var draftNote = $('[data-draft-note]'), draftText = $('[data-draft-text]');
    var cntN = $('[data-count-n]'), cntMsg = $('[data-count-msg]');
    var DRAFT = 'os-szkic';
    var fPulapka = $('[name="strona_www"]', form);
    var shownAt = Date.now();
    var triedSubmit = false;
    var sending = false;
    var temat = function () { return $$('input[name="temat"]', form).filter(function (c) { return c.checked; }).map(function (c) { return c.value; }); };
    var counter = function () {
      var n = fWiad.value.trim().length;
      cntN.textContent = n === 1 ? '1 znak' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? n + ' znaki' : n + ' znaków');
      cntMsg.textContent = n === 0 ? 'Kilka zdań wystarczy.' : (n < 40 ? 'Dobry początek.' : (n < 200 ? 'Super, to nam bardzo pomoże.' : 'Mamy wszystko, czego trzeba.'));
    };
    var saveDraft = function () {
      var data = { imie: fImie.value, kontakt: fKontakt.value, firma: fFirma.value, wiad: fWiad.value, temat: temat() };
      var any = data.imie || data.kontakt || data.firma || data.wiad || data.temat.length;
      if (any) { store.set(DRAFT, JSON.stringify(data)); draftNote.hidden = false; }
      else { store.del(DRAFT); draftNote.hidden = true; }
    };
    var restoreDraft = function () {
      var raw = store.get(DRAFT);
      if (!raw) return;
      try {
        var dr = JSON.parse(raw);
        fImie.value = dr.imie || '';
        fKontakt.value = dr.kontakt || '';
        fFirma.value = dr.firma || '';
        fWiad.value = dr.wiad || '';
        $$('input[name="temat"]', form).forEach(function (c) { c.checked = (dr.temat || []).indexOf(c.value) > -1; });
        if (dr.imie || dr.kontakt || dr.wiad) { draftText.textContent = 'Przywróciliśmy szkic z poprzedniej wizyty.'; draftNote.hidden = false; }
      } catch (e) { store.del(DRAFT); }
    };
    var applyPrefill = function () {
      var text = session.get(PREFILL);
      if (!text) return;
      session.del(PREFILL);
      if (!fWiad.value.trim()) fWiad.value = text;
      else if (fWiad.value.indexOf(text.trim()) === -1) fWiad.value = fWiad.value.replace(/\s+$/, '') + '\n\n' + text;
      counter();
      saveDraft();
      setTimeout(function () { toast('Wpisaliśmy zakres do wiadomości. Dopisz resztę.'); }, 500);
    };
    var isEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
    var isPhone = function (v) { return /^[+\d\s().-]+$/.test(v) && v.replace(/\D/g, '').length >= 9; };
    var setErr = function (input, errId, msg) {
      var p = d.getElementById(errId);
      p.textContent = msg || '';
      p.hidden = !msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };
    var validate = function (shake) {
      var errs = [];
      var imie = fImie.value.trim(), kon = fKontakt.value.trim();
      var eImie = imie ? '' : 'Błąd: jak mamy się do Ciebie zwracać? Wpisz imię.';
      var eKon = !kon ? 'Błąd: podaj e-mail albo telefon, żebyśmy mogli odpisać.' : ((isEmail(kon) || isPhone(kon)) ? '' : 'Błąd: to nie wygląda na e-mail ani numer telefonu. Sprawdź literówki.');
      setErr(fImie, 'e-imie', eImie);
      setErr(fKontakt, 'e-kontakt', eKon);
      if (eImie) errs.push(fImie);
      if (eKon) errs.push(fKontakt);
      if (shake && !reduce()) {
        errs.forEach(function (inp) {
          var f = inp.closest('.field');
          f.classList.remove('shake');
          void f.offsetWidth;
          f.classList.add('shake');
        });
      }
      return errs;
    };
    var setBusy = function (b) {
      sending = b;
      submitBtn.classList.toggle('busy', b);
      if (b) submitBtn.setAttribute('aria-disabled', 'true'); else submitBtn.removeAttribute('aria-disabled');
      form.setAttribute('aria-busy', b ? 'true' : 'false');
    };
    var sendData = function (data) {
      if (!FORM_ENDPOINT) {
        if (window.console) console.info('Tryb pokazowy formularza – ustaw FORM_ENDPOINT, żeby wysyłać naprawdę.', data);
        return new Promise(function (res) { setTimeout(function () { res(true); }, 1300); });
      }
      return fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.ok; });
    };

    restoreDraft();
    counter();
    applyPrefill();
    var dTimer = 0;
    form.addEventListener('input', function (e) {
      if (e.target === fWiad) counter();
      if (triedSubmit && (e.target === fImie || e.target === fKontakt)) validate(false);
      clearTimeout(dTimer);
      dTimer = setTimeout(saveDraft, 350);
    });
    form.addEventListener('change', function (e) { if (e.target.name === 'temat') saveDraft(); });
    $('[data-draft-clear]').addEventListener('click', function () {
      form.reset();
      store.del(DRAFT);
      draftNote.hidden = true;
      draftText.textContent = 'Szkic zapisuje się w Twojej przeglądarce.';
      setErr(fImie, 'e-imie', '');
      setErr(fKontakt, 'e-kontakt', '');
      triedSubmit = false;
      counter();
      fImie.focus();
      toast('Wyczyszczone. Czysta kartka.');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      triedSubmit = true;
      alertEl.hidden = true;
      var errs = validate(true);
      if (errs.length) { errs[0].focus(); return; }
      setBusy(true);
      var data = { imie: fImie.value.trim(), kontakt: fKontakt.value.trim(), firma: fFirma.value.trim(), temat: temat(), wiadomosc: fWiad.value.trim() };
      // Dla serwera: pole-pułapka (ludzie go nie widzą) i czas od pokazania formularza (ochrona przed automatami)
      sendData(Object.assign({ strona_www: fPulapka ? fPulapka.value : '', t: Date.now() - shownAt }, data)).then(function (ok) {
        setBusy(false);
        if (!ok) throw new Error('send');
        $('[data-sent-h]').textContent = 'Dziękujemy, ' + data.imie.split(/\s+/)[0] + '.';
        form.hidden = true;
        sent.hidden = false;
        sent.focus();
        form.reset();
        store.del(DRAFT);
        draftNote.hidden = true;
        triedSubmit = false;
        counter();
      }).catch(function () {
        setBusy(false);
        alertEl.hidden = false;
      });
    });
    $('[data-sent-again]').addEventListener('click', function () {
      shownAt = Date.now();
      sent.hidden = true;
      form.hidden = false;
      fImie.focus();
    });
  }

  /* ── Kopiowanie adresu ── */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-copy');
      var ok = function () {
        b.classList.remove('done');
        void b.offsetWidth;
        b.classList.add('done');
        toast('Skopiowane. Teraz tylko wkleić.');
      };
      var fb = function () {
        var ta = d.createElement('textarea');
        ta.value = t;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        d.body.appendChild(ta);
        ta.select();
        var s = false;
        try { s = d.execCommand('copy'); } catch (e) {}
        d.body.removeChild(ta);
        if (s) ok(); else toast('Ups, nie udało się skopiować. Adres: ' + t);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, fb);
      else fb();
    });
  });

})();
