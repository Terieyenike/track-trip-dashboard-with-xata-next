import test from 'node:test';
import assert from 'node:assert/strict';
import {buildStory,validPublicStory} from '../lib/stories.mjs';
import {initial,validateFields} from '../utils/travel-data.mjs';
test('public snapshot includes only selected own-trip memories and excludes private fields',()=>{
 const trip={...initial.trips[2],plan:{budget:50000},description:'private',image:'/api/photos/private'};
 const story=buildStory(trip,initial.notes,{author:'Traveler',takeaway:'Go early',noteIds:['first-memory']});
 assert.equal(validPublicStory(story),true);
 for(const field of ['id','start','end','image','plan','description','owner_id'])assert.equal(field in story,false);
 assert.equal('image' in story.memories[0],false);
 assert.throws(()=>buildStory(initial.trips[0],initial.notes,{author:'Traveler',takeaway:'Tip',noteIds:['first-memory']}));
});
test('public reader rejects malformed and oversized story content',()=>{
 assert.equal(validPublicStory({title:'broken'}),false);
 const story=buildStory(initial.trips[2],initial.notes,{author:'Traveler',takeaway:'Tip',noteIds:[]});
 story.memories=[{name:'name',description:'text',category:'category',rating:1000000}];assert.equal(validPublicStory(story),false);
});
test('journal supports custom categories with bounded lengths',()=>{
 const note={...initial.notes[0],type:'Local traditions'};
 assert.equal(validateFields(note,true,initial.trips),'');
 assert.notEqual(validateFields({...note,type:'x'.repeat(41)},true,initial.trips),'');
});
test('story templates use new identities and user dates without copying private records',async()=>{
 const {storyToTrip}=await import('../lib/stories.mjs');
 const story=buildStory(initial.trips[2],initial.notes,{author:'Traveler',takeaway:'Go early',noteIds:['first-memory']});
 let id=0;const trip=storyToTrip(story,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','2027-02-02','2027-02-04',()=>String(++id));
 assert.equal(trip.sourceStory.author,'Traveler');assert.equal(trip.plan.activities[0].date,'2027-02-02');assert.equal(trip.plan.activities[0].actualCost,null);
 assert.equal(validateFields(trip,false,[]),'');assert.equal(trip.status,'Planning');
 assert.throws(()=>storyToTrip(story,'id','2027-02-30','2027-03-04',()=>String(++id)));
});
test('public story titles are independent of author and reject empty titles',()=>{
 const input={title:'A weekend on the coast',author:'Travel Writer',takeaway:'Visit early',noteIds:[]};
 const story=buildStory(initial.trips[2],initial.notes,input);
 assert.equal(story.title,input.title);assert.equal(story.author,input.author);
 assert.throws(()=>buildStory(initial.trips[2],initial.notes,{...input,title:'   '}));
});
