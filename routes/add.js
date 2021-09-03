const { Router } = require('express');
const { validationResult } = require('express-validator');

const Course = require('../models/course');
const auth = require('../middleware/auth');
const { courseValidators } = require('../utils/validators');

const router = Router();

router.get('/', auth, (request, response) => {
  response.render('add', {
    title: 'Добавить курс',
    isAdd: true,
  });
});

router.post('/', auth, courseValidators, async (request, response) => {
  const { title, price, image } = request.body;

  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(422).render('add', {
      title: 'Добавить курс',
      isAdd: true,
      error: errors.array()[0].msg,
      data: {
        title, price, image,
      },
    });
  }

  const course = new Course({
    title,
    price,
    image,
    userId: request.user,
  });

  try {
    await course.save();
    response.redirect('/courses');
  }
  catch (error) {
    console.error(error);
  }
});

module.exports = router;
