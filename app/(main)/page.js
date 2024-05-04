import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <section className='text-gray-600 body-font'>
        <div className='container px-5 py-24 mx-auto md:w-[80%] lg:w-[90%]'>
          <div className='lg:flex lg:flex-row lg:justify-center lg:items-start lg:mx-auto lg:w-full'>
            <div className='lg:w-1/2 lg:pr-8 mb-8 lg:mb-0'>
              <h1 className='text-3xl sm:text-5xl font-bold text-gray-900 mb-4'>
                Keep track of all your adventures,
                <br className='hidden sm:inline' />
                never forget the amazing memories.
              </h1>
              <p className='text-lg text-gray-700 mb-8'>
                Track Trips helps you organize your travel experiences,
                <br className='hidden sm:inline' />
                so you can relive and share your favorite moments anytime.
              </p>
              <Link
                href='/dashboard/'
                className='text-white bg-indigo-700 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg'>
                Get Started
              </Link>
            </div>
            <div className='lg:w-1/2'>
              <Image
                alt='hero image'
                priority={true}
                width={600}
                height={400}
                src='/assets/pexels-officialakfotos-18556827.jpg'
                className='shadow-lg object-cover object-center rounded-lg'
              />
            </div>
          </div>
        </div>
      </section>

      <section className='bg-gray-100 py-20'>
        <div className='container mx-auto px-5'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900'>
              Explore Key Features
            </h2>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
            <div className='bg-white p-8 rounded-lg shadow-md'>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Easy Tracking
              </h3>
              <p className='text-gray-700'>
                Keep all your travel details organized in one place.
              </p>
            </div>
            <div className='bg-white p-8 rounded-lg shadow-md'>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Photo Gallery
              </h3>
              <p className='text-gray-700'>
                Create beautiful galleries of your favorite travel photos.
              </p>
            </div>
            <div className='bg-white p-8 rounded-lg shadow-md'>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Sharing Made Easy
              </h3>
              <p className='text-gray-700'>
                Share your adventures with friends and family effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='bg-indigo-500 py-20'>
        <div className='container mx-auto px-5'>
          <div className='text-center'>
            <h2 className='text-3xl font-bold text-white mb-4'>
              Ready to start tracking your adventures?
            </h2>
            <p className='text-lg text-white mb-8'>
              Sign up now and start preserving your travel memories!
            </p>
            <Link
              href='#'
              className='text-white bg-indigo-700 border-0 py-3 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg'>
              Sign Up
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
