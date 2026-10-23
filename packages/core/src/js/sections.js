/**
 * Pure Admin — Sections (EXPERIMENTAL)
 *
 * Drives `.pa-sections[data-pa-sections]`: one long piece of content split into
 * `.pa-sections__section` elements, plus a `.pa-sections__nav` holding a
 * `pa-steps` list whose items point at the sections (`data-section="<id>"`).
 * The nav markup is authored (wrappers render it server-side); this module only
 * manages state:
 *
 *   current step   the last section whose top has passed the reading line (a third
 *                  of the visible scroll area); at the end of the scroll, the last one.
 *                  Wizard mode: the active page.
 *   step state     data-validate → from the section's own fields:
 *                    untouched | warning (started, incomplete) | danger (invalid) | success
 *                  otherwise read tracking: done once its bottom passed the reading line
 *   click a step   smooth-scroll to its section (scroll-spy paused until it settles);
 *                  a section too close to the end gets temporary end space so it can
 *                  reach the nav — removed again once it is scrolled out of sight.
 *                  Wizard mode: switch page (data-validate: Next only past a valid page).
 *
 * Block attributes:
 *   data-pa-sections               auto-init marker
 *   data-validate                  colour steps by the validity of their fields
 *   data-update-hash               write #section-id to the URL on a step click
 *   data-text-next / -finish       wizard button texts (default "Next" / "Finish")
 *   data-text-complete / -incomplete / -invalid / -read
 *                                  screen-reader state texts (English defaults)
 * Classes it sets:
 *   .pa-sections-host              on the app shell's .pc-layout__content while a block is on the
 *                                  page, so position:sticky works inside it (see _sections.scss)
 *   .pa-sections--in-view          the block is on screen (the overlay nav shows only then)
 *   .pa-sections__section--active  the current section (wizard shows only that one)
 *   .pa-steps__item--current/--done/--success/--warning/--danger + aria-current="step"
 * CSS custom properties it sets on the block:
 *   --pa-sections-nav-height       measured nav height (bar layouts clear it on a jump)
 *   --pa-sections-end-space        temporary end space for a jump near the end
 * Events (on the block, bubbling):
 *   pa-sections:change   detail = { current: sectionId, index, states: [...] } — only when something changed
 *
 * API: window.pureAdmin.components.sections = { init(scope), get(el) }
 *      get(el) → { go(index), refresh(), destroy() }
 */
