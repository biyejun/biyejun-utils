const { sayHi: sayHi2 } = require('@biye/biye-utils')

function sayHi(name) {
  console.log(`hello ${name} from biye-test2`);
}

function dd() {
  console.log('新版发布 hhhh');
}

module.exports = {
  sayHi,
  sayHi2
}