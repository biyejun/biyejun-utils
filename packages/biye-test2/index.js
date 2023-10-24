const { sayHi: sayHi2 } = require('@biye/biye-utils');

function sayHi(name) {
  console.log(`hello ${name} from biye-test2`);
}

function dd() {
  console.log('新版发布 hhhh');
}

console.log('测试 Performance Improvements 1');

module.exports = {
  sayHi,
  sayHi2,
  dd,
};
