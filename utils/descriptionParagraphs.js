export default function generateDescriptionParagraphs(description) {
  return description.split("\n").map((paragraph, index) => (
    <p key={index} className='mb-2'>
      {paragraph}
    </p>
  ));
}
