const { Router } = require('express');

const User = require('../models/user');
const auth = require('../middleware/auth');

const router = Router();

router.get('/', auth, async (request, response) => {
  response.render('profile', {
    title: 'Профиль',
    isProfile: true,
    user: request.user.toObject(),
  });
});

router.post('/', auth, async (request, response) => {
  try {
    const user = await User.findById(request.user._id);

    const toChange = {
      name: request.body.name,
    };
    
    console.log('request.file', request.file);

    if (request.file) {
      toChange.avatarUrl = request.file.path;
    }

    Object.assign(user, toChange);

    await user.save();

    response.redirect('/profile');
  }
  catch (error) {
    console.error('catch error', error);
  }
});

module.exports = router;
