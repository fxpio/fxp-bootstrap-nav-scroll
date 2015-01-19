/*
 * This file is part of the Sonatra package.
 *
 * (c) François Pluchino <francois.pluchino@sonatra.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*global jQuery*/
/*global navigator*/
/*global window*/
/*global document*/
/*global CSSMatrix*/
/*global WebKitCSSMatrix*/
/*global MSCSSMatrix*/

/**
 * @param {jQuery} $
 *
 * @typedef {NavScroll}        NavScroll
 * @typedef {Number|undefined} NavScroll.$dropdownToggle
 * @typedef {Number|undefined} NavScroll.dragStartPosition
 */
(function ($) {
    'use strict';

    /**
     * Check is browser is Firefox.
     *
     * @return Boolean
     */
    function isFirefox() {
        return -1 !== navigator.userAgent.toLowerCase().indexOf('firefox');
    }

    /**
     * Refreshes the left and right indicator, depending of the presence of
     * items.
     *
     * @param {NavScroll} self The nav scroll instance
     *
     * @private
     */
    function refreshIndicator(self) {
        var position = self.$element.hammerScroll('getScrollPosition'),
            max = self.$element.hammerScroll('getMaxScrollPosition');

        if (position > 0) {
            self.$element.addClass('nav-scrollable-has-previous');

        } else {
            self.$element.removeClass('nav-scrollable-has-previous');
        }

        if (position < max) {
            self.$element.addClass('nav-scrollable-has-next');

        } else {
            self.$element.removeClass('nav-scrollable-has-next');
        }

        if (undefined !== self.$dropdownToggle) {
            self.$dropdownToggle.dropdown('toggle');
        }
    }

    /**
     * Refresh the indicator on scrolling.
     *
     * @param {jQuery.Event|Event} event
     *
     * @typedef {NavScroll} Event.data The nav scroll instance
     *
     * @private
     */
    function scrolling(event) {
        refreshIndicator(event.data);
    }

    /**
     * Action when dropdown is shown (to close the dropdown when the navscroll is in scrolling).
     *
     * @param {jQuery.Event} event
     *
     * @typedef {NavScroll} jQuery.Event.data The nav scroll instance
     *
     * @private
     */
    function onShownDropdown(event) {
        event.data.$dropdownToggle = $('.dropdown-toggle', event.target);
    }

    /**
     * Action when dropdown is hidden (to close the dropdown when the navscroll is in scrolling).
     *
     * @param {jQuery.Event} event
     *
     * @typedef {NavScroll} jQuery.Event.data The nav scroll instance
     *
     * @private
     */
    function onHideDropdown(event) {
        delete event.data.$dropdownToggle;
    }

    // NAV SCROLL CLASS DEFINITION
    // ===========================

    /**
     * @constructor
     *
     * @param {string|elements|object|jQuery} element
     * @param {object}                        options
     *
     * @typedef {Manager} NavScroll.hammer The hammer manager
     *
     * @this NavScroll
     */
    var NavScroll = function (element, options) {
        this.guid     = jQuery.guid;
        this.options  = $.extend({}, NavScroll.DEFAULTS, options);
        this.$element = $(element);

        if (isFirefox()) {
            this.options.forceNativeScroll = true;
        }

        this.$element
            .addClass('nav-scrollable')
            .hammerScroll($.extend(this.options, {'direction': 'horizontal'}))
            .on('shown.bs.dropdown.st.navscroll', null, this, onShownDropdown)
            .on('hide.bs.dropdown.st.navscroll', null, this, onHideDropdown);

        var $nav = $('.' + this.options.classNav, this.$element);

        if ($nav.hasClass('nav-tabs')) {
            this.$element.addClass('is-nav-tabs');
        }

        if ($nav.hasClass('nav-pills')) {
            this.$element.addClass('is-nav-pills');
        }

        if (!this.options.scrollbar) {
            this.$element.on('scrolling.st.hammerscroll.st.navscroll', null, this, scrolling);
            refreshIndicator(this);
        }
    },
        old;

    /**
     * Defaults options.
     *
     * @type {object}
     */
    NavScroll.DEFAULTS = {
        classNav:         'nav',
        scrollbar:        false,
        useScroll:        false,
        nativeScroll:     false,
        scrollbarInverse: true
    };

    /**
     * Destroy instance.
     *
     * @this NavScroll
     */
    NavScroll.prototype.destroy = function () {
        this.$element
            .off('scrolling.st.hammerscroll.st.navscroll', scrolling)
            .off('shown.bs.dropdown.st.navscroll', onShownDropdown)
            .off('hide.bs.dropdown.st.navscroll', onHideDropdown)
            .hammerScroll('destroy');
    };


    // NAV SCROLL PLUGIN DEFINITION
    // ============================

    function Plugin(option, value) {
        return this.each(function () {
            var $this   = $(this),
                data    = $this.data('st.navscroll'),
                options = typeof option === 'object' && option;

            if (!data && option === 'destroy') {
                return;
            }

            if (!data) {
                data = new NavScroll(this, options);
                $this.data('st.navscroll', data);
            }

            if (typeof option === 'string') {
                data[option](value);
            }
        });
    }

    old = $.fn.navScroll;

    $.fn.navScroll             = Plugin;
    $.fn.navScroll.Constructor = NavScroll;


    // NAV SCROLL NO CONFLICT
    // ======================

    $.fn.navScroll.noConflict = function () {
        $.fn.navScroll = old;

        return this;
    };


    // NAV SCROLL DATA-API
    // ===================

    $(window).on('load', function () {
        $('[data-nav-scroll="true"]').each(function () {
            var $this = $(this);
            Plugin.call($this, $this.data());
        });
    });

}(jQuery));
