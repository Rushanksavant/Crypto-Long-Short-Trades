import React from "react";
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

import Web3Modal from 'web3modal'

import contractLong from "../artifacts/contracts/contractLong.sol/contractLong.json"

import Nav from "../components/Nav";


const contractLong_add = "0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf";



export default function Long() {
    const [supplyAmount, setSupplyAmount] = useState(0); // eth
    const [maxBorrow, setMaxBorrow] = useState(0); // amount of DAI
    const [borrowBalance, setBorrowBalance] = useState(0); // in DAI
    const [accLiquidity, setAccLiquidity] = useState(0); // in $

    const [contractBalance, setContractBalance] = useState(0); // eth

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

    async function supplyETH() {
        init()
        const Long = new ethers.Contract(contractLong_add, contractLong.abi, signer)
        let transaction = await Long.supply({ value: ethers.utils.parseEther(supplyAmount) })
        await transaction.wait()
    }

    async function goLong() {
        init()
        const Long = new ethers.Contract(contractLong_add, contractLong.abi, signer)
        await Long.goLong_ETH(parseInt(0.5 * maxBorrow), Math.floor(Date.now() / 1000) + 60 * 10)
    }

    async function get_info() {
        init()
        const Long = new ethers.Contract(contractLong_add, contractLong.abi, provider)
        setSupplyAmount(parseInt(await Long.callStatic.getSuppliedBalance()));
        setMaxBorrow(parseInt(await Long.callStatic.getMaxBorrow()))
        setBorrowBalance(parseInt(await Long.callStatic.getBorrowBalance()))
        setAccLiquidity(parseInt(await Long.callStatic.getAccountLiquidity()))
        setContractBalance(parseInt(await provider.getBalance(contractLong_add)))
        console.log(await Long.callStatic.getAccountLiquidity())
    }

    async function closePosition() {
        init()
        const Long = new ethers.Contract(contractLong_add, contractLong.abi, signer)
        let transaction = await Long.claimProfits(Math.floor(Date.now() / 1000) + 60 * 10)
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
                            <button className="text-gray-800 text-2xl font-bold text-center lg:mb-4 bg-red-200 px-2 py-1 rounded-md hover:bg-red-300 hover:border-red hover:border-4 mt-3" onClick={get_info}>Fetch Status:</button><br></br>

                            <p className="text-white text-lg my-2 font-serif">Supplied Amount -</p><p className="text-yellow-500 text-lg my-2 font-sans">{supplyAmount}</p>
                            <p className="text-white text-lg my-2 font-serif">-----------------------</p>
                            <p className="text-white text-lg my-2 font-serif">Borrow Balnce Current -</p><p className="text-yellow-500 text-lg my-2 font-sans">{borrowBalance}</p>
                            <p className="text-white text-lg my-2 font-serif">Account Liquidity -</p><p className="text-yellow-500 text-lg my-2 font-sans">{accLiquidity}</p>
                            <p className="text-white text-lg my-2 font-serif">-----------------------</p>
                            <p className="text-white text-lg my-2 font-serif">ETH held -</p><p className="text-yellow-500 text-lg my-2 font-sans">{contractBalance}</p>

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
                <div className="bg-gray-300 dark:bg-gray-800 lg:w-1/2 lg:ml-20 lg:p-14 p-8 flex shadow-lg">
                    <div>
                        <h1 className="dark:text-white md:w-8/12 lg:w-10/12 xl:8/12 2xl:w-8/12 w-full xl:text-6xl sm:text-5xl text-4xl font-semibold text-gray-800 capitalize">LongETH</h1>
                        <p className="text-gray-800 text-lg my-3 font-serif">To supply ETH to Compound as collateral:</p>
                        <div className="mt-2">
                            <input className="w-20 h-10 mr-5 rounded-lg p-3 hover:bg-gray-100 border-double border-4 border-sky-500 border-gray-800"
                                onChange={(event) => setSupplyAmount(event.target.value)} />
                            <button className=" text-white bg-gray-900 hover:bg-black hover:text-white rounded-md p-4 "
                                onClick={supplyETH}>Supply</button>

                            <p className="text-gray-800 text-lg mt-20 mb-3 font-serif">Click below to go Long on ETH (*you need to Supply ETH before):</p>
                            <button className=" text-white bg-gray-900 hover:bg-black hover:text-white rounded-md p-4 mb-20"
                                onClick={goLong}>Take Position</button><br></br>

                            <p className="text-gray-800 text-lg mb-3 mt-15 font-serif">Click below to claim profits (*ETH price should be increased to get profits):</p>
                            <button className=" text-white bg-gray-900 hover:bg-black hover:text-white rounded-md p-4"
                                onClick={closePosition}>claim Profits</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}