"use client";

export default function Footer() {
  return (
    <footer className='bg-gray-800 text-white py-8'>
      <div className='container mx-auto px-5 text-center'>
        <p>
          &copy; {new Date().getFullYear()} Track Trips. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
