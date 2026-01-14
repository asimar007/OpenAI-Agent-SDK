import "dotenv/config";
import { Agent, run, tool, RunContext } from "@openai/agents";
import { z } from "zod";

interface MyContext {
  userId: string;
  userName: string;
}

const getUserInfo = tool({
  name: "get_user",
  description: "Get The user info",
  parameters: z.object({}),
  execute: async (_, ctx?: RunContext<MyContext>): Promise<string> => {
    return `userId=${ctx?.context.userId} and username=${ctx?.context.userName}`;
  },
});

const customerSupportAgent = new Agent<MyContext>({
  name: "Customer Support Agent",
  instructions: `You are in Expert in Customer Support Agent`,
  tools: [getUserInfo],
});

async function main(q: string, ctx: MyContext) {
  const result = await run(customerSupportAgent, q, {
    context: ctx,
  });
  console.log(result.finalOutput);
}

main("Hey What is my name", {
  userId: "1",
  userName: "Asim",
});
