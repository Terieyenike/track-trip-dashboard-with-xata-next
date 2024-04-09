"use client";

import Header from "@/components/Heading";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const defaultFormFields = {
  city: "",
  country: "",
  start: "",
  end: "",
};

export default function TripForm() {
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { city, country, start, end } = formFields;

  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };

  const validateDate = () => {
    if (new Date(end) <= new Date(start)) {
      toast.error("End date must be greater than the start date.");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validateDate()) {
      return;
    }
    try {
      const response = await fetch(
        "https://teri-eyenike-s-workspace-14frfm.eu-west-1.xata.sh/db/track-trip-dashboard-with-xata-next:main/tables/trips/data?columns=id",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.XATA_API_KEY}`,
          },
          body: JSON.stringify({
            city: city,
            country: country,
            start: start,
            end: end,
          }),
        }
      );
      if (response.ok) {
        toast.success("Trip data stored successfully.");
        resetFormFields();
      } else {
        toast.error("Failed to store trip data.");
      }
    } catch (error) {
      toast.error("Error storing trip data:", error.message);
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    submit();
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };

  const today = new Date().toISOString().split("T")[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

  return (
    <section>
      <Header name={"Trip Form"} />
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
            min={today}
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
            min={tomorrowFormatted}
            max={"2050-12-31"}
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
      <ToastContainer theme='dark' />
    </section>
  );
}
