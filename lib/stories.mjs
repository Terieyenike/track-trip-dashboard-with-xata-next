export function buildStory(trip, notes, input) {
  const text = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
  if (input.title !== undefined && !text(input.title,150)) throw new Error('Add a story title of up to 150 characters.');
  if (!text(input.author, 60) || !text(input.takeaway, 1200)) throw new Error('Add a display name and a useful takeaway.');
  if (!Array.isArray(input.noteIds) || input.noteIds.length > 30 || new Set(input.noteIds).size !== input.noteIds.length) throw new Error('Choose up to 30 memories.');
  const selected = input.noteIds.map(id => {
    const note = notes.find(note => note.id === id && note.trip === trip.id);
    if (!note) throw new Error('A selected memory is unavailable.');
    return { name: note.name, description: note.description, category: note.type, rating: Number(note.rating) };
  });
  return { title: input.title?.trim() || trip.title, city: trip.city, country: trip.country, author: input.author.trim(), takeaway: input.takeaway.trim(), memories: selected };
}
export function validPublicStory(story) {
 const text=(value,max)=>typeof value==='string' && value.trim().length>0 && value.length<=max;
 return Boolean(story && text(story.title,150) && text(story.city,150) && text(story.country,150) && text(story.author,60) && text(story.takeaway,1200) && Array.isArray(story.memories) && story.memories.length<=30 && story.memories.every(note=>note && text(note.name,150) && text(note.description,10000) && text(note.category,40) && Number.isInteger(note.rating) && note.rating>=1 && note.rating<=5));
}
export function storyToTrip(story, storyId, start, end, makeId) {
 if(!validPublicStory(story))throw new Error('This story cannot be used as a template.');
 const validDate=value=>typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
 if(!validDate(start)||!validDate(end)||end<start)throw new Error('Choose valid start and end dates.');
 const days=Math.round((Date.parse(end+'T12:00:00Z')-Date.parse(start+'T12:00:00Z'))/86400000)+1;
 if(days>365)throw new Error('Choose a trip of up to 365 days.');
 return {id:makeId(),title:story.title,city:story.city,country:story.country,start,end,status:'Planning',image:'/assets/pexels-pixabay-208745.jpg',description:`Inspired by ${story.author}: ${story.takeaway}`,sourceStory:{id:storyId,author:story.author},plan:{currency:'USD',budget:0,packing:[],activities:story.memories.map((note,index)=>({id:makeId(),title:note.name,date:new Date(Date.parse(start+'T12:00:00Z')+Math.min(index,days-1)*86400000).toISOString().slice(0,10),time:'',type:note.category==='Dining'?'Food':'Explore',place:'',notes:'Inspired by a shared memory. Verify opening times, availability, and prices before booking.',link:'',cost:0,actualCost:null,done:false}))}};
}
