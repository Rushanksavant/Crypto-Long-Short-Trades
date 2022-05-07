import React from "react";
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

import Web3Modal from 'web3modal'

import contractShort from "../artifacts/contracts/contractShort.sol/contractShort.json"
import swapETHforDAI from "../artifacts/contracts/swapETHforDAI.sol/swapETHforDAI.json"

import Nav from "../components/Nav";

const DAI_ABI = require("../DAI_ABI.json");
const DAI_add = "0x6B175474E89094C44Da98b954EedeAC495271d0F"

const contractShort_add = "0x9d4454B023096f34B160D6B654540c56A1F81688";
const swapETHforDAI_add = "0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00";


export default function Short() {
    const [supplyAmount, setSupplyAmount] = useState(0);
    const [ethForDai, setEthForDai] = useState(0);

    const [maxBorrow, setMaxBorrow] = useState(0);
    const [borrowBalance, setBorrowBalance] = useState(0);
    const [accLiquidity, setAccLiquidity] = useState(0);

    const [contractBalance, setContractBalance] = useState(0);

    let web3Modal;
    let connection;
    let provider;
    let signer;

    useEffect(() => {
        init()
    }, [])

    async function init() {
        web3Modal = new Web3Modal()
        connection = await web3Modal.connect()
        provider = new ethers.providers.Web3Provider(connection)
        signer = provider.getSigner()
    }

    async function fundDAI() {
        init()
        const swapper = new ethers.Contract(swapETHforDAI_add, swapETHforDAI.abi, signer)
        let ransaction = await swapper.swapExactETHForTokens(0, DAI_add, contractShort_add, { value: ethers.utils.parseEther(ethForDai) })
    }

    async function supplyDAI() {
        init()
        const Short = new ethers.Contract(contractShort_add, contractShort.abi, signer)
        const DAI = new ethers.Contract(DAI_add, DAI_ABI, provider)
        await Short.supply(await DAI.balanceOf(Short.address))
    }

    async function goShort() {
        init()
        const Short = new ethers.Contract(contractShort_add, contractShort.abi, signer)
        await Short.goShort_ETH(parseInt(0.5 * maxBorrow), Math.floor(Date.now() / 1000) + 60 * 10)
    }

    async function get_info() {
        init()
        const DAI = new ethers.Contract(DAI_add, DAI_ABI, provider)
        const Short = new ethers.Contract(contractShort_add, contractShort.abi, provider)
        setContractBalance(parseInt(await DAI.balanceOf(contractShort_add)))
        setSupplyAmount(parseInt(await Short.callStatic.getSuppliedBalance()));
        setMaxBorrow(parseInt(await Short.callStatic.getMaxBorrow()))
        setBorrowBalance(parseInt(await Short.callStatic.getBorrowBalance()))
        setAccLiquidity(parseInt(await Short.callStatic.getAccountLiquidity()))
    }

    async function closePosition() {
        init()
        const Short = new ethers.Contract(contractShort_add, contractShort.abi, signer)
        let transaction = await Short.claimProfits(Math.floor(Date.now() / 1000) + 60 * 10)
        await transaction.wait()
    }
    return (
        <div className="bg-gray-900">
            <Nav />
            <div className="flex lg:flex-row items-stretch justify-between lg:px-0 px-6 lg:py-20 py-8 2xl:mx-auto 2xl:container">
                <div className="z-30 relative lg:w-1/2">
                    <div className="hidden relative dark:bg-gray-800 bg-black w-full lg:w-10/12 lg:h-full lg:flex justify-end items-center">
                        <img src="https://media.istockphoto.com/photos/stock-market-investment-graph-on-financial-numbers-abstract-picture-id1372263450?k=20&m=1372263450&s=612x612&w=0&h=hsM29khQqyPRanTBQg_lSNdJfi9MsP97cC1zlZLKQho=" alt="image with decent chairs" className="w-full relative z-30 lg:h-full" />
                        <div className="w-3/4 absolute -right-20 z-30 px-6 py-10 bg-black h-5/6">
                            <button className="text-gray-800 text-2xl font-bold text-center lg:mb-4 bg-red-200 px-2 py-1 rounded-md hover:bg-red-300 hover:border-red hover:border-4 lg:my-2" onClick={get_info}>Fetch Status:</button><br></br>
                            <p className="text-white text-lg my-2 font-serif">Supplied Amount -</p><p className="text-yellow-500 text-lg my-2 font-sans">{supplyAmount}</p>
                            <p className="text-white text-lg my-2 font-serif">-----------------------</p>
                            <p className="text-white text-lg my-2 font-serif">Borrow Balnce Current -</p><p className="text-yellow-500 text-lg my-2 font-sans">{borrowBalance}</p>
                            <p className="text-white text-lg my-2 font-serif">Account Liquidity -</p><p className="text-yellow-500 text-lg my-2 font-sans">{accLiquidity}</p>
                            <p className="text-white text-lg my-2 font-serif">-----------------------</p>
                            <p className="text-white text-lg my-2 font-serif">DAI held -</p><p className="text-yellow-500 text-lg my-2 font-sans">{contractBalance}</p>

                        </div>
                        <div className="w-full lg:w-auto lg:-mr-32 lg:pl-20">
                            <div className="w-full relative z-30 lg:pl-5 px-6 py-20 bg-gray-900 lg:mt-10"></div>
                            <div className="w-full relative z-30 lg:pl-5 px-6 py-20 bg-gray-900 lg:pt-5"></div>
                            <div className="w-full relative z-30 lg:pl-5 px-6 py-20 bg-gray-900"></div>
                            <div className="w-full relative z-30 lg:pl-5 px-6 py-20 bg-gray-900 lg:mb-10"></div>
                        </div>
                    </div>
                    <div className="absolute top-0 dark:bg-gray-800 bg-black md:h-96 w-full hidden md:block lg:hidden"></div>
                </div>
                <div className="bg-gray-300 dark:bg-gray-800 lg:w-1/2 lg:ml-20 lg:p-10 p-8 flex shadow-lg">
                    <div>
                        <h1 className="dark:text-white md:w-8/12 lg:w-10/12 xl:8/12 2xl:w-8/12 w-full xl:text-6xl sm:text-5xl text-4xl font-semibold text-gray-800 capitalize">ShortETH</h1>
                        <p className="text-gray-800 text-lg my-3 font-serif">To Fund this contract with DAI (input the eth amount to excahnge):</p>
                        <input className="w-1/5 h-10 mr-5 rounded-lg p-3 hover:bg-gray-100 border-double border-4 border-sky-500 border-gray-800"
                            onChange={(event) => setEthForDai(event.target.value)} />
                        <button className=" text-white bg-gray-900 hover:bg-black hover:text-white rounded-md p-4 mb-4"
                            onClick={fundDAI}>Fund DAI</button>
                        <p className="text-gray-800 text-lg my-3 font-serif">To supply DAI to Compound as collateral: (*contract needs to have DAI)</p>
                        <div className="mt-2">
                            {/* <input className="w-20 h-10 mr-5 rounded-lg p-3 hover:bg-gray-100 border-double border-4 border-sky-500 border-gray-800"
                                onChange={(event) => setSupplyAmount(event.target.value)} /> */}
                            <button className=" text-white bg-gray-900 hover:bg-black hover:text-white rounded-md p-4 "
                                onClick={supplyDAI}>Supply</button>

                            <p className="text-gray-800 text-lg mt-10 mb-3 font-serif">Click below to go Short on ETH (*you need to Supply DAI before):</p>
                            <button className=" text-white bg-gray-900 hover:bg-black hover:text-white rounded-md p-4 mb-10"
                                onClick={goShort}>Take Position</button><br></br>

                            <p className="text-gray-800 text-lg mb-3 font-serif">Click below to claim profits (*ETH price should be decreased to get profits):</p>
                            <button className=" text-white bg-gray-900 hover:bg-black hover:text-white rounded-md p-4"
                                onClick={closePosition}>claim Profits</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}