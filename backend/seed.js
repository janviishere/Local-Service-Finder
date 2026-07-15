import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  { name: 'Electrician',    slug: 'electrician',    icon: '⚡' },
  { name: 'Plumber',        slug: 'plumber',        icon: '🔧' },
  { name: 'House Cleaning', slug: 'house-cleaning', icon: '🏠' },
  { name: 'AC Repair',      slug: 'ac-repair',      icon: '❄️' },
  { name: 'Painting',       slug: 'painting',       icon: '🎨' },
  { name: 'Carpentry',      slug: 'carpentry',      icon: '🪵' },
  { name: 'Pest Control',   slug: 'pest-control',   icon: '🐜' },
  { name: 'Security',       slug: 'security',       icon: '🔒' },
];

const providersData = [
  // Madhya Pradesh
  { name: 'Rajesh Kumar',    email: 'rajesh@electric.com',   password: 'password123', role: 'provider', city: 'Bhopal',     avatar: 'https://i.pravatar.cc/150?img=12' },
  { name: 'Suresh Sharma',   email: 'suresh@plumb.com',      password: 'password123', role: 'provider', city: 'Indore',     avatar: 'https://i.pravatar.cc/150?img=15' },
  { name: 'Priya Verma',     email: 'priya@clean.com',       password: 'password123', role: 'provider', city: 'Bhopal',     avatar: 'https://i.pravatar.cc/150?img=47' },
  { name: 'Anil Singh',      email: 'anil@ac.com',           password: 'password123', role: 'provider', city: 'Indore',     avatar: 'https://i.pravatar.cc/150?img=51' },
  { name: 'Mohan Patel',     email: 'mohan@paint.com',       password: 'password123', role: 'provider', city: 'Jabalpur',   avatar: 'https://i.pravatar.cc/150?img=33' },
  { name: 'Vikram Das',      email: 'vikram@carp.com',       password: 'password123', role: 'provider', city: 'Gwalior',    avatar: 'https://i.pravatar.cc/150?img=68' },
  { name: 'Sunita Rao',      email: 'sunita@pest.com',       password: 'password123', role: 'provider', city: 'Bhopal',     avatar: 'https://i.pravatar.cc/150?img=25' },
  { name: 'Arjun Mehta',     email: 'arjun@security.com',    password: 'password123', role: 'provider', city: 'Indore',     avatar: 'https://i.pravatar.cc/150?img=11' },
  // Metro Cities
  { name: 'Rahul Desai',     email: 'rahul@repair.com',      password: 'password123', role: 'provider', city: 'Mumbai',     avatar: 'https://i.pravatar.cc/150?img=13' },
  { name: 'Kiran Patel',     email: 'kiran@clean.com',       password: 'password123', role: 'provider', city: 'Delhi',      avatar: 'https://i.pravatar.cc/150?img=44' },
  { name: 'Amit Sharma',     email: 'amit@plumb.com',        password: 'password123', role: 'provider', city: 'Bangalore',  avatar: 'https://i.pravatar.cc/150?img=59' },
  { name: 'Deepak Nair',     email: 'deepak@electric.com',   password: 'password123', role: 'provider', city: 'Pune',       avatar: 'https://i.pravatar.cc/150?img=17' },
  { name: 'Swetha Reddy',    email: 'swetha@clean.com',      password: 'password123', role: 'provider', city: 'Hyderabad',  avatar: 'https://i.pravatar.cc/150?img=45' },
  { name: 'Kartik Iyer',     email: 'kartik@paint.com',      password: 'password123', role: 'provider', city: 'Chennai',    avatar: 'https://i.pravatar.cc/150?img=21' },
  { name: 'Pooja Mishra',    email: 'pooja@pest.com',        password: 'password123', role: 'provider', city: 'Mumbai',     avatar: 'https://i.pravatar.cc/150?img=49' },
  { name: 'Sunil Joshi',     email: 'sunil@ac.com',          password: 'password123', role: 'provider', city: 'Pune',       avatar: 'https://i.pravatar.cc/150?img=35' },
  { name: 'Naveen Kumar',    email: 'naveen@security.com',   password: 'password123', role: 'provider', city: 'Bangalore',  avatar: 'https://i.pravatar.cc/150?img=63' },
  { name: 'Anjali Singh',    email: 'anjali@carp.com',       password: 'password123', role: 'provider', city: 'Delhi',      avatar: 'https://i.pravatar.cc/150?img=38' },
  { name: 'Harish Gupta',    email: 'harish@electric.com',   password: 'password123', role: 'provider', city: 'Hyderabad',  avatar: 'https://i.pravatar.cc/150?img=54' },
  { name: 'Rekha Pillai',    email: 'rekha@clean.com',       password: 'password123', role: 'provider', city: 'Chennai',    avatar: 'https://i.pravatar.cc/150?img=27' },
];

