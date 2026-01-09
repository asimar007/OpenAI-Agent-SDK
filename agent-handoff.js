import "dotenv/config";
import { Agent, tool, run } from "@openai/agents";
import { z } from "zod";
import fs from "node:fs/promises";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";

const fetchAllPlans = tool({
  name: "internet_plans",
  description:
    "Retrieves all available internet plans with their plan ID, price in INR, and speed details",
  parameters: z.object({}),
  async execute() {
    return [
      {
        plan_id: "1",
        price_inr: "399",
        speed: "30 Mbps",
      },
      {
        plan_id: "2",
        price_inr: "799",
        speed: "50 Mbps",
      },
      {
        plan_id: "3",
        price_inr: "1399",
        speed: "100 Mbps",
      },
    ];
  },
});

const processRefund = tool({
  name: "process_refund",
  description:
    "Processes a refund request for a customer based on their customer ID and the reason for the refund",
  parameters: z.object({
    customerId: z.string().describe("id of the customer"),
    reason: z.string().describe("reason for refund"),
  }),
  async execute({ customerId, reason }) {
    await fs.appendFile(
      "./refund.txt",
      `Refund for Customer having ID ${customerId} for ${reason}\n`,
      "utf-8"
    );
    return { refundIssue: true };
  },
});

const refundAgent = new Agent({
  name: "Refund Agent",
  instructions:
    "You are a refund processing agent responsible for handling customer refund requests. Always collect the customer ID and reason for refund before processing. Be empathetic",
  tools: [processRefund],
});

const salesAgent = new Agent({
  name: "Sales Agenet",
  instructions:
    "You are a helpful sales agent specializing in internet plans. Use the available tools to provide customers with plan information, compare options, and help them choose the best plan for their needs. Be friendly, informative, and focus on finding the right solution for each customer.",
  tools: [
    fetchAllPlans,
    refundAgent.asTool({
      toolName: "refund_expert",
      toolDescription: "Handles Refund question and request.",
    }),
  ],
});

const receptionAgent = new Agent({
  name: "Reception Agent",
  instructions: `
    ${RECOMMENDED_PROMPT_PREFIX}
    You are a reception agent for an internet service provider. Your role is to greet customers and determine whether they need help with sales inquiries about internet plans or refund requests. Based on their needs, hand off to the appropriate specialized agent. Be welcoming and ensure a smooth transition to the right expert.`,
  handoffDescription:
    "Handles initial customer inquiries and routes them to either sales or refund specialists based on the customer's needs",
  handoffs: [salesAgent, refundAgent],
});

const result = await run(
  receptionAgent,
  "I only play Youtube what is the best plan for me?"
);
console.log(result.finalOutput);
