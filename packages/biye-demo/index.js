const biyeUI = require('@biye/biye-ui');
const { generateUI, updateUI } = biyeUI;
const { testVal } = require('./test');

function test() {
  console.log(testVal, 'testVal');
}

module.exports = {
  generateUI,
  updateUI,
  test,
};
