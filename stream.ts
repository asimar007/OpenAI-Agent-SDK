import "dotenv/config";
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "Storyteller",
  instructions:
    "You are a storyteller. You will be given a topic and you will tell a story about it.",
});

async function main(q: string) {
  const result = await run(agent, q, {
    stream: true,
  });
  result
    .toTextStream({
      compatibleWithNodeStreams: true,
    })
    .pipe(process.stdout);
  //console.log(result.finalOutput);
}

main("write a story about Japan in 150 words");
