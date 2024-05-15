"use client";

import Header from "@/components/Heading";
import { filterNote } from "@/utils/filter";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { editNote } from "@/utils/edit";
import { getTrips } from "@/utils/get-trips";

export const revalidate = 0;

export default function Update({ params }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [img, setImg] = useState(null);
  const [rating, setRating] = useState(1);
  const [trip, setTrip] = useState("");
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { record } = await filterNote(JSON.parse(JSON.stringify(params)));
        setName(record.name);
        setDescription(record.description);
        setType(record.type);
        setImg(record.img.url);
        setRating(record.rating);
        // setTrip(record.trip);
      } catch (error) {
        console.error("Error fetching note data:", error);
      }
    };

    const fetchTrips = async () => {
      try {
        const tripsData = await getTrips();
        setTrips(JSON.parse(tripsData));
      } catch (error) {
        console.error("Error fetching trips", error);
      }
    };

    fetchData();
    fetchTrips();
  }, [params]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { uploadUrl } = await editNote(
        name,
        description,
        type,
        rating,
        img.type
      );
      await fetch(uploadUrl, { method: "PUT", body: img });
      router.push("/dashboard/note");
    } catch (error) {
      console.error("Error updating note data: ", error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImg(URL.createObjectURL(file));
    } else {
      setImg(null);
    }
  };

  const types = [
    { label: "Event", value: "Event" },
    { label: "Dining", value: "Dining" },
    { label: "Experience", value: "Experience" },
    { label: "General", value: "General" },
  ];

  return (
    <section>
      <Header name={"Note Form"} />
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='trip' className='block text-gray-700 font-bold mb-2'>
            Trip
            <span>*</span>
          </label>
          <select
            name='trip'
            id='trip'
            value={trip}
            onChange={(event) => setTrip(event.target.value)}
            className='block w-full py-2 px-4 mt-3 mb-5 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none leading-normal'>
            <option value='' disabled className='text-gray-500'>
              Select pre-existing location
            </option>
            {trips.map((trip) => (
              <option value={trip?.city} key={trip.id}>
                (trip?.city)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor='city' className='block text-gray-700 font-bold mb-2'>
            Name
            <span>*</span>
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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
            onChange={(event) => setDescription(event.target.value)}
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
            onChange={(event) => setType(event.target.value)}
            className='block w-full py-2 px-4 mt-3 mb-5 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none leading-normal'>
            {types.map((type, index) => (
              <option key={index} value={type.label}>
                {type.value}
              </option>
            ))}
          </select>
        </div>
        <div className='mb-6'>
          <label htmlFor='img' className='block text-gray-700 font-bold mb-2'>
            Image
          </label>
          <input
            type='file'
            id='img'
            name='img'
            onChange={handleFileChange}
            accept='image/*'
            className='py-2 mb-5 mt-3 text-gray-700'
          />

          {img && (
            <Image
              src={img}
              width={300}
              height={300}
              priority={true}
              alt='wonderful destination'
              className='rounded-md shadow-md object-contain'
            />
          )}
        </div>
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
            onChange={(event) => setRating(event.target.value)}
            className='w-full px-4 py-2 border rounded-lg mb-5 mt-3 text-gray-700 bg-white border-gray-300 appearance-none block leading-normal focus:outline-none'
          />
        </div>

        <div className='mt-12'>
          <button
            type='submit'
            className='bg-green-400 px-7 py-2 rounded hover:cursor-pointer hover:bg-green-300'>
            Save
          </button>
          <Link
            href={`/dashboard/note`}
            className='px-7 py-[10px] bg-gray-300 rounded hover:bg-gray-400 ml-4'>
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
