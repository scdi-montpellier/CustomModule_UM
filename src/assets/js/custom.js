/*	----------floating libchat-----------*/
(function() {
var chat = document.createElement('script');
chat.type = 'text/javascript';
chat.async = 'true';
chat.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'ubib.libanswers.com/load_chat.php?hash=f510ead3b82121573988017daae7c49f';
var s = document.getElementsByTagName('script')[0];
s.parentNode.insertBefore(chat, s);
})();
	/*---------------libchat code ends here---------------*/
	
// Primo injecte le DOM custom (header/footer) après le bootstrap Angular,
// donc on attend que les éléments apparaissent réellement dans la page.
function waitFor(selector, callback, {timeout = 15000} = {}) {
    const existing = document.querySelector(selector);
    if (existing) return callback(existing);

    const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
            observer.disconnect();
            callback(el);
        }
    });
    observer.observe(document.documentElement, {childList: true, subtree: true});

    if (timeout) {
        setTimeout(() => observer.disconnect(), timeout);
    }
}

/* ----------------------------------------------------------
                          ZoteroBib 
  ---------------------------------------------------------- */

  (function () {

  // URL du PNX de la fiche dont le menu est ouvert
  let currentPnxUrl = null;

  // ① Capturer quel record déclenche le menu export (fonctionne en liste et en fulldisplay)
  document.addEventListener('click', function (e) {
    const exportBtn = e.target.closest(
      'button[aria-haspopup="menu"][aria-label*="export"]'
    );
    if (!exportBtn) return;

    // Chercher le span urlToXmlPnx dans le conteneur le plus proche
    // Cela fonctionne aussi bien en liste (nde-search-result-item-container) qu'en fulldisplay
    let container = exportBtn.closest('nde-search-result-item-container') 
                    || exportBtn.closest('nde-full-display-container')
                    || exportBtn.closest('[data-qa*="result"]');
    
    if (!container) {
      // Fallback : chercher le span directement en priorité urlToXmlPnxSingleRecord (fulldisplay)
      let pnxSpan = document.querySelector('.urlToXmlPnxSingleRecord[data-url]');
      if (!pnxSpan) pnxSpan = document.querySelector('.urlToXmlPnx[data-url]');
      currentPnxUrl = pnxSpan ? pnxSpan.getAttribute('data-url') : null;
      return;
    }

    // Dans le conteneur, chercher en priorité urlToXmlPnxSingleRecord (fulldisplay)
    let pnxSpan = container.querySelector('.urlToXmlPnxSingleRecord');
    if (!pnxSpan) pnxSpan = container.querySelector('.urlToXmlPnx');
    currentPnxUrl = pnxSpan ? pnxSpan.getAttribute('data-url') : null;
  }, true); // capture phase pour précéder Angular

  // ② Observer l'apparition du bouton EasyBib dans le CDK overlay
  // Observe document.documentElement pour capturer les overlays en dehors de nde-app-root
  const menuObserver = new MutationObserver(function () {
    // Sélecteurs multiples pour plus de flexibilité
    const easybibBtn = document.querySelector(
      'button mat-icon[data-mat-icon-name="EasyBib"]'
    )?.closest('button')
    || document.querySelector(
      '[role="menuitem"] mat-icon[data-mat-icon-name="EasyBib"]'
    )?.closest('[role="menuitem"]')
    || document.querySelector(
      'button[aria-label*="EasyBib"]'
    );

    if (easybibBtn && !easybibBtn.dataset.zoteroBibBound) {
      easybibBtn.dataset.zoteroBibBound = '1';

      easybibBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (currentPnxUrl) {
          handleZoteroBibClick(currentPnxUrl);
        }
      }, true);

      // Renommer l'entrée du menu
      let label = easybibBtn.querySelector('.mat-mdc-menu-item-text span');
      if (!label) label = easybibBtn.querySelector('mat-icon')?.parentElement;
      if (label && !label.textContent.includes('ZoteroBib')) {
        const textNode = Array.from(label.childNodes).find(n => n.nodeType === 3);
        if (textNode) textNode.textContent = 'ZoteroBib';
        else if (!label.querySelector('span')) label.textContent = 'ZoteroBib';
      }
    }
  });

  // Observer document.documentElement au lieu de document.body
  // pour capturer les CDK overlays qui peuvent être placés en dehors de nde-app-root
  menuObserver.observe(document.documentElement, { childList: true, subtree: true });

  // ③ Fetch PNX → construire URL ZoteroBib → ouvrir
  async function handleZoteroBibClick(pnxUrl) {
    try {
      const response = await fetch(pnxUrl);
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, 'application/xml');

      const q = buildZoterobibQuery(xml);
      if (q) {
        window.open('https://zbib.org/import?q=' + encodeURIComponent(q), '_blank');
      }
    } catch (err) {
      console.error('[ZoteroBib] Erreur fetch PNX', err);
    }
  }

  function getXmlVal(xml, tag) {
    const el = xml.querySelector(tag);
    return el ? el.textContent.trim() : '';
  }

  function buildZoterobibQuery(xml) {
    // Priorité : DOI > ISBN > ISSN+titre > titre+auteur
    const doi  = getXmlVal(xml, 'addata > doi');
    if (doi && doi.startsWith('10.') && doi.includes('/')) return doi;

    const isbn = getXmlVal(xml, 'addata > isbn');
    if (isbn) return isbn.replace(/[^0-9X]/gi, '');

    const title  = getXmlVal(xml, 'display > title');
    const issn   = getXmlVal(xml, 'addata > issn');
    if (issn && title) return title;

    const author = getXmlVal(xml, 'display > creator');
    if (author && title) return title;

    const btitle = getXmlVal(xml, 'addata > btitle');
    return btitle || title || null;
  }
 
})();

