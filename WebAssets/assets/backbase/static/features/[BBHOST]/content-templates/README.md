# Content templates
Advanced content widget shared templates

## Information
|  name |  version |  bundle |
|--|:--:|--:|
|  content-templates |  2.2.0 |  Universal |

## Usage example
### Using widget model
Define property widgetChrome in the widget model.xml

```
    <property label="Content Template" name="templateUrl" viewHint="select-one,admin,designModeOnly">
        <value type="string">$(contextRoot)/static/features/[BBHOST]/content-templates/templates/promo-banner.html</value>
    </property>
```
### Using g:preference
```
    <g:preferences>
        <g:preference name="templateUrl" label="Content Template" type="select-one" default="$(contextRoot)/static/features/[BBHOST]/content-templates/templates/text.html">
            <g:enumeration label="Image" value="$(contextRoot)/static/features/[BBHOST]/content-templates/templates/image.html" />
            <g:enumeration label="Text" value="$(contextRoot)/static/features/[BBHOST]/content-templates/templates/text.html" />
            <g:enumeration label="Promo Banner" value="$(contextRoot)/static/features/[BBHOST]/content-templates/templates/promo-banner.html" />
        </g:preference>
    </g:preferences>
```
