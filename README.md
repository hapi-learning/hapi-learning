[![Build Status](https://travis-ci.org/fknop/hapi-learning.svg)](https://travis-ci.org/fknop/hapi-learning)
[![Dependency Status](https://david-dm.org/fknop/hapi-learning.svg)](https://david-dm.org/fknop/hapi-learning)

# hapi-learning 

*The master branch is not stable at the moment.* 

[![Join the chat at https://gitter.im/fknop/hapi-learning](https://badges.gitter.im/fknop/hapi-learning.svg)](https://gitter.im/fknop/hapi-learning?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Building an e-learning platform with HapiJS and AngularJS

## Documentation

You can find the API documentation [here](http://fknop.github.io/hapi-learning-docs)

## How to use

### 1. requirements

+ **Node >= v4** : available on [Node.js](https://nodejs.org/en/)** beware of old version on `apt` repositories
+ **npm** (*comes with node but you can update it* : `(sudo) npm install -g npm`)
+ **bower** (*used for frontend libs*) : `(sudo) npm install -g bower`
+ **git** (*to clone this repo*) : available on [https://git-scm.com/](https://git-scm.com/) or avaible with `apt` and alternatives.

### 2. Clone the project

ssh:
```
$ git clone git@github.com:fknop/hapi-learning.git hapi-learning
```

https:
```
$ git clone https://github.com/fknop/hapi-learning.git hapi-learning
```

### 3. Configure your environments variables

Create a `.env` file in the root folder and change the options below:

```
# Connections

WEB_HOST=localhost
WEB_PORT=8080
WEB_CORS=true

API_HOST=localhost
API_PORT=8088
API_CORS=true

# Database : will be created in root folder

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

#Add your own auth key (key used to generate the token)
AUTH_KEY=9FDS954QLBNQbraF9K9yBJZ0I95CR8269FDS954QLBNQbraF9K9yBJZ0I95CR826

# Maximum size of files to upload in bytes
UPLOAD_MAX=20970000

# The expiration time of the token
TOKEN_EXP=7200

#Mails
SENDGRID_KEY= # ADD SENDGRID KEY
OFFICIAL_EMAIL_ADDRESS= # ADD SENDGRID MAIL

```

### 4. Start the app 

```
$ npm start
```

npm start will install the dependencies `npm install` and `bower install` in the prestart script.


### 4(alternative). Arguments on startup

You can run server using `node`

* -P (--prod) : start the server in production mode, will be using gulp dist directory instead of public
* -f (--flush) : deletes database and the storage folder 
* -v (--verbose) : verbose mode for logging

*Exemple* : 

```
$ node . -fv
```
or
```
$ npm start -- -fv
```

## The tests

There is an alternative database created for tests, you will find it in root folder.

```
$ npm test
```


## Directory Layout

```

Directory Layout :


app/                        --> app folder
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
    storage/                --> uploaded files come here
    public/                 --> angular app
        index.html          --> entry point for angular app
        favicons/           --> differents favicons
        lib/                --> lib folder (bower components come here)
        scripts/            --> scripts for main module
            app.js          --> Angular main app configuration
            controllers/    --> controllers for main module
            services/       --> services for main module (factory, service, provider)
            directives/     --> directives for main module
        templates/          --> every HTML templates used in scripts/directives/
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
                test/       --> test for module1
            module2/
                scripts/
                    app.js
                    controllers/
                    services/
                    directives/
                styles/
                views/
                test/       --> test folder for mudule2
                
test/                       --> test folder (for the backend)

plugins/                    --> plugins that we write ourselves
        plugin1/
            package.json
            test/           --> test folder
            index.js        --> entry point for plugin1
        plugin2/
            package.json
            test/
            index.js        --> entry point for plugin2


```

## License

[See licence document inside this repo](LICENSE)

## Notes

+ The hapi-permissions plugins is still in development, and not used in the project yet.
+ You can find `hapi-pagination` on [github](https://github.com/fknop/hapi-pagination) or [npm](https://www.npmjs.com/package/hapi-pagination)

## Thanks

+ Thanks to everyone in the team, we hope this project will grow ideas inside students' head.
+ Thanks to every contributosr
