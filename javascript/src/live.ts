import NimbleView from "./NimbleView";
import NimbleRemote from "./NimbleRemote";


const container = document.createElement("div");
const init_scale = window.location.hostname === 'localhost' ? 1.0 : 1.0;
container.style.height = `${window.innerHeight * init_scale}px`;
container.style.width = `${window.innerWidth * init_scale}px`;
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


view.createDropdown(100, "Dropdown", ["Option 1", "Option 2", "Option 3"], [0.005*window.innerWidth,window.innerHeight*0.1] , [0,0], 1);

// Function to update container size
const updateContainerSize = () => {
  container.style.height = `${window.innerHeight * init_scale}px`;
  container.style.width = `${window.innerWidth * init_scale}px`;
  view.render(); // Re-render the view to adjust to new size
};

// Add event listener for window resize
window.addEventListener('resize', updateContainerSize);

// Optional: Add event listener for zoom change (if needed)
window.addEventListener('zoom', updateContainerSize);