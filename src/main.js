import { mount } from "svelte";
import "./app.css";

import App from "./App.svelte";
import { loadState } from "./data.svelte.js";

loadState();

const app = mount(App, {
    target: document.getElementById("app"),
});

export default app;
