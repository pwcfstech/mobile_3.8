Base Launchpad library including 3rd party and requirejs configuration

# Information
|  name |  version |  bundle |
|--|:--:|--:|
|  base |  3.0.4 |  launchpad |

## Dependencies

- angular ~1.2.28
- lodash ~3.10.1
- jquery ~2.1.3

## Dev Dependencies

- config ^3.0.0
- angular-mocks ~1.2.28

## Install
```bash
bower i base && bower link
```
## Develop
```bash
git clone ssh://git@stash.backbase.com:7999/lpm/foundation-base.git  base && cd base
bower install
bower link
```
## Usage

- Create Angular Module

```javascript

module.name = 'widget-demo';

var base = require('base');
var deps = []; // no deps

// Create Angular Module
module.exports = base.createModule(module.name, deps);
```

- Require Widget

Global function to bootstrap widgets

```javascript

base.requireWidget(__WIDGET__ , 'scripts/main');

//or

requireWidget(__WIDGET__, 'dist/scripts/main');
```

- Using external utils

```javascript

var utils = require('base').utils // lodash + base utils
```
## Testing
```
bblp test
```
with watch flag

```
bblp test -w
```
## Build
```
bblp build
```
