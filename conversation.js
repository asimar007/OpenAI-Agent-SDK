import "dotenv/config";
import { Agent, tool, run } from "@openai/agents";
import { z } from "zod";

let sharedHistory = [];

const executeSQL = tool({
  name: "execute_sql",
  description: "This Execute the SQL query",
  parameters: z.object({
    sql: z.string().describe("the sql query"),
  }),
  execute: async ({ sql }) => {
    console.log(`Execute [SQL]: ${sql}`);
    return "done";
  },
});

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
  tools: [executeSQL],
});

async function main(q = "") {
  // Store Message in In-Memory DB
  sharedHistory.push({ role: "user", content: q });
  const result = await run(sqlAgent, sharedHistory);

  sharedHistory = result.history;
  //   console.log(result.history);
  console.log("Final Output:", result.finalOutput);
  console.log("\n\n\n\n");
}
// TURN -1
main("My name is Asim").then(() => {
  //TURN - 2; its loose the context because each turn is seperate
  main("get me all the users with my name");
});
