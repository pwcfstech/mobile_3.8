define(function (require, exports, module) {
    'use strict';

    var template = '' +
        '<span>' +
        '    <i class="{{option.icon}} option-icon"></i>' +
        '    <span class="sr-only">Sort by</span>' +
        '    <span class="option-label">{{option.label}}</span>' +
        '    <span class="sr-only">{{option.aria}}</span>' +
        '    <i class="lp-icon lp-icon-checkmark_fat"></i>' +
        '</span>';

    return template;
});
