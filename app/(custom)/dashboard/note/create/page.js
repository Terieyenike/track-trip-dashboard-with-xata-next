"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Heading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { notesData } from "@/utils/notes-data";
import { getTrips } from "@/utils/get-trips";

const defaultFormFields = {
  name: "",
  description: "",
  type: "",
  trip: "",
  rating: 1,
  img: null,
};

export default function NoteForm() {
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { name, description, type, rating, img, trip } = formFields;

  const [trips, setTrips] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const tripsData = await getTrips();
        setTrips(JSON.parse(tripsData));
      } catch (error) {
        console.error("Error fetching trips", error);
      }
    };
    fetchTrips();
  }, []);

  const getTripIdByName = (tripName) => {
    const selectedTrip = trips.find((trip) => trip.city === tripName);
    return selectedTrip ? selectedTrip.id : null;
  };

  const validateForm = () => {
    return (
      name.trim() !== "" &&
      description.trim() !== "" &&
      type.trim() !== "" &&
      trip.trim() !== "" &&
      img !== null
    );
  };

  const submit = async () => {
    const tripId = getTripIdByName(trip);
    const { uploadUrl } = await notesData(
      name,
      description,
      type,
      rating,
      img.type,
      tripId
    );
    await fetch(uploadUrl, { method: "PUT", body: img });
    router.push("/dashboard/note");
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      if (validateForm()) {
        await submit();
        console.log("Notes data stored successfully");
      }
    } catch (error) {
      toast.error("Please fill out all fields");
    }
  };

  const handleInputChange = (event) => {
    const { name, value, files } = event.target;
    if (name === "img") {
      setFormFields({ ...formFields, [name]: files[0] });
    } else {
      setFormFields({ ...formFields, [name]: value });
    }
  };

  const experiences = [
    { label: "Event", value: "Event" },
    { label: "Dining", value: "Dining" },
    { label: "Experience", value: "Experience" },
    { label: "General", value: "General" },
  ];

  return (
    <>
      <Header name={"Note Form"} />
      <form onSubmit={handleFormSubmit}>
        <div>
          <label htmlFor='type' className='block text-gray-700 font-bold mb-2'>
            Trip
            <span>*</span>
          </label>
          <select
            name='trip'
            id='trip'
            value={trip}
            onChange={handleInputChange}
            className='block w-full py-2 px-4 mt-3 mb-5 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none leading-normal'>
            <option value='' disabled className='text-gray-500'>
              ---------
            </option>
            {trips.map((trip) => (
              <option value={trip?.city} key={trip.id}>
                {trip?.city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor='name' className='block text-gray-700 font-bold mb-2'>
            Name
            <span>*</span>
          </label>
          <input
            type='text'
            maxLength={100}
            id='name'
            name='name'
            value={name}
            onChange={handleInputChange}
            required
            placeholder='place visited'
            className='w-full px-4 py-2 border rounded-lg mb-5 mt-3 text-gray-700 bg-white border-gray-300 appearance-none block leading-normal focus:outline-none'
          />
        </div>
        <div>
          <label
            htmlFor='description'
            className='block text-gray-700 font-bold mb-2'>
            Description
            <span>*</span>
          </label>
          <textarea
            name='description'
            id='description'
            value={description}
            onChange={handleInputChange}
            required
            placeholder='enter a description'
            cols='45'
            rows='10'
            className='w-full px-4 py-2 border rounded-lg mb-5 mt-3 text-gray-700 bg-white border-gray-300 appearance-none block leading-normal focus:outline-none resize-none'
          />
        </div>
        <div>
          <label htmlFor='type' className='block text-gray-700 font-bold mb-2'>
            Type
            <span>*</span>
          </label>
          <select
            name='type'
            id='type'
            value={type}
            onChange={handleInputChange}
            className='block w-full py-2 px-4 mt-3 mb-5 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none leading-normal'>
            <option value='' disabled className='text-gray-500'>
              ---------
            </option>
            {experiences.map((experience, index) => (
              <option value={experience.label} key={index}>
                {experience.value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor='img' className='block text-gray-700 font-bold mb-2'>
            Img
          </label>
          <input
            type='file'
            id='img'
            name='img'
            onChange={handleInputChange}
            accept='image/*'
            className='py-2 mb-5 mt-3 text-gray-700'
          />
        </div>
        {img && (
          <div>
            <p className='mb-3'>Selected Image:</p>
            <Image
              src={URL.createObjectURL(img)}
              priority={true}
              width={300}
              height={300}
              alt='exciting destination'
              className='rounded-md shadow-md mb-5 object-contain'
            />
          </div>
        )}
        <div>
          <label
            htmlFor='rating'
            className='block text-gray-700 font-bold mb-2'>
            Rating
            <span>*</span>
          </label>
          <input
            type='number'
            name='rating'
            id='rating'
            value={rating}
            min={0}
            max={5}
            onChange={handleInputChange}
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
    </>
  );
}
