define(function (require, exports, module) {

  'use strict';

	var _ = require('base').utils;

	// @ngInject


		var defaultProfileImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABPCAIAAADz89W0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3MkVFRDI3OTJERUQxMUUzQkU4Qzk1MDlEQzAyMjFFNCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3MkVFRDI3QTJERUQxMUUzQkU4Qzk1MDlEQzAyMjFFNCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjcyRUVEMjc3MkRFRDExRTNCRThDOTUwOURDMDIyMUU0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjcyRUVEMjc4MkRFRDExRTNCRThDOTUwOURDMDIyMUU0Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+gildPAAABRdJREFUeNrsmstKI0EUhicmRmO8IoKIgigoCoovIOhOX8m38RncuHWjG0HFjeAl4GWhoAvvUZPMZ/6ZQ9OtmUBa04OnFk2luqo9X51LnVMzqZWVlV8/qbX8+mHNgR3YgR3YgR3YgR3YgR3YgR3YgR3YgR3YgR3YgR3YgR34O1umkcWVSiX4M5VK2Yj6PDUt9Co6GPxI6MvB+U0GDlL9MZiWluBe6KkJ9iqI8RmDjVeq7cO/1TQN8wTm9fX16ekpn88/Pj5ms1kky+VyLy8vdMrlMoOtra100um0MWgLghj0mfD29mav+JnJZJKiYWuA9fb2jo2NiRYwhL64uIBf0k9NTTFHWyMY5kRtVX0msIqfPK+vr0ulUnRrmgyMHF1dXQsLCz09PYChlpubm7W1tbu7O2SFbXx8fGZmxpiZDwzToobKTwhZgmKfn5/Pz883NjaKxaJMo3FR0/Pz841/Ba0iGSSDg4MPDw/Ih27b29uPj495hbUXCoWRkRGELlYb5MDAzCv6etJ4xaD2BWzGh4aGmHl5eVnD4b8PWPpBFbK6q6ur0dFRlCxzbWtrw6sZ7OjoQNXIPTs7y2ScOVttTGCVvFTN+lI7P/kyP9k4vhkLc6NBCwmQiT76RLdbW1vLy8tyP8inp6dPT09RFHi49Pb29sDAgMyVJ+N0YI6eW6yFljkMEvyYw19pftCSQ0osheWTk5OjoyNCFLolgGHGc3Nzm5ubnZ2dbMf6+jquzvj7H85kbLOCja+xO4uLi2wWO4I5yMJjceBGMy3bcsRCOBnhzs7O/f09CmcvwJ6cnAQbWgi7u7vhyVcbVIxg1cxkOX1G6LM1eDLBWX4hS47LgWMAthiLuKgCJEx3b2+PETk2KsV1IZS7QmgeyxL5M5y5apO1M5lpds4rqicrtUS94gESZoAnJib6+/sBYBcI3ZiojqtQvik1auNub2+xDu2j3CRGS47fhzVCrEJRGCR+u7S0pIAE5/DwsDpRYEuniOe7u7vsnbKO1N8WL3MMufT74VZNIVAvHY4f/JDgjEoVYC0g84x+oVRt5WpjrX3zizTcaHloSlBKaJkjZ698WOoy3do0dfTKEmw6+DNPTbCWFA2HVC0DVpOtKsYyfnBwsL+/T4gyk+aVlC8kebuKEL1VREhWPRws8aIVrD15RWp9dnYGQyhpEZvgdUQpb5MXVAItKUHLXM4MW/KZKeotZ4/O3mipYGvVOITxZKUllmNGLxuar+HQ1QT6URqsA5noRVIZugOIOoX8glWazEdk2DF6ciZ2J7E8RC4qbPItKkTxh6wjeDeiJcQ50hVLM1G4YkGC6uEQsIWcYMWD6HaVESo8dKppnBGcWaFLsZrz2WJbEjUsEqvvTWl20RHKW2zQtsBuCKiZqCsPDw/tbiiJGpboxFskNjyJa5VgjSs73RCpzKbuJ9ksFApkMhYLkwgMGInx6uoqRZKUo6u5f2rJ/FlVhOqwvr6+GAumr9Kwkko0U7+UZtLsi2KVQoDcwbKUJPqwLiikIrmxyil5bG0N6zKEQlpHsZRsdwzJ1TAiIqhiDzmj7qssONVYq9ybtVKsrUpWLh2NQBDKaaVnRFc9XOdyqVp3l1aZJNSkLdlUTLYiIXjY1nm1EDx77QxL6DkcyoHr+QexaGYe7SRUw9EEu55z5bOFH36qaRcA/11zYAd2YAd2YAd2YAd2YAd2YAd2YAd24B/QMrH/J4qkA8f7Pyhcw+7DzW6/BRgAykJQPtOgddIAAAAASUVORK5CYII=';

		var extractInitials = function(name) {

      var initials = '';
      name = name.split(' ');

      for (var i = 0; i < name.length; i++) {
        initials += name[i].substr(0, 1);
      }

      initials = initials.toUpperCase();
      return initials;

    };

		var getColorFromInitials = function(initials) {

      var a = initials.charCodeAt(0) - 64;
      var x = a + 120;

      var i = Math.floor((((a - 1) / (26 - 1)) * (5 - 1) + 1) - 1);
      var colors = [
        [ x, 210, 210 ],
        [ x, x, 210 ],
        [ 210, x, x ],
        [ x, 210, x ],
        [ 210, x, 210 ]
      ];
      return colors[i];
    };

		exports.getDefaultProfileImage = function(name, width, height, color) {

      var canvas = document.createElement('canvas');

      if (!name || !canvas.getContext || !canvas.getContext('2d') ) {
        return defaultProfileImage;
      }

      var initials = extractInitials(name);
      color = color || getColorFromInitials(initials);

      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      var ctx = canvas.getContext('2d');

      ctx.fillStyle = _.isArray(color) ? 'rgb(' + color.join(',') + ')' : color;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgb(250,250,250)';

      var scale;
      // var marginRight = 0;

      switch (initials.length) {
        case 1:
          scale = 0.6;
          // marginRight = 4;
          break;

        case 2:
          scale = 0.5;
          // marginRight = 3;
          break;

        case 3:
          scale = 0.45;
          // marginRight = 2;
          break;

        default:
          scale = 0.3;
          // marginRight = 0;
          break;
      }

      var fontSize = parseInt( scale * height, 10);
      var marginBottom = Math.floor( 0.15 * height);

      ctx.font = fontSize + 'px Proxima Regular, Helvetica Nueue, Helvetica, Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(initials, width - 3, height - marginBottom);

      var dataUri = canvas.toDataURL('image/png');
      return dataUri;
    };

});
