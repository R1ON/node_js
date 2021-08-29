const { Router } = require('express');

const Course = require('../models/course');
const auth = require('../middleware/auth');

const router = Router();

router.get('/', auth, async (request, response) => {
  const user = await request.user.populate('cart.items.courseId').execPopulate();

  const courses = mapCartItems(user.cart.items);

  response.render('card', {
    title: 'Корзина',
    isCard: true,
    courses,
    price: computePrice(courses),
  })
});

router.post('/add', auth, async (request, response) => {
  const course = await Course.findById(request.body.id);

  await request.user.addToCart(course);
  response.redirect('/card');
});

router.delete('/remove/:id', auth, async (request, response) => {
  await request.user.removeFromCart(request.params.id);

  const user = await request.user.populate('cart.items.courseId').execPopulate();
  const courses = mapCartItems(user.cart.items);

  response
    .status(200)
    .json({
      courses,
      price: computePrice(courses),
    });
});

// --- utils

function mapCartItems(cart) {
  return cart.map((item) => ({
    ...item.courseId.toJSON(),
    id: item.courseId.id,
    count: item.count,
  }));
}

function computePrice(courses) {
  return courses.reduce((acc, item) => {
    return acc += item.price * item.count;
  }, 0);
}

// ---

module.exports = router;
