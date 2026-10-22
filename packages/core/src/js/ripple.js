/**
 * Pure Admin Button Ripple
 * Plays the `.pa-btn--ripple` click animation.
 *
 * The CSS (`.pa-btn--ripple`) draws the circle; this script adds
 * `.pa-btn--ripple-active` on click and removes it once the animation has
 * run. One delegated listener on the document — buttons rendered later
 * (LiveView patches, SPA re-renders) ripple without any init call.
 *
 *   <button class="pa-btn pa-btn--primary pa-btn--ripple">Save</button>
 *
 * Variants: `.pa-btn--ripple` alone grows from the click point; add
 * `.pa-btn--ripple-center` to always start in the middle, or
 * `.pa-btn--ripple-pulse` for a halo that grows past the button's edges
 * (`.pa-btn--ripple-double-pulse`: two halos, one after the other).
 *
 * Custom ripple types need no JS: define `.pa-btn--ripple-<name>` in your own
 * CSS with an animation on `.pa-btn--ripple-active` (on ::before, ::after or
 * the button) — this script times it from the computed animation.
 * Duration follows the theme's `$ripple-duration` (the computed
 * animation-duration), so nothing is hard-coded here.
 */

(function () {
    'use strict';

    var pa = (window.pureAdmin = window.pureAdmin || {});
    if (pa.ripple) return; // loaded twice — keep the first listener

    var ACTIVE = 'pa-btn--ripple-active';
    var timers = new WeakMap();

    function toMs(v) {
        var n = parseFloat(String(v).split(',')[0]);
        if (isNaN(n)) return 0;
        return String(v).trim().endsWith('ms') ? n : n * 1000;
    }

    // When the last running layer ends — the ::before ink, the ::after halo,
    // the delayed second halo of --ripple-double-pulse, or the button itself —
    // so themes can retune $ripple-duration / $ripple-double-pulse-delay and a
    // product's own ripple types (any .pa-btn--ripple-<name> with an
    // animation) are timed without registering anything.
    function durationMs(btn) {
        var max = 0;
        [null, '::before', '::after'].forEach(function (pseudo) {
            var cs = getComputedStyle(btn, pseudo);
            if (cs.animationName && cs.animationName !== 'none') {
                max = Math.max(max, toMs(cs.animationDuration) + toMs(cs.animationDelay));
            }
        });
        return max || 450;
    }

    // Grow from the click point, sized to reach the farthest corner.
    // Keyboard clicks (detail 0) start from the centre.
    function place(btn, e) {
        var r = btn.getBoundingClientRect();
        var fromPointer = e && e.detail > 0 && e.clientX != null;
        var x = fromPointer ? e.clientX - r.left : r.width / 2;
        var y = fromPointer ? e.clientY - r.top : r.height / 2;
        var dx = Math.max(x, r.width - x);
        var dy = Math.max(y, r.height - y);
        btn.style.setProperty('--pa-ripple-x', x + 'px');
        btn.style.setProperty('--pa-ripple-y', y + 'px');
        btn.style.setProperty('--pa-ripple-size', (2 * Math.sqrt(dx * dx + dy * dy)) + 'px');
    }

    function play(btn, e) {
        // No disabled check: browsers don't fire click on a disabled button, and
        // a click handler that disables it (async save) should still ripple.
        if (!btn) return;
        clearTimeout(timers.get(btn));
        place(btn, e);
        // Restart on rapid re-clicks: drop the class and force a reflow so the
        // animation runs again from zero.
        btn.classList.remove(ACTIVE);
        void btn.offsetWidth;
        btn.classList.add(ACTIVE);
        timers.set(btn, setTimeout(function () {
            btn.classList.remove(ACTIVE);
        }, durationMs(btn)));
    }

    document.addEventListener('click', function (e) {
        var btn = e.target instanceof Element ? e.target.closest('.pa-btn--ripple') : null;
        if (btn) play(btn, e);
    });

    pa.ripple = { play: play };
})();
