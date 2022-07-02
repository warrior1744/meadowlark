npm init <initializer> (set up a new or existing npm package. initializer in this case is an npm package named create-<initializer> which will be installed by npm-exec)

npx kill-port 3000

npm install -g nodemon (A popular utility to automatically restart a Node program when you make changes to the source code)
npx nodemon <*filename.js> (nodemon on js file)
node --version (check node version)

npm install express -g (install express on the repository)

npm install express-handlebars (install express extension for html tools)

npm install --save-dev jest (install Jest)

npm run <*script> (test script)

npm test -- --watch (constantly monitors your code and tests for changes and reruns the automatically)

npm test -- --coverage (   )

npm install --save-dev puppeteer (A controllable, headless version of Chrome.)

npm install --save-dev portfinder (   )

npm install --save-dev eslint (   )

./node_modeules/.bin/eslint --init (initialize ESLint configuration)

npm install node-fetch

npm install -g light-server ( install local server)
light-server -s .  (start the server at localhost:4000/ )

npm install body-parser (middleware to parse the URL-encoded body)

npm install cookie-parser (chapter09 )

npm install express-session (chapter09)

npm install nodemailer (chapter11)

npm install morgan (chapter12 most common logging middleware)

npm install fs (chapter12 install file system)

export NODE_ENV=production  (switch to production mode, default is development mode)

npm install -g forever (install process manager)

forever start project.js  or forever start npx nodemon project.js

install -g artillery (install stress test module)

npm install mongoose (chapter13, install mongodb module)

npm install pg (chapter13, install postgreSQL module)

npm install lodash (chapter13, odash makes JavaScript easier by taking the hassle out of working with arrays, numbers, objects, strings, etc.)

npm install connect-redis (chapter13, connect-redis provides Redis session storage for Express.)

npm install ioredis (chapter13, redis client module)

npm install vhost (domain-aware routing middleware)


** run server in production mode or development mode

$ export NODE_ENV=production
$ node meadowlark.js




*** heroku deployment

0. add this json setup to the package.json

"engines": {
    "npm": "8.3.1",
    "node": "^16.14.0"
  },


1. install heroku cli

Cli commands

2. heroku --version
3. heroku login
4. heroku create meadowlark1984

create Procfile to the roof of the project folder

5. web: node meadowlark.js

Cli commands

6. git add .
7. git commit -m 'ready to deploy'
8. heroku git:remote -a meadowlark1984
9. git push heroku master
10. heroku logs --tail    (for checking errors)



$ heroku config:set USE_NPM_INSTALL=true -a <Your app name>
$ heroku config:set NODE_MODULES_CACHE=false -a <Your app name>

