const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

const userOne = {
  name: 'Jonny',
  email: 'jonny@apple.com',
  password: 'ihavethebestdesign'
};

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test('Should signup a new user', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'Elon',
      email: 'elon@spacex.com',
      password: 'letsgotomars'
    })
    .expect(201);
});

test('Should login existing user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200);
});

test('Should not login non-existent user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: 'feowjjfvewf'
    })
    .expect(400);
});

// test('Should not login non-existent user', async () => {
//   await request(app)
//     .post('/users/login')
//     .send({
//       email: 'asdiojfiewj@kfejklw.efa',
//       password: 'jfoiewjfowae'
//     })
//     .expect(400);
// });
