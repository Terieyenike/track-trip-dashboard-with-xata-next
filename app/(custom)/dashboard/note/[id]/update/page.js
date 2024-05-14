"use client";

import Header from "@/components/Heading";
import { filterNote } from "@/utils/filter";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const revalidate = 0;

export default function Update({ params }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { record } = await filterNote(JSON.parse(JSON.stringify(params)));
        setName(record.name);
        setDescription(record.description);
        setType(record.type);
      } catch (error) {
        console.error("Error fetching note data:", error);
      }
    };

    fetchData();
  }, [params]);

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Form submitted with values:", { name, description, type });
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

        <div>
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
