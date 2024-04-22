export function capitalizeWords(str) {
  return str
    .toLowerCase()
    .split(/\s+|-/)
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}
