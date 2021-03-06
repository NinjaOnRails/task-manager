const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should signup a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Elon',
      email: 'elon@spacex.com',
      password: 'letsgotomars'
    })
    .expect(201);

  // Assert that the databse was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertions about the response
  // expect(response.body.user.name).toBe('Elon')
  expect(response.body).toMatchObject({
    user: {
      name: 'Elon',
      email: 'elon@spacex.com'
    },
    token: user.tokens[0].token
  });
  expect(user.password).not.toEqual('letsgotomars');

  expect(response.body.token);
});

test('Should not signup a user with invalid name', async () => {
  await request(app)
    .post('/users')
    .send({
      name: '',
      email: 'elon@spacex.com',
      password: 'letsgotomars'
    })
    .expect(400);
  expect(await User.length).toEqual(3);
});

test('Should not signup a user with invalid email', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'Elon',
      email: 'elonspacex.com',
      password: 'letsgotomars'
    })
    .expect(400);
  expect(await User.length).toEqual(3);
});

test('Should not signup a user with invalid password', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'Elon',
      email: 'elon@spacex.com',
      password: 'lets'
    })
    .expect(400);
  expect(await User.length).toEqual(3);
});

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(response.body.token).toEqual(user.tokens[1].token);
});

test('Should not login non-existent user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: 'feowjjfvewf'
    })
    .expect(400);
  expect(response.body).toEqual({});
});

test('Should get profile for user', async () => {
  const response = await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  const user = await User.findById(userOneId);
  expect(response.body._id).toEqual(user._id.toString());
});

test('Should not get profile for unauthenticated user', async () => {
  const response = await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
  expect(response.body).toEqual({ error: 'Please authenticate.' });
});

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
  const user = await User.findById(userOneId);
  expect(user).not.toBeNull();
});

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);
  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user field', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ name: 'George' })
    .expect(200);
  const user = await User.findById(userOneId);
  expect(user.name).toEqual('George');
});

test('Should not update invalid user field', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ location: 'Mordor' })
    .expect(400);
  const user = await User.findById(userOneId);
  expect(user.location).toEqual(undefined);
});

test('Should not update user with invalid name', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ name: '' })
    .expect(400);
  const user = await User.findById(userOneId);
  expect(user.name).not.toEqual('');
});

test('Should not update user with invalid email', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ email: 'jiofawefj' })
    .expect(400);
  const user = await User.findById(userOneId);
  expect(user.email).not.toEqual('jiofawefj');
});

test('Should not update user with invalid password', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ password: 'eijfsadovhjepasswordfjioeravjiao' })
    .expect(400);
  const user = await User.findById(userOneId);
  expect(user.password).not.toEqual('eijfsadovhjepasswordfjioeravjiao');
});

test('Should not update invalid user if unauthenticated', async () => {
  await request(app)
    .patch('/users/me')
    .send({ name: 'John' })
    .expect(401);
  const user = await User.findById(userOneId);
  expect(user.name).not.toEqual('John');
});
