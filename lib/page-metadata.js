export function pageMetadata(title, description, privatePage=false) {
 return {title,description,openGraph:{title:`${title} | Track Trips`,description,siteName:'Track Trips',type:'website',images:[{url:'/assets/track-trips-social.png',width:1200,height:630,alt:'Track Trips — Plan trips. Share stories. Make memories.'}]},twitter:{card:'summary_large_image',images:['/assets/track-trips-social.png'],title:`${title} | Track Trips`,description},...(privatePage?{robots:{index:false,follow:false}}:{})};
}
