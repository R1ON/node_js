const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const hbs = require('express-handlebars').create({
  defaultLayout: 'main',
  extname: 'hbs',
});

const homeRoute = require('./routes/home');
const addRoute = require('./routes/add');
const coursesRoute = require('./routes/courses');
const cardRoute = require('./routes/card');

const User = require('./models/user');

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(async (request, response, next) => {
  try {
    request.user = await User.findById('60e4abef9bebe54e21cccc61');
    next();
  }
  catch (error) {
    console.error(error);
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use('/', homeRoute);
app.use('/add', addRoute);
app.use('/courses', coursesRoute);
app.use('/card', cardRoute);


start();

async function start() {
  const URL = 'mongodb+srv://rion:8QF9WJbiMNsvHTjc@cluster0.bdm1j.mongodb.net/shop';

  try {
    await mongoose.connect(URL, {
      useUnifiedTopology: true,
      useFindAndModify: false,
      useNewUrlParser: true,
    });

    const candidate = await User.findOne();

    if (!candidate) {
      const user = new User({
        email: 'hello@yandex.ru',
        name: 'Roman',
        cart: { items: [] },
      });

      await user.save();
    }

    app.listen(3000, () => {
      console.log('Started...');
    });
  }
  catch (error) {
    console.error(error);
  }
}
