import express, { Request, Response } from "express";
import axios from "axios";
import { randomInt } from "crypto";
import { exec } from "child_process";
import * as fs from "fs";
import * as os from "os";

const app = express();
const port = 3000;

app.use(express.json());

const internalServices = [
  { url: "http://localhost:3001/service1" },
  { url: "http://localhost:3002/service2" },
  { url: "http://localhost:3003/service3" },
];

async function relayWebhook(req: Request, res: Response) {
  try {
    const randomService = internalServices[randomInt(internalServices.length)];
    const serviceUrl = randomService.url;

    if (Math.random() < 0.3) {
      const errorCodes = [400, 500, 502, 503];
      const errorCode = errorCodes[randomInt(errorCodes.length)];
      return res
        .status(errorCode)
        .send({ error: `Simulated error: ${errorCode}` });
    }

    if (Math.random() < 0.3) {
      const delay = randomInt(30000);
      console.log(`Simulating delay of ${delay}ms for ${serviceUrl}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const response = await axios.post(serviceUrl, req.body);
    res.status(response.status).send(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      console.error("Error relaying webhook:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  }
}

app.post("/webhook", async (req, res) => {
  await relayWebhook(req, res);
});

app.listen(port, () => {
  console.log(`Webhook relay server listening at http://localhost:${port}`);
});

// Mock Internal Service 1
const app1 = express();
app1.use(express.json());
app1.post("/service1", (req, res) => {
  console.log("Service 1 received:", req.body);
  res.send({ message: "Service 1 processed webhook" });
});
app1.listen(3001, () => console.log("Mock Service 1 listening on port 3001"));

// Mock Internal Service 2
const app2 = express();
app2.use(express.json());
app2.post("/service2", (req, res) => {
  console.log("Service 2 received:", req.body);
  res.send({ message: "Service 2 processed webhook" });
});

app2.listen(3002, () => console.log("Mock Service 2 listening on port 3002"));

// Mock Internal Service 3
const app3 = express();
app3.use(express.json());
app3.post("/service3", (req, res) => {
  console.log("Service 3 received:", req.body);
  res.send({ message: "Service 3 processed webhook" });
});

app3.listen(3003, () => console.log("Mock Service 3 listening on port 3003"));

function runLoadTest() {
  const jsonBody = JSON.stringify({ test: "load" });
  fs.writeFileSync("body.json", jsonBody);

  const attackDefinition = `POST http://localhost:3000/webhook${os.EOL}Content-Type: application/json${os.EOL}Content-Length: ${jsonBody.length}${os.EOL}@./body.json`;

  fs.writeFileSync("attack.txt", attackDefinition);

  const command = `vegeta attack -rate=1000 -duration=60s -timeout=31s -targets=attack.txt | vegeta report`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running load test: ${error}`);
      return;
    }
    console.log(`Load test results:\n${stdout}`);
  });
}

setTimeout(runLoadTest, 2000);
