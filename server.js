import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

const PORT = 8000;
const API_KEY = process.env.API_KEY;

const app = express();
app.use(express.json());
app.use(cors());

app.post("/completions", async (req, resp) => {
  try {
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: req.body.messages,
        max_tokens: 100,
      }),
    };

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      options
    );
    const data = await response.json();
    resp.send(data);
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => console.log(`Your server is running on PORT ${PORT}`));
