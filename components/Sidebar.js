"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div className='md:h-screen bg-slate-700 text-white w-full md:w-2/5 md:max-w-xs lg:w-1/4 py-2 md:pt-8 md:pb-2 flex flex-col items-center justify-start border-r'>
      <div className='border-b w-full text-center pb-4 text-2xl'>
        <Link href='/'>
          <h1>Track Trips</h1>
        </Link>
      </div>
      <div className='pt-4 w-full text-center'>
        <ul className='flex md:flex-col justify-around px-2 md:px-0 pb-2 md:pb-0 text-xs md:text-base lg:text-lg'>
          <Link href='/dashboard'>
            <li className='py-4 px-3 md:px-0 hover:bg-gray-600 hover:cursor-pointer'>
              My Trips
            </li>
          </Link>
          <Link href='/dashboard/trip/create'>
            <li className='py-4 px-3 md:px-0 hover:bg-gray-600 hover:cursor-pointer'>
              New Trip +
            </li>
          </Link>
          <Link href='/dashboard/note'>
            <li className='py-4 px-3 md:px-0 hover:bg-gray-600 hover:cursor-pointer'>
              My Notes
            </li>
          </Link>
          <Link href='/dashboard/note/create'>
            <li className='py-4 px-3 md:px-0 hover:bg-gray-600 hover:cursor-pointer'>
              New Note +
            </li>
          </Link>
        </ul>
      </div>
    </div>
  );
}
