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
// const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
// const wsHost = window.location.hostname || 'localhost';
// const wsPort = 8070;
// const wsUrl = `${wsProtocol}${wsHost}:${wsPort}/ws`;


const wsUrl = window.location.hostname === 'localhost'
  ? 'ws://localhost:8070/ws'  // Development
  : `wss://${window.location.hostname}/ws`;  // Production


console.log('Attempting WebSocket connection to:', wsUrl);

const remote = new NimbleRemote(wsUrl, view);

// Add error handling
remote.socket.onerror = (error) => {
  console.error('WebSocket connection error:', error);
};

remote.socket.onclose = (event) => {
  console.log('WebSocket closed:', event.code, event.reason);
};

remote.socket.onopen = () => {
  console.log('WebSocket connection established');
};


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

