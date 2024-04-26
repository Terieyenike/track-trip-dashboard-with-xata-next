"use client";

import { apiNoteDetail } from "@/utils/api-note-detail";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

export const revalidate = 0;

export default function Note() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notesData = await apiNoteDetail();
        setNotes(JSON.parse(notesData));
      } catch (error) {
        console.log("Error fetching notes", error);
      }
    };
    fetchNotes();
  }, []);
  return (
    <>
      <h3 className='font-bold text-xl pb-4'>Notes:</h3>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {notes.map((note) => (
          <Link href={"#"} key={note.id}>
            <div className='border rounded-lg pb-4 shadow hover:shadow-lg flex flex-col'>
              <Image
                src={note.img.url}
                width={300}
                height={300}
                alt={note.name}
                className='w-full rounded-t-md object-cover h-48'
              />
              <div class='flex-grow px-4 py-2'>
                <p class='text-center mt-3 text-lg font-bold'>Kpalime</p>
                <p class='text-center mt-1 text-lg truncate'>{note.name}</p>
                <p class='text-center mt-1 text-gray-500'>
                  Rating: {note.rating}/5
                </p>
              </div>
            </div>
          </Link>
        ))}
        <Link href={"/dashboard/note/create/"}>
          <div class='border-2 border-dashed rounded-lg hover:shadow flex justify-center items-center'>
            <p class=''>New Note +</p>
          </div>
        </Link>
      </div>
    </>
  );
}
