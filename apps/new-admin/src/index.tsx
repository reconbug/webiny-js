import "cross-fetch/polyfill";
import "core-js/stable";
import "regenerator-runtime/runtime";
import "reflect-metadata";
import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";

const render = module.hot ? ReactDOM.render : ReactDOM.hydrate;
render(<App />, document.getElementById("root"));
