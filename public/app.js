const card = document.getElementById('card');

if (card) {
  card.addEventListener('click', (event) => {
    if (event.target.id === 'removeButton') {
      const id = event.target.dataset.id;

      fetch(`/card/remove/${id}`, {
        method: 'delete',
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.courses.length) {
            const html = data.courses.map((course) => (
              `
                <tr>
                  <td>${course.title}</td>
                  <td>${course.count}</td>
                  <td>
                      <button data-id="${course.id}" id="removeButton">Удалить</button>
                  </td>
                </tr>
              `
            )).join('');

            card.querySelector('tbody').innerHTML = html;
            card.querySelector('h3 span').innerHTML = data.price;
          }
          else {
            card.innerHTML = '<p>В корзине ничего нет</p>';
          }
        });
    }
  });
}

const toDate = (date) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(date));
}

document.querySelectorAll('.date').forEach((node) => {
  node.textContent = toDate(node.textContent);
});
