## Usage

```html
<lp-donut-chart options="mainCtrl.options"></lp-donut-chart>

<lp-donut-chart
    options="mainCtrl.options"
    item="selectedItem"
    on-select="onSelectCallback"
    on-resize="onResizeCallback"
></lp-donut-chart>
```

```js
.controller('MainCtrl', ['$http', function ($http) {
    var ctrl = this;

    $http.get('mock/data.json').then(function (res) {
        ctrl.options = {
            data: res.data
        };
    });
}])
```
