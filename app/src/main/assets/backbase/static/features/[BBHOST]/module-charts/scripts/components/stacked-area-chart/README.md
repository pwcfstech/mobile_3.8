## Usage

```html
<lp-stacked-area-chart options="mainCtrl.options"></lp-stacked-area-chart>
```

```js
.controller('MainCtrl', ['$http', function ($http) {
    var ctrl = this;

    $http.get('mock/data.json').then(function (res) {
        ctrl.options = {
            data: res.data,
            parsers: {
                x: getDate,
                y: getValue
            },
            formatters: {
                x: d3.time.format('%Y')
            }
        };
    });
}])
```
