"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getTrips } from "@/utils/get-trips";
import { formatDate } from "@/utils/date";
import { capitalizeWords } from "@/utils/capitalizeWords";
import Header from "@/components/Heading";

export const revalidate = 0;

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const tripsData = await getTrips();
        setTrips(JSON.parse(tripsData));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trips:", error);
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  return (
    <>
      <Header name={"My Trips"} />
      {loading ? (
        <div className='flex justify-center pt-16'>
          <p>Loading...</p>
        </div>
      ) : (
        trips.length === 0 && <p>No travel memories found</p>
      )}

      {!loading &&
        trips?.map((trip) => (
          <Link href={`/dashboard/trip/${trip.id}`} key={trip.id}>
            <div className='bg-gray-50 p-10 rounded shadow my-4 hover:shadow-lg hover:cursor-pointer'>
              <p className='text-lg'>
                {trip?.country ? trip?.country.toUpperCase() : ""} |{" "}
                {trip?.city ? capitalizeWords(trip?.city) : ""}
              </p>
              <p className='text-sm pt-4'>
                <span>{trip?.start ? formatDate(trip?.start) : ""}</span> to{" "}
                <span>{trip?.end ? formatDate(trip?.end) : ""}</span>
              </p>
            </div>
          </Link>
        ))}
    </>
  );
}
