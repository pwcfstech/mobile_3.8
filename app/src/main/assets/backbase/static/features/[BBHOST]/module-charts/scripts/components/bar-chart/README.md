## Usage

```html
<lp-bar-chart lp-chart-options="mainCtrl.options"></lp-bar-chart>
```

```js
.controller('MainCtrl', ['$http', function ($http) {
    var ctrl = this;

    $http.get('mock/data.json').then(function (res) {
        ctrl.options = {
            data: res.data,
            height: 200,
            padding: [0, 30, 30, 40],
            parsers: {
                x: getDate,
                y: getValue
            },
            formatters: {
                x: d3.time.format('%e'),
                y: formatAmount,
                tooltip: function(d) {
                    return [
                        formatDate(getDate(d)),
                        formatAmount(getValue(d))
                    ].join('&lt;br/>');
                }
            }
        };
    });
}])
```
