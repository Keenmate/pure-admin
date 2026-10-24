/**
 * Demo helper — persist a demo page's configurator switches to localStorage, so the
 * chosen configuration survives a reload. Ported from the Keenmate web-components
 * devkit (src/examples/controls-persistence.js) — same behaviour and storage format,
 * as a plain script (no dependency).
 *
 * Call ONCE, at the end of the page's own wiring (after its change-listeners are
 * attached):
 *
 *     <div class="controls"> …selects / inputs… </div>
 *     window.demoControls.attach('sections');   // a stable per-page key
 *
 * It scans every <input>/<select> inside `.controls`, restores the saved values,
 * then dispatches `change` (+ `input` for value controls) on each so the page's OWN
 * listeners re-apply the configuration. A listener that resets OTHER controls on a
 * user's change (e.g. picking an example resets its defaults) must skip that while
 * window.demoControls.isRestoring() is true, or it would overwrite restored values.
 */
(function () {
    'use strict';

    var STORAGE_PREFIX = 'pure-admin';
    var restoring = false;
    var CONTROLS_SELECTOR = '.controls input, .controls select';

    function stateId(control) {
        return control.type === 'checkbox' ? 'chk:' + control.id
            : control.type === 'radio' ? 'radio:' + control.name
            : 'val:' + control.id;
    }

    function storageKey(pageId) {
        return STORAGE_PREFIX + ':examples:controls:' + pageId;
    }

    function load(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || '{}') || {};
        } catch (e) {
            return {};
        }
    }

    function save(key, controls) {
        var state = {};
        controls.forEach(function (control) {
            if (control.type === 'radio') {
                if (control.checked) state[stateId(control)] = control.value;
            } else if (control.type === 'checkbox') {
                state[stateId(control)] = control.checked;
            } else {
                state[stateId(control)] = control.value;
            }
        });
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (e) {
            /* storage unavailable (private mode / quota) — no persistence */
        }
    }

    /**
     * Restore + persist all `.controls` inputs/selects under `root` for page `pageId`.
     * @returns {{ clear(): void }} clear() forgets the saved state for this page
     */
    function attach(pageId, root) {
        root = root || document;
        var key = storageKey(pageId);
        var controls = Array.prototype.slice.call(root.querySelectorAll(CONTROLS_SELECTOR));
        var api = { clear: function () { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } } };
        if (!controls.length) return api;

        // 1) restore the saved values onto the controls
        var saved = load(key);
        controls.forEach(function (control) {
            var id = stateId(control);
            if (!(id in saved)) return;
            if (control.type === 'radio') control.checked = control.value === saved[id];
            else if (control.type === 'checkbox') control.checked = !!saved[id];
            else control.value = saved[id];
        });

        // 2) re-apply through the page's own handlers (radios: only the checked one per
        //    group; value controls also get `input`, some pages listen on that)
        var firedRadioGroups = {};
        restoring = true;
        try {
            controls.forEach(function (control) {
                if (control.type === 'radio') {
                    if (!control.checked || firedRadioGroups[control.name]) return;
                    firedRadioGroups[control.name] = true;
                }
                control.dispatchEvent(new Event('change', { bubbles: true }));
                if (control.type !== 'radio' && control.type !== 'checkbox') control.dispatchEvent(new Event('input', { bubbles: true }));
            });
        } finally {
            restoring = false;
        }

        // 3) save on every later change
        function onChange(e) {
            if (e.target && e.target.closest && e.target.closest('.controls')) save(key, controls);
        }
        root.addEventListener('change', onChange);
        root.addEventListener('input', onChange);
        return api;
    }

    window.demoControls = {
        attach: attach,
        storageKey: storageKey,
        isRestoring: function () { return restoring; }
    };
})();
