# Launchpad Front End configuration files

# Information

| name                  | version           | bundle           |
| ----------------------|:-----------------:| ----------------:|
| config                | 3.2.3             | Launchpad        |


## Includes

- requirejs.conf.js
- common i18n translations files


## Using reguirejs.conf

Using require.js for local development

- Install a new module

```javascript
paths: {
    ....
        'module-name': path + '/module-ng-sample/'+ dist +'scripts',
    ...
}

packages: [
    ...
    module-name
    ...
 ]
```

- Check the production module from the **dist/** folders 

```
root.launchpad.config = root.launchpad.config || {
    usemin: true
};
```

- Make sure you add the dist folder to repo
