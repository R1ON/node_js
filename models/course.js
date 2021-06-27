const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Course {
  constructor(title, price, image) {
    this.title = title;
    this.price = price;
    this.image = image;

    this.id = uuidv4();
  }

  async save() {
    const courses = await Course.getAll();

    courses.push(this.toJSON());

    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(__dirname, '..', 'data', 'courses.json'),
        JSON.stringify(courses),
        (error) => {
          if (error) {
            reject(error);

            resolve()
          }
        },
      );
    });
  }

  toJSON() {
    const { title, price, image, id } = this;

    return { title, price, image, id };
  }

  static async update(updatingCourse) {
    const courses = await Course.getAll();

    const updatedCourses = courses.map((course) => (
      course.id === updatingCourse.id
        ? updatingCourse
        : course
    ));

    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(__dirname, '..', 'data', 'courses.json'),
        JSON.stringify(updatedCourses),
        (error) => {
          if (error) {
            reject(error);

            resolve()
          }
        },
      );
    });
  }

  static getAll() {
    return new Promise((resolve, reject) => {
      fs.readFile(
        path.join(__dirname, '..', 'data', 'courses.json'),
        'utf-8',
        (error, data) => {
          if (error) {
            reject(error);
          }

          resolve(JSON.parse(data));
        },
      );
    });
  }

  static async getById(id) {
    const courses = await Course.getAll();

    return courses.find((course) => course.id === id);
  }
}

module.exports = Course;
