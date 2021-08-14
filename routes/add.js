const { Router } = require('express');
const Course = require('../models/course');
const auth = require('../middleware/auth');

const router = Router();

router.get('/', auth, (request, response) => {
  response.render('add', {
    title: 'Добавить курс',
    isAdd: true,
  });
});

router.post('/', auth, async (request, response) => {
  const { title, price, image } = request.body;

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
