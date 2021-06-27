const path = require('path');
const fs = require('fs');

const pathToCardJSON = path.join(
  path.dirname(require.main.filename),
  'data',
  'card.json'
);

class Card {
  static async add(course) {
    const card = await Card.fetch();

    const index = card.courses.findIndex((cardCourse) => cardCourse.id === course.id);
    const candidate = card.courses[index];

    if (candidate) {
      candidate.count += 1;
      card.courses[index] = candidate;
    }
    else {
      course.count = 1;
      card.courses.push(course);
    }

    card.price += parseFloat(course.price);

    return new Promise((resolve, reject) => {
      fs.writeFile(pathToCardJSON, JSON.stringify(card), (error) => {
        if (error) {
          reject(error);
        }
        else {
          resolve();
        }
      });
    });
  }

  static async fetch() {
    return new Promise((resolve, reject) => {
      fs.readFile(pathToCardJSON, 'utf-8', (error, data) => {
        if (error) {
          reject(error);
        }
        else {
          resolve(JSON.parse(data));
        }
      });
    });
  }
}

module.exports = Card;
