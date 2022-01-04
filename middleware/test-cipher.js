const utils = require("../utils");

const alpha =
  "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890!@#$%^&*()";
const aa = [...alpha];

const rotateArray = function ([...nums], k) {
  for (let i = 0; i < k; i++) {
    nums.unshift(nums.pop());
  }
  return nums;
};

const bb = rotateArray(aa, 5);
// console.log(aa);
// console.log(bb);

// const encrypt = function ([...pass], encrypt) {
//   const [na, nb] = encrypt ? [[...aa], [...bb]] : [[...bb], [...aa]];

//   const ePass = pass.map((l) => {
//     const index = na.indexOf(l);
//     return nb[index];
//   });
//   return ePass;
// };

// console.log(encrypt("pass999", true));
// console.log(encrypt("tyuu444"));

module.exports = {
  encrypt([...pass], encrypt) {
    const [na, nb] = encrypt ? [[...aa], [...bb]] : [[...bb], [...aa]];

    const ePass = pass.map((l) => {
      const index = na.indexOf(l);
      return nb[index];
    });
    return ePass;
  },
};
