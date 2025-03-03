"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
const internalServices = [
    { url: "http://localhost:3001/service1" },
    { url: "http://localhost:3002/service2" },
    { url: "http://localhost:3003/service3" },
];
async function relayWebhook(req, res) {
    try {
        const randomService = internalServices[(0, crypto_1.randomInt)(internalServices.length)];
        const serviceUrl = randomService.url;
        if (Math.random() < 0.3) {
            const errorCodes = [400, 500, 502, 503];
            const errorCode = errorCodes[(0, crypto_1.randomInt)(errorCodes.length)];
            return res
                .status(errorCode)
                .send({ error: `Simulated error: ${errorCode}` });
        }
        if (Math.random() < 0.3) {
            const delay = (0, crypto_1.randomInt)(30000);
            console.log(`Simulating delay of ${delay}ms for ${serviceUrl}`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
        const response = await axios_1.default.post(serviceUrl, req.body);
        res.status(response.status).send(response.data);
    }
    catch (error) {
        if (error.response) {
            res.status(error.response.status).send(error.response.data);
        }
        else {
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
const app1 = (0, express_1.default)();
app1.use(express_1.default.json());
app1.post("/service1", (req, res) => {
    console.log("Service 1 received:", req.body);
    res.send({ message: "Service 1 processed webhook" });
});
app1.listen(3001, () => console.log("Mock Service 1 listening on port 3001"));
// Mock Internal Service 2
const app2 = (0, express_1.default)();
app2.use(express_1.default.json());
app2.post("/service2", (req, res) => {
    console.log("Service 2 received:", req.body);
    res.send({ message: "Service 2 processed webhook" });
});
app2.listen(3002, () => console.log("Mock Service 2 listening on port 3002"));
// Mock Internal Service 3
const app3 = (0, express_1.default)();
app3.use(express_1.default.json());
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
    const command = `vegeta attack -rate=1000 -duration=60s -targets=attack.txt | vegeta report`;
    (0, child_process_1.exec)(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error running load test: ${error}`);
            return;
        }
        console.log(`Load test results:\n${stdout}`);
    });
}
setTimeout(runLoadTest, 2000);
//# sourceMappingURL=app.js.map