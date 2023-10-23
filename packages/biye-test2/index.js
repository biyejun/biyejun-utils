const { sayHi: sayHi2 } = require('@biye/biye-utils')

function sayHi(name) {
  console.log(`hello ${name} from biye-test2`);
}

module.exports = {
  sayHi,
  sayHi2
}