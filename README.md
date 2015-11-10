# eLearning

## Links

Framapad : https://lite6.framapad.org/p/atl2016-e12-elearning
Google Sheets : https://docs.google.com/spreadsheets/d/1RvT8Yisf4I6zTw3u3PwaiVU_Fisp1x2lrA5AXp8Ckrw/edit#gid=0

## How to use

ssh:
```
$ git clone git@gitlab.com:fknop/ATL3-hapi-learning.git hapi-learning
```

https:
```
$ git clone https://gitlab.com/fknop/ATL3-hapi-learning.git hapi-learning
```

Install dependencies:

```
$ cd hapi-learning
$ npm install
$ cd app/public
$ bower install
```

Start the app: (go back to the root folder)
```
$ npm start
```
or
```
$ node .
```

Start the node tests :

```
$ npm test
```


## Directory Layout

```

Directory Layout :


app/                          --> app folder
    server.js               --> server (node entry point)
    package.json
    routes/                 --> routes folder
        index.js            --> entry point (loads all the routes files and exports them)
        routes1.js          --> file containing routes
        routes2.js
    models/                 --> models folder
        index.js            --> entry point (loads all the models and exports them)
        user.js             --> user model
        course.js           --> course model
    controllers/            --> handlers folder (one file per resource)
        index.js            --> entry point (loads all the handlers and exports them)
        user.js             --> handlers for the user resource
    utils/                  --> utils folder (contains some logic)
    public/                 --> angular app
        index.html          --> entry point for angular app
        scripts/            --> scripts for main module
            app.js
            controllers/    --> controllers for main module
            services/       --> services for main module (factory, service, provider)
            directives/     --> directives for main module
        styles/             --> styles for main module
        views/              --> views for main modules
        test/               --> test folder for main module
        submodules/         --> sub modules for the app
            module1/
                scripts/
                    app.js
                    controllers/
                    services/
                    directives/
                styles/
                views/
                test/   --> test for module1
            module2/
                scripts/
                    app.js
                    controllers/
                    services/
                    directives/
                styles/
                views/
                test/   --> test folder for mudule2
test/                   --> test folder (for the backend)
plugins/                --> plugins that we write ourselves
        plugin1/
            package.json
            test/           --> test folder
            index.js        --> entry point for plugin1
        plugin2/
            package.json
            test/
            index.js        --> entry point for plugin2


```
