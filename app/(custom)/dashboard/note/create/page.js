"use client";

import Header from "@/components/Heading";
import { getTrips } from "@/utils/get-trips";
import { notesData } from "@/utils/api";
import { useState, useEffect } from "react";

const defaultFormFields = {
  city: "",
  name: "",
  img: "",
  description: "",
  rating: "",
  type: "",
};

export default function NoteForm() {
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { city, name, description, type, rating, img } = formFields;
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const tripsData = await getTrips();
        setTrips(JSON.parse(tripsData));
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };

    fetchTrips();
  }, []);

  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log(city);
    await notesData(city);
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
          <label htmlFor='city' className='block text-gray-700 font-bold mb-2'>
            Trip
            <span>*</span>
          </label>
          <select
            value={city}
            name='city'
            id='city'
            onChange={handleChange}
            className='block w-full py-2 px-4 mt-3 mb-5 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none leading-normal'>
            <option value='' disabled className='text-gray-500'>
              ---------
            </option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.city}>
                {trip.city}
              </option>
            ))}
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
