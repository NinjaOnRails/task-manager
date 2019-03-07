const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api', {
  useNewUrlParser: true,
  useCreateIndex: true
});

const Task = mongoose.model('Task', {
  description: {
    type: String
  },
  completed: {
    type: Boolean
  }
});

// const myTask = new Task({
//   description: 'Buy eggs',
//   completed: false
// });

// myTask
//   .save()
//   .then(() => {
//     console.log(myTask);
//   })
//   .catch(error => {
//     console.log('Error', error);
//   });

const User = mongoose.model('User', {
  name: {
    type: String
  },
  age: {
    type: Number
  }
});

// const me = new User({
//   name: 'Rick',
//   age: 'jewaoifjs'
// });

// me.save()
//   .then(() => {
//     console.log(me);
//   })
//   .catch(error => {
//     console.log('Error', error);
//   });
