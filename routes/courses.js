const { Router } = require('express');
const Course = require('../models/course');

const router = Router();

router.get('/', async (request, response) => {
  const courses = await Course.getAll();

  response.render('courses', {
    title: 'Курсы',
    isCourses: true,
    courses,
  });
});

router.get('/:id/edit', async (request, response) => {
  if (!request.query.allow) {
    return response.redirect('/');
  }

  const course = await Course.getById(request.params.id);

  response.render('editCourse', {
    title: `Изменить курс ${course.title}`,
    course,
  });
});

router.get('/:id', async (request, response) => {
  const course = await Course.getById(request.params.id);

  response.render('course', {
    title: `Курс ${course.title}`,
    layout: 'empty',
    course,
  });
});

router.post('/edit', async (request, response) => {
  response.redirect('/courses');
  await Course.update(request.body);
});

module.exports = router;
