import Header from "@/components/Heading";
import Link from "next/link";
import Image from "next/image";
import { getXataClient } from "@/src/xata";
import { capitalizeWords } from "@/utils/capitalizeWords";

const xata = getXataClient();

export default async function Trip({ params }) {
  const record = await xata.db.trips.filter({ id: params.id }).getFirst();

  return (
    <>
      <Header name={"Trip Details"} />
      <div className='bg-gray-50 p-8 rounded shadow my-4'>
        <p className='text-2xl'>
          {record?.country.toUpperCase()} | {capitalizeWords(record?.city)}
        </p>
        <div className='my-10'>
          <Link
            href={"#"}
            className='px-7 py-2 bg-gray-300 rounded mr-4 hover:bg-gray-200'>
            Edit
          </Link>
          <button className='px-7 py-2 bg-red-300 rounded hover:bg-red-200 hover:cursor-pointer'>
            Delete
          </button>
        </div>
        <h3 className='text-xl pb-4'>Notes:</h3>
        <div className='flex flex-wrap gap-2'>
          <Link href={"#"}>
            <div className='border-2 rounded-lg pb-4 hover:shadow'>
              <Image
                src='https://res.cloudinary.com/terieyenike/image/upload/v1697874936/teri_w7yxei.jpg'
                alt='teri'
                width={192}
                height={192}
                className='rounded-t-md overflow-hidden'
                style={{
                  objectFit: "cover",
                }}
              />
              <p className='text-center mt-4 text-lg'>Surfing</p>
              <p className='text-center mt-2 text-gray-600'>Rating: 4/5</p>
            </div>
          </Link>
          <Link href={"/dashboard/note/create"}>
            <div className='border-2 border-dashed rounded-lg hover:shadow w-48 h-48 flex justify-center items-center'>
              <p className='min-h-32'>New Note +</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
