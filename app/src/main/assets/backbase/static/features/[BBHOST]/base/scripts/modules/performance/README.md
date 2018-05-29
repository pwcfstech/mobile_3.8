# Performance

Provides methods to track performance of javascript code using Mobile SDK API.

See [How to measure performance using SDK API](#https://backbase.atlassian.net/wiki/display/LPES/How+to+measure+performance+using+SDK+API)


## Usage

There are two ways to use performance module to track performance:

#### Directly


```javascript
// Get performance object
var performance = lpBase.performance();

// Start measurement
performance.start('render', {
  sender: 'widget-transactions',
  tags: ['js', 'render']
});

// ... some other code

// End measurement
performance.end('render', {
  sender: 'widget-transactions',
  tags: ['js', 'render']
});
```

By default performance module publishes `performance.start` and `performance.end` events.
These events can be specified:

```
// Get performance object
var performance = lpBase.performance({
  events: {
    start: 'cxp.performance.start',
    end: 'cxp.performance.end'
  }
});

// Start measurement
performance.start('render', {
  sender: 'widget-transactions',
  tags: ['js', 'render']
});

// ... some other code

// End measurement
performance.end('render', {
  sender: 'widget-transactions',
  tags: ['js', 'render']
});
```

#### With annotations

Add annotation to your javascript code:

```javascript
// @performance start render widgets-transactions widget_123 [js,render]
widget.render();
// @performance end render widgets-transactions widget_123 [js,render]
```

Then run the build command against the needed widget with the special flag:
```
bblp build --with-performance
```

During build all @performance annotations will be replaced with corresponding `lpBase.performance` methods.