const customersData = [
  { name: 'Anita Sharma',  email: 'anita@test.com',  password: 'password123', role: 'customer', city: 'Bhopal'    },
  { name: 'Vikram Mehta',  email: 'vikram@test.com', password: 'password123', role: 'customer', city: 'Indore'    },
  { name: 'Kavya Reddy',   email: 'kavya@test.com',  password: 'password123', role: 'customer', city: 'Bhopal'    },
  { name: 'Rohit Gupta',   email: 'rohit@test.com',  password: 'password123', role: 'customer', city: 'Jabalpur'  },
  { name: 'Prachi Jain',   email: 'prachi@test.com', password: 'password123', role: 'customer', city: 'Mumbai'    },
  { name: 'Saurabh Rao',   email: 'saurabh@test.com',password: 'password123', role: 'customer', city: 'Bangalore' },
];

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Upsert Categories
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  console.log('✅ Categories seeded.');

  const dbCategories = await prisma.category.findMany();
  const getCatId = (slug) => dbCategories.find(c => c.slug === slug)?.id;

  // 2. Upsert Providers
  const hashedPassword = await bcrypt.hash('password123', 10);
  const providers = [];
  for (const p of providersData) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: { ...p, password: hashedPassword }
    });
    providers.push(user);
  }

  // 3. Upsert Customers
  const customers = [];
  for (const c of customersData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: { ...c, password: hashedPassword }
    });
    customers.push(user);
  }
  console.log('✅ Users seeded.');

  // 4. Create Services (delete old ones first to avoid duplicates)
  await prisma.review.deleteMany({});
  await prisma.service.deleteMany({});

  const servicesData = [
    // ══════════════════════════════════════════════
    // BHOPAL
    // ══════════════════════════════════════════════
    { title: 'Ceiling Fan Installation',       description: 'Professional installation of ceiling fans with proper wiring and safety checks. Includes testing and cleanup.',               price: '₹499',  categorySlug: 'electrician',    providerIdx: 0, city: 'Bhopal',     rating: 4.8, reviewCount: 312 },
    { title: 'Switchboard Repair & Upgrade',   description: 'Repair or replace damaged switchboards. Fix loose connections, tripped breakers, or upgrade to modular fittings.',         price: '₹299',  categorySlug: 'electrician',    providerIdx: 0, city: 'Bhopal',     rating: 4.6, reviewCount: 178 },
    { title: 'Full Home Wiring',               description: 'Complete new wiring for your home or office. ISI-marked wires, MCBs, and earthing — done to code.',                       price: '₹3999', categorySlug: 'electrician',    providerIdx: 0, city: 'Bhopal',     rating: 4.9, reviewCount: 87  },
    { title: 'Tap & Leakage Repair',           description: 'Fix dripping taps, leaking pipes and running cisterns. Fast response, genuine spare parts, long-lasting fix guaranteed.',  price: '₹199',  categorySlug: 'plumber',        providerIdx: 1, city: 'Bhopal',     rating: 4.9, reviewCount: 503 },
    { title: 'Bathroom Fittings Installation', description: 'Installation of showers, washbasins, commodes, and taps. Full plumbing for new bathrooms or renovations.',                price: '₹999',  categorySlug: 'plumber',        providerIdx: 1, city: 'Bhopal',     rating: 4.8, reviewCount: 196 },
    { title: 'Full Home Deep Cleaning',        description: 'Top-to-bottom deep cleaning of your entire home. Kitchen degreasing, bathroom scrubbing, floor mopping and more.',        price: '₹2999', categorySlug: 'house-cleaning', providerIdx: 2, city: 'Bhopal',     rating: 4.9, reviewCount: 621 },
    { title: 'Bathroom Cleaning',              description: 'Complete sanitisation of bathrooms including tiles, shower glass, commode, basin, and exhaust fan.',                      price: '₹549',  categorySlug: 'house-cleaning', providerIdx: 2, city: 'Bhopal',     rating: 4.7, reviewCount: 257 },
    { title: 'Sofa & Carpet Shampooing',       description: 'Deep shampoo cleaning of sofas, carpets, and curtains to remove stains, dust mites, and allergens.',                     price: '₹899',  categorySlug: 'house-cleaning', providerIdx: 2, city: 'Bhopal',     rating: 4.6, reviewCount: 134 },
    { title: 'AC Gas Refilling (R32/R22)',      description: 'AC gas top-up with refrigerant check and leak detection. Restores cooling to peak capacity with original gas.',          price: '₹1499', categorySlug: 'ac-repair',      providerIdx: 3, city: 'Bhopal',     rating: 4.7, reviewCount: 302 },
    { title: 'Exterior Wall Painting',         description: 'Weather-resistant exterior paint for entire building or compound wall. Waterproof coating, 5-year durability.',           price: '₹8999', categorySlug: 'painting',        providerIdx: 4, city: 'Bhopal',     rating: 4.6, reviewCount: 99  },
    { title: 'Modular Kitchen Fitting',        description: 'Full modular kitchen installation — carcass, shutters, handles, hinges, and countertop fitting by trained carpenters.',  price: '₹2999', categorySlug: 'carpentry',      providerIdx: 5, city: 'Bhopal',     rating: 4.9, reviewCount: 74  },
    { title: 'Cockroach Control Treatment',    description: 'Gel-bait and spray treatment for complete cockroach elimination. Odourless, safe for children and pets. 3-month warranty.', price: '₹699', categorySlug: 'pest-control',   providerIdx: 6, city: 'Bhopal',     rating: 4.8, reviewCount: 341 },
    { title: 'Bed Bug Treatment',              description: 'Heat and chemical treatment for complete bed bug elimination. Covers mattresses, bed frames, and surrounding areas.',      price: '₹999',  categorySlug: 'pest-control',   providerIdx: 6, city: 'Bhopal',     rating: 4.7, reviewCount: 89  },
    { title: 'Smart Lock Installation',        description: 'Install digital smart locks with PIN, fingerprint, RFID, and Bluetooth access. Compatible with all door types.',         price: '₹1499', categorySlug: 'security',       providerIdx: 7, city: 'Bhopal',     rating: 4.7, reviewCount: 117 },

    // ══════════════════════════════════════════════
    // INDORE
    // ══════════════════════════════════════════════
    { title: 'Power Outlet Installation',      description: 'Install new power points and USB outlets at any location in your home. Ideal for home theatre and kitchen setups.',      price: '₹199',  categorySlug: 'electrician',    providerIdx: 0, city: 'Indore',     rating: 4.7, reviewCount: 224 },
    { title: 'Drain & Sewer Cleaning',         description: 'Unblock clogged drains, basins, and sewer lines using high-pressure jet cleaning equipment.',                           price: '₹549',  categorySlug: 'plumber',        providerIdx: 1, city: 'Indore',     rating: 4.7, reviewCount: 142 },
    { title: 'Kitchen Deep Cleaning',          description: 'Intensive cleaning of kitchen chimney, tiles, gas hob, oven, and cabinets using eco-friendly industrial cleaners.',     price: '₹1299', categorySlug: 'house-cleaning', providerIdx: 2, city: 'Indore',     rating: 4.8, reviewCount: 389 },
    { title: 'AC Service & Cleaning',          description: 'Full service with filter cleaning, coil wash, refrigerant level check, and performance test. No hidden charges.',       price: '₹499',  categorySlug: 'ac-repair',      providerIdx: 3, city: 'Indore',     rating: 4.8, reviewCount: 448 },
    { title: 'Texture & Designer Painting',    description: 'Premium texture finishes like sponge, metallic, Venetian plaster, and stencil art to transform accent walls.',         price: '₹3499', categorySlug: 'painting',        providerIdx: 4, city: 'Indore',     rating: 4.8, reviewCount: 156 },
    { title: 'Door Repair & Fitting',          description: 'Fix stiff, warped, or damaged doors. Hinges, handles, door closers and wooden door frame repairs.',                     price: '₹599',  categorySlug: 'carpentry',      providerIdx: 5, city: 'Indore',     rating: 4.6, reviewCount: 163 },
    { title: 'Termite Proofing Treatment',     description: 'Pre-construction or post-construction chemical barrier for termite control. 5-year guarantee with annual inspection.',  price: '₹2499', categorySlug: 'pest-control',   providerIdx: 6, city: 'Indore',     rating: 4.9, reviewCount: 128 },
    { title: 'CCTV Camera Installation',       description: 'Install HD or IP CCTV cameras with DVR/NVR setup, remote viewing, and mobile alerts. Indoor and outdoor models.',      price: '₹2999', categorySlug: 'security',       providerIdx: 7, city: 'Indore',     rating: 4.8, reviewCount: 203 },

    // ══════════════════════════════════════════════
    // JABALPUR
    // ══════════════════════════════════════════════
    { title: 'Overhead Tank Cleaning',         description: 'Safe and thorough cleaning of overhead and underground water tanks. Removes sediment, algae, and bacteria.',            price: '₹799',  categorySlug: 'plumber',        providerIdx: 1, city: 'Jabalpur',   rating: 4.6, reviewCount: 91  },
    { title: 'Interior Room Painting',         description: '2-coat premium paint finish for living rooms, bedrooms, and halls. Putty application included for a smooth finish.',   price: '₹4999', categorySlug: 'painting',        providerIdx: 4, city: 'Jabalpur',   rating: 4.7, reviewCount: 213 },
    { title: 'Home Electrical Safety Audit',   description: 'Complete check of home wiring, breakers, and earthing. Get a report and fix unsafe connections.',                       price: '₹699',  categorySlug: 'electrician',    providerIdx: 0, city: 'Jabalpur',   rating: 4.5, reviewCount: 62  },
    { title: 'Cockroach & Ant Treatment',      description: 'Combined pest control for cockroaches, ants, and crawling insects using eco-safe sprays. Child and pet friendly.',     price: '₹599',  categorySlug: 'pest-control',   providerIdx: 6, city: 'Jabalpur',   rating: 4.6, reviewCount: 77  },

    // ══════════════════════════════════════════════
    // GWALIOR
    // ══════════════════════════════════════════════
    { title: 'AC Installation',                description: 'Professional split or window AC installation with copper pipe fitting, wall bracket, and electrical connections.',      price: '₹1199', categorySlug: 'ac-repair',      providerIdx: 3, city: 'Gwalior',    rating: 4.9, reviewCount: 177 },
    { title: 'Furniture Assembly',             description: 'Expert assembly of flat-pack furniture — beds, wardrobes, shelves, dining sets and more. Neat and precise.',            price: '₹399',  categorySlug: 'carpentry',      providerIdx: 5, city: 'Gwalior',    rating: 4.7, reviewCount: 287 },
    { title: 'Inverter & UPS Repair',          description: 'Diagnose and repair home inverters, UPS units, and battery systems. Genuine parts used, 90-day warranty.',             price: '₹599',  categorySlug: 'electrician',    providerIdx: 0, city: 'Gwalior',    rating: 4.6, reviewCount: 98  },
    { title: 'Security Alarm System Setup',    description: 'Install motion detectors, door sensors, and alarm panels for complete home security with mobile notifications.',        price: '₹3499', categorySlug: 'security',       providerIdx: 7, city: 'Gwalior',    rating: 4.7, reviewCount: 54  },

    // ══════════════════════════════════════════════
    // MUMBAI
    // ══════════════════════════════════════════════
    { title: 'AC Servicing (Split/Window)',    description: 'Complete jet cleaning of AC units. Removes dust buildup and improves cooling efficiency significantly.',               price: '₹499',  categorySlug: 'ac-repair',      providerIdx: 8, city: 'Mumbai',     rating: 4.9, reviewCount: 450 },
    { title: 'Washing Machine Repair',         description: 'Fixing all top load and front load washing machine issues — motor, drum, pump and electronics.',                       price: '₹399',  categorySlug: 'electrician',    providerIdx: 8, city: 'Mumbai',     rating: 4.7, reviewCount: 120 },
    { title: 'Refrigerator Repair',            description: 'Diagnose and fix fridge cooling issues, compressor problems, and gas leaks. Same-day service available.',             price: '₹499',  categorySlug: 'electrician',    providerIdx: 8, city: 'Mumbai',     rating: 4.8, reviewCount: 203 },
    { title: '1/2/3 BHK Deep Cleaning',       description: 'Full house cleaning including floor scrubbing, bathroom, kitchen, and window cleaning. Book for 3–6 hr slots.',        price: '₹1999', categorySlug: 'house-cleaning', providerIdx: 14, city: 'Mumbai',    rating: 4.8, reviewCount: 730 },
    { title: 'Cockroach Control (Mumbai)',     description: 'Targeted gel and spray treatment for cockroach elimination in apartments. Safe for families and pets.',                price: '₹699',  categorySlug: 'pest-control',   providerIdx: 14, city: 'Mumbai',    rating: 4.9, reviewCount: 512 },
    { title: 'AC Gas Top-Up (Mumbai)',         description: 'Quick AC refrigerant top-up service with performance testing. Available for all brands.',                              price: '₹1299', categorySlug: 'ac-repair',      providerIdx: 8, city: 'Mumbai',     rating: 4.7, reviewCount: 198 },
    { title: 'Home Painting (2BHK)',           description: '2BHK complete interior painting with Asian Paints or Berger. Putty, primer, and 2-coat finish included.',              price: '₹9999', categorySlug: 'painting',        providerIdx: 13, city: 'Mumbai',    rating: 4.8, reviewCount: 143 },
    { title: 'CCTV Installation (Mumbai)',     description: '4/8-channel DVR with Full-HD cameras, night vision, and remote mobile access. Includes 3-month support.',             price: '₹3499', categorySlug: 'security',       providerIdx: 16, city: 'Mumbai',    rating: 4.9, reviewCount: 276 },

    // ══════════════════════════════════════════════
    // DELHI
    // ══════════════════════════════════════════════
    { title: 'Deep Cleaning Studio/1BHK',      description: 'Full house cleaning including floor scrubbing, bathroom, and kitchen. Trusted across Delhi NCR.',                     price: '₹1999', categorySlug: 'house-cleaning', providerIdx: 9, city: 'Delhi',      rating: 4.8, reviewCount: 612 },
    { title: 'Sofa Cleaning (5 Seater)',       description: 'Shampoo and vacuuming of fabric and leather sofas. Removes deep-seated dirt and allergens.',                          price: '₹799',  categorySlug: 'house-cleaning', providerIdx: 9, city: 'Delhi',      rating: 4.9, reviewCount: 301 },
    { title: 'Wardrobe & Shelf Fitting',       description: 'Install and fix wardrobes, floating shelves, and storage units. Precision wall mounting with appropriate anchors.',   price: '₹799',  categorySlug: 'carpentry',      providerIdx: 17, city: 'Delhi',     rating: 4.7, reviewCount: 189 },
    { title: 'Electric Geyser Installation',   description: 'Install or replace water heaters safely with proper insulation, earthing, and pressure relief valve.',                price: '₹499',  categorySlug: 'electrician',    providerIdx: 0, city: 'Delhi',      rating: 4.8, reviewCount: 234 },
    { title: 'Pest Control (Full Home)',       description: 'Complete home pest control — cockroaches, termites, rats, mosquitoes, and bedbugs. Annual packages available.',       price: '₹1499', categorySlug: 'pest-control',   providerIdx: 6, city: 'Delhi',      rating: 4.6, reviewCount: 445 },
    { title: 'Smart Home Security Setup',      description: 'Complete smart home security — cameras, smart locks, motion sensors, and doorbell with mobile integration.',           price: '₹5999', categorySlug: 'security',       providerIdx: 7, city: 'Delhi',      rating: 4.9, reviewCount: 88  },

    // ══════════════════════════════════════════════
    // BANGALORE
    // ══════════════════════════════════════════════
    { title: 'Tap & Shower Replacement',       description: 'Replacing old or leaking bathroom fittings including showers, taps, and mixers with quality branded parts.',          price: '₹199',  categorySlug: 'plumber',        providerIdx: 10, city: 'Bangalore', rating: 4.8, reviewCount: 220 },
    { title: 'Blockage Removal (Bangalore)',   description: 'Clearing clogged sinks, bathroom drains, and kitchen drainage using professional tools.',                             price: '₹299',  categorySlug: 'plumber',        providerIdx: 10, city: 'Bangalore', rating: 4.6, reviewCount: 95  },
    { title: 'TV Wall Mounting',               description: 'Professional TV mounting with concealed wiring. Works with all wall types including false ceiling and brick.',          price: '₹499',  categorySlug: 'carpentry',      providerIdx: 10, city: 'Bangalore', rating: 4.9, reviewCount: 410 },
    { title: 'AC Installation (Bangalore)',    description: 'Split or window AC installation by certified technicians. Includes copper pipe, brackets, and foam insulation.',       price: '₹1099', categorySlug: 'ac-repair',      providerIdx: 3,  city: 'Bangalore', rating: 4.8, reviewCount: 167 },
    { title: 'Home Deep Cleaning (Bangalore)', description: '3BHK full home deep cleaning. Kitchen, bathrooms, fans, windows, and floor sanitization. Eco-friendly products.',     price: '₹3499', categorySlug: 'house-cleaning', providerIdx: 9,  city: 'Bangalore', rating: 4.9, reviewCount: 489 },
    { title: 'CCTV & Security (Bangalore)',    description: '360-degree security setup with wireless cameras, door sensors, and smart alarm system for homes and offices.',         price: '₹3999', categorySlug: 'security',       providerIdx: 16, city: 'Bangalore', rating: 4.8, reviewCount: 134 },
    { title: 'Interior Painting (Bangalore)',  description: '2/3BHK interior painting with premium paint brands. Wall putty, primer, and texture finish options available.',        price: '₹6999', categorySlug: 'painting',        providerIdx: 13, city: 'Bangalore', rating: 4.7, reviewCount: 195 },

    // ══════════════════════════════════════════════
    // PUNE
    // ══════════════════════════════════════════════
    { title: 'Electrical Wiring (Pune)',       description: 'New wiring for apartments, villas, and commercial spaces. MCB panels, earthing, and concealed wiring.',               price: '₹4499', categorySlug: 'electrician',    providerIdx: 11, city: 'Pune',      rating: 4.8, reviewCount: 143 },
    { title: 'AC Service & Repair (Pune)',     description: 'Complete AC service including gas refill, filter cleaning, coil cleaning, and performance test.',                     price: '₹599',  categorySlug: 'ac-repair',      providerIdx: 15, city: 'Pune',      rating: 4.7, reviewCount: 312 },
    { title: 'Full Home Cleaning (Pune)',      description: 'Complete home cleaning for 1–4 BHK. Bathroom, kitchen, bedroom, and living room — sanitized and spotless.',           price: '₹2499', categorySlug: 'house-cleaning', providerIdx: 9,  city: 'Pune',      rating: 4.8, reviewCount: 267 },
    { title: 'Plumbing Services (Pune)',       description: 'All plumbing works — leakage repair, pipeline repair, tap replacement, and new connections in Pune.',                  price: '₹349',  categorySlug: 'plumber',        providerIdx: 10, city: 'Pune',      rating: 4.6, reviewCount: 178 },
    { title: 'Termite Control (Pune)',         description: 'Long-lasting termite treatment for homes and offices. Guaranteed results with 5-year post-construction warranty.',    price: '₹1999', categorySlug: 'pest-control',   providerIdx: 14, city: 'Pune',      rating: 4.8, reviewCount: 97  },

    // ══════════════════════════════════════════════
    // HYDERABAD
    // ══════════════════════════════════════════════
    { title: 'Electrician (Hyderabad)',        description: 'Certified electricians for all electrical repairs, wiring, fan and light installation across Hyderabad.',             price: '₹299',  categorySlug: 'electrician',    providerIdx: 18, city: 'Hyderabad', rating: 4.7, reviewCount: 283 },
    { title: 'Deep Cleaning (Hyderabad)',      description: 'Full home deep cleaning for 2–4 BHK. Includes kitchen degreasing, bathroom sanitization, and floor polishing.',       price: '₹2699', categorySlug: 'house-cleaning', providerIdx: 12, city: 'Hyderabad', rating: 4.8, reviewCount: 354 },
    { title: 'AC Service (Hyderabad)',         description: 'Complete AC maintenance — filter cleaning, coil wash, gas top-up, and leak check. All brands supported.',             price: '₹499',  categorySlug: 'ac-repair',      providerIdx: 15, city: 'Hyderabad', rating: 4.9, reviewCount: 411 },
    { title: 'Plumber (Hyderabad)',            description: 'Fix all plumbing issues — pipeline leaks, blockages, tap replacements, and bathroom fitting installation.',           price: '₹249',  categorySlug: 'plumber',        providerIdx: 10, city: 'Hyderabad', rating: 4.6, reviewCount: 156 },
    { title: 'Pest Control (Hyderabad)',       description: 'Complete pest elimination — cockroaches, bedbugs, termites, and rodents. 3-month service guarantee.',                price: '₹799',  categorySlug: 'pest-control',   providerIdx: 6,  city: 'Hyderabad', rating: 4.7, reviewCount: 223 },
    { title: 'Home Painting (Hyderabad)',      description: 'Interior and exterior painting with popular brands. Putty, primer included. Competitive rates for Hyderabad.',        price: '₹5499', categorySlug: 'painting',        providerIdx: 13, city: 'Hyderabad', rating: 4.6, reviewCount: 118 },

    // ══════════════════════════════════════════════
    // CHENNAI
    // ══════════════════════════════════════════════
    { title: 'Interior Painting (Chennai)',    description: '2BHK premium interior painting with washable emulsion and designer finishes. Quick completion, clean worksite.',       price: '₹5999', categorySlug: 'painting',        providerIdx: 13, city: 'Chennai',   rating: 4.8, reviewCount: 163 },
    { title: 'Home Cleaning (Chennai)',        description: 'Complete home deep cleaning service for all room types. Eco-friendly solutions, trained professionals.',               price: '₹2299', categorySlug: 'house-cleaning', providerIdx: 19, city: 'Chennai',   rating: 4.7, reviewCount: 298 },
    { title: 'Plumbing (Chennai)',             description: 'Expert plumbing services — tap repair, drain cleaning, pipeline replacement, and overhead tank cleaning.',            price: '₹299',  categorySlug: 'plumber',        providerIdx: 10, city: 'Chennai',   rating: 4.6, reviewCount: 187 },
    { title: 'AC Repair (Chennai)',            description: 'Expert AC repair and service for all models. Gas refill, compressor repair, and coil cleaning.',                     price: '₹549',  categorySlug: 'ac-repair',      providerIdx: 15, city: 'Chennai',   rating: 4.8, reviewCount: 389 },
    { title: 'CCTV (Chennai)',                 description: 'HD security cameras for homes, shops, and offices. 4/8 channel DVR systems with app monitoring and alerts.',         price: '₹2799', categorySlug: 'security',       providerIdx: 16, city: 'Chennai',   rating: 4.7, reviewCount: 142 },
    { title: 'Electrical Work (Chennai)',      description: 'All home electrical work — wiring, switchboard repairs, fan installation, and inverter fitting.',                    price: '₹349',  categorySlug: 'electrician',    providerIdx: 18, city: 'Chennai',   rating: 4.7, reviewCount: 204 },
  ];

  const dbServices = [];
  for (const s of servicesData) {
    const { categorySlug, providerIdx, ...rest } = s;
    const service = await prisma.service.create({
      data: { ...rest, categoryId: getCatId(categorySlug), providerId: providers[providerIdx].id }
    });
    dbServices.push(service);
  }
  console.log(`✅ ${dbServices.length} services seeded.`);

  // 5. Create Reviews
  const reviewsData = [
    { rating: 5, comment: 'Rajesh was absolutely professional. Fixed our fan within 30 minutes. Highly recommend!', userId: customers[0].id, serviceId: dbServices[0].id },
    { rating: 5, comment: 'Excellent work. Very clean and precise wiring done for our new home.', userId: customers[1].id, serviceId: dbServices[2].id },
    { rating: 5, comment: 'Suresh fixed the tap in no time. No mess left behind. Will call again!', userId: customers[2].id, serviceId: dbServices[3].id },
    { rating: 4, comment: 'Good service. Drain was fully cleared. Was slightly delayed but communicated well.', userId: customers[0].id, serviceId: dbServices[14].id },
    { rating: 5, comment: 'Priya and her team are AMAZING. The house looks brand new after the deep cleaning.', userId: customers[3].id, serviceId: dbServices[5].id },
    { rating: 5, comment: 'Kitchen is sparkling clean. Even cleaned areas I did not expect. Outstanding job!', userId: customers[1].id, serviceId: dbServices[16].id },
    { rating: 5, comment: 'AC is cooling perfectly now. Anil was thorough in his service. Will book again.', userId: customers[0].id, serviceId: dbServices[17].id },
    { rating: 4, comment: 'Good painting job. Color finish is smooth. Took one day more than quoted but worth it.', userId: customers[2].id, serviceId: dbServices[22].id },
    { rating: 5, comment: 'Cockroach problem completely eliminated after first treatment. Very impressed!', userId: customers[3].id, serviceId: dbServices[11].id },
    { rating: 5, comment: 'CCTV setup done perfectly with remote access on my phone. Feels much safer now.', userId: customers[1].id, serviceId: dbServices[21].id },
    { rating: 5, comment: 'Furniture assembled in 2 hours. Very careful with the parts. Highly satisfied!', userId: customers[4].id, serviceId: dbServices[25].id },
    { rating: 5, comment: 'Mumbai AC service was excellent. AC is working like new now!', userId: customers[4].id, serviceId: dbServices[28].id },
    { rating: 4, comment: 'Good deep cleaning service in Delhi. Team was professional and on time.', userId: customers[5].id, serviceId: dbServices[36].id },
    { rating: 5, comment: 'TV wall mounted perfectly. Wiring was concealed neatly. Great job!', userId: customers[5].id, serviceId: dbServices[48].id },
    { rating: 5, comment: 'Best pest control in Hyderabad. Haven\'t seen a single cockroach since!', userId: customers[4].id, serviceId: dbServices[56].id },
  ];

  for (const r of reviewsData) {
    await prisma.review.create({ data: r });
  }
  console.log('✅ Reviews seeded.');
  console.log('🎉 Seeding finished!');

  console.log('\n📝 Test Accounts:');
  console.log('Customer: anita@test.com / password123');
  console.log('Customer: vikram@test.com / password123');
  console.log('Customer: prachi@test.com / password123');
  console.log('Provider: rajesh@electric.com / password123');
  console.log('Provider: suresh@plumb.com / password123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
