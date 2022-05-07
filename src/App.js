import React from "react";
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

import eth_research from "./imgs/download.png"
import compound from "./imgs/compound_icon.png"
import uniswap from "./imgs/uniswap_icon.png"

import Nav from "./components/Nav";

function App() {

  return (
    <div className="bg-gray-700 h-screen">
      <Nav />
      <div className="h-2/3 mx-auto bg-gray-300">
        <img src={eth_research} className="relative h-full mx-auto" />
      </div>

      <div className="mt-5 font-serif">
        <div className="text-6xl text-yellow-500 font-bold text-center">
          Maximize profits
        </div>
        <div className="text-3xl text-yellow-500 font-bold text-center mt-3">
          By going Short and Long on ETH whenever this is a major dip/rise
        </div>
      </div>

      <div className="mt-5 text-yellow-500 ml-3 flex">
        <a href="https://compound.finance/" target="_blank">
          <img src={compound} className="rounded-full ml-3 w-10 h-10" />
        </a>
        <a href="https://uniswap.org/" target="_blank">
          <img src={uniswap} className="rounded-full ml-3 w-10 h-10" />
        </a>
      </div>
    </div >
  );
}

export default App;