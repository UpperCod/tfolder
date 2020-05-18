let { prompts } = require("../utils");
const questions = [
  {
    type: "text",
    name: "title",
    message: "What is your GitHub username?",
  },
];

module.exports = function () {
  return prompts(questions);
};
