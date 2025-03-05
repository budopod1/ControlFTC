if (typeof Promise.withResolvers == 'undefined') {
    Promise.withResolvers = () => {
        let resolve, reject;
        let promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return {promise, resolve, reject};
    }
}

import { mount } from "svelte";
import "./app.css";

import App from "./App.svelte";
import { loadState } from "./data.svelte.js";

loadState();

const app = mount(App, {
    target: document.getElementById("app"),
});

export default app;
