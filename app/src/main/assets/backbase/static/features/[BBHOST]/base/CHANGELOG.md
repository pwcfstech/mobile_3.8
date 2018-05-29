### `v3.0.4 - 21/07/2016`
* LF-1136: Bumped version for xsrf
* LF-1105: Port CSRF implementation from 0.12.x branch

### `v3.0.3 - 31/03/2016`

### `v3.0.2 - 25/03/2016`

### `v3.0.1 - 04/03/2016`
* LPMAINT-168: Updated angular version to 1.5.0

### `v3.0.0 - 09/02/2016`
* LF-785: Updated angular version to 1.4.9

### v2.9.5 - `27/01/2016, 1:04pm`
* NOJIRA: Do not validate session until user is logged in

### v2.9.4 - `15/01/2016, 10:57am`
* LF-781: Fixed launchpad.getWigetInfo helper function.

### v2.9.2 - `20/10/2015, 2:12pm`
* bugfix/LF-470-session-hendler-doesn-t-show-the-notification: - Fix notification

### v2.9.1 - `30/09/2015, 3:12pm`
* - additional response format validation is added (lte IE8);
* version bump
* bugfix/LPMAINT-35-ie8-stabilization: - default header is added for old IE

### v2.9.0 - `01/09/2015, 12:07pm`
* LP-223 Add performance module


### v2.8.6 - `14/09/2015, 10:14am`
* LF-68: removed inject preconfigure logic from require-widget in base


### v2.8.5 - `11/09/2015, 2:15pm`
#### Move network event registration to notification widget.
* Export notification submodule used by mobile. Improve offline notification subscription.


### v2.8.1 - `03/09/2015, 3:35pm`
* LF-132: Renamed core lpCoreTemplate API method resolveTemplateSrc to resolvePath


### v2.8.0 - `01/09/2015, 6:06pm`
* bugfix/LF-227-refactor-session-timeout-handler-for: - console.log is removed
* bugfix/LF-227-refactor-session-timeout-handler-for: - bugs are fixed - logout function is changed
* bugfix/LF-227-refactor-session-timeout-handler-for: - log dependency is changed
* bugfix/LF-227-refactor-session-timeout-handler-for: - session handler is moved from trunk to base - session processing is changed


### v2.7.0 - `01/09/2015, 2:28pm`
* LF-177: Add queue module, and event initialisation in startup portal.


### v2.6.4 - `31/08/2015, 3:33pm`
* Fix the exposing the NS as string instead of the launchpad object


### v2.6.3 - `31/08/2015, 1:47pm`
* fix checking the b$ on mobile SDK if is mocked or not with isb$Mocked utility


### v2.6.2 - `28/08/2015, 6:09pm`
#### fix-custom-launchpad-chromes


### v2.6.1 - `26/08/2015, 2:57pm`
#### add tag to info.json for styleguide filtering
* add tag to info.json for styleguide menu filtering


### v2.6.0 - `20/08/2015, 6:47pm`
#### add base modules structures and some utilities from core

### v2.5.0 - `11/08/2015, 9:25am`
#### added new modules to base
* startPortal
* backbase-extention
* session-handler
* update lodash to 3.10.0

### v2.4.3 - `11/08/2015, 5:41pm`
#### Fix model.xml format.
* LF-211: Add model.xml for feature definition.


### v2.4.2 - `11/08/2015, 1:38pm`
#### Add model.xml for feature definition.

### v2.4.1 - `10/08/2015, 6:05pm`
#### Remove repository from bower.json


### v2.4.0 - `28/07/2015, 3:46pm`
#### Support packaging templates into main widget module main.js.


## [2.3.1] - 2015-07-13
 - Prevent deprecation console.warn messages in case if minfied code is used

## [2.2.1] - 2015-06-30
 - configure lpCoreTemplateProvider with template paths from widget proprties

## [2.2.0] - 2015-06-22
 - add base.inject helper function

## [2.1.2] - 2015-06-16
 - add launchpad.getWidgetsInfo() function on global.launchpad NS
 - fix remove deps on base and core in requireWidget function for non angular widgets

## [2.0.0] - 2015-05-12 (note: generated from git logs)

 - use own require-widget function
 - Add jquery as dependency
 - Use one require widget function and load it as script tag
