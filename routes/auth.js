const { Router } = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');

const keys = require('../keys');
const User = require('../models/user');

const regEmail = require('../emails/registation');
const resetEmail = require('../emails/reset');

const router = Router();
const transporter = nodemailer.createTransport(sendgrid({
  auth: { api_key: keys.SENDGRID_API_KEY },
}));

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
      await transporter.sendMail(regEmail(email));
    }
  }
  catch(error) {
    console.error(error);
  }
});

router.get('/reset', (request, response) => {
  response.render('auth/reset', {
    title: 'Забыли пароль?',
    error: request.flash('error'),
  });
});

router.post('/reset', (request, response) => {
  try {
    crypto.randomBytes(32, async (error, buffer) => {
      if (error) {
        request.flash('error', 'Что-то пошло не так');
        return response.redirect('/auth/reset');
      }

      const token = buffer.toString('hex');
      const candidate = await User.findOne({ email: request.body.email });

      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + (60 * 60 * 1000); // + 1h

        await candidate.save();
        await transporter.sendMail(resetEmail(candidate.email, token));
        response.redirect('/auth/login');
      }
      else {
        request.flash('error', 'Email не найден');
        response.redirect('/auth/reset');
      }
    });
  }
  catch (error) {
    console.error(error);
  }
});

router.get('/password/:token', async (request, response) => {
  if (!request.params.token) {
    return response.redirect('/auth/login');
  }

  try {
    const user = await User.findOne({
      resetToken: request.params.token,
      resetTokenExp: { $gt: Date.now() }, // $gt (greater than) - больше чем
    });

    if (!user) {
      return response.redirect('/auth/login');
    }

    response.render('auth/password', {
      title: 'Восстановление пароля',
      error: request.flash('error'),
      userId: user._id.toString(),
      token: request.params.token,
    });
  }
  catch (error) {
    console.error(error);
  }
});

router.post('/password', async (request, response) => {
  try {
    const user = await User.findOne({
      _id: request.body.userId,
      resetToken: request.body.token,
      resetTokenExp: { $gt: Date.now() }, // $gt (greater than) - больше чем
    });

    if (!user) {
      request.flash('error', 'Попробуйте еще раз');
      return response.redirect('/auth/login');
    }

    user.resetToken = undefined;
    user.resetTokenExp = undefined;
    user.password = await bcrypt.hash(request.body.password, 10);
    await user.save();

    return response.redirect('/auth/login');
  }
  catch (error) {
    console.error(error);
  }
});

module.exports = router;
