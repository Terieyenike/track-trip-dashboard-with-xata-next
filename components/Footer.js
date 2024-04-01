"use client";

export default function Footer() {
  return (
    <footer className='absolute bottom-0 py-1 text-center w-full'>
      <p>{new Date().getFullYear()} &copy; Track Trips</p>
    </footer>
  );
}
