import { toast } from "react-toastify";

const submitTripData = async (city, country, start, end) => {
  try {
    const response = await fetch(
      "https://teri-eyenike-s-workspace-14frfm.eu-west-1.xata.sh/db/track-trip-dashboard-with-xata-next:main/tables/trips/data?columns=id",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.XATA_API_KEY}`,
        },
        body: JSON.stringify({
          city: city,
          country: country,
          start: start,
          end: end,
        }),
      }
    );
    if (response.ok) {
      toast.success("Trip data stored successfully.");
      // Optionally, return data if needed
      // return await response.json();
    } else {
      toast.error("Failed to store trip data.");
    }
  } catch (error) {
    toast.error("Error storing trip data:", error.message);
  }
};

export { submitTripData };
