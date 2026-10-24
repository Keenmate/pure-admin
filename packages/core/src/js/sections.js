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
 *   nav follow     when the nav's steps don't fit (a bar scrolling sideways, a long side
 *                  column), the nav scrolls itself to keep the current step in view.
 *   step state     data-progress decides how a step gets ticked:
 *                    seen (default)  done once its START and its END have both been on
 *                                    screen through your own scrolling (a jump is not
 *                                    tracked while it runs — jumped-over sections stay open;
 *                                    a section that fits on screen is seen when shown)
 *                    passed          done once it is above the reading line — a jump ticks
 *                                    what it went over (lax)
 *                    confirm         done only when its [data-sections-confirm] checkbox (in
 *                                    the section footer) is ticked or via markDone(); seen but
 *                                    not ticked = warning. data-confirm-after-seen keeps the
 *                                    checkbox disabled until the section has been seen.
 *                    fields          from the section's own fields: untouched | warning
 *                                    (started, incomplete) | danger (invalid) | success
 *   overlay        the .pa-sections__toggle handle opens / closes the pill (touch has no
 *                  hover); a step tap jumps and folds it, a tap outside or Esc folds it.
 *                  aria-expanded kept on the handle. API open() / close().
 *   click a step   smooth-scroll to its section (scroll-spy paused until it settles);
 *                  a section too close to the end gets temporary end space so it can
 *                  reach the nav — removed again once it is scrolled out of sight.
 *                  Wizard mode: switch page (fields: Next only past a valid page;
 *                  confirm: only past a confirmed one).
 *
 * Block attributes:
 *   data-pa-sections               auto-init marker
 *   data-progress                  seen | passed | confirm | fields (see step state)
 *   data-confirm-after-seen        confirm: checkbox disabled until the section was seen
 *   data-overlay-steps="N"         overlay layout: show at most N steps; the list scrolls
 *                                  (no scrollbar — the edge with more steps fades)
 *   data-debug                     log what the controller does to the console
 *   data-update-hash               write #section-id to the URL on a step click
 *   data-text-next / -finish       wizard button texts (default "Next" / "Finish")
 *   data-text-complete / -incomplete / -invalid / -read / -confirmed / -unconfirmed
 *                                  screen-reader state texts (English defaults)
 * Classes it sets:
 *   .pa-sections-host              on the app shell's .pc-layout__content while a block is on the
 *                                  page, so position:sticky works inside it (see _sections.scss)
 *   .pa-sections--in-view          the block is on screen (the overlay nav shows only then)
 *   .pa-sections__nav--open        overlay unfolded by the handle / open() (hover + keyboard need no class)
 *   .pa-sections__nav--more-before / --more-after   a limited overlay list has steps above / below
 *   .pa-sections__section--active  the current section (wizard shows only that one)
 *   .pa-steps__item--current/--done/--success/--warning/--danger + aria-current="step"
 * CSS custom properties it sets on the block:
 *   --pa-sections-nav-height       measured nav height (bar layouts clear it on a jump)
 *   --pa-sections-end-space        temporary end space for a jump near the end
 * Events (on the block, bubbling):
 *   pa-sections:change   detail = { current: sectionId, index, states: [...] } — only when something changed
 *
 * API: window.pureAdmin.components.sections = { init(scope), get(el) }
 *   get(el) → { go(i), markDone(i), clear(i), open(), close(), refresh(), destroy() }
 *   (i = 0-based step index or a section id)
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
        var read = [];                   // passed: its bottom went above the reading line
        var seenStart = [], seenEnd = [];   // seen: its start / end were on screen
        var confirmed = [];              // confirm: its [data-sections-confirm] is checked
        var forced = [];                 // markDone() from the API
        var current = 0;
        var jumping = false, settleTimer = null;
        var endSpace = 0;
        var lastSignature = '';
        var scroller = null;

        var isWizard = function () { return root.classList.contains('pa-sections--wizard'); };
        // how a step gets ticked — data-progress: seen (default) | passed | confirm | fields
        var MODES = { seen: 1, passed: 1, confirm: 1, fields: 1 };
        var progress = function () { var m = root.getAttribute('data-progress'); return MODES[m] ? m : 'seen'; };
        var validate = function () { return progress() === 'fields'; };

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
        // ---- debug: data-debug on the block logs what the controller does -------------
        var debug = root.hasAttribute('data-debug');
        function log() {
            if (!debug) return;
            console.log.apply(console, ['[pa-sections]'].concat(Array.prototype.slice.call(arguments)));
        }
        function stepOf(el) {
            var li = el && el.closest && el.closest('.pa-steps__item');
            return li && items.indexOf(li) >= 0 ? items.indexOf(li) + 1 : null;
        }
        function listPos() { var l = nav.querySelector('.pa-steps'); return l ? Math.round(l.scrollTop) : null; }

        function measureNav() {
            root.style.setProperty('--pa-sections-nav-height', nav.offsetHeight + 'px');
        }

        // ---- overlay: at most N steps visible (data-overlay-steps) ----------------------
        // The list scrolls with no scrollbar; the edge that has more steps fades instead.
        var list = nav.querySelector('.pa-steps');
        function applyVisibleSteps() {
            var n = parseInt(root.getAttribute('data-overlay-steps'), 10);
            if (n > 0) root.style.setProperty('--pa-sections-overlay-steps', String(n));
            else root.style.removeProperty('--pa-sections-overlay-steps');
            updateMore();
        }
        function updateMore() {
            if (!list) return;
            var limited = list.scrollHeight > list.clientHeight + 1;
            nav.classList.toggle('pa-sections__nav--more-before', limited && list.scrollTop > 1);
            nav.classList.toggle('pa-sections__nav--more-after', limited && list.scrollTop + list.clientHeight < list.scrollHeight - 1);
        }

        // ---- state ------------------------------------------------------------------
        function fieldsOf(section) { return section.querySelectorAll('input:not([data-sections-confirm]), select, textarea'); }
        function confirmBoxOf(i) { return sections[i].querySelector('[data-sections-confirm]'); }
        function isSeen(i) { return !!(seenStart[i] && seenEnd[i]); }
        function stateOf(i) {
            if (forced[i]) return validate() ? 'success' : 'done';
            var mode = progress();
            if (mode === 'passed') return read[i] ? 'done' : '';
            if (mode === 'seen') return isSeen(i) ? 'done' : '';
            // seen but not ticked yet: a warning, like a started-but-incomplete form section
            if (mode === 'confirm') return confirmed[i] ? 'done' : (isSeen(i) ? 'warning' : '');
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
            var confirm = progress() === 'confirm';
            return st === 'success' ? text('complete', 'complete')
                : st === 'warning' ? (confirm ? text('unconfirmed', 'not confirmed') : text('incomplete', 'incomplete'))
                : st === 'danger' ? text('invalid', 'invalid')
                : st === 'done' ? (confirm ? text('confirmed', 'confirmed') : text('read', 'read')) : '';
        }

        // ---- render: touch the DOM only where something changed ----------------------
        // the nav scrolls itself when its steps don't fit (a bar sideways, a long side
        // column down): keep the current step in view — scrolls only the nav, never the page
        var revealed = -1;
        function scrolls(el) { return el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1; }
        function revealStep(li) {
            if (!li) return;
            // the scroller: the step list itself (overlay with data-overlay-steps) or the nav
            var ol = li.parentElement;
            var box = scrolls(ol) ? ol : (scrolls(nav) ? nav : null);
            if (!box) return;
            var scrollsX = box.scrollWidth > box.clientWidth + 1, scrollsY = box.scrollHeight > box.clientHeight + 1;
            var n = box.getBoundingClientRect(), r = li.getBoundingClientRect();
            log('reveal step', items.indexOf(li) + 1, 'in', box === nav ? 'nav' : 'list',
                'dy', Math.round((r.top + r.height / 2) - (n.top + n.height / 2)), 'list scrollTop', listPos());
            // centre the step (rect deltas, so RTL needs no special case)
            box.scrollBy({
                left: scrollsX ? (r.left + r.width / 2) - (n.left + n.width / 2) : 0,
                top: scrollsY ? (r.top + r.height / 2) - (n.top + n.height / 2) : 0,
                behavior: reducedMotion() ? 'auto' : 'smooth'
            });
        }

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
            var lockUnseen = progress() === 'confirm' && root.hasAttribute('data-confirm-after-seen');
            sections.forEach(function (s, i) {
                var box = confirmBoxOf(i);
                if (box) box.disabled = lockUnseen && !isSeen(i) && !box.checked;
            });
            if (current !== revealed) {
                log('current', revealed + 1, '->', current + 1, jumping ? '(jump)' : '(scroll)');
                revealed = current;
                revealStep(items[current]);
            }

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
        // current step: the last section whose top has passed the reading line
        function spy() {
            var vp = viewport();
            var line = vp.top + vp.height * READING_LINE;
            var idx = 0;
            sections.forEach(function (s, i) {
                var r = s.getBoundingClientRect();
                if (r.height && r.top <= line) idx = i;   // a hidden (wizard) page has no position
            });
            if (!endSpace && atEnd()) idx = sections.length - 1;   // a short last section never reaches the line
            current = idx;
        }
        // passed: everything whose bottom is above the reading line (also what a jump went over)
        function markPassed() {
            var vp = viewport();
            var line = vp.top + vp.height * READING_LINE;
            sections.forEach(function (s, i) {
                var r = s.getBoundingClientRect();
                if (r.height && r.bottom <= line) read[i] = true;
            });
            if (!endSpace && atEnd()) read[sections.length - 1] = true;
        }
        // seen: record each section's start (its top) and end (its bottom) once it is in the
        // visible band — below the edge (navbar) and a sticky bar, above the bottom of the
        // scroll area. Only what is on screen counts; a jump is not tracked while it runs.
        function track() {
            var vp = viewport();
            var bottom = vp.top + vp.height;
            sections.forEach(function (s, i) {
                var r = s.getBoundingClientRect();
                if (!r.height) return;   // a hidden wizard page
                var top = vp.top + landingOf(s);
                if (!seenStart[i] && r.top >= top - 1 && r.top <= bottom) { seenStart[i] = true; log('seen start of', i + 1); }
                if (!seenEnd[i] && r.bottom >= top && r.bottom <= bottom + 1) { seenEnd[i] = true; log('seen end of', i + 1); }
            });
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
            if (jumping || ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                ticking = false;
                if (!isWizard()) {
                    maybeDropEndSpace();
                    spy();
                    markPassed();
                }
                track();
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
            log('go', i + 1, 'from', current + 1);
            current = Math.max(0, Math.min(sections.length - 1, i));
            var section = sections[current];
            if (isWizard()) {
                render();
                track();   // a page that fits on screen is seen as soon as it is shown
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
                    log('jump settled on', current + 1, sections[current].id,
                        'section top', Math.round(section.getBoundingClientRect().top - viewport().top),
                        'landing', landingOf(section));
                    jumping = false;
                    target.removeEventListener('scroll', settle);
                    // the jump has landed: record what is on screen now (seen) and what it
                    // went over (passed) — right away, not on the next scroll
                    markPassed();
                    track();
                    render();
                }, SETTLE_MS);
            };
            target.addEventListener('scroll', settle, { passive: true });
            settle();
        }
        function markTouched(scope) {
            Array.prototype.forEach.call(fieldsOf(scope), function (f) { touched.add(f); });
        }

        // ---- overlay: open / close with the handle (touch has no hover) ---------------
        var toggle = nav.querySelector('.pa-sections__toggle');
        function isOpen() { return nav.classList.contains('pa-sections__nav--open'); }
        function setOpen(open) {
            nav.classList.toggle('pa-sections__nav--open', !!open);
            if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        var downStep = null, downList = null;
        function onPointerDown(e) {
            if (nav.contains(e.target)) {
                downStep = stepOf(e.target); downList = listPos();
                log('pointerdown', e.pointerType, 'on', downStep ? 'step ' + downStep : e.target.className || e.target.tagName, 'list scrollTop', downList);
            }
            if (isOpen() && !nav.contains(e.target)) setOpen(false);   // tap outside closes
        }
        function onPointerUp(e) {
            if (!nav.contains(e.target) && downStep === null) return;
            var upStep = stepOf(e.target);
            log('pointerup on', upStep ? 'step ' + upStep : e.target.className || e.target.tagName, 'list scrollTop', listPos(),
                upStep !== downStep || listPos() !== downList ? '<- MOVED since pointerdown (step ' + downStep + ', list ' + downList + ') — the browser fires no click / clicks something else' : '');
            downStep = null;
        }
        function onKeyDown(e) { if (e.key === 'Escape' && isOpen()) setOpen(false); }

        function onField(e) {
            if (e.target.matches && e.target.matches('[data-sections-confirm]')) {
                var i = sections.indexOf(e.target.closest('.pa-sections__section'));
                if (i >= 0) { confirmed[i] = e.target.checked; log('confirm', i + 1, e.target.checked); }
            } else {
                touched.add(e.target);
            }
            render();
        }
        function readConfirmBoxes() {
            sections.forEach(function (s, i) { var b = confirmBoxOf(i); confirmed[i] = !!(b && b.checked); });
        }
        function indexOf(x) {   // a step index (0-based) or a section id
            return typeof x === 'string' ? sections.findIndex(function (s) { return s.id === x; }) : x;
        }
        function onClick(e) {
            if (nav.contains(e.target)) log('click on', stepOf(e.target) ? 'step ' + stepOf(e.target) : e.target.className || e.target.tagName,
                'list scrollTop', listPos());
            var link = e.target.closest('.pa-steps__link');
            if (link && nav.contains(link)) {
                e.preventDefault();
                setOpen(false);
                go(items.indexOf(link.closest('.pa-steps__item')), { focus: true });
                return;
            }
            if (toggle && toggle.contains(e.target)) { setOpen(!isOpen()); return; }
            if (e.target.closest('[data-sections-prev]')) { go(current - 1); return; }
            if (e.target.closest('[data-sections-next]')) {
                if (validate()) {
                    markTouched(sections[current]);
                    if (stateOf(current) !== 'success') { render(); return; }   // stay until the page is valid
                } else if (progress() === 'confirm') {
                    if (stateOf(current) !== 'done') {   // stay until the page is confirmed
                        var box = confirmBoxOf(current);
                        if (box && !box.disabled) box.focus();
                        render();
                        return;
                    }
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
            entries.forEach(function (e) {
                root.classList.toggle('pa-sections--in-view', e.isIntersecting);
                if (!e.isIntersecting) setOpen(false);
            });
        });
        presence.observe(root);
        var sizer = new ResizeObserver(function () { measureNav(); attachScroll(); updateMore(); });
        sizer.observe(nav);
        sizer.observe(root);

        root.addEventListener('input', onField);
        root.addEventListener('change', onField);
        root.addEventListener('click', onClick);
        if (list) list.addEventListener('scroll', updateMore, { passive: true });
        var listLogTimer;
        function onListScroll() {
            clearTimeout(listLogTimer);
            listLogTimer = setTimeout(function () { log('list scrolled to', listPos()); }, 150);
        }
        if (list && debug) list.addEventListener('scroll', onListScroll, { passive: true });
        document.addEventListener('pointerup', onPointerUp, true);
        log('init', root.id || '', 'steps', items.length, 'layout', root.className, 'overlay-steps', root.getAttribute('data-overlay-steps'));
        applyVisibleSteps();
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown);
        attachScroll();
        measureNav();
        if (!isWizard()) { spy(); markPassed(); }   // wizard: starts on the first page
        readConfirmBoxes();
        track();
        render();

        return {
            go: function (i) { go(indexOf(i), { focus: false }); },
            // set a step done yourself (any mode); in confirm mode its checkbox is ticked too
            markDone: function (i) {
                i = indexOf(i);
                if (!sections[i]) return;
                forced[i] = true;
                var box = confirmBoxOf(i);
                if (box) { box.checked = true; confirmed[i] = true; }
                render();
            },
            // back to not done: forget what was seen / passed / confirmed for it
            clear: function (i) {
                i = indexOf(i);
                if (!sections[i]) return;
                forced[i] = false; read[i] = false; seenStart[i] = false; seenEnd[i] = false; confirmed[i] = false;
                var box = confirmBoxOf(i);
                if (box) box.checked = false;
                render();
            },
            // overlay layout: unfold / fold the floating navigator (e.g. from your own button)
            open: function () { setOpen(true); },
            close: function () { setOpen(false); },
            // after the block's classes changed (layout / mode / style) or its content did
            refresh: function () {
                setEndSpace(0);
                applyVisibleSteps();
                rendered = [];
                measureNav();
                attachScroll();
                if (!isWizard()) { spy(); markPassed(); }
                readConfirmBoxes();
                track();
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
                if (list) list.removeEventListener('scroll', updateMore);
                root.style.removeProperty('--pa-sections-overlay-steps');
                document.removeEventListener('pointerdown', onPointerDown, true);
                document.removeEventListener('pointerup', onPointerUp, true);
                if (list) list.removeEventListener('scroll', onListScroll);
                document.removeEventListener('keydown', onKeyDown);
                setOpen(false);
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
