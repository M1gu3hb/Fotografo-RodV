import React from "react";
import ReactDOM from "react-dom/client";
import "./fonts.css";
import App from "./App";
import type { PageData } from "./Gallery";
import "./styles.css";
import "./portfolio.css";

const page = JSON.parse(document.getElementById('page-data')!.textContent!) as PageData;
const app = (
  <React.StrictMode>
    <App page={page} />
  </React.StrictMode>
);
const root = document.getElementById('root')!;
if (root.hasChildNodes()) ReactDOM.hydrateRoot(root, app);
else ReactDOM.createRoot(root).render(app);
