/*
 * This file is part of the Sonatra package.
 *
 * (c) François Pluchino <francois.pluchino@sonatra.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

+function ($) {
    'use strict';

    // DROPDOWN POSITION CLASS DEFINITION
    // ==================================

    /**
     * @constructor
     *
     * @param htmlString|Element|Array|jQuery element
     * @param Array                           options
     *
     * @this
     */
    var DropdownPosition = function (element, options) {
        this.guid     = jQuery.guid;
        this.options  = $.extend({}, options);
        this.$element = $(element);

        $(document)
            .on('shown.bs.dropdown.st.dropdownposition' + this.guid, '.dropdown', $.proxy(onShow, this))
            .on('hide.bs.dropdown.st.dropdownposition' + this.guid, '.dropdown', $.proxy(onHide, this))
        ;

        $(window).on('shown.bs.dropdown.st.dropdownposition' + this.guid, '.dropdown.open', $.proxy(onResize, this));
    };

    /**
     * Destroy instance.
     *
     * @this
     */
    DropdownPosition.prototype.destroy = function () {
        $.proxy(onHide, this.$element.get(0))();

        $(document)
            .off('shown.bs.dropdown.st.dropdownposition' + this.guid, '.dropdown', $.proxy(onShow, this))
            .off('hide.bs.dropdown.st.dropdownposition' + this.guid, '.dropdown', $.proxy(onHide, this))
        ;

        $(window).off('shown.bs.dropdown.st.dropdownposition' + this.guid, '.dropdown.open', $.proxy(onResize, this));

        this.$element.removeData('st.dropdownposition');
    };

    /**
     * Action on show dropdown event.
     *
     * @param jQuery.Event event
     *
     * @this
     * @private
     */
    function onShow (event) {
        var $menu = $.proxy(getMenu, this)();
        var width = $menu.outerWidth();
        var height = $menu.outerHeight();
        var left = $menu.offset()['left'];
        var top = $menu.offset()['top'];
        var endLeft = left + width;
        var endTop = top + height;
        var maxLeft = $(window).width();
        var maxTop = $(window).height();

        $menu.css('max-width', maxLeft);
        $menu.css('max-height', maxTop);

        if (left < 0) {
            $menu.css('margin-left', -left);
        } else if (endLeft > maxLeft) {
            $menu.css('margin-left', -(endLeft - maxLeft));
        }

        if (top < 0) {
            $menu.css('margin-top', -top);
        } else if (endTop > maxTop) {
            $menu.css('margin-top', -(endTop - maxTop));
        }
    }

    /**
     * Action on hide dropdown event.
     *
     * @param jQuery.Event event
     *
     * @this
     * @private
     */
    function onHide (event) {
        var $menu = $.proxy(getMenu, this)();

        $menu.css('max-width', '');
        $menu.css('max-height', '');
        $menu.css('margin-left', '');
        $menu.css('margin-top', '');
    }

    /**
     * Action on window resize event.
     *
     * @param jQuery.Event event
     *
     * @this
     * @private
     */
    function onResize (event) {
        var $menu = $.proxy(getMenu, this)();
        $menu.removeClass('open');

        $menu.trigger('shown.bs.dropdown', { relatedTarget: this });
    }

    /**
     * Get dropdown menu.
     *
     * @return jQuery
     *
     * @private
     */
    function getMenu () {
        var $menu = $('.dropdown-menu', this);

        if (0 == $menu.size()) {
            var menuId = $('.dropdown-menu-restore-position', this).attr('data-dropdown-restore-for');
            $menu = $('[data-dropdown-restore-id=' + menuId + ']');
        }

        return $menu;
    }


    // DROPDOWN POSITION PLUGIN DEFINITION
    // ===================================

    var old = $.fn.dropdownPosition;

    $.fn.dropdownPosition = function (option, _relatedTarget) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('st.dropdownposition');
            var options = typeof option == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }

            if (!data) {
                $this.data('st.dropdownposition', (data = new DropdownPosition(this, options)));
            }

            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.dropdownPosition.Constructor = DropdownPosition;


    // DROPDOWN POSITION NO CONFLICT
    // =============================

    $.fn.dropdownPosition.noConflict = function () {
        $.fn.dropdownPosition = old;

        return this;
    };


    // DROPDOWN POSITION DATA-API
    // ==========================

    $(document)
        .on('shown.bs.dropdown.st.dropdownposition', '.dropdown', $.proxy(onShow, this))
        .on('hide.bs.dropdown.st.dropdownposition', '.dropdown', $.proxy(onHide, this))
    ;

    $(window).on('shown.bs.dropdown.st.dropdownposition', '.dropdown.open', $.proxy(onResize, this));

}(jQuery);
