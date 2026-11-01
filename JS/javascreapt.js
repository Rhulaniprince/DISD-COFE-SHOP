document.addEventListener('DOMContentLoaded', function () {
    highlightCurrentPage();
    initScrollReveal();
    initBackToTop();
    initMenuTabs();
    initOpenBadge();
    initLightbox(); 
    initAccordion(); 
    initContactForm();
    initMap();       
});

/* Mark the current page in the nav */
function highlightCurrentPage() {
    var current = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
    document.querySelectorAll('.navigations a').forEach(function (link) {
        if (link.getAttribute('href').toLowerCase() === current) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

/* Fade sections in as they scroll into view */
function initScrollReveal() {
    var targets = document.querySelectorAll('.home-intro, .heading, .parent > div');
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    targets.forEach(function (el, i) {
        el.classList.add('reveal');
        el.style.transitionDelay = (i % 4) * 80 + 'ms';
        observer.observe(el);
    });
}

/* Back-to-top button */
function initBackToTop() {
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '&uarr;';
    document.body.appendChild(btn);

    window.addEventListener('scroll', function () {
        btn.classList.toggle('show', window.scrollY > 400);
    });
    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
/* Tabs: build a tab bar from the menu headings */
function initMenuTabs() {
    var section = document.querySelector('.menu-section');
    if (!section) return;

    var headings = section.querySelectorAll('.menu-category');
    if (!headings.length) return;

    var tabBar = document.createElement('div');
    tabBar.className = 'menu-tabs';
    tabBar.setAttribute('role', 'tablist');

    var panels = [];
    var tabs = [];

    headings.forEach(function (heading, index) {
        var grid = heading.nextElementSibling;
        var panel = document.createElement('div');
        panel.className = 'menu-panel';
        panel.setAttribute('role', 'tabpanel');
        panel.id = 'menu-panel-' + index;

        // move the heading and its grid into a panel
        heading.parentNode.insertBefore(panel, heading);
        panel.appendChild(heading);
        panel.appendChild(grid);
        panel.hidden = index !== 0;
        panels.push(panel);

        var tab = document.createElement('button');
        tab.className = 'menu-tab' + (index === 0 ? ' active' : '');
        tab.type = 'button';
        tab.textContent = heading.textContent;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', panel.id);
        tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        tabBar.appendChild(tab);
        tabs.push(tab);

        tab.addEventListener('click', function () {
            tabs.forEach(function (t, i) {
                var active = i === index;
                t.classList.toggle('active', active);
                t.setAttribute('aria-selected', active ? 'true' : 'false');
                panels[i].hidden = !active;
            });
        });
    });

    panels[0].parentNode.insertBefore(tabBar, panels[0]);
}

/* Badge: "We are open now" / "closed" based on your hours */
function initOpenBadge() {
    var info = document.querySelector('.menu-info');
    if (!info) return;

    // [open hour, close hour] by weekday (0 = Sunday)
    var hours = {
        0: null,
        1: [7.5, 18], 2: [7.5, 18], 3: [7.5, 18], 4: [7.5, 18], 5: [7.5, 18],
        6: [8, 17]
    };

    // always use South African time
    var now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' }));
    var today = hours[now.getDay()];
    var current = now.getHours() + now.getMinutes() / 60;
    var isOpen = today && current >= today[0] && current < today[1];

    var badge = document.createElement('div');
    badge.className = 'open-badge ' + (isOpen ? 'open' : 'closed');
    badge.textContent = isOpen ? 'We are open now' : 'We are closed right now';
    info.parentNode.insertBefore(badge, info);   // sits above the address and hours
}
/* Gallery lightbox: click an image to view it larger */
function initLightbox() {
    var images = Array.prototype.slice.call(document.querySelectorAll('.gallery-item img'));
    if (!images.length) return;   // do nothing on pages without a gallery

    var current = 0;

    // build the lightbox once and add it to the page
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML =
        '<button class="lightbox-close" aria-label="Close">&times;</button>' +
        '<button class="lightbox-prev" aria-label="Previous image">&#8249;</button>' +
        '<img class="lightbox-img" alt="">' +
        '<button class="lightbox-next" aria-label="Next image">&#8250;</button>' +
        '<div class="lightbox-caption"></div>';
    document.body.appendChild(box);

    var bigImg = box.querySelector('.lightbox-img');
    var caption = box.querySelector('.lightbox-caption');

    // show image number "index" (wraps around at both ends)
    function show(index) {
        current = (index + images.length) % images.length;
        bigImg.src = images[current].src;
        bigImg.alt = images[current].alt;
        caption.textContent = images[current].alt + '  (' + (current + 1) + ' / ' + images.length + ')';
    }
    function open(index) {
        show(index);
        box.classList.add('show');
        document.body.style.overflow = 'hidden';   // stop the page scrolling behind it
    }
    function close() {
        box.classList.remove('show');
        document.body.style.overflow = '';
    }

    // clicking a gallery image opens it
    images.forEach(function (img, i) {
        img.addEventListener('click', function () { open(i); });
    });

    // buttons and clicking the dark background
    box.querySelector('.lightbox-close').addEventListener('click', close);
    box.querySelector('.lightbox-prev').addEventListener('click', function () { show(current - 1); });
    box.querySelector('.lightbox-next').addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });

    // keyboard: Esc closes, arrows move between images
    document.addEventListener('keydown', function (e) {
        if (!box.classList.contains('show')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(current - 1);
        if (e.key === 'ArrowRight') show(current + 1);
    });
}
/* Accordion: click a question to open its answer */
function initAccordion() {
    var items = document.querySelectorAll('.accordion-item');
    if (!items.length) return;   // do nothing on pages without an accordion

    items.forEach(function (item) {
        var header = item.querySelector('.accordion-header');
        var panel = item.querySelector('.accordion-panel');

        header.addEventListener('click', function () {
            var isOpen = item.classList.contains('open');

            // close every item first, so only one is open at a time
            items.forEach(function (other) {
                other.classList.remove('open');
                other.querySelector('.accordion-panel').style.maxHeight = null;
                other.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
            });

            // then open the clicked one (unless it was already open, which closes it)
            if (!isOpen) {
                item.classList.add('open');
                panel.style.maxHeight = panel.scrollHeight + 'px';
                header.setAttribute('aria-expanded', 'true');
            }
        });
    });
}
/* Thank-you popup, called by the contact form after a valid submit */
function showModal(title, message) {
    var overlay = document.getElementById('site-modal');

    // build it once, the first time it's needed
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'site-modal';
        overlay.className = 'modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.innerHTML =
            '<div class="modal">' +
                '<button class="modal-close" aria-label="Close">&times;</button>' +
                '<h2></h2><p></p>' +
                '<button class="modal-ok">OK</button>' +
            '</div>';
        document.body.appendChild(overlay);

        var close = function () { overlay.classList.remove('show'); };
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) close();
        });
        overlay.querySelector('.modal-close').addEventListener('click', close);
        overlay.querySelector('.modal-ok').addEventListener('click', close);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });
    }

    overlay.querySelector('h2').textContent = title;
    overlay.querySelector('p').textContent = message;
    overlay.classList.add('show');
    overlay.querySelector('.modal-ok').focus();
}

