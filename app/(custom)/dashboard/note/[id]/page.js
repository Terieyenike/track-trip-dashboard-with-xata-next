import Header from "@/components/Heading";
import Link from "next/link";
import Image from "next/image";
import { capitalizeWords } from "@/utils/capitalizeWords";
import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export default async function NoteDetail({ params }) {
  const record = await xata.db.notes.read({ id: params.id });

  const descriptionParagraphs = record.description
    .split("\n")
    .map((paragraph, index) => (
      <p key={index} className='mb-2'>
        {paragraph}
      </p>
    ));

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
      <div className='bg-gray-50 p-8 rounded shadow hover:shadow-md my-4 md:flex xl:flex-row flex-col'>
        <div className='xl:w-1/2 xl:flex-grow xl:mr-8'>
          <h2 className='text-2xl font-semibold mb-4'>
            {capitalizeWords(record.name)}
          </h2>
          <div className='mb-2'>
            <span className='font-bold'>Description</span>:
            {descriptionParagraphs}
          </div>
          <p className='mb-2'>
            <span className='font-bold'>Type</span>: {record.type}
          </p>
          <p className='mb-2'>
            <span className='font-bold'>Rating</span>: {record.rating}/5
          </p>
        </div>
        <div className='xl:w-1/2 xl:ml-8'>
          <Image
            src={record.img.url}
            priority={true}
            width={300}
            height={300}
            alt={record.name}
            className='w-full h-auto'
          />
        </div>
      </div>
    </>
  );
}
