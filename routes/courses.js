const { Router } = require('express');

const Course = require('../models/course');
const auth = require('../middleware/auth');

const router = Router();

router.get('/', async (request, response) => {
  try {
    const courses = await Course
      .find()
      .populate('userId', 'email name').lean();

    response.render('courses', {
      title: 'Курсы',
      isCourses: true,
      userId: request.user ? request.user._id.toString() : null,
      courses: courses.map((course) => ({
        ...course,
        userId: {
          ...course.userId,
          _id: course.userId._id.toString(),
        }
      })),
    });
  }
  catch (error) {
    console.error(error);
  }
});

router.get('/:id/edit', auth, async (request, response) => {
  if (!request.query.allow) {
    return response.redirect('/');
  }

  try {
    const course = await Course.findById(request.params.id).lean();

    if (!isOwner(course, request)) {
      return response.redirect('/courses');
    }

    response.render('editCourse', {
      title: `Изменить курс ${course.title}`,
      course,
    });
  }
  catch (error) {
    console.error(error);
  }
});

router.get('/:id', async (request, response) => {
  try {
    const course = await Course.findById(request.params.id).lean();

    response.render('course', {
      title: `Курс ${course.title}`,
      layout: 'empty',
      course,
    });
  }
  catch(error) {
    console.error(error);
  }
});

router.post('/edit', auth, async (request, response) => {
  try {
    const { id, ...body } = request.body;

    const course = await Course.findById(id);

    if (!isOwner(course, request)) {
      return response.redirect('/courses');
    }

    Object.assign(course, body);

    await course.save();
    response.redirect('/courses');
  }
  catch (error) {
    console.error(error);
  }
});

router.post('/remove', auth, async (request, response) => {
  try {
    await Course.deleteOne({
      _id: request.body.id,
      userId: request.user._id,
    });
    response.redirect('/courses');
  }
  catch (error) {
    console.error(error);
  }
});

function isOwner(course, request) {
  return course.userId.toString() === request.user._id.toString();
}

module.exports = router;
