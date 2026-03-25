import { configure } from "mobx";

import "./ui/x-app.ts";

configure({
  enforceActions: "always",
});

const canvas = document.createElement("canvas");

const app = document.createElement("x-app");
app.appendChild(canvas);

document.body.appendChild(app);
