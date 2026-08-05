/* ═══════════════════════════════════════════════════════════════════
   PARCOURS INDUSTRIE — MOTEUR D'ANIMATIONS
   ───────────────────────────────────────────────────────────────────
   Fichier unique chargé par les 53 pages. Aucune dépendance,
   aucun framework, aucune compilation.

   Contenu :
     1.  Barre de progression de lecture
     2.  Navigation floutée au scroll
     3.  Menu mobile (burger + accordéons)
     4.  Révélation des sections au scroll
     5.  Compteurs animés
     6.  Parallaxe léger sur les photos hero
     7.  Bouton retour en haut
     8.  Formulaire : progression + validation
     9.  Défilement doux des ancres
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ── 0. CONTENUS PILOTÉS PAR LE CMS STATIQUE ──────────────────── */
  /* Decap CMS modifie des fichiers JSON dans /content. Le site les lit
     ici : si un fichier manque ou ne charge pas en local, le HTML déjà
     présent reste affiché comme solution de secours.                 */
  function rootPrefix() {
    var path = window.location.pathname;
    if (/\/blog\/|\/vae\/|\/bilan\/|\/reconversion\/|\/orientation\/|\/coaching\/|\/entreprises\/|\/ingenierie\//.test(path)) {
      return '../';
    }
    return '';
  }

  function assetPath(path) {
    if (!path) return '';
    if (/^(https?:)?\/\//.test(path) || path.charAt(0) === '/') return path;
    return rootPrefix() + path.replace(/^\.?\//, '');
  }

  function normalizedAsset(path) {
    if (!path) return '';
    var a = document.createElement('a');
    a.href = path;
    return a.pathname.replace(/\/+/g, '/');
  }

  function fetchJson(path) {
    return fetch(assetPath(path), { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('CMS JSON introuvable');
        return res.json();
      });
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function articleUrl(article) {
    if (article.url) return article.url;
    return 'article.html?slug=' + encodeURIComponent(article.slug || '');
  }

  function markdownToHtml(md) {
    var lines = String(md || '').split(/\r?\n/);
    var html = [];
    var inList = false;
    lines.forEach(function (line) {
      var text = line.trim();
      if (!text) {
        if (inList) { html.push('</ul>'); inList = false; }
        return;
      }
      if (/^###\s+/.test(text)) {
        if (inList) { html.push('</ul>'); inList = false; }
        html.push('<h3>' + escapeHtml(text.replace(/^###\s+/, '')) + '</h3>');
      } else if (/^##\s+/.test(text)) {
        if (inList) { html.push('</ul>'); inList = false; }
        html.push('<h2>' + escapeHtml(text.replace(/^##\s+/, '')) + '</h2>');
      } else if (/^[-*]\s+/.test(text)) {
        if (!inList) { html.push('<ul>'); inList = true; }
        html.push('<li>' + escapeHtml(text.replace(/^[-*]\s+/, '')) + '</li>');
      } else {
        if (inList) { html.push('</ul>'); inList = false; }
        html.push('<p>' + escapeHtml(text) + '</p>');
      }
    });
    if (inList) html.push('</ul>');
    return html.join('');
  }

  function initCmsImages() {
    return fetchJson('content/site-images.json').then(function (data) {
      var entries = [];

      // Nouvelle structure : groupes organisés pour Decap CMS.
      if (Array.isArray(data.groups)) {
        data.groups.forEach(function (group) {
          (group.images || []).forEach(function (item) { entries.push(item); });
        });
      } else if (data && typeof data === 'object') {
        Object.keys(data).forEach(function (key) {
          var group = data[key];
          if (group && Array.isArray(group.images)) {
            group.images.forEach(function (item) { entries.push(item); });
          }
        });
      } else {
        // Ancienne structure plate conservée par sécurité.
        Object.keys(data || {}).forEach(function (key) {
          entries.push({ id: key, current_path: data[key], image: data[key] });
        });
      }

      if (!entries.length) return;

      var byId = {};
      var byCurrentPath = {};
      entries.forEach(function (item) {
        if (!item) return;
        if (item.id) byId[item.id] = item;
        if (item.current_path) byCurrentPath[normalizedAsset(item.current_path)] = item;
      });

      function chosenImage(item) {
        return item && (item.image || item.current_path || '/images/accueil/hero-accueil.jpg');
      }

      function applyToImage(img, item) {
        var next = chosenImage(item);
        var fallback = item.current_path || img.getAttribute('src') || '/images/accueil/hero-accueil.jpg';
        if (!next) return;
        img.addEventListener('error', function onError() {
          img.removeEventListener('error', onError);
          console.warn('[CMS images] Image introuvable, fallback utilisé :', next, '→', fallback);
          img.src = assetPath(fallback);
        });
        img.src = assetPath(next);
        if (item.alt) img.alt = item.alt;
      }

      document.querySelectorAll('img').forEach(function (img) {
        var item = null;
        var id = img.getAttribute('data-cms-image');
        if (id && byId[id]) item = byId[id];
        if (!item) item = byCurrentPath[normalizedAsset(img.getAttribute('src'))];
        if (item) applyToImage(img, item);
      });

      // Images de fond inline.
      document.querySelectorAll('[style*="url("]').forEach(function (el) {
        var bg = el.style.backgroundImage || '';
        Object.keys(byCurrentPath).forEach(function (oldPath) {
          if (bg.indexOf(oldPath) === -1 && bg.indexOf(oldPath.replace(/^\//, '')) === -1) return;
          var next = chosenImage(byCurrentPath[oldPath]);
          el.style.backgroundImage = bg.replace(oldPath, assetPath(next)).replace(oldPath.replace(/^\//, ''), assetPath(next));
        });
      });

      // Images dans les feuilles CSS du site. On ignore les feuilles externes.
      Array.prototype.forEach.call(document.styleSheets, function (sheet) {
        var rules;
        try { rules = sheet.cssRules; } catch (e) { return; }
        if (!rules) return;
        Array.prototype.forEach.call(rules, function (rule) {
          if (!rule.style || !rule.style.backgroundImage) return;
          var bg = rule.style.backgroundImage;
          Object.keys(byCurrentPath).forEach(function (oldPath) {
            var relativeOld = oldPath.replace(/^\//, '');
            if (bg.indexOf(oldPath) === -1 && bg.indexOf(relativeOld) === -1) return;
            var next = assetPath(chosenImage(byCurrentPath[oldPath]));
            rule.style.backgroundImage = bg.replace(oldPath, next).replace(relativeOld, next);
          });
        });
      });
    }).catch(function (error) {
      console.warn('[CMS images] Inventaire images non chargé, images HTML conservées.', error);
    });
  }

  function initCmsTestimonials() {
    var section = document.querySelector('[data-cms-testimonials]');
    if (!section) return Promise.resolve();
    return fetchJson('content/avis-clients.json').then(function (data) {
      var avis = (data.avis || []).filter(function (item) { return item.visible !== false; });
      if (!avis.length) return;
      section.querySelectorAll('.temoignage-card').forEach(function (card) { card.remove(); });
      avis.forEach(function (item) {
        var card = document.createElement('div');
        card.className = 'temoignage-card';
        var note = Math.max(1, Math.min(5, parseInt(item.note || 5, 10)));
        card.innerHTML =
          '<div class="temo-stars">' + '★★★★★'.slice(0, note) + '</div>' +
          '<div class="temo-text">"' + escapeHtml(item.texte) + '"</div>' +
          '<div class="temo-author">' +
            '<div class="temo-avatar">' + escapeHtml(item.initiales || '?') + '</div>' +
            '<div><div class="temo-name">' + escapeHtml(item.nom) + '</div>' +
            '<div class="temo-role">' + escapeHtml([item.profil, item.service].filter(Boolean).join(', ')) + '</div></div>' +
          '</div>';
        section.appendChild(card);
      });
    }).catch(function () {});
  }

  function renderArticleCard(article, featured) {
    var cls = featured ? 'article-featured' : 'article-card';
    var imgCls = featured ? 'article-featured-img' : 'article-card-img';
    var bodyCls = featured ? 'article-featured-body' : 'article-card-body';
    var meta = escapeHtml((article.lecture || '5 min') + ' de lecture · ' + (article.date || ''));
    var soon = featured ? '' : '<div class="article-soon">Article CMS</div>';
    var footer = featured
      ? '<div class="article-meta"><span>' + meta + '</span><span class="article-read">Lire l&rsquo;article →</span></div>'
      : '<div class="article-footer"><span class="article-date">' + escapeHtml((article.date || '') + ' · ' + (article.lecture || '')) + '</span><span class="read-link">Lire l&rsquo;article →</span></div>';
    return '<a href="' + escapeHtml(articleUrl(article)) + '" class="' + cls + '" data-cat="' + escapeHtml(article.categorie || 'actualités') + '" style="display:block;text-decoration:none;">' +
      '<img loading="lazy" decoding="async" src="' + escapeHtml(assetPath(article.image || 'images/blog/blog-article-metiers-industrie.png')) + '" alt="' + escapeHtml(article.alt || article.titre) + '" class="' + imgCls + '"/>' +
      '<div class="' + bodyCls + '">' +
      '<span class="article-cat">' + escapeHtml(article.categorie || 'Actualités') + '</span>' +
      (featured ? '<h2>' : '<h3>') + escapeHtml(article.titre) + (featured ? '</h2>' : '</h3>') +
      '<p>' + escapeHtml(article.resume) + '</p>' + soon + footer +
      '</div></a>';
  }

  function initCmsBlogList() {
    var featuredBox = document.querySelector('[data-cms-blog-featured]');
    var listBox = document.querySelector('[data-cms-blog-list]');
    if (!featuredBox || !listBox) return Promise.resolve();
    return fetchJson('content/blog/articles.json').then(function (data) {
      var articles = (data.articles || []).filter(function (item) { return item.visible !== false; });
      if (!articles.length) return;
      var featured = articles.filter(function (item) { return item.featured; })[0] || articles[0];
      featuredBox.outerHTML = renderArticleCard(featured, true);
      listBox.innerHTML = articles.filter(function (item) { return item !== featured; }).map(function (item) {
        return renderArticleCard(item, false);
      }).join('');
    }).catch(function () {});
  }

  function initCmsArticlePage() {
    var page = document.querySelector('[data-cms-article-page]');
    if (!page) return Promise.resolve();
    return fetchJson('content/blog/articles.json').then(function (data) {
      var params = new URLSearchParams(window.location.search);
      var slug = params.get('slug');
      var article = (data.articles || []).filter(function (item) {
        return item.visible !== false && item.slug === slug;
      })[0];
      if (!article) return;
      document.title = article.titre + ' | Parcours Industrie';
      page.querySelector('[data-cms-article-title]').textContent = article.titre;
      page.querySelector('[data-cms-article-category]').textContent = article.categorie || 'Article';
      page.querySelector('[data-cms-article-meta]').textContent = (article.date || '') + ' · ' + (article.lecture || '');
      page.querySelector('[data-cms-article-summary]').textContent = article.resume || '';
      var img = page.querySelector('[data-cms-article-image]');
      if (img && article.image) {
        img.src = assetPath(article.image);
        img.alt = article.alt || article.titre;
      }
      page.querySelector('[data-cms-article-body]').innerHTML = markdownToHtml(article.contenu || article.resume || '');
    }).catch(function () {});
  }

  function initCmsContent() {
    return Promise.all([
      initCmsImages(),
      initCmsTestimonials(),
      initCmsBlogList(),
      initCmsArticlePage()
    ]);
  }

  /* ── 1. BARRE DE PROGRESSION DE LECTURE ────────────────────────── */
  function initProgressBar() {
    var bar = document.querySelector('.pi-progress__bar');
    if (!bar) return;
    var ticking = false;

    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ── 2. NAVIGATION FLOUTÉE AU SCROLL ───────────────────────────── */
  function initNavScroll() {
    var nav = document.querySelector('.pi-nav');
    if (!nav) return;
    var ticking = false;

    function update() {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ── 3. MENU MOBILE ────────────────────────────────────────────── */
  function initMobileMenu() {
    var burger = document.querySelector('.pi-burger');
    var panel = document.querySelector('.pi-mobile');
    if (!burger || !panel) return;

    burger.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('pi-menu-open', open);
    });

    // Accordéons des rubriques à sous-pages
    panel.querySelectorAll('.pi-mobile__head[data-toggle]').forEach(function (head) {
      head.addEventListener('click', function () {
        var group = head.closest('.pi-mobile__group');
        var open = group.classList.toggle('is-open');
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    // Fermeture avec la touche Échap
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) burger.click();
    });
  }

  /* ── 4. RÉVÉLATION DES SECTIONS AU SCROLL ──────────────────────── */
  /* Les classes sont posées automatiquement par le script : aucune
     modification du HTML des pages n'est nécessaire pour animer une
     nouvelle page ou une nouvelle section.                           */
  /* Repère les conteneurs de type « grille » et les cartes quels que
     soient leurs noms de classe : toute classe se terminant par -grid
     est traitée comme une grille, toute classe se terminant par -card
     comme une carte. Une page ajoutée plus tard est donc animée sans
     aucune retouche du script.                                        */
  function tagGenericComponents() {
    document.querySelectorAll('[class]').forEach(function (el) {
      var tokens = el.className.split(/\s+/);
      for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i];
        if (t === 'grid' || t === 'cards' || /-grid$/.test(t)) el.classList.add('pi-grid');
        if (t === 'card' || /-card$/.test(t)) el.classList.add('pi-card');
      }
    });
  }

  function initReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    // Éléments animés un par un
    var soloSelectors = [
      '.section-tag', '.section-title', '.section-sub',
      '.profil-card', '.cta-section > *', '.form-card',
      '.intro-text', '.page-intro', '.encart', '.highlight-box',
      '.salaire-box', '.info-box', '.temo-text', '.pi-rule',
      '.legal-body section', '.etapes', '.art-body h2', '.art-body .encart',
      '.art-cta', '.article-tags'
    ];
    // Grilles : les enfants sont révélés en cascade
    var groupSelectors = [
      '.pi-grid', '.photo-strip', '.steps', '.faq-list',
      '.temoignages', '.debouche-tags', '.profil-items', '.contact-infos',
      '.pistes', '.merci-liens'
    ];

    var toObserve = [];
    var seen = new WeakSet();

    function mark(el, variant, delay) {
      if (!el || seen.has(el)) return;
      // On n'anime pas ce qui est déjà visible au chargement (hero)
      var top = el.getBoundingClientRect().top;
      if (top < window.innerHeight * 0.85) return;
      seen.add(el);
      el.classList.add('pi-reveal');
      if (variant) el.classList.add(variant);
      if (delay) el.setAttribute('data-delay', String(Math.min(delay, 5)));
      toObserve.push(el);
    }

    soloSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { mark(el); });
    });

    groupSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (grid) {
        Array.prototype.forEach.call(grid.children, function (child, i) {
          mark(child, null, i % 6);
        });
      });
    });

    // Titres de section : trait orange animé
    document.querySelectorAll('.section-title').forEach(function (t) {
      if (t.getBoundingClientRect().top >= window.innerHeight * 0.85) t.classList.add('pi-underline');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    toObserve.forEach(function (el) { io.observe(el); });
    document.querySelectorAll('.pi-underline').forEach(function (el) { io.observe(el); });
  }

  /* ── 5. COMPTEURS ANIMÉS ───────────────────────────────────────── */
  /* Anime tout élément .stat-num / .chiffre / [data-count] dont le
     texte contient un nombre. Les valeurs non numériques
     (« CAP→Ingé », « CPF ») sont laissées intactes.                  */
  function initCounters() {
    if (!('IntersectionObserver' in window)) return;

    var nodes = document.querySelectorAll('.stat-num, .chiffre, .info-bar-item .val, .stat-item .num, [data-count]');
    var targets = [];

    nodes.forEach(function (el) {
      // La valeur d'origine est mémorisée dans l'attribut data-count dès
      // le premier passage. Sans cela, le script relirait « 0 % » — le
      // texte qu'il vient lui-même d'écrire — et la vraie valeur serait
      // perdue à la moindre seconde exécution.
      if (!el.hasAttribute('data-count')) {
        el.setAttribute('data-count', el.textContent.trim());
      }
      var raw = el.getAttribute('data-count').trim();
      var m = raw.match(/^(\D*?)(\d[\d\s ]*)([.,](\d+))?(\D*)$/);
      if (!m) return;
      var intPart = m[2].replace(/[\s ]/g, '');
      if (intPart.length > 6) return;
      // Rien à animer en dessous de 2 : voir « 1 an minimum » se
      // transformer en « 0 an minimum » puis « 1 an minimum » ressemble
      // à un bug, pas à une animation. On laisse la valeur telle quelle.
      if (parseInt(intPart, 10) < 2) return;
      targets.push({
        el: el,
        prefix: m[1] || '',
        value: parseInt(intPart, 10),
        decimals: m[4] || '',
        suffix: m[5] || '',
        grouped: /[\s ]/.test(m[2])
      });
      el.classList.add('pi-count');
      if (!reduceMotion) el.textContent = m[1] + '0' + (m[4] ? ',' + m[4].replace(/\d/g, '0') : '') + (m[5] || '');
    });

    if (!targets.length) return;

    function run(t) {
      if (reduceMotion) { restore(t); return; }
      var dur = 1400, start = null;
      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(t.value * eased);
        var txt = t.grouped ? val.toLocaleString('fr-FR') : String(val);
        t.el.textContent = t.prefix + txt + (t.decimals ? ',' + t.decimals : '') + t.suffix;
        if (p < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }
    function restore(t) {
      var txt = t.grouped ? t.value.toLocaleString('fr-FR') : String(t.value);
      t.el.textContent = t.prefix + txt + (t.decimals ? ',' + t.decimals : '') + t.suffix;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var t = targets.filter(function (x) { return x.el === entry.target; })[0];
        if (t) run(t);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    targets.forEach(function (t) {
      // Si le chiffre se trouve DÉJÀ au-dessus de la zone visible — page
      // rouverte au milieu, lien vers une ancre, retour arrière du
      // navigateur — l'observateur ne se déclenchera jamais et la valeur
      // resterait bloquée à zéro. On affiche donc directement le résultat.
      if (t.el.getBoundingClientRect().bottom < 0) {
        restore(t);
        return;
      }
      io.observe(t.el);
    });
  }

  /* ── 6. PARALLAXE LÉGER SUR LES PHOTOS HERO ────────────────────── */
  function initParallax() {
    if (reduceMotion) return;

    // .page-hero-img est la photo de bandeau des fiches diplômes et des
    // pages de rubrique — elle était absente de cette liste, le parallaxe
    // ne s'appliquait donc qu'à la page d'accueil.
    var layers = document.querySelectorAll(
      '.hero-photo-wrap img, .page-hero-img, .page-hero-photo img, .article-hero-img, .pi-parallax'
    );
    if (!layers.length) return;

    // Le parallaxe est désactivé sous 760 px : sur mobile il est coûteux
    // et provoque des saccades sur iOS Safari. La condition est réévaluée
    // à chaque redimensionnement — sinon une simple rotation de téléphone
    // laisserait l'effet actif avec un décalage figé.
    var small = window.matchMedia('(max-width: 760px)');
    var ticking = false;

    function reset() {
      layers.forEach(function (el) { el.style.transform = ''; });
    }

    function update() {
      ticking = false;
      if (small.matches) return;
      var y = window.scrollY;
      layers.forEach(function (el) {
        if (y < window.innerHeight * 1.4) {
          el.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(1) + 'px,0) scale(1.06)';
        }
      });
    }

    window.addEventListener('scroll', function () {
      if (small.matches) return;
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });

    function onBreakpoint() {
      if (small.matches) reset();
      else update();
    }
    if (small.addEventListener) small.addEventListener('change', onBreakpoint);
    else small.addListener(onBreakpoint);          // anciens navigateurs
    window.addEventListener('orientationchange', onBreakpoint);

    onBreakpoint();
  }

  /* ── 7. BOUTON RETOUR EN HAUT ──────────────────────────────────── */
  function initToTop() {
    var btn = document.querySelector('.pi-totop');
    if (!btn) return;
    var ticking = false;

    function update() {
      btn.classList.toggle('is-visible', window.scrollY > 700);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    update();
  }

  /* ── 8. FORMULAIRE : PROGRESSION + VALIDATION ──────────────────── */
  function initForm() {
    var form = document.querySelector('.pi-form');
    if (!form) return;

    var bar = form.querySelector('.pi-form__progress span');
    var label = form.querySelector('.pi-form__progress-label');

    function requiredGroups() {
      var groups = [];
      var seenRadio = {};
      form.querySelectorAll('[required]').forEach(function (el) {
        if (el.type === 'radio') {
          if (seenRadio[el.name]) return;
          seenRadio[el.name] = true;
          groups.push({ type: 'radio', name: el.name });
        } else {
          groups.push({ type: 'field', el: el });
        }
      });
      return groups;
    }

    function filledCount(groups) {
      var n = 0;
      groups.forEach(function (g) {
        if (g.type === 'radio') {
          if (form.querySelector('input[name="' + g.name + '"]:checked')) n++;
        } else if (g.el.type === 'checkbox') {
          if (g.el.checked) n++;
        } else if (g.el.value.trim() !== '') n++;
      });
      return n;
    }

    function updateProgress() {
      var groups = requiredGroups();
      if (!groups.length) return;
      var pct = Math.round((filledCount(groups) / groups.length) * 100);
      if (bar) bar.style.width = pct + '%';
      if (label) {
        label.textContent = pct === 100
          ? 'Formulaire complet — vous pouvez envoyer'
          : pct + ' % complété';
      }
    }

    form.addEventListener('input', updateProgress);
    form.addEventListener('change', updateProgress);
    updateProgress();

    // Netlify Forms doit garder l'envoi HTML natif.
    // On bloque uniquement si les champs obligatoires sont invalides.
    form.addEventListener('submit', function (e) {
      form.classList.add('was-validated');
      if (!form.checkValidity()) {
        e.preventDefault();
        var first = form.querySelector(':invalid');
        if (first) {
          first.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
          first.focus({ preventScroll: true });
        }
        return;
      }
      var btn = form.querySelector('.submit-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours…'; }
    });
  }

  /* ── 9. FILTRES DU BLOG ────────────────────────────────────────── */
  /* Filtrage instantané par catégorie, sans rechargement.
     Une nouvelle carte d'article est filtrée automatiquement dès
     qu'elle porte un attribut data-cat.                              */
  function initBlogFilters() {
    var buttons = document.querySelectorAll('[data-filter]');
    if (!buttons.length) return;

    var cards = document.querySelectorAll('[data-cat]');
    var empty = document.querySelector('.blog-empty');

    function apply(key) {
      var shown = 0;
      cards.forEach(function (card) {
        var match = key === 'tous' || card.getAttribute('data-cat') === key;
        card.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0;

      buttons.forEach(function (b) {
        var on = b.getAttribute('data-filter') === key;
        b.classList.toggle('active', on);
        if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        apply(b.getAttribute('data-filter'));
        var grid = document.querySelector('.articles-grid');
        if (grid) {
          var top = grid.getBoundingClientRect().top + window.scrollY - 140;
          if (window.scrollY > top) window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      });
    });
  }

  /* ── 10. FAQ : ACCORDÉONS ACCESSIBLES ──────────────────────────── */
  function initFaq() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var question = item.querySelector('.faq-q');
      var answer = item.querySelector('.faq-a');
      if (!question || !answer || question.dataset.piFaqReady === 'true') return;

      question.dataset.piFaqReady = 'true';
      question.setAttribute('role', 'button');
      question.setAttribute('tabindex', '0');
      question.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');

      if (!answer.id) answer.id = 'faq-a-' + Math.random().toString(36).slice(2, 9);
      question.setAttribute('aria-controls', answer.id);

      function toggle() {
        var open = item.classList.toggle('open');
        question.setAttribute('aria-expanded', open ? 'true' : 'false');
      }

      question.addEventListener('click', toggle);
      question.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /* ── 11. ONGLETS SIMPLES ───────────────────────────────────────── */
  function initTabs() {
    document.querySelectorAll('[data-tab-target]').forEach(function (tab) {
      if (tab.dataset.piTabReady === 'true') return;
      tab.dataset.piTabReady = 'true';
      tab.setAttribute('type', 'button');
      tab.setAttribute('role', 'tab');

      var targetId = tab.getAttribute('data-tab-target');
      var panel = document.getElementById(targetId);
      if (!panel) return;
      tab.setAttribute('aria-controls', targetId);
      tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
      panel.setAttribute('role', 'tabpanel');

      tab.addEventListener('click', function () {
        var group = tab.closest('.process-tabs') || document;
        group.querySelectorAll('[data-tab-target]').forEach(function (other) {
          var otherPanel = document.getElementById(other.getAttribute('data-tab-target'));
          var active = other === tab;
          other.classList.toggle('active', active);
          other.setAttribute('aria-selected', active ? 'true' : 'false');
          if (otherPanel) otherPanel.classList.toggle('active', active);
        });
      });
    });
  }

  /* ── 12. DÉFILEMENT DOUX DES ANCRES ────────────────────────────── */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 74;
        window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ── DÉMARRAGE ─────────────────────────────────────────────────── */
  ready(function () {
    initCmsContent().then(function () {
      tagGenericComponents();
      initProgressBar();
      initNavScroll();
      initMobileMenu();
      initReveal();
      initCounters();
      initParallax();
      initToTop();
      initForm();
      initBlogFilters();
      initFaq();
      initTabs();
      initAnchors();
    });
  });
})();
