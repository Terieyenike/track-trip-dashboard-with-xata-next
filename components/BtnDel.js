"use client";

import { deleteNote } from "@/utils/delete";
import { useRouter } from "next/navigation";
import ConfirmationDialog from "./ConfirmationDialog";

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
      <ConfirmationDialog onConfirm={handleDelete} />
    </>
  );
}