// NAVBAR
waitFor('.js-navbar', function (navbar) {
    const toggleLockBody = () => {
        const body = document.body;
        body.style.overflow = body.style.overflow === "hidden" ? '' : 'hidden';
    };

    const menuToggle = document.body.querySelector('.js-menu-toggle');
    const switcherLanguages = document.body.querySelector('.js-switcher');
    const accountToggle = document.body.querySelector('.js-account-toggle');
    const account = document.body.querySelector('.js-account');

    // 1. DÉLÉGATION D'ÉVÉNEMENTS (Robuste face aux rafraîchissements de Primo)
    document.addEventListener("click", (e) => {
        // A. Clic sur le bouton principal d'un sous-menu
        const topButton = e.target.closest('.item__top');
        
        if (topButton) {
            // Empêche des comportements inattendus lors du clic
            e.preventDefault(); 
            
            const parentItem = topButton.closest('.navbar__item');
            if (!parentItem) return;

            const subMenu = parentItem.querySelector('.item__sub-menu');
            if (subMenu) {
                const isActive = subMenu.classList.contains('active');

                // Fermer d'abord tous les autres sous-menus
                document.querySelectorAll('.item__sub-menu').forEach((el) => {
                    el.classList.remove('active');
                });

                // Ouvrir celui cliqué s'il était fermé
                if (!isActive) {
                    subMenu.classList.add('active');
                }
            }
        }

        // B. Clic sur l'overlay pour tout fermer
        if (e.target.closest(".header__overlay")) {
            document.querySelectorAll('.item__sub-menu').forEach((el) => {
                el.classList.remove('active');
            });
        }
    });

    // 2. GESTION DES AUTRES BOUTONS (Sans bloquer le script s'ils sont absents)
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            navbar.classList.toggle('active');
            menuToggle.classList.toggle('active');
            menuToggle.querySelector('span.material-symbols-outlined').textContent =
                menuToggle.classList.contains('active') ? 'close' : 'menu';
            toggleLockBody();
        });
    }

    if (switcherLanguages) {
        switcherLanguages.querySelectorAll('.material-symbols-outlined, label.weglot-language').forEach((el) => {
            el.addEventListener('click', () => {
                switcherLanguages.querySelector('ul').classList.toggle("active");
            });
        });
    }

    if (accountToggle && account) {
        accountToggle.addEventListener('click', function () {
            account.classList.toggle('active');
        });
    }
});

// PARALLAX
waitFor('.cta-block .js-parallax', function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const items = document.querySelectorAll('.cta-block .js-parallax');
    const speed = 0.50;
    const visible = new Set();
    let ticking = false;

    const update = function () {
        ticking = false;
        const vh = window.innerHeight;
        visible.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const progress =
                (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
            const offset = (-progress * el.offsetHeight * speed).toFixed(1);
            el.style.setProperty('--parallax', `${offset}px`);
        });
    };

    const onScroll = function () {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                visible.add(entry.target);
            } else {
                visible.delete(entry.target);
            }
        });
        onScroll();
    });

    items.forEach((el) => io.observe(el));

    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll);
    update();
});

waitFor('.js-search', function () {
    const menuSearch = document.querySelector('.js-menu-search');
    const partSearch = document.querySelector('.js-search');

    if (menuSearch && partSearch) {
        menuSearch.addEventListener('click', function () {
            partSearch.classList.add('show');
        })

        const close = partSearch.querySelector('.part-search__close')
        close.addEventListener('click', function () {
            partSearch.classList.remove('show')
        })
    }
})
