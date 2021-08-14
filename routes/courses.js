const { Router } = require('express');

const Course = require('../models/course');
const auth = require('../middleware/auth');

const router = Router();

router.get('/', async (request, response) => {
  const courses = await Course
    .find()
    .populate('userId', 'email name').lean();

  response.render('courses', {
    title: 'Курсы',
    isCourses: true,
    courses,
  });
});

router.get('/:id/edit', auth, async (request, response) => {
  if (!request.query.allow) {
    return response.redirect('/');
  }

  const course = await Course.findById(request.params.id).lean();

  response.render('editCourse', {
    title: `Изменить курс ${course.title}`,
    course,
  });
});

router.get('/:id', async (request, response) => {
  const course = await Course.findById(request.params.id).lean();

  response.render('course', {
    title: `Курс ${course.title}`,
    layout: 'empty',
    course,
  });
});

router.post('/edit', auth, async (request, response) => {
  const { id, ...body } = request.body;

  await Course.findByIdAndUpdate(id, body);
  response.redirect('/courses');
});

router.post('/remove', auth, async (request, response) => {
  try {
    await Course.deleteOne({ _id: request.body.id });
    response.redirect('/courses');
  }
  catch (error) {
    console.error(error);
  }
});

module.exports = router;
