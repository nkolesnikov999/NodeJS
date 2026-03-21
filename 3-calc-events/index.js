const { EventEmitter } = require('events');

const calcEmitter = new EventEmitter();

const add = require('./add');
const subtract = require('./subtract');
const multiply = require('./multiply');
const divide = require('./divide');

const operationToEvent = {
  add: 'Add',
  subtract: 'Subtract',
  multiply: 'Multiply',
  divide: 'Divide',
};

calcEmitter.on('Add', (a, b) => {
  calcEmitter.emit('result', add(a, b));
});

calcEmitter.on('Subtract', (a, b) => {
  calcEmitter.emit('result', subtract(a, b));
});

calcEmitter.on('Multiply', (a, b) => {
  calcEmitter.emit('result', multiply(a, b));
});

calcEmitter.on('Divide', (a, b) => {
  try {
    calcEmitter.emit('result', divide(a, b));
  } catch (err) {
    calcEmitter.emit('operationError', err.message);
  }
});

calcEmitter.on('result', (value) => {
  console.log(value);
});

calcEmitter.on('operationError', (message) => {
  console.error(message);
  process.exit(1);
});

const num1 = Number(process.argv[2]);
const num2 = Number(process.argv[3]);
const operation = process.argv[4];

if (process.argv.length < 5) {
  console.error(
    'Использование: node index.js <число1> <число2> <операция>',
  );
  process.exit(1);
}

if (Number.isNaN(num1) || Number.isNaN(num2)) {
  console.error('Первые два аргумента должны быть числами.');
  process.exit(1);
}

const eventName = operationToEvent[operation];
if (!eventName) {
  console.error(
    `Неизвестная операция: ${operation}. Доступны: add, subtract, multiply, divide.`,
  );
  process.exit(1);
}

calcEmitter.emit(eventName, num1, num2);
