"use client";

import { deleteTrip } from "@/utils/delete-trip";
import { deleteNote } from "@/utils/delete";
import { useRouter } from "next/navigation";
import ConfirmationDialog from "./ConfirmationDialog";

export default function BtnDelTrip({ id }) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteTrip(id);
      await deleteNote(id);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting trip", error);
    }
  };
  return (
    <>
      <ConfirmationDialog onConfirm={handleDelete} />
    </>
  );
}
