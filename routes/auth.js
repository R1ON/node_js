const { Router } = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/user')

const router = Router();

router.get('/login', async (request, response) => {
  response.render('auth/login', {
    title: 'Авторизация',
    isLogin: true,
    error: request.flash('error'),
  });
});

router.post('/login', async (request, response) => {
  try {
    const { email, password } = request.body;

    const candidate = await User.findOne({ email });

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password);

      if (areSame) {
        request.session.user = candidate;
        request.session.isAuthenticated = true;

        request.session.save((error) => {
          if (error) {
            throw error;
          }

          response.redirect('/');
        });
      }
      else {
        request.flash('error', 'Неверный пароль');
        response.redirect('/auth/login');
      }
    }
    else {
      request.flash('error', 'Пользователь не найден');
      response.redirect('/auth/login');
    }
  }
  catch (error) {
    console.error(error);
  }
});

router.get('/logout', async (request, response) => {
  request.session.destroy(() => {
    response.redirect('/auth/login');
  });
});

router.post('/register', async (request, response) => {
  try {
    const { email, password, name, repeat } = request.body;

    const candidate = await User.findOne({ email });

    if (candidate) {
      request.flash('error', 'Email уже занят');
      response.redirect('/auth/login');
    }
    else {
      const hashPassword = await bcrypt.hash(password, 10);

      const user = new User({
        email,
        name,
        password: hashPassword,
        cart: { items: [] },
      });

      await user.save();

      response.redirect('/auth/login');
    }
  }
  catch(error) {
    console.error(error);
  }
});

module.exports = router;
