"use client";

import { deleteNote } from "@/utils/delete";
import { useRouter } from "next/navigation";

export default function BtnDel({ id }) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteNote(id);
      router.push("/dashboard/note/");
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };
  return (
    <>
      <button
        className='px-7 py-2 bg-red-300 rounded hover:bg-red-200 hover:cursor-pointer'
        onClick={handleDelete}>
        Delete
      </button>
    </>
  );
}
