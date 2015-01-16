/*
 * This file is part of the Sonatra package.
 *
 * (c) François Pluchino <francois.pluchino@sonatra.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*global jQuery*/
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
     * Refreshes the left and right indicator, depending of the presence of
     * items.
     *
     * @param {NavScroll} self The nav scroll instance
     *
     * @private
     */
    function refreshIndicator(self) {
        var position = self.$wrapper.hammerScroll('getScrollPosition'),
            max = self.$wrapper.hammerScroll('getMaxScrollPosition');

        if (position > 0) {
            self.$content.addClass('nav-scrollable-has-previous');

        } else {
            self.$content.removeClass('nav-scrollable-has-previous');
        }

        if (position < max) {
            self.$content.addClass('nav-scrollable-has-next');

        } else {
            self.$content.removeClass('nav-scrollable-has-next');
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
        this.$wrapper = this.options.useScroll || this.options.nativeScroll ?
                $('.' + this.options.classNav, this.$element)
            : this.$element;
        this.$wrapper.hammerScroll($.extend(this.options, {'direction': 'horizontal'}));
        this.$content = this.options.useScroll || this.options.nativeScroll ?
                $('.hammer-scroll-content', this.$element)
            : this.$wrapper;
        this.$element
            .on('shown.bs.dropdown.st.navscroll', null, this, onShownDropdown)
            .on('hide.bs.dropdown.st.navscroll', null, this, onHideDropdown);

        if (!this.options.scrollbar) {
            this.$wrapper.on('scrolling.st.hammerscroll.st.navscroll', null, this, scrolling);
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
        this.$wrapper.hammerScroll('destroy');
        this.$wrapper.off('scrolling.st.hammerscroll.st.navscroll', scrolling);
        this.$element
            .off('shown.bs.dropdown.st.navscroll', onShownDropdown)
            .off('hide.bs.dropdown.st.navscroll', onHideDropdown);
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
