import express from "express";

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
