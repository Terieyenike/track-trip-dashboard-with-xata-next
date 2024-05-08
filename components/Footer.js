"use client";

export default function Footer() {
  return (
    <footer className='bg-gray-800 py-8'>
      <div className='container mx-auto px-5 text-center'>
        <p className='text-gray-400 mb-4 text-sm'>
          Designed and Developed by{" "}
          <a
            href='https://iamteri.tech'
            target='_'
            rel='noreferrer noopener'
            className='text-white'>
            Fitinth
          </a>
          .
        </p>
        <p className='text-xs text-gray-400'>
          &copy; {new Date().getFullYear()} Track Trips. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
