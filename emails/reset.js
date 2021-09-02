const keys = require('../keys');

module.exports = function(to, token) {
  return {
    to,
    from: keys.EMAIL_FROM,
    subject: 'Восстановление пароля',
    html: `
      <h1>Вы забыли пароль?</h1>
      <p>Чтобы восстановить, перейдите по ссылке</p>
      <a href="${keys.BASE_URL}/auth/password/${token}">Восстановить пароль</a>
    `,
  };
}
