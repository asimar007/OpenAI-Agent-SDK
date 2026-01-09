import "dotenv/config";
import { Agent, run, OutputGuardrailTripwireTriggered } from "@openai/agents";
import { z } from "zod";

const sqlGuardrail = new Agent({
  name: "Output Guardrail Agent",
  instructions:
    "Evaluate if the SQL query is safe to execute. The query must be read-only (SELECT statements only). Reject any queries that modify, insert, update, delete, drop, truncate, or alter tables or data.",
  outputType: z.object({
    reason: z.string().optional().describe("reason if query is unsafe"),
    isSafe: z.boolean().describe("if query is safe to execute"),
  }),
});

const outputGuard = {
  name: "Check Output",
  execute: async ({ agentOutput, context }) => {
    const sqlQuery = agentOutput?.sqlQuery;

    if (!sqlQuery) {
      console.log("No SQL query found in output");
      return { tripwireTriggered: false };
    }

    console.log("SQL Query to validate:", sqlQuery);
    const result = await run(sqlGuardrail, sqlQuery, { context });
    console.log("Guardrail evaluation:", result.finalOutput);

    return {
      outputInfo: result.finalOutput,
      tripwireTriggered: !result.finalOutput.isSafe,
    };
  },
};

const sqlAgent = new Agent({
  name: "SQL Agent",
  instructions: `You are an Expert SQL AI Agent that specilization in generate SQL queries as per your request
    
    PostgreSQL Schema:

    -- Users table
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
    );

    -- Comments table
    CREATE TABLE comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        post_id INTEGER, -- Reference to whatever post/content this comment is on
        parent_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE, -- For nested comments
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
    );

    -- Indexes for better performance
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_username ON users(username);
    CREATE INDEX idx_comments_user_id ON comments(user_id);
    CREATE INDEX idx_comments_post_id ON comments(post_id);
    CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);

    `,
  outputGuardrails: [outputGuard],
  outputType: z.object({
    sqlQuery: z.string().optional().describe("sql query"),
  }),
});

async function main(q = "") {
  try {
    const result = await run(sqlAgent, q);
    console.log("\nGenerated SQL Query:", result.finalOutput.sqlQuery);
  } catch (e) {
    if (e instanceof OutputGuardrailTripwireTriggered) {
    } else {
      console.error(e.message);
    }
  }
}

main("get me all the comments and delete the 1st one");