(function () {
    'use strict';

    var ROLES = { done: 'done', success: 'success', warning: 'warning', danger: 'danger' };
    var ICONS = { done: 'check', success: 'check', warning: 'warning', danger: 'x' };
    var READING_LINE = 1 / 3;   // fraction of the visible scroll area
    var SETTLE_MS = 150;        // scroll idle time that ends a jump
    var BOTTOM_SLACK = 4;       // px: "at the end of the scroll"

    function reducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // The element that actually scrolls the block: the nearest ancestor with a real
    // overflow scroll, else the document. (An `overflow: auto` box whose content fits
    // is not a scroller.)
    function findScroller(el) {
        for (var p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            var oy = getComputedStyle(p).overflowY;
            if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight + 1) return p;
        }
        return null;   // the document
    }

    // Mark the app shell's content wrapper while at least one block lives in it (ref-counted).
    var HOST_CLASS = 'pa-sections-host';
    function claimHost(root) {
        var host = root.closest('.pc-layout__content');
        if (!host) return null;
        host._paSectionsCount = (host._paSectionsCount || 0) + 1;
        host.classList.add(HOST_CLASS);
        return host;
    }
    function releaseHost(host) {
        if (!host) return;
        host._paSectionsCount = Math.max(0, (host._paSectionsCount || 1) - 1);
        if (!host._paSectionsCount) host.classList.remove(HOST_CLASS);
    }

    function create(root) {
        var items = Array.prototype.slice.call(root.querySelectorAll('.pa-sections__nav .pa-steps__item[data-section]'));
        var sections = items.map(function (li) { return document.getElementById(li.dataset.section); });
        if (!items.length || sections.some(function (s) { return !s; })) return null;

        var nav = root.querySelector('.pa-sections__nav');
        var host = claimHost(root);   // before measuring: it changes which element scrolls
        var text = function (name, fallback) { return root.getAttribute('data-text-' + name) || fallback; };
        var touched = new WeakSet();
        var read = [];
        var current = 0;
        var jumping = false, settleTimer = null;
        var endSpace = 0;
        var lastSignature = '';
        var scroller = null;

        var isWizard = function () { return root.classList.contains('pa-sections--wizard'); };
        var validate = function () { return root.hasAttribute('data-validate'); };

        // ---- geometry -------------------------------------------------------------
        function viewport() {
            if (scroller) {
                var r = scroller.getBoundingClientRect();
                return { top: r.top, height: scroller.clientHeight };
            }
            return { top: 0, height: window.innerHeight };
        }
        function scrollEl() { return scroller || document.scrollingElement; }
        function atEnd() {
            var el = scrollEl();
            return el.scrollTop + el.clientHeight >= el.scrollHeight - BOTTOM_SLACK;
        }
        function measureNav() {
            root.style.setProperty('--pa-sections-nav-height', nav.offsetHeight + 'px');
        }

        // ---- state ------------------------------------------------------------------
        function fieldsOf(section) { return section.querySelectorAll('input, select, textarea'); }
        function stateOf(i) {
            if (!validate()) return read[i] ? 'done' : '';
            var fields = fieldsOf(sections[i]);
            var any = false, invalid = false, complete = true;
            Array.prototype.forEach.call(fields, function (f) {
                var t = touched.has(f);
                if (t) any = true;
                if (t && f.value !== '' && f.type !== 'checkbox' && f.type !== 'radio' && !f.checkValidity()) invalid = true;
                if (f.required) {
                    var ok = (f.type === 'checkbox' || f.type === 'radio') ? f.checked : (f.value !== '' && f.checkValidity());
                    if (!ok) complete = false;
                }
            });
            if (invalid) return 'danger';
            if (!any) return '';
            return complete ? 'success' : 'warning';
        }
        function stateText(st) {
            return st === 'success' ? text('complete', 'complete')
                : st === 'warning' ? text('incomplete', 'incomplete')
                : st === 'danger' ? text('invalid', 'invalid')
                : st === 'done' ? text('read', 'read') : '';
        }

        // ---- render: touch the DOM only where something changed ----------------------
        var rendered = [];   // per item: { state, current }
        function render() {
            var states = items.map(function (li, i) { return stateOf(i); });
            items.forEach(function (li, i) {
                var st = states[i], cur = i === current;
                var prev = rendered[i];
                if (prev && prev.state === st && prev.current === cur) return;
                rendered[i] = { state: st, current: cur };

                Object.keys(ROLES).forEach(function (r) { li.classList.toggle('pa-steps__item--' + r, st === r); });
                li.classList.toggle('pa-steps__item--current', cur);
                if (cur) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');

                var marker = li.querySelector('.pa-steps__marker');
                if (marker) {
                    if (ICONS[st]) marker.innerHTML = '<span class="pa-icon pa-icon--' + ICONS[st] + '" aria-hidden="true"></span>';
                    else marker.textContent = String(i + 1);
                }
                var sr = li.querySelector('.pa-steps__state');
                if (!sr) {
                    sr = document.createElement('span');
                    sr.className = 'pa-steps__state';
                    (li.querySelector('.pa-steps__content') || li).appendChild(sr);
                }
                sr.textContent = stateText(st) ? ' — ' + stateText(st) : '';
            });
            sections.forEach(function (s, i) { s.classList.toggle('pa-sections__section--active', i === current); });

            var prevBtn = root.querySelector('[data-sections-prev]');
            var nextBtn = root.querySelector('[data-sections-next]');
            if (prevBtn) prevBtn.disabled = current === 0;
            if (nextBtn) nextBtn.textContent = current === sections.length - 1 ? text('finish', 'Finish') : text('next', 'Next');

            var signature = current + '|' + states.join(',');
            if (signature !== lastSignature) {
                lastSignature = signature;
                root.dispatchEvent(new CustomEvent('pa-sections:change', {
                    bubbles: true,
                    detail: { current: sections[current].id, index: current, states: states }
                }));
            }
        }

        // ---- scroll: spy + read tracking + end space ---------------------------------
        function spy() {
            var vp = viewport();
            var line = vp.top + vp.height * READING_LINE;
            var idx = 0;
            sections.forEach(function (s, i) {
                var r = s.getBoundingClientRect();
                if (r.top <= line) idx = i;
                if (r.bottom <= line) read[i] = true;
            });
            if (!endSpace && atEnd()) {   // a short last section never reaches the line
                idx = sections.length - 1;
                read[idx] = true;
            }
            current = idx;
        }
        function setEndSpace(px) {
            endSpace = Math.max(0, Math.round(px));
            if (endSpace) root.style.setProperty('--pa-sections-end-space', endSpace + 'px');
            else root.style.removeProperty('--pa-sections-end-space');
        }
        // space needed for `section` to reach its landing line (its scroll-margin-top)
        function spaceNeededFor(section) {
            var vp = viewport();
            var landAt = landingOf(section);
            var el = scrollEl();
            var blockBottom = root.getBoundingClientRect().bottom - endSpace;
            var below = blockBottom - section.getBoundingClientRect().top;
            // scrollable room after the block (rest of the page) — excluding our own current end space
            var after = el.scrollHeight - endSpace - (el.scrollTop + (blockBottom - vp.top));
            return Math.max(0, vp.height - landAt - below - Math.max(0, after));
        }
        // drop the space once it is entirely below the visible area: nothing visible moves
        function maybeDropEndSpace() {
            if (!endSpace) return;
            var vp = viewport();
            if (root.getBoundingClientRect().bottom - endSpace > vp.top + vp.height) setEndSpace(0);
        }

        var ticking = false;
        function onScroll() {
            if (jumping || isWizard() || ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                ticking = false;
                maybeDropEndSpace();
                spy();
                render();
            });
        }
        function scrollTarget() { return scroller || window; }
        function attachScroll() {
            scrollTarget().removeEventListener('scroll', onScroll);
            scroller = findScroller(root);
            scrollTarget().addEventListener('scroll', onScroll, { passive: true });
        }

        // ---- navigation ----------------------------------------------------------------
        // Scroll ONLY the block's own scroller so `el`'s top lands `margin` px below the top of
        // the visible area. (scrollIntoView() scrolls every scrollable ancestor — including an
        // `overflow: hidden` body — which can shift the whole app shell.)
        function scrollToEl(el, margin) {
            var behavior = reducedMotion() ? 'auto' : 'smooth';
            var delta = el.getBoundingClientRect().top - viewport().top - margin;
            if (scroller) scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: behavior });
            else window.scrollTo({ top: window.scrollY + delta, behavior: behavior });
        }
        function landingOf(el) { return parseFloat(getComputedStyle(el).scrollMarginTop) || 0; }

        function go(i, opts) {
            current = Math.max(0, Math.min(sections.length - 1, i));
            var section = sections[current];
            if (isWizard()) {
                render();
                scrollToEl(root, landingOf(sections[current]));
                return;
            }
            jumping = true;
            render();
            setEndSpace(spaceNeededFor(section));
            scrollToEl(section, landingOf(section));
            if (opts && opts.focus) {
                if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1');
                section.focus({ preventScroll: true });
            }
            if (root.hasAttribute('data-update-hash') && history.replaceState) history.replaceState(null, '', '#' + section.id);
            var target = scrollTarget();
            var settle = function () {
                clearTimeout(settleTimer);
                settleTimer = setTimeout(function () {
                    jumping = false;
                    target.removeEventListener('scroll', settle);
                }, SETTLE_MS);
            };
            target.addEventListener('scroll', settle, { passive: true });
            settle();
        }
        function markTouched(scope) {
            Array.prototype.forEach.call(fieldsOf(scope), function (f) { touched.add(f); });
        }

        function onField(e) { touched.add(e.target); render(); }
        function onClick(e) {
            var link = e.target.closest('.pa-steps__link');
            if (link && nav.contains(link)) {
                e.preventDefault();
                go(items.indexOf(link.closest('.pa-steps__item')), { focus: true });
                return;
            }
            if (e.target.closest('[data-sections-prev]')) { go(current - 1); return; }
            if (e.target.closest('[data-sections-next]')) {
                if (validate()) {
                    markTouched(sections[current]);
                    if (stateOf(current) !== 'success') { render(); return; }   // stay until the page is valid
                } else {
                    read[current] = true;
                }
                if (current < sections.length - 1) go(current + 1); else render();
                return;
            }
            if (e.target.closest('[data-sections-submit]')) { markTouched(root); render(); }
        }

        // ---- wiring --------------------------------------------------------------------
        var presence = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { root.classList.toggle('pa-sections--in-view', e.isIntersecting); });
        });
        presence.observe(root);
        var sizer = new ResizeObserver(function () { measureNav(); attachScroll(); });
        sizer.observe(nav);
        sizer.observe(root);

        root.addEventListener('input', onField);
        root.addEventListener('change', onField);
        root.addEventListener('click', onClick);
        attachScroll();
        measureNav();
        spy();
        render();

        return {
            go: function (i) { go(i, { focus: false }); },
            // after the block's classes changed (layout / mode / style) or its content did
            refresh: function () {
                setEndSpace(0);
                rendered = [];
                measureNav();
                attachScroll();
                if (!isWizard()) spy();
                render();
            },
            destroy: function () {
                presence.disconnect();
                sizer.disconnect();
                scrollTarget().removeEventListener('scroll', onScroll);
                clearTimeout(settleTimer);
                setEndSpace(0);
                root.removeEventListener('input', onField);
                root.removeEventListener('change', onField);
                root.removeEventListener('click', onClick);
                releaseHost(host);
                delete root._paSections;
            }
        };
    }

    function init(scope) {
        (scope || document).querySelectorAll('[data-pa-sections]').forEach(function (el) {
            if (!el._paSections) el._paSections = create(el);
        });
    }
    function get(el) { return el && el._paSections || null; }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
    else init();

    var pa = (window.pureAdmin = window.pureAdmin || {});
    (pa.components = pa.components || {}).sections = { init: init, get: get };
})();
