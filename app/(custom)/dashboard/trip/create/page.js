"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const defaultFormFields = {
  city: "",
  country: "",
  start: new Date().toISOString().substring(0, 10),
  end: new Date().toISOString().substring(0, 10),
};

export default function TripForm() {
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { city, country, start, end } = formFields;

  const router = useRouter();

  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };

  const handleFormSubmit = (event) => {
    fetch("api/trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        city,
        country,
        start,
        end,
      }),
    });
    event.preventDefault();
    router.push("/dashboard");
    resetFormFields();
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormFields((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
  };

  return (
    <section>
      <h1 className='text-4xl mb-8'>Trip Form</h1>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label htmlFor='city' className='block text-gray-700 font-bold mb-2'>
            City
            <span>*</span>
          </label>
          <input
            type='text'
            maxLength={50}
            id='city'
            name='city'
            value={city}
            onChange={handleInputChange}
            required
            placeholder='enter the city'
            className='w-full px-4 py-2 border rounded-lg mb-5 mt-3 text-gray-700 bg-white border-gray-300 appearance-none block leading-normal focus:outline-none'
          />
        </div>
        <div>
          <label
            htmlFor='country'
            className='block text-gray-700 font-bold mb-2'>
            Country
            <span>*</span>
          </label>
          <input
            maxLength={2}
            type='text'
            id='country'
            name='country'
            value={country}
            onChange={handleInputChange}
            required
            placeholder='country code, example NG'
            className='w-full px-4 py-2 border rounded-lg mb-5 mt-3 text-gray-700 bg-white border-gray-300 appearance-none block leading-normal focus:outline-none'
          />
        </div>
        <div>
          <label htmlFor='start' className='block text-gray-700 font-bold mb-2'>
            Start date
            <span>*</span>
          </label>
          <input
            type='date'
            name='start'
            value={start}
            onChange={handleInputChange}
            id='start'
            className='w-full px-4 py-2 border rounded-lg mb-5 mt-3 text-gray-700 bg-white border-gray-300 appearance-none block leading-normal focus:outline-none'
          />
        </div>
        <div>
          <label htmlFor='end' className='block text-gray-700 font-bold mb-2'>
            End date
            <span>*</span>
          </label>
          <input
            type='date'
            name='end'
            onChange={handleInputChange}
            value={end}
            id='end'
            className='w-full px-4 py-2 border rounded-lg mb-5 mt-3 text-gray-700 bg-white border-gray-300 appearance-none block leading-normal focus:outline-none'
          />
        </div>
        <button
          type='submit'
          className='bg-green-400 px-7 py-2 rounded hover:cursor-pointer hover:bg-green-300'>
          Save
        </button>
      </form>
    </section>
  );
}
