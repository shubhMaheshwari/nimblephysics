import NimbleView from "./NimbleView";
import NimbleRemote from "./NimbleRemote";

const container = document.createElement("div");
const init_sclae = window.location.hostname === 'localhost' ? 0.5 : 1.0;
container.style.height = `${window.innerHeight * init_sclae}px`;
container.style.width = `${window.innerWidth * init_sclae}px`;
container.style.margin = "0px";
document.body.style.margin = "0px";
document.body.style.padding = "0px";
document.body.appendChild(container);
const view = new NimbleView(container);
// Use the current host and protocol for the WebSocket connection
const wsProtocol = location.protocol === "https:" ? "wss://" : "ws://";
const wsHost = location.hostname; // Current hostname (e.g., domain or IP)
const wsPort = 8070; // Fixed WebSocket port

const wsUrl = window.location.hostname === 'localhost'
  ? 'ws://localhost:8070/ws'  // Development
  : `wss://${window.location.host}/ws`;  // Production

const remote = new NimbleRemote(wsUrl, view);
