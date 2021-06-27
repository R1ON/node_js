const { Router } = require('express');

const Card = require('../models/card');
const Course = require('../models/course');

const router = Router();

router.get('/', async (request, response) => {
  const { courses, price } = await Card.fetch();

  response.render('card', {
    title: 'Корзина',
    isCard: true,
    courses,
    price,
  })
});

router.post('/add', async (request, response) => {
  const course = await Course.getById(request.body.id);

  console.log('course', course)

  await Card.add(course);
  response.redirect('/card');
});

router.delete('/remove/:id', async (request, response) => {
  const card = await Card.remove(request.params.id);

  response
    .status(200)
    .json(card);
});

module.exports = router;
