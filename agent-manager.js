import "dotenv/config";
import { Agent, tool, run } from "@openai/agents";
import { z } from "zod";

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

const salesAgent = new Agent({
  name: "Sales Agenet",
  instructions:
    "You are a helpful sales agent specializing in internet plans. Use the available tools to provide customers with plan information, compare options, and help them choose the best plan for their needs. Be friendly, informative, and focus on finding the right solution for each customer.",
  tools: [fetchAllPlans],
});

const result = await run(salesAgent, "how me all Internet plans");
console.log(result.finalOutput);
