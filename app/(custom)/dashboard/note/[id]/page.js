import Header from "@/components/Heading";
import Link from "next/link";
import Image from "next/image";
import { capitalizeWords } from "@/utils/capitalizeWords";
import generateDescriptionParagraphs from "@/utils/descriptionParagraphs";
import { filter } from "@/utils/filter";
import BtnDel from "@/components/BtnDel";

export default async function NoteDetail({ params }) {
  const record = await filter(params);

  const descriptionParagraphs = generateDescriptionParagraphs(
    record.description
  );

  return (
    <>
      <Header name={"Note Detail"} />
      <div className='flex mb-4'>
        <Link
          href={"#"}
          className='px-7 py-2 bg-gray-300 rounded mr-4 hover:bg-gray-200'>
          Edit
        </Link>
        <BtnDel delete={record.id} />
      </div>
      {record ? (
        <div className='bg-gray-50 p-8 rounded shadow hover:shadow-md my-4 md:flex xl:flex-row flex-col'>
          <div className='xl:w-1/2 xl:flex-grow xl:mr-8'>
            <h2 className='text-2xl font-semibold mb-4'>
              {record.id}
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
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
