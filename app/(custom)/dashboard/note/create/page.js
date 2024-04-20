"use client";

import Header from "@/components/Heading";
import { useState } from "react";

const defaultFormFields = {
  options: "",
};

export default function NoteForm() {
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { options } = formFields;

  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    resetFormFields;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };

  return (
    <>
      <Header name={"Note Form"} />
      <form onSubmit={handleFormSubmit}>
        <div>
          <label
            htmlFor='options'
            className='block text-gray-700 font-bold mb-2'>
            Trip
            <span>*</span>
          </label>
          <select
            value={options}
            name='options'
            id='options'
            onChange={handleChange}
            className='block w-full py-2 px-4 mt-3 mb-5 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none leading-normal'>
            <option value='' disabled className='text-gray-500'>
              ---------
            </option>
            <option value='san francisco'>San Francisco</option>
            <option value='saint louis'>Saint Louis</option>
            <option value='melbourne'>Melbourne</option>
            <option value='kpalime'>Kpalime</option>
          </select>
        </div>
        <button
          type='submit'
          className='bg-green-400 px-7 py-2 rounded hover:cursor-pointer hover:bg-green-300'>
          Save
        </button>
      </form>
    </>
  );
}
