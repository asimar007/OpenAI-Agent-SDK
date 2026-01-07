import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";

const getWeatherReportSchema = z.object({
  city: z.string().describe("city name"),
  degree_c: z.number(),
  condition: z.string().optional().describe("condition of the weather"),
});

const getWeatherTool = tool({
  name: "get_weather",
  description: "Return the weather for a given city",
  parameters: z.object({
    city: z.string().describe("name of the city"),
  }),
  async execute({ city }) {
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
    const response = await axios.get(url, { responseType: "text" });
    return `The weather in ${city} is ${response.data}`;
  },
});

const agent = new Agent({
  name: "Weather Agent",
  instructions:
    "You are an Weather Report Agent to help user to tell the Weather Report",
  tools: [getWeatherTool],
  outputType: getWeatherReportSchema,
});

async function main(query = "") {
  const result = await run(agent, query);
  console.log(result.finalOutput);
}

main("What is the Weather of Kolkata?");
