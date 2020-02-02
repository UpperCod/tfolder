import sade from "sade";
import template from "./tfolder";

sade("tfolder <src> <dest>")
  .version("PKG.VERSION")
  .option("-f, --force", "force writing of existing files", false)
  .option(
    "-d, --data",
    "allows you to enter data to share with the json format template",
    "{}"
  )
  .example("tfolder ./a ./b")
  .example("tfolder ./a ./b -f")
  .example('tfolder ./a ./b -f -d "{\\"name\\":\\"...data\\"}"')
  .action(async (src, dest = "dist", { data, force }) => {
    await template(src, dest, { data: JSON.parse(data), force });
    console.log(`successful copy, check directory \`${dest}\``);
  })
  .parse(process.argv);
