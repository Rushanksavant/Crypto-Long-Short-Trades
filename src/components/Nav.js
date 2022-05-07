import react from 'react'


export default function Nav() {
    return (
        <nav className="bg-gray-800 border-gray-200 px-2 sm:px-4 py-2.5 dark:bg-gray-800 lg:py-5">
            <div className="container flex flex-wrap justify-between items-center mx-auto">
                <a href="/" className="flex">
                    <span className="self-center font-semibold font-mono text-yellow-500 text-2xl">Go-getter ETH</span>
                </a>
                <div className="hidden w-full md:block md:w-auto" id="mobile-menu">
                    <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:justify-center sm:justify-center">
                        {/* <li>
                            <a href="/" className="block py-2 pr-4 pl-3 text-yellow-500 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700" aria-current="page">Home</a>
                        </li> */}
                        <li>
                            <a href="/goLong" className="block py-2 pr-4 pl-3 text-yellow-500 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">LongETH</a>
                        </li>
                        <li>
                            <a href="/goShort" className="block py-2 pr-4 pl-3 text-yellow-500 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">ShortETH</a>
                        </li>
                        <li>
                            <a href="https://github.com/Rushanksavant/Crypto-Long-Short-Trades" target="_blank" className="block py-2 pr-4 pl-3 text-yellow-500 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Code</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}