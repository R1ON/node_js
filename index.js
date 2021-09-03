const path = require('path');
const express = require('express');
const csrf = require('csurf');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const MongoStore = require('connect-mongodb-session')(session);

// ---

const keys = require('./keys');

const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const fileMiddleware = require('./middleware/file');
const errorMiddleware = require('./middleware/error');

const homeRoute = require('./routes/home');
const addRoute = require('./routes/add');
const coursesRoute = require('./routes/courses');
const cardRoute = require('./routes/card');
const ordersRoute = require('./routes/orders');
const authRoute = require('./routes/auth');
const profileRoute = require('./routes/profile');

// ---

const app = express();
const hbs = require('express-handlebars').create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: require('./utils/hbs-helpers'),
});
const store = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGODB_URI,
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Указывает, что объект req.body будет содержать значения любого типа, а не только строки
app.use(express.urlencoded({ extended: true }));
app.use(session({
  store,
  secret: keys.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(fileMiddleware.single('avatar'));
app.use(csrf());
app.use(flash());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data: https:"],
    },
  },
}));
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);


app.use('/', homeRoute);
app.use('/add', addRoute);
app.use('/courses', coursesRoute);
app.use('/card', cardRoute);
app.use('/orders', ordersRoute);
app.use('/auth', authRoute);
app.use('/profile', profileRoute);
app.use(errorMiddleware);

start();

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useUnifiedTopology: true,
      useFindAndModify: false,
      useNewUrlParser: true,
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log('Started...');
    });
  }
  catch (error) {
    console.error(error);
  }
}
