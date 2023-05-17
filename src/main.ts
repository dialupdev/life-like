import { configure } from "mobx";
import "./components/x-app";

configure({
  enforceActions: "always",
});

const app = document.createElement("x-app");
document.body.appendChild(app);