/* Contact form: validation, character counter and thank-you popup */
function initContactForm() {
    var form = document.querySelector('.contact-form');
    if (!form) return;

    var nameField = form.querySelector('[name="name"]');
    var emailField = form.querySelector('[name="email"]');
    var phoneField = form.querySelector('[name="phone"]');
    var commentField = form.querySelector('[name="comment"]');
    var MAX = 500;

    form.setAttribute('novalidate', '');   // use our messages, not the browser's
    commentField.setAttribute('maxlength', MAX);

    // live character counter under the comment box
    var counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.textContent = '0 / ' + MAX;
    commentField.insertAdjacentElement('afterend', counter);
    commentField.addEventListener('input', function () {
        counter.textContent = commentField.value.length + ' / ' + MAX;
        counter.classList.toggle('warn', commentField.value.length > MAX - 50);
    });

    function setError(field, message) {
        clearError(field);
        field.classList.add('field-error');
        var msg = document.createElement('div');
        msg.className = 'error-msg';
        msg.textContent = message;
        // name and email sit side by side, so put their message under the row
        var anchor = field.parentElement.classList.contains('form-row') ? field.parentElement : field;
        anchor.insertAdjacentElement('afterend', msg);
        field._errorEl = msg;
    }
    function clearError(field) {
        field.classList.remove('field-error');
        if (field._errorEl) {
            field._errorEl.remove();
            field._errorEl = null;
        }
    }

    // remove a field's error as soon as the person starts fixing it
    [nameField, emailField, phoneField, commentField].forEach(function (f) {
        f.addEventListener('input', function () { clearError(f); });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();   // stop the page reloading
        var valid = true;

        if (nameField.value.trim().length < 2) {
            setError(nameField, 'Please enter your name.');
            valid = false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
            setError(emailField, 'Please enter a valid email address.');
            valid = false;
        }
        // phone is optional, but if filled in it must look like a phone number
        var phone = phoneField.value.trim();
        if (phone && !/^[+()\d\s-]{7,15}$/.test(phone)) {
            setError(phoneField, 'Please enter a valid phone number.');
            valid = false;
        }
        if (commentField.value.trim().length < 5) {
            setError(commentField, 'Please tell us a little more (at least 5 characters).');
            valid = false;
        }

        if (!valid) return;

        var first = nameField.value.trim().split(' ')[0];
        showModal('Thank you, ' + first + '!', 'Your message has been received. We will get back to you soon.');
        form.reset();
        counter.textContent = '0 / ' + MAX;
    });
}

/* Interactive map (Leaflet + OpenStreetMap) */
function initMap() {
    var mapEl = document.getElementById('map');
    if (!mapEl) return;

    // Leaflet didn't load (offline, or the script tag is missing)
    if (typeof L === 'undefined') {
        mapEl.textContent = 'The map could not be loaded. Please check your internet connection.';
        return;
    }

    var cafe = [-26.1935, 28.0335];   // 70 Juta St, Braamfontein (approximate)

    var map = L.map('map', { scrollWheelZoom: false }).setView(cafe, 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker(cafe).addTo(map)
        .bindPopup('<strong>Skinner Caf&eacute;</strong><br>70 Juta St, Braamfontein<br>Mon&ndash;Fri 7:30AM&ndash;6PM<br>Sat 8AM&ndash;5PM')
        .openPopup();

    // only zoom with the scroll wheel after clicking the map, so scrolling the page still works
    map.on('click', function () { map.scrollWheelZoom.enable(); });
    map.on('mouseout', function () { map.scrollWheelZoom.disable(); });
}