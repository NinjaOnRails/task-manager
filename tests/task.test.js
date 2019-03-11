const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const {
  userOneId,
  userOne,
  userTwo,
  taskOne,
  setupDatabase
} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'Buy a used Russian rocket'
    })
    .expect(201);
  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
});

test('Should fetch user tasks', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  expect(response.body.length).toEqual(2);
});

test('Should fetch user task by id', async () => {
  const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  expect(response.body._id).toEqual(taskOne._id);
});

test('Should delete user task', async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  const task = await Task.findById(taskOne._id);
  expect(task).toBeNull();
});

test("Should not delete other users' tasks", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);
  // const task = await Task.findById(taskOne._id);
  // expect(task).not.toBeNull();
  // console.log(task);
});

test('Should not delete task if unathenticated', async () => {
  request(app)
    .delete(`/tasks/${taskOne._id}`)
    .send()
    .expect(401);
  // const task = await Task.findById(taskOne._id);
  // expect(task).not.toBeNull();
});

test('Should not create task with invalid description', async () => {
  request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ description: '' })
    .expect(400);
});

test('Should not create task with invalid completed', async () => {
  request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ completed: 1 })
    .expect(400);
});

test("Should not update other useres' task", async () => {
  request(app)
    .patch(`tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({ completed: true })
    .expect(404);
  const task = await Task.findById(taskOne._id);
  expect(task.completed).toEqual(false);
});
