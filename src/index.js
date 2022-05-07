import React from 'react';
import ReactDOM from 'react-dom';
import './assets/main.css';
import App from './App';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Long from "./routes/Long";
import Short from "./routes/Short";

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="goLong" element={<Long />} />
      <Route path="goShort" element={<Short />} />
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);
