// Seed demo leads / listings / deals so the cockpit is alive on first run.
// Run: node --env-file=.env.local scripts/seed.mjs
import { createClient } from '@supabase/supabase-js';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const A = process.env.AGENT_ID;
if (!A) { console.error('Set AGENT_ID in .env.local first'); process.exit(1); }

const leads = [
  { agent_id:A, name:'Priya Naidoo', phone:'27825550198', suburb:'Beaulieu', source:'website_valuation', lead_type:'seller', temperature:'hot', status:'new', summary:'Ready to list' },
  { agent_id:A, name:'Sipho Mahlangu', email:'sipho@mail.com', suburb:'Carlswald', source:'whatsapp', lead_type:'seller', temperature:'hot', status:'new', summary:'Wants a valuation' },
  { agent_id:A, name:'The Bekker Family', phone:'27715550142', suburb:'Blue Hills', source:'property24', lead_type:'buyer', temperature:'warm', status:'contacted', summary:'Looking up to R4m' },
  { agent_id:A, name:'Aisha Patel', email:'aisha@mail.com', suburb:'Noordwyk', source:'referral', lead_type:'seller', temperature:'warm', status:'appraisal_booked', summary:'Appraisal Thu' },
];
const listings = [
  { agent_id:A, title:'4-bed family home', suburb:'Beaulieu', address:'Shetland St', price:5499000, beds:4, baths:3, garages:2, status:'active', views:1240, enquiries:18 },
  { agent_id:A, title:'Cluster in secure estate', suburb:'Bridle Park', address:'Coral Wood Village', price:2600000, beds:3, baths:2, garages:2, status:'under_offer', views:860, enquiries:11 },
  { agent_id:A, title:'Modern 4-bed on 1 acre', suburb:'Glenferness', address:'Maple Rd', price:3950000, beds:4, baths:3, garages:3, status:'active', views:640, enquiries:7 },
];

const { error: le } = await db.from('leads').insert(leads);
const { data: lst, error: lse } = await db.from('listings').insert(listings).select('id,price');
if (le || lse) { console.error(le || lse); process.exit(1); }

const deals = [
  { agent_id:A, listing_id:lst[0].id, stage:'live' },
  { agent_id:A, listing_id:lst[1].id, stage:'otp', otp_amount:2600000 },
  { agent_id:A, listing_id:lst[2].id, stage:'mandate' },
];
await db.from('deals').insert(deals);
await db.from('mandates').insert([{ agent_id:A, listing_id:lst[0].id, type:'sole', mandate_price:5499000 }]);
console.log('Seeded: leads, listings, deals, mandate.');
