document.addEventListener('DOMContentLoaded', function () {
    highlightCurrentPage();
    initNavToggle();
    initScrollReveal();
    initBackToTop();
    initMenu();
    initOpenBadge();
    initLightbox(); 
    initAccordion(); 
    initContactForm();
           
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
/* Accordion*/
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

    form.setAttribute('novalidate', '');  
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


/* ---------- Menu data ---------- */
var MENU_DATA = [
    { category: 'coffee', name: 'Cappuccino', price: 30, description: '' },
    { category: 'coffee', name: 'Caffe Latte', price: 30, description: '' },
    { category: 'coffee', name: 'Flat White', price: 35, description: '' },
    { category: 'coffee', name: 'Cortado', price: 25, description: '' },
    { category: 'coffee', name: 'Caffe Mocha', price: 45, description: '' },
    { category: 'coffee', name: 'Americano', price: 25, description: '' },
    { category: 'coffee', name: 'Espresso', price: 25, description: '' },
    { category: 'coffee', name: 'Hot Chocolate', price: 40, description: '' },
    { category: 'coffee', name: 'Chai Latte', price: 30, description: '' },
    { category: 'coffee', name: 'Spanish Latte', price: 60, description: 'Espresso, coconut & condensed milk' },

    { category: 'iced lattes', name: 'Iced Coffee', price: 35, description: 'Long coffee with ice' },
    { category: 'iced lattes', name: 'Iced Caffe Latte', price: 40, description: 'Espresso & cold milk' },
    { category: 'iced lattes', name: 'Iced Caffe Mocha', price: 40, description: 'Espresso, chocolate & cream' },
    { category: 'iced lattes', name: 'Frosted Caramel Latte', price: 45, description: 'Espresso, caramel & cream' },

    { category: 'freezos', name: 'Coffee Freezo', price: 65, description: '' },
    { category: 'freezos', name: 'Salted Caramel Freezo', price: 65, description: 'Espresso, salted caramel & milk' },
    { category: 'freezos', name: "S'mores Freezo", price: 70, description: 'Espresso, toasted marshmallow & milk' },
    { category: 'freezos', name: 'Skinner Freezo', price: 65, description: 'Peach, cream & vanilla' },

    { category: 'tea', name: 'Rooibos/Earl Grey', price: 30, description: '' },
    { category: 'tea', name: 'Green/Chai/Peppermint', price: 35, description: '' },

    { category: 'soft drinks', name: 'Mountain Falls Still 500ml', price: 35, description: '' },
    { category: 'soft drinks', name: 'Mountain Falls Sparkling 1l', price: 65, description: '' },
    { category: 'soft drinks', name: 'San Pellegrino Sodas', price: 55, description: '' },
    { category: 'soft drinks', name: 'Sir Fruit Fresh Juices', price: 50, description: '' },
    { category: 'soft drinks', name: 'Boosters', price: 45, description: '' },

    { category: 'breakfast', name: 'Yoghurt & Muesli', price: 65, description: 'Creamy yoghurt, crunchy muesli & fresh berries' },
    { category: 'breakfast', name: 'Toasted Cheese Bagel', price: 65, description: 'Toasted bagel, melted mozzarella & cheddar cheese' },
    { category: 'breakfast', name: 'Ham & Cheese Croissant', price: 70, description: 'Flaky croissant, savoury ham & melted cheese' }
];

/* ---------- Menu: builds the page from MENU_DATA, with search, sort and category filter ---------- */
function initMenu() {
    var results = document.getElementById('menu-results');
    if (!results) return;   // do nothing on other pages

    var searchBox = document.getElementById('menu-search');
    var sortBox = document.getElementById('menu-sort');
    var countEl = document.getElementById('menu-count');
    var tabBar = document.getElementById('menu-tabs');
    var activeCategory = 'all';

    // work out the category list from the data (keeps the order above)
    var categories = [];
    MENU_DATA.forEach(function (item) {
        if (categories.indexOf(item.category) === -1) categories.push(item.category);
    });

    // category buttons: "all" plus one per category
    ['all'].concat(categories).forEach(function (cat) {
        var tab = document.createElement('button');
        tab.type = 'button';
        tab.className = 'menu-tab' + (cat === 'all' ? ' active' : '');
        tab.textContent = cat;
        tab.addEventListener('click', function () {
            activeCategory = cat;
            tabBar.querySelectorAll('.menu-tab').forEach(function (t) {
                t.classList.toggle('active', t === tab);
            });
            render();
        });
        tabBar.appendChild(tab);
    });

    function render() {
        var query = searchBox.value.trim().toLowerCase();
        var sort = sortBox.value;

        // 1. FILTER by category and search text (matches name, description or category)
        var items = MENU_DATA.filter(function (item) {
            var inCategory = activeCategory === 'all' || item.category === activeCategory;
            var text = (item.name + ' ' + item.description + ' ' + item.category).toLowerCase();
            return inCategory && text.indexOf(query) !== -1;
        });

        // 2. SORT (filter() made a copy, so MENU_DATA itself is never reordered)
        if (sort === 'price-asc') items.sort(function (a, b) { return a.price - b.price; });
        else if (sort === 'price-desc') items.sort(function (a, b) { return b.price - a.price; });
        else if (sort === 'name') items.sort(function (a, b) { return a.name.localeCompare(b.name); });

        // 3. GROUP: by category normally, or one flat list when sorting across "all"
        var groups = [];
        if (sort !== 'default' && activeCategory === 'all') {
            if (items.length) groups.push({ title: 'all items', items: items });
        } else {
            categories.forEach(function (cat) {
                var inCat = items.filter(function (i) { return i.category === cat; });
                if (inCat.length) groups.push({ title: cat, items: inCat });
            });
        }

        // 4. BUILD the HTML
        results.innerHTML = '';
        groups.forEach(function (group) {
            var heading = document.createElement('h2');
            heading.className = 'menu-category';
            heading.textContent = group.title;

            var grid = document.createElement('div');
            grid.className = 'menu-grid';

            group.items.forEach(function (item) {
                var card = document.createElement('div');
                card.className = 'menu-item';

                var h3 = document.createElement('h3');
                h3.appendChild(document.createTextNode(item.name + ' '));
                var price = document.createElement('span');
                price.textContent = 'R' + item.price.toFixed(2);
                h3.appendChild(price);
                card.appendChild(h3);

                if (item.description) {
                    var p = document.createElement('p');
                    p.textContent = item.description;
                    card.appendChild(p);
                }
                grid.appendChild(card);
            });

            results.appendChild(heading);
            results.appendChild(grid);
        });

        if (!items.length) {
            var empty = document.createElement('p');
            empty.className = 'menu-empty';
            empty.textContent = 'Nothing on the menu matches "' + searchBox.value.trim() + '". Try a different word.';
            results.appendChild(empty);
        }

        countEl.textContent = items.length + (items.length === 1 ? ' item' : ' items');

        // replay the fade-in each time the list changes
        results.style.animation = 'none';
        void results.offsetWidth;
        results.style.animation = '';
    }

    searchBox.addEventListener('input', render);    // updates as you type
    sortBox.addEventListener('change', render);

    render();   // first draw
}

function initNavToggle() {
    var nav = document.querySelector('nav');
    var menu = nav && nav.querySelector('.navigations');
    if (!menu) return;

    menu.id = 'site-menu';

    var btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle navigation menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'site-menu');
    btn.innerHTML = '<span></span><span></span><span></span>';
    nav.insertBefore(btn, menu);   // sits between the logo and the links

    function setOpen(open) {
        nav.classList.toggle('nav-open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', function () {
        setOpen(!nav.classList.contains('nav-open'));
    });

    // tapping anywhere else, or pressing Esc, closes it
    document.addEventListener('click', function (e) {
        if (!nav.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setOpen(false);
    });

    // reset when the window grows back to desktop size
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) setOpen(false);
    });
}