const { Schema, model } = require('mongoose');

const user = new Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  cart: {
    items: [{
      count: {
        type: Number,
        required: true,
        default: 1,
      },
      courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
      },
    }],
  },
});

user.methods.addToCart = async function(course) {
  const items = [...this.cart.items];

  const index = items.findIndex((item) => (
    item.courseId.toString() === course._id.toString()
  ));

  if (index >= 0) {
    items[index].count += 1;
  }
  else {
    items.push({
      courseId: course._id,
      count: 1,
    });
  }

  this.cart = { items };

  return this.save();
}

user.methods.removeFromCart = async function(id) {
  let items = [...this.cart.items];

  const index = items.findIndex((item) => (
    item.courseId.toString() === id
  ));

  if (items[index].count === 1) {
    items = items.filter((item) => (
      item.courseId.toString() !== id
    ));
  }
  else {
    items[index].count -= 1;
  }

  this.cart = { items };

  return this.save();
}

user.methods.clearCart = async function() {
  this.cart = { items: [] };
  return this.save();
}

module.exports = model('User', user);
