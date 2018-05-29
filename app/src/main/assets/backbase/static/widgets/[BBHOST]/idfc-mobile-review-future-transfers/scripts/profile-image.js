define(function(require, exports, module) {
    'use strict';
    var _ = require('base').utils;
    var defaultProfileImage =
        'data:image/png;base64,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';
    var extractInitials = function(name) {
        var initials = '';
        name = name.split(' ');
        if (name.length == 1) {
            initials = name[0].substr(0, 2);
        } else {
            for (var i = 0; i < name.length; i++) {
                initials += name[i].substr(0, 1);
            }
        }
        initials = initials.toUpperCase();
        return initials;
    };
    var getColorFromInitials = function(initials) {
        var a = initials.charCodeAt(0) - 64;
        var x = a + 120;
        var i = Math.floor((((a - 1) / (26 - 1)) * (5 - 1) + 1) - 1);
        var colors = [
            [x, 210, 210],
            [x, x, 210],
            [210, x, x],
            [x, 210, x],
            [210, x, 210]
        ];
        return colors[i];
    };
    exports.getDefaultProfileImage = function(name, width, height) {
        var canvas = document.createElement('canvas');
        if (!name || !canvas.getContext || !canvas.getContext('2d')) {
            return defaultProfileImage;
        }
        var initials = extractInitials(name);
        var color = 'rgb(255,173,27)';
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = _.isArray(color) ? 'rgb(' + color.join(',') +
            ')' : color;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'rgb(250,250,250)';
        var scale;
        switch (initials.length) {
            case 1:
                scale = 0.6;
                break;
            case 2:
                scale = 0.5;
                break;
            case 3:
                scale = 0.45;
                break;
            default:
                scale = 0.3;
                break;
        }
        var fontSize = parseInt(scale * height * 0.7, 10);
        var marginBottom = Math.floor(0.35 * height);
        ctx.font = fontSize +
            'px Proxima Regular, Helvetica Nueue, Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(initials, width * 0.5, height - marginBottom);
        var dataUri = canvas.toDataURL('image/png');
        return dataUri;
    };
});