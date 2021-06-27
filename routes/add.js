const { Router } = require('express');
const Course = require('../models/course');

const router = Router();

router.get('/', (request, response) => {
  response.render('add', {
    title: 'Добавить курс',
    isAdd: true,
  });
});

router.post('/', async (request, response) => {
  const { title, price, image } = request.body;

  response.redirect('/courses');

  const course = new Course(title, price, image);
  await course.save();
});

module.exports = router;
