import "dotenv/config";
import { OpenAI } from "openai";

const client = new OpenAI();
client.conversations.create({}).then((e) => {
  console.log(`Conv id is:-`, e.id);
});
//conv_69667439423881979db4f3c46fa9d55a05831c1ecdf46bfc
