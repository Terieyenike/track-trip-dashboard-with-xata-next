import Header from "@/components/Heading";
import { getXataClient } from "@/src/xata";
import Link from "next/link";
import Image from "next/image";

const xata = getXataClient();

export default async function NoteDetail({ params }) {
  const record = await xata.db.notes.filter({ id: params.id }).getFirst();
  return (
    <>
      <Header name={"Note Detail"} />
      <div className='flex mb-4'>
        <Link
          href={"#"}
          className='px-7 py-2 bg-gray-300 rounded mr-4 hover:bg-gray-200'>
          Edit
        </Link>
        <button className='px-7 py-2 bg-red-300 rounded hover:bg-red-200 hover:cursor-pointer'>
          Delete
        </button>
      </div>
      <div className='bg-gray-50 p-8 rounded shadow hover:shadow-md my-4 flex flex-col md:flex-row'>
        <div className='md:w-1/2 md:mr-8'>
          <h2 className='text-2xl font-semibold mb-4'>{record.name}</h2>
          <p className='mb-2'>
            <span className='font-bold'>Description</span>: {record.description}
          </p>
          <p className='mb-2'>
            <span className='font-bold'>Type</span>: {record.type}
          </p>
          <p className='mb-2'>
            <span className='font-bold'>Rating</span>: {record.rating}/5
          </p>
        </div>
        <div className='md:w-1/2 md:ml-8'>
          <Image
            src={record.img.url}
            loading='lazy'
            width={300}
            height={300}
            alt='record.name'
            className='w-full h-auto'
          />
        </div>
      </div>
    </>
  );
}
