export default function FormInput({ label, ...otherProps }) {
  return (
    <>
      <div>
        <label htmlFor='city' className='block text-gray-700 font-bold mb-2'>
          {label}
          <span>*</span>
        </label>
        <input
          {...otherProps}
          placeholder='enter the city'
          className='w-full px-4 py-2 border rounded-lg mb-5 mt-3 text-gray-700 bg-white border-gray-300 appearance-none block leading-normal focus:outline-none'
        />
      </div>
      <div>
        <label htmlFor='country' className='block text-gray-700 font-bold mb-2'>
          Country
          <span>*</span>
        </label>
        <input
          maxLength={2}
          type='text'
          id='country'
          name='country'
          placeholder='country code, example NG'
          className='w-full px-4 py-2 border rounded-lg mb-5 mt-3 text-gray-700 bg-white border-gray-300 appearance-none block leading-normal focus:outline-none invalid:border-red-500'
        />
      </div>
      <div>
        <label
          htmlFor='start_date'
          className='block text-gray-700 font-bold mb-2'>
          Start date
          <span>*</span>
        </label>
        <input
          type='date'
          name='start_date'
          id='start_date'
          className='w-full px-4 py-2 border rounded-lg mb-5 mt-3 text-gray-700 bg-white border-gray-300 appearance-none block leading-normal focus:outline-none'
        />
      </div>
      <div>
        <label
          htmlFor='end_date'
          className='block text-gray-700 font-bold mb-2'>
          End date
          <span>*</span>
        </label>
        <input
          type='date'
          name='end_date'
          id='end_date'
          className='w-full px-4 py-2 border rounded-lg mb-5 mt-3 text-gray-700 bg-white border-gray-300 appearance-none block leading-normal focus:outline-none'
        />
      </div>
    </>
  );
}
