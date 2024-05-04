"use client";

import Header from "@/components/Heading";
import { filterTrip } from "@/utils/filter";
import { Edit } from "@/utils/edit";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const revalidate = 0;

export default function Update({ params }) {
  const router = useRouter();

  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const record = await filterTrip(params);
        setCity(record.city);
        setCountry(record.country);
        setStart(record.start);
        setEnd(record.end);
      } catch (error) {
        console.error("Error fetching trip data:", error);
      }
    };

    fetchData();
  }, [params]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await Edit(params.id, city, start, end, country);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating trip data:", error);
    }
  };

  return (
    <section>
      <Header name={"Trip Form"} />
      <form onSubmit={handleSubmit}>
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
            onChange={(e) => setCity(e.target.value)}
            required
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
            onChange={(e) => setCountry(e.target.value)}
            required
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
            onChange={(e) => setStart(e.target.value)}
            id='start'
            placeholder='put the start date here'
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
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            id='end'
            className='w-full px-4 py-2 border rounded-lg mb-5 mt-3 text-gray-700 bg-white border-gray-300 appearance-none block leading-normal focus:outline-none'
          />
        </div>

        <div>
          <button
            type='submit'
            className='bg-green-400 px-7 py-2 rounded hover:cursor-pointer hover:bg-green-300'>
            Save
          </button>
          <Link
            href={`/dashboard`}
            className='px-7 py-[10px] bg-gray-300 rounded hover:bg-gray-400 ml-4'>
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
