const bcrypt = require('bcryptjs');
const { body } = require('express-validator');

const User = require('../models/user');

// Auth
exports.registerValidators = [
  body('email', 'Введите корректный email')
    .isEmail()
    .custom(async (value) => {
      try {
        const candidate = await User.findOne({ email: value });

        if (candidate) {
          return Promise.reject('Такой email уже занят');
        }
      }
      catch (error) {
        console.error('catch error', error);
      }
    })
    .normalizeEmail(),

  body('password', 'Пароль должен быть мин. 3 символов')
    .isLength({ min: 3, max: 56 })
    .isAlphanumeric()
    .trim(),

  body('confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Пароли не совпадают');
      }

      return true;
    })
    .trim(),

  body('name', 'Имя должно быть мин. 2 символа')
    .isLength({ min: 2 })
    .trim(),
];

exports.loginValidators = [
  body('email', 'Введите корректный email')
    .isEmail()
    .custom(async (value) => {
      try {
        const candidate = await User.findOne({ email: value });

        if (!candidate) {
          return Promise.reject('Пользователь не найден');
        }
      }
      catch (error) {
        console.error('catch error', error);
      }
    })
    .normalizeEmail(),

  body('password', 'Пароль должен быть мин. 3 символов')
    .isLength({ min: 3, max: 56 })
    .isAlphanumeric()
    .custom(async (value, { req }) => {
      try {
        const candidate = await User.findOne({ email: req.body.email });
        const areSame = await bcrypt.compare(value, candidate.password);

        if (!areSame) {
          return Promise.reject('Неверный пароль');
        }
      }
      catch (error) {
        console.error('catch error', error);
      }
    })
    .trim(),
];

// Add
exports.courseValidators = [
  body('title', 'Минимальная длина 3 символа')
    .isLength({ min: 3 })
    .trim(),

  body('price', 'Цена должна быть числом')
    .isNumeric(),

  body('image', 'Введите корректный url')
    .isURL(),
];