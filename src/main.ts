import { configure } from "mobx";

import "./ui/x-app.ts";

configure({
  enforceActions: "always",
});

const app = document.createElement("x-app");

document.body.appendChild(app);
