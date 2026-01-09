import "dotenv/config";
import { Agent, run, InputGuardrailTripwireTriggered } from "@openai/agents";
import { z } from "zod";

const mathInputAgent = new Agent({
  name: "Math Input Ai Agent for Guardrail",
  instructions:
    "Check if the user is asking you to do their math equation or not.",
  outputType: z.object({
    isValidMathQuestion: z.boolean().describe("If the question math or not"),
    reasoning: z.string().optional().describe("reject reason"),
  }),
});

const mathInputGuardrail = {
  name: "math ai agent input guardrail",
  execute: async ({ input }) => {
    console.log(input);
    const result = await run(mathInputAgent, input);
    return {
      outputInfo: result.finalOutput.reasoning,
      //   tripwireTriggered: result.finalOutput.isValidMathQuestion ? false : true,
      tripwireTriggered: !result.finalOutput.isValidMathQuestion,
    };
  },
};

const mathAgent = new Agent({
  name: "Math Agent",
  instructions: "you are in Expert in Math AI Agent",
  inputGuardrails: [mathInputGuardrail],
});

// const result = await run(mathAgent, "What is const keyword");

// console.log(result.finalOutput);

async function main(q = "") {
  try {
    const result = await run(mathAgent, q);
    console.log(result.finalOutput);
  } catch (e) {
    if (e instanceof InputGuardrailTripwireTriggered) {
      console.log(e.message);
    }
  }
}

main("Write a poem");
