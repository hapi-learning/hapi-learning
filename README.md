# eLearning

## How to use

ssh:
```
$ git clone git@gitlab.com:fknop/ATL3-hapi-learning.git hapi-learning
```

https:
```
$ git clone https://gitlab.com/fknop/ATL3-hapi-learning.git hapi-learning
```

Create a .env file in the root folder and change the options below:

```
# Connections

WEB_HOST=localhost
WEB_PORT=8080
WEB_CORS=true

API_HOST=localhost
API_PORT=8088
API_CORS=true

# DB

DB_DIALECT=sqlite
DB_STORAGE=database.sqlite

# For PostgreSQL, MySQL, SQLServer.
# DB_NAME
# DB_USERNAME
# DB_PASSWORD
# DB_HOST

# Storage

# Where to store the storage folder, by default in the app folder
# STORAGE_PATH

# Others

AUTH_KEY=9FDS954QLBNQbraF9K9yBJZ0I95CR8269FDS954QLBNQbraF9K9yBJZ0I95CR826

# Maximum size of files to upload in bytes
UPLOAD_MAX=20970000

# The expiration time of the token
TOKEN_EXP=7200

#Mails
SENDGRID_KEY= # ADD SENDGRID KEY
OFFICIAL_EMAIL_ADDRESS= # ADD SENDGRID MAIL

```



Start the app: (go back to the root folder)
```
$ npm start
```

npm start installs the dependencies.

Start the node tests :

```
$ npm test
```

## Hapi-pagination

Plugin hapi-pagination (not for the course) : https://github.com/fknop/hapi-pagination

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
