import "dotenv/config";
import { Agent, run } from "@openai/agents";

const helloAgent = new Agent({
  name: "Hello Agent",
  instructions: "You are an Agent that always say Hello World with user name",
});

const result = await run(helloAgent, "Hey There, My name is Asim Sk");
console.log(result.state._currentStep.output);
