# Widget Chrome Templates
Chrome templates used by launchpad widgets

## Information
|  name |  version |  bundle |
|--|:--:|--:|
|  chrome-templates |  1.0.3 |  Universal |

## Usage example
### Using widget model
Define property widgetChrome in the widget model.xml

```
    <property label="Widget Chrome" name="widgetChrome" viewHint="select-one,admin,designModeOnly">
        <value type="string">$(contextRoot)/static/features/[BBHOST]/chromes/blank/chrome-blank.html</value>
    </property>
```
### Using uiEditingOptions
Define your chromes in the uiEditingOptions

```
    widgetPreferenceSelections:{
        widgetChrome:[
            {label: "No Chrome", value: "$(contextRoot)/static/backbase.com.2012.aurora/html/chromes/widget_none.html"},
            {label: "Default Chrome", value: "$(contextRoot)/static/backbase.com.2012.aurora/html/chromes/widget_default.html"}
        ]
    },
```
### Using g:preference
TBA

