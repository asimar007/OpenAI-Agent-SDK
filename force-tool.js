import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

const calculatorTool = tool({
  name: "Calculator",
  description: "Use this tool to answer questions about math problems.",
  parameters: z.object({ question: z.string() }),
  execute: async (input) => {
    console.log("✅ TOOL WAS CALLED!");
  },
});

const agent = new Agent({
  name: "Strict tool user",
  instructions: "Always answer using the calculator tool.",
  tools: [calculatorTool],
  modelSettings: { toolChoice: "auto" },

  //? modelSettings: { toolChoice: "none" },
});

const result = await run(agent, "what is 2+2=?");

console.log(result.finalOutput);
