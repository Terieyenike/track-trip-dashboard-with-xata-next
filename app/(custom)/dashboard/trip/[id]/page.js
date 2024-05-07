import Header from "@/components/Heading";
import Link from "next/link";
import Image from "next/image";
import { capitalizeWords } from "@/utils/capitalizeWords";
import BtnDelTrip from "@/components/BtnDelTrip";
import { filterTrip } from "@/utils/filterTrip";
import { getXataClient } from "@/src/xata";

export default async function Trip({ params }) {
  const xata = getXataClient();
  const { data } = await filterTrip(params);

  const notes = await xata.db.notes.filter("trip.id", data?.id).getMany();

  return (
    <>
      <Header name={"Trip Details"} />
      <div className='bg-gray-50 p-8 rounded shadow my-4'>
        <p className='text-2xl'>
          {data?.country.toUpperCase()} | {capitalizeWords(data?.city)}
        </p>
        <div className='my-10'>
          <Link
            href={`/dashboard/trip/${data.id}/update`}
            className='px-7 py-2 bg-gray-300 rounded mr-4 hover:bg-gray-200'>
            Edit
          </Link>
          <BtnDelTrip id={data.id} note={notes[0]?.id} />
        </div>
        <h3 className='text-xl pb-4'>Notes:</h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
          {notes.map((note) => (
            <Link href={`/dashboard/note/${note.id}`} key={note.id}>
              <div className='w-full'>
                <div className='border-2 rounded-lg pb-4 hover:shadow cursor-pointer'>
                  <Image
                    src={note.img.url}
                    alt={note.name}
                    width={300}
                    height={300}
                    priority={true}
                    className='w-full rounded-t-md overflow-hidden h-32'
                    style={{
                      objectFit: "cover",
                    }}
                  />
                  <div className='flex-grow px-4 py-2'>
                    <p className='text-center mt-4 text-lg truncate'>
                      {capitalizeWords(note.name)}
                    </p>
                    <p className='text-center mt-2 text-gray-600'>
                      Rating: {note.rating}/5
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          <Link href={"/dashboard/note/create"}>
            <div className='w-full'>
              <div className='border-2 border-dashed rounded-lg hover:shadow h-48 flex justify-center items-center'>
                <p className='min-h-32'>New Note +</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
