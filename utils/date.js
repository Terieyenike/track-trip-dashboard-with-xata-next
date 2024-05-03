export function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    month: "long",
    day: "numeric",
  };
  const day = date.getDate();
  const suffix = (day) => {
    if (day >= 11 && day <= 13) {
      return "th";
    } else {
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    }
  };
  return `${date.toLocaleDateString("en-US", options)}${suffix(day)}`;
}
