const num1 = Number(process.argv[2]);
const num2 = Number(process.argv[3]);
const operation = process.argv[4];

const operations = {
  add: require('./add'),
  subtract: require('./subtract'),
  multiply: require('./multiply'),
  divide: require('./divide'),
};

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

const fn = operations[operation];
if (!fn) {
  console.error(
    `Неизвестная операция: ${operation}. Доступны: add, subtract, multiply, divide.`,
  );
  process.exit(1);
}

try {
  console.log(fn(num1, num2));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
