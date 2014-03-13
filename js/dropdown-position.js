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
            $menu.hammerScroll({useScroll: true, scrollbar: true});
        var $wrapper = $menu.parent();

        $wrapper.css('position', 'absolute');
        $wrapper.css('top', $menu.css('top'));
        $wrapper.css('left', $menu.css('left'));
        $wrapper.css('z-index', $menu.css('z-index'));
        $wrapper.css('border', $menu.css('border'));
        $wrapper.css('-webkit-box-shadow', $menu.css('-webkit-box-shadow'));
        $wrapper.css('box-shadow', $menu.css('box-shadow'));
        $wrapper.css('overflow', 'hidden');
        $wrapper.css('margin-top', '-1px');
        $menu.css('position', 'initial');
        $menu.css('top', '0');
        $menu.css('left', 'inherit');
        $menu.css('right', 'initial');
        $menu.css('margin-top', '0');
        $menu.css('padding-top', '0');
        $menu.css('border', 'none');
        $menu.css('-webkit-box-shadow', 'initial');
        $menu.css('box-shadow', 'initial');
        $menu.css('display', 'block');

        var parentOffset = $.proxy(getParentOffset, this)($wrapper);
        var left = $wrapper.offset()['left'];
        var top = $wrapper.offset()['top'] - parentOffset['top'];
        var maxLeft = $(window).width();
        var maxTop = $(window).height() + $(window).scrollTop() - 50;

        $wrapper.css('max-width', maxLeft);
        $wrapper.css('max-height', maxTop);
        $menu.css('max-height', maxTop);

        var width = $wrapper.outerWidth();
        var height = $wrapper.outerHeight();
        var endLeft = left + width;
        var endTop = top + height;

        if (left < 0) {
            $wrapper.css('margin-left', -left);
        } else if (endLeft > maxLeft) {
            $wrapper.css('margin-left', -(endLeft - maxLeft));
        }

        if (top < 0) {
            $wrapper.css('margin-top', -top);
        } else if (endTop > maxTop) {
            $wrapper.css('margin-top', -(endTop - maxTop));
        }

        $menu.hammerScroll('resizeScrollbar');
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

        $menu.hammerScroll('destroy');
        $menu.css('position', '');
        $menu.css('top', '');
        $menu.css('left', '');
        $menu.css('right', '');
        $menu.css('margin-top', '');
        $menu.css('padding-top', '');
        $menu.css('border', '');
        $menu.css('-webkit-box-shadow', '');
        $menu.css('box-shadow', '');
        $menu.css('max-width', '');
        $menu.css('max-height', '');
        $menu.css('overflow', '');
        $menu.css('display', '');
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

    /**
     * Get parent offset of menu.
     *
     * @param jQuery $target
     *
     * @return Object (left and top properties)
     *
     * @private
     */
    function getParentOffset ($target) {
        var $parent = $target.parent();

        if ($parent.get(0) instanceof Window) {
            return {'top': 0, 'left': 0};
        }

        return $parent.offset();
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
