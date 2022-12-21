
// Dependencies
// path module
const path = require('path');
// dotenv file for sensitive configuration information
require('dotenv').config();
// Express.js server
const express = require('express');
// All routes as defined in the controllers folder
const routes = require('./controllers/');
// Sequelize connection to the database
const sequelize = require('./config/connection');
// Handlebars template engine for front-end
const exphbs = require('express-handlebars')
// Express session to handle session cookies
const session = require('express-session')
// Sequelize store to save the session so the user can remain logged in
const SequelizeStore = require('connect-session-sequelize')(session.Store);
// Handlebars helpers
const helpers = require('./utils/helpers');

// Initialize handlebars for the html templates
const hbs = exphbs.create({ helpers });


const sess = {
    secret: 'super secret',
    cookie: { maxAge: 7200000 },
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
      db: sequelize
    })
  };


const app = express();

const PORT = process.env.PORT || 3001;


app.use(express.static(path.join(__dirname, 'public')));


app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session(sess));


app.use(routes);


sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => console.log('Now listening'));
  });