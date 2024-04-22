export function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    month: "long",
    day: "numeric",
  };
  const day = date.getDate();
  const suffix = (day) =>
    (day >= 11 && day <= 13) || day % 10 > 3
      ? "th"
      : ["st", "nd", "rd"][(day % 10) - 1];
  return `${date.toLocaleDateString("en-US", options)}${suffix(day)}`;
}
