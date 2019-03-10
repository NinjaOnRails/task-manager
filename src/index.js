const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT || 3000;

// app.use((req, res, next) => {
//   if (req.method === 'GET') {
//     res.send('GET requests are disabled');
//   } else next();
// });

// app.use((req, res, next) => {
//   res.status(503).send('The site is under maintenance. Please try back soon.');
// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

// const main = async () => {
//   // const task = await Task.findById('5c842045f392320e900ae65f');
//   // await task.populate('owner').execPopulate();
//   // console.log(task.owner);

//   const user = await User.findById('5c841f451b51bd0e722dbe02');
//   await user.populate('tasks').execPopulate();
//   console.log(user.tasks);
// };

// main();
