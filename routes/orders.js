const { Router} = require('express');
const router = Router();

const Order = require('../models/order');
const auth = require('../middleware/auth');

router.get('/', auth, async (request, response) => {
  try {
    const orders = await Order.find({
      'user.userId': request.user._id,
    }).populate('user.userId');

    const transformedOrders = orders.map((order) => ({
      ...order.toJSON(),
      price: order.courses.reduce((acc, item) => {
        return acc += item.count * item.course.price;
      }, 0),
    }));

    response.render('orders', {
      title: 'Заказы',
      isOrder: true,
      orders: transformedOrders,
    });
  }
  catch (error) {
    console.error(error);
  }
});

router.post('/', auth, async (request, response) => {
  try {
    const user = await request.user.populate('cart.items.courseId').execPopulate();

    const courses = user.cart.items.map((item) => ({
      count: item.count,
      course: item.courseId.toJSON(),
    }));

    const order = new Order({
      user: {
        userId: request.user,
        name: request.user.name,
      },
      courses,
    });

    await order.save();
    await request.user.clearCart();

    response.redirect('/orders');
  }
  catch (error) {
    console.error(error);
  }
});

module.exports = router;
