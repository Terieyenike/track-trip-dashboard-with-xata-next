"use client";

import { apiNoteDetail } from "@/utils/api-note-detail";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

export const revalidate = 0;

export default function Note() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notesData = await apiNoteDetail();
        setNotes(JSON.parse(notesData));
        setLoading(false);
      } catch (error) {
        console.log("Error fetching notes", error);
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);
  return (
    <>
      <h3 className='font-bold text-xl pb-4'>Notes:</h3>
      {loading ? (
        <div className='flex justify-center pt-16'>
          <p>Loading...</p>
        </div>
      ) : (
        notes.length === 0 && <p>No notes found</p>
      )}

      {!loading && (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {notes.map((note) => (
            <Link href={`/dashboard/note/${note.id}`} key={note.id}>
              <div className='border rounded-lg pb-4 shadow hover:shadow-lg flex flex-col'>
                <Image
                  src={note.img.url}
                  loading='lazy'
                  width={300}
                  height={300}
                  alt={note.name}
                  className='w-full rounded-t-md object-cover h-48'
                />
                <div className='flex-grow px-4 py-2'>
                  <p className='text-center mt-3 text-lg font-bold'>Kpalime</p>
                  <p className='text-center mt-1 text-lg truncate'>
                    {note.name}
                  </p>
                  <p className='text-center mt-1 text-gray-500'>
                    Rating: {note.rating}/5
                  </p>
                </div>
              </div>
            </Link>
          ))}
          <Link href={"/dashboard/note/create/"}>
            <div className='border-2 border-dashed rounded-lg hover:shadow flex justify-center items-center'>
              <p className='text-gray-500'>New Note +</p>
            </div>
          </Link>
        </div>
      )}
    </>
  );
}
