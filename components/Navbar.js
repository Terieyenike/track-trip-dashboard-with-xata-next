import Link from "next/link";

export default function Navbar() {
  return (
    <header className='text-gray-600 body-font border-b'>
      <div className='container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center md:justify-between'>
        <Link
          className='flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0'
          href='/'>
          <span className='ml-3 text-xl'>Track Trips</span>
        </Link>
        <Link href='/dashboard/'>
          <button className='inline-flex items-center bg-green-200 border-0 py-2 px-5 focus:outline-none hover:bg-green-300 rounded text-base mt-4 md:mt-0'>
            Dashboard
          </button>
        </Link>
      </div>
    </header>
  );
}
