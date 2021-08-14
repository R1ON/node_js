const { Router } = require('express');
const User = require('../models/user');

const router = Router();

router.get('/login', async (request, response) => {
  response.render('auth/login', {
    title: 'Авторизация',
    isLogin: true,
  });
});

router.post('/login', async (request, response) => {
  const user = await User.findById('60e4abef9bebe54e21cccc61');

  request.session.user = user;
  request.session.isAuthenticated = true;

  request.session.save((error) => {
    if (error) {
      throw error;
    }

    response.redirect('/');
  });
});

router.get('/logout', async (request, response) => {
  request.session.destroy(() => {
    response.redirect('/auth/login');
  });
});

module.exports = router;
