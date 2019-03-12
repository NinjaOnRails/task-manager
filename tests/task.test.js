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

test('Should not create task with invalid description', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ description: '' })
    .expect(400);
  const task = await Task.findById(response.body._id);
  expect(task).toBeNull();
});

test('Should not create task with invalid completed', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ completed: 1 })
    .expect(400);
  const task = await Task.findById(response.body._id);
  expect(task).toBeNull();
});

test('Should fetch user tasks', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  expect(response.body.length).toEqual(3);
});

test('Should fetch user task by id', async () => {
  const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  expect(response.body._id).toEqual(taskOne._id.toString());
});

test('Should not fetch user task by id if unauthenticated', async () => {
  const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .send()
    .expect(401);
  expect(response.body._id).toEqual(undefined);
});

test("Should not fetch other users' task by id", async () => {
  const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(500);
  expect(response.body._id).toEqual(undefined);
});

test('Should fetch only completed tasks', async () => {
  const response = await request(app)
    .get(`/tasks/?completed=true`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  response.body.forEach(task => {
    expect(task.completed).toEqual(true);
  });
});

test('Should fetch only incompleted tasks', async () => {
  const response = await request(app)
    .get(`/tasks/?completed=false`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  response.body.forEach(task => {
    expect(task.completed).toEqual(false);
  });
});

test('Should sort tasks by description descending', async () => {
  const response = await request(app)
    .get(`/tasks/?sortBy=description:desc`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  const tasks = [...response.body];
  expect(response.body).toEqual(
    tasks.sort((a, b) => (a.description < b.description ? 1 : -1))
  );
});

test('Should sort tasks by description ascending', async () => {
  const response = await request(app)
    .get(`/tasks/?sortBy=description:asc`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  const tasks = [...response.body];
  expect(response.body).toEqual(
    tasks.sort((a, b) => (a.description > b.description ? 1 : -1))
  );
});

test('Should sort tasks by incompleted', async () => {
  const response = await request(app)
    .get(`/tasks/?sortBy=completed`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  const tasks = [...response.body];
  expect(response.body).toEqual(
    tasks.sort((a, b) => (a.completed >= b.completed ? 1 : -1))
  );
  // console.log(response.body);
  // console.log(tasks.sort((a, b) => (a.description >= b.description ? 1 : -1)));
});

// test('Should sort tasks by created at ascending', async () => {
//   const response = await request(app)
//     .get(`/tasks/?sortBy=createdAt`)
//     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//     .send()
//     .expect(200);
//   const tasks = [...response.body];
//   expect(response.body).toEqual(
//     tasks.sort((a, b) => (a.createdAt >= b.createdAt ? 1 : -1))
//   );
//   console.log(response.body);
//   console.log(tasks.sort((a, b) => (a.createdAt >= b.createdAt ? 1 : -1)));
// });

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
  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});

test('Should not delete task if unathenticated', async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .send()
    .expect(401);
  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});

test("Should not update other useres' task", async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({ completed: true })
    .expect(404);
  const task = await Task.findById(taskOne._id);
  expect(task.completed).toEqual(false);
});

test('Should not update task with invalid description', async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ description: '' })
    .expect(400);
  const task = await Task.findById(taskOne._id);
  expect(task.description).toEqual('First task');
});

test('Should not update task with invalid completed', async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ completed: 8 })
    .expect(400);
  const task = await Task.findById(taskOne._id);
  expect(task.completed).toEqual(false);
});
