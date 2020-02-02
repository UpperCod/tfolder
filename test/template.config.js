import prompts from "prompts";

const questions = [
  {
    type: "text",
    name: "title",
    message: "What is your GitHub username?"
  }
];

export default function() {
  return prompts(questions);
}
