const path = require('path');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongodb-session')(session);

const varMiddleware = require('./middleware/variables');

const MONGODB_URI = 'mongodb+srv://rion:8QF9WJbiMNsvHTjc@cluster0.bdm1j.mongodb.net/shop';

const app = express();
const hbs = require('express-handlebars').create({
  defaultLayout: 'main',
  extname: 'hbs',
});
const store = new MongoStore({
  collection: 'sessions',
  uri: MONGODB_URI,
});

const homeRoute = require('./routes/home');
const addRoute = require('./routes/add');
const coursesRoute = require('./routes/courses');
const cardRoute = require('./routes/card');
const ordersRoute = require('./routes/orders');
const authRoute = require('./routes/auth');

const User = require('./models/user');

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));

// Указывает, что объект req.body будет содержать значения любого типа, а не только строки
app.use(express.urlencoded({ extended: true }));
app.use(session({
  store,
  secret: 'some string',
  resave: false,
  saveUninitialized: false,
}));
app.use(varMiddleware);


app.use('/', homeRoute);
app.use('/add', addRoute);
app.use('/courses', coursesRoute);
app.use('/card', cardRoute);
app.use('/orders', ordersRoute);
app.use('/auth', authRoute);

start();

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useUnifiedTopology: true,
      useFindAndModify: false,
      useNewUrlParser: true,
    });

    app.listen(3000, () => {
      console.log('Started...');
    });
  }
  catch (error) {
    console.error(error);
  }
}
