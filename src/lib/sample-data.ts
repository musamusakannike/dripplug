import { SerializedCategory, SerializedProduct, SerializedReview } from "@/types";

export const SAMPLE_CATEGORIES: Omit<SerializedCategory, "_id">[] = [
  {
    name: "Jerseys",
    slug: "jerseys",
    image:
      "https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=900&q=80",
    description: "Retro football kits, basketball jerseys & custom UNILORIN campus jerseys.",
    order: 1,
  },
  {
    name: "Round Necks",
    slug: "round-necks",
    image:
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=80",
    description: "Essential heavyweight 280GSM everyday crewnecks built for Ilorin weather.",
    order: 2,
  },
  {
    name: "T-Shirts",
    slug: "t-shirts",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    description: "Boxy drop-shoulder graphic tees and vintage wash streetwear shirts.",
    order: 3,
  },
  {
    name: "Baggy Jeans",
    slug: "baggy-jeans",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
    description: "90s wide-leg denim, skater jeans, and relaxed carpenter pants.",
    order: 4,
  },
  {
    name: "Joggers",
    slug: "joggers",
    image:
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=900&q=80",
    description: "Fleece sweatpants, uncuffed wide-leg joggers, and multi-pocket cargos.",
    order: 5,
  },
  {
    name: "Hoodies",
    slug: "hoodies",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
    description: "Plush 400GSM oversized pullover and zip-up hoodies for cold morning lectures.",
    order: 6,
  },
  {
    name: "Caps",
    slug: "caps",
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=80",
    description: "Snapbacks, distressed dad hats, and trucker caps to finish the fit.",
    order: 7,
  },
];

const DEFAULT_FAQS = [
  {
    question: "How fast is UNILORIN campus delivery?",
    answer:
      "Orders placed before 3 PM are delivered the same day within 1–4 hours to Old Park, New Park, or directly to your hostel.",
  },
  {
    question: "Does this shrink after washing?",
    answer:
      "No. All our cotton tees, round necks, and hoodies are pre-shrunk and enzyme-washed to hold their boxy fit.",
  },
  {
    question: "Can I exchange if the size doesn't fit?",
    answer:
      "Yes! Unworn items with tags intact can be exchanged within 48 hours of delivery at Old Park at no extra cost.",
  },
];

export const SAMPLE_PRODUCTS: Omit<SerializedProduct, "_id" | "category" | "createdAt">[] = [
  // 1. JERSEYS
  {
    name: "UNILORIN '75 Retro Varsity Football Jersey",
    slug: "unilorin-75-retro-varsity-football-jersey",
    description:
      "Breathable jacquard mesh retro jersey with embroidered crest and oversized boxy drape. Built for Friday campus fits and inter-faculty games.",
    details: [
      "100% breathable micro-mesh polyester (210 GSM)",
      "Woven vintage crest and tackle-twill back number",
      "Ribbed striped V-neck collar and cuffs",
      "Relaxed unisex boxy streetwear cut",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "jerseys",
    images: [
      "https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 14500,
    compareAtPrice: 18000,
    colors: [
      { name: "Navy Blue", hex: "#1E3A8A" },
      { name: "White", hex: "#FFFFFF" },
    ],
    variants: [
      { size: "M", color: "Navy Blue", sku: "JRS-UNI-NVY-M", stock: 12 },
      { size: "L", color: "Navy Blue", sku: "JRS-UNI-NVY-L", stock: 15 },
      { size: "XL", color: "Navy Blue", sku: "JRS-UNI-NVY-XL", stock: 8 },
      { size: "M", color: "White", sku: "JRS-UNI-WHT-M", stock: 10 },
      { size: "L", color: "White", sku: "JRS-UNI-WHT-L", stock: 9 },
    ],
    tags: ["jersey", "football", "retro", "unilorin", "sportswear"],
    isFeatured: true,
    isActive: true,
    soldCount: 84,
    ratingAverage: 4.8,
    ratingCount: 16,
  },
  {
    name: "Milan '07 Kaka Retro Long-Sleeve Kit",
    slug: "milan-07-retro-long-sleeve-kit",
    description:
      "Iconic Champions League era long-sleeve retro football jersey. Pairs effortlessly with baggy jorts or wide-leg denim.",
    details: [
      "Classic red and black vertical stripe weave",
      "Moisture-wicking honeycomb fabric",
      "True-to-size or size up for oversized look",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "jerseys",
    images: [
      "https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 16000,
    compareAtPrice: 20000,
    colors: [
      { name: "Crimson Red", hex: "#DC2626" },
      { name: "White", hex: "#FFFFFF" },
    ],
    variants: [
      { size: "S", color: "Crimson Red", sku: "JRS-MIL-RED-S", stock: 6 },
      { size: "M", color: "Crimson Red", sku: "JRS-MIL-RED-M", stock: 14 },
      { size: "L", color: "Crimson Red", sku: "JRS-MIL-RED-L", stock: 11 },
      { size: "XL", color: "Crimson Red", sku: "JRS-MIL-RED-XL", stock: 5 },
      { size: "L", color: "White", sku: "JRS-MIL-WHT-L", stock: 7 },
    ],
    tags: ["jersey", "retro", "milan", "long-sleeve"],
    isFeatured: true,
    isActive: true,
    soldCount: 62,
    ratingAverage: 4.9,
    ratingCount: 12,
  },
  {
    name: "Harlem 99 Mesh Basketball Jersey",
    slug: "harlem-99-mesh-basketball-jersey",
    description:
      "Heavyweight perforated basketball tank jersey with double-layered tackle twill numbers and contrast striped trim.",
    details: [
      "Heavy 260 GSM poly-mesh construction",
      "Thick striped knit armhole and neck trim",
      "Ideal for layering over a white round neck tee",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "jerseys",
    images: [
      "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 12500,
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" },
    ],
    variants: [
      { size: "M", color: "Black", sku: "JRS-HLM-BLK-M", stock: 10 },
      { size: "L", color: "Black", sku: "JRS-HLM-BLK-L", stock: 14 },
      { size: "XL", color: "Black", sku: "JRS-HLM-BLK-XL", stock: 8 },
      { size: "L", color: "White", sku: "JRS-HLM-WHT-L", stock: 6 },
    ],
    tags: ["jersey", "basketball", "mesh", "sleeveless"],
    isFeatured: false,
    isActive: true,
    soldCount: 39,
    ratingAverage: 4.6,
    ratingCount: 8,
  },

  // 2. ROUND NECKS
  {
    name: "Essential 280GSM Heavyweight Round Neck",
    slug: "essential-280gsm-heavyweight-round-neck",
    description:
      "No-logo luxury blank round neck tee with a thick 1-inch collar that never bacon-wrinkles. Your daily lecture staple.",
    details: [
      "100% combed ring-spun cotton (280 GSM)",
      "High-density ribbed crew neckline",
      "Drop-shoulder boxy silhouette",
      "Breathable for sunny Ilorin afternoons",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "round-necks",
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 8500,
    compareAtPrice: 11000,
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Heather Grey", hex: "#9CA3AF" },
      { name: "Sand Beige", hex: "#D6C7B2" },
    ],
    variants: [
      { size: "S", color: "Black", sku: "RNK-ESS-BLK-S", stock: 20 },
      { size: "M", color: "Black", sku: "RNK-ESS-BLK-M", stock: 25 },
      { size: "L", color: "Black", sku: "RNK-ESS-BLK-L", stock: 30 },
      { size: "XL", color: "Black", sku: "RNK-ESS-BLK-XL", stock: 15 },
      { size: "M", color: "White", sku: "RNK-ESS-WHT-M", stock: 22 },
      { size: "L", color: "White", sku: "RNK-ESS-WHT-L", stock: 18 },
      { size: "L", color: "Heather Grey", sku: "RNK-ESS-GRY-L", stock: 14 },
      { size: "L", color: "Sand Beige", sku: "RNK-ESS-SND-L", stock: 12 },
    ],
    tags: ["round neck", "plain tee", "heavyweight", "essential", "cotton"],
    isFeatured: true,
    isActive: true,
    soldCount: 145,
    ratingAverage: 4.9,
    ratingCount: 34,
  },
  {
    name: "Washed Olive Boxy Crewneck Tee",
    slug: "washed-olive-boxy-crewneck-tee",
    description:
      "Pigment-dyed vintage wash round neck with subtle seam distressing and ultra-soft handfeel.",
    details: [
      "260 GSM garment-dyed cotton jersey",
      "Relaxed chest with slightly cropped waist",
      "Double-needle stitch reinforcement",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "round-necks",
    images: [
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 9500,
    colors: [
      { name: "Olive Green", hex: "#3F6212" },
      { name: "Black", hex: "#000000" },
    ],
    variants: [
      { size: "M", color: "Olive Green", sku: "RNK-OLV-M", stock: 14 },
      { size: "L", color: "Olive Green", sku: "RNK-OLV-L", stock: 16 },
      { size: "XL", color: "Olive Green", sku: "RNK-OLV-XL", stock: 9 },
      { size: "L", color: "Black", sku: "RNK-OLV-BLK-L", stock: 10 },
    ],
    tags: ["round neck", "olive", "vintage wash", "boxy"],
    isFeatured: false,
    isActive: true,
    soldCount: 51,
    ratingAverage: 4.7,
    ratingCount: 9,
  },
  {
    name: "Contrast Stitch Ribbed Round Neck",
    slug: "contrast-stitch-ribbed-round-neck",
    description:
      "Clean streetwear round neck elevated with exposed contrast overlock stitching along the shoulders and hem.",
    details: [
      "270 GSM structured cotton",
      "Contrast white twin-needle overlock seams",
      "Snug anti-sag collar",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "round-necks",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 10000,
    compareAtPrice: 12500,
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Navy Blue", hex: "#1E3A8A" },
    ],
    variants: [
      { size: "S", color: "Black", sku: "RNK-CNT-BLK-S", stock: 8 },
      { size: "M", color: "Black", sku: "RNK-CNT-BLK-M", stock: 12 },
      { size: "L", color: "Black", sku: "RNK-CNT-BLK-L", stock: 15 },
      { size: "M", color: "Navy Blue", sku: "RNK-CNT-NVY-M", stock: 10 },
    ],
    tags: ["round neck", "contrast stitch", "streetwear"],
    isFeatured: false,
    isActive: true,
    soldCount: 44,
    ratingAverage: 4.5,
    ratingCount: 6,
  },

  // 3. T-SHIRTS
  {
    name: "One Life Puff-Print Graphic T-Shirt",
    slug: "one-life-puff-print-graphic-t-shirt",
    description:
      "Oversized streetwear graphic t-shirt crafted from soft breathable heavyweight cotton with raised 3D puff-ink chest and back artwork.",
    details: [
      "100% heavyweight carded cotton (290 GSM)",
      "Raised 3D puff-print front & back graphics",
      "Dropped shoulders with elbow-skimming sleeves",
      "Pre-shrunk and machine washable (turn inside out)",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "t-shirts",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 12000,
    compareAtPrice: 15000,
    colors: [
      { name: "Olive Green", hex: "#3F6212" },
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" },
    ],
    variants: [
      { size: "S", color: "Olive Green", sku: "TSH-ONL-OLV-S", stock: 9 },
      { size: "M", color: "Olive Green", sku: "TSH-ONL-OLV-M", stock: 18 },
      { size: "L", color: "Olive Green", sku: "TSH-ONL-OLV-L", stock: 22 },
      { size: "XL", color: "Olive Green", sku: "TSH-ONL-OLV-XL", stock: 11 },
      { size: "M", color: "Black", sku: "TSH-ONL-BLK-M", stock: 15 },
      { size: "L", color: "Black", sku: "TSH-ONL-BLK-L", stock: 19 },
      { size: "L", color: "White", sku: "TSH-ONL-WHT-L", stock: 14 },
    ],
    tags: ["t-shirt", "graphic tee", "puff print", "oversized"],
    isFeatured: true,
    isActive: true,
    soldCount: 118,
    ratingAverage: 4.8,
    ratingCount: 24,
  },
  {
    name: "Ilorin Concrete Jungle Acid-Wash Tee",
    slug: "ilorin-concrete-jungle-acid-wash-tee",
    description:
      "Vintage charcoal acid-wash t-shirt featuring distressed screen-printed street typography.",
    details: [
      "Custom mineral acid-wash finish",
      "Cracked plastisol vintage screen print",
      "Thick 2.5cm collar rib",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "t-shirts",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 13000,
    compareAtPrice: 16000,
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Heather Grey", hex: "#9CA3AF" },
    ],
    variants: [
      { size: "M", color: "Black", sku: "TSH-ACID-BLK-M", stock: 13 },
      { size: "L", color: "Black", sku: "TSH-ACID-BLK-L", stock: 17 },
      { size: "XL", color: "Black", sku: "TSH-ACID-BLK-XL", stock: 10 },
      { size: "L", color: "Heather Grey", sku: "TSH-ACID-GRY-L", stock: 8 },
    ],
    tags: ["t-shirt", "acid wash", "vintage", "graphic"],
    isFeatured: true,
    isActive: true,
    soldCount: 76,
    ratingAverage: 4.7,
    ratingCount: 15,
  },
  {
    name: "Raglan Monochrome Sleeve Striped Tee",
    slug: "raglan-monochrome-sleeve-striped-tee",
    description:
      "Skater-inspired contrast raglan sleeve t-shirt with breathable jersey body and relaxed shoulder line.",
    details: [
      "Contrast black raglan sleeves on crisp body",
      "Soft 240 GSM combed cotton",
      "Easy everyday campus styling",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "t-shirts",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 10500,
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Crimson Red", hex: "#DC2626" },
    ],
    variants: [
      { size: "S", color: "White", sku: "TSH-RAG-WHT-S", stock: 7 },
      { size: "M", color: "White", sku: "TSH-RAG-WHT-M", stock: 14 },
      { size: "L", color: "White", sku: "TSH-RAG-WHT-L", stock: 12 },
      { size: "M", color: "Crimson Red", sku: "TSH-RAG-RED-M", stock: 9 },
      { size: "L", color: "Crimson Red", sku: "TSH-RAG-RED-L", stock: 11 },
    ],
    tags: ["t-shirt", "raglan", "striped"],
    isFeatured: false,
    isActive: true,
    soldCount: 48,
    ratingAverage: 4.6,
    ratingCount: 10,
  },
  {
    name: "No Cap Typography Oversized Tee",
    slug: "no-cap-typography-oversized-tee",
    description:
      "Minimalist front logo with bold back brutalist typography print. Heavyweight cotton that holds its boxy shape all day.",
    details: [
      "280 GSM organic ring-spun cotton",
      "High-definition matte screen print",
      "Tagless printed neck label for zero itch",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "t-shirts",
    images: [
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 11500,
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Sand Beige", hex: "#D6C7B2" },
    ],
    variants: [
      { size: "M", color: "White", sku: "TSH-NCP-WHT-M", stock: 16 },
      { size: "L", color: "White", sku: "TSH-NCP-WHT-L", stock: 18 },
      { size: "XL", color: "White", sku: "TSH-NCP-WHT-XL", stock: 9 },
      { size: "L", color: "Sand Beige", sku: "TSH-NCP-SND-L", stock: 12 },
    ],
    tags: ["t-shirt", "graphic", "oversized", "white tee"],
    isFeatured: false,
    isActive: true,
    soldCount: 64,
    ratingAverage: 4.8,
    ratingCount: 11,
  },

  // 4. BAGGY JEANS
  {
    name: "90s Skater Wide-Leg Baggy Jeans",
    slug: "90s-skater-wide-leg-baggy-jeans",
    description:
      "Authentic 14oz non-stretch denim cut with a roomy thigh and clean wide leg that stacks effortlessly over sneakers.",
    details: [
      "100% rigid 14oz cotton denim",
      "5-pocket classic construction with YKK brass zip fly",
      "Wide leg opening designed to stack on chunky kicks",
      "Reinforced belt loops and bar-tack stress points",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "baggy-jeans",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 21000,
    compareAtPrice: 25000,
    colors: [
      { name: "Washed Blue", hex: "#3B82F6" },
      { name: "Black", hex: "#000000" },
    ],
    variants: [
      { size: "S", color: "Washed Blue", sku: "BGY-90S-BLU-S", stock: 8 },
      { size: "M", color: "Washed Blue", sku: "BGY-90S-BLU-M", stock: 15 },
      { size: "L", color: "Washed Blue", sku: "BGY-90S-BLU-L", stock: 18 },
      { size: "XL", color: "Washed Blue", sku: "BGY-90S-BLU-XL", stock: 10 },
      { size: "M", color: "Black", sku: "BGY-90S-BLK-M", stock: 12 },
      { size: "L", color: "Black", sku: "BGY-90S-BLK-L", stock: 14 },
    ],
    tags: ["baggy jeans", "denim", "wide leg", "skater", "jeans"],
    isFeatured: true,
    isActive: true,
    soldCount: 132,
    ratingAverage: 4.9,
    ratingCount: 29,
  },
  {
    name: "Washed Black Carpenter Utility Denim",
    slug: "washed-black-carpenter-utility-denim",
    description:
      "Relaxed baggy carpenter jeans featuring side hammer loop, utility tool pockets, and vintage charcoal fade.",
    details: [
      "Heavyweight sulfur-washed black denim",
      "Functional side utility pockets and hammer loop",
      "Relaxed straight-wide leg fit",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "baggy-jeans",
    images: [
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 22500,
    compareAtPrice: 26500,
    colors: [{ name: "Black", hex: "#000000" }],
    variants: [
      { size: "M", color: "Black", sku: "BGY-CRP-BLK-M", stock: 11 },
      { size: "L", color: "Black", sku: "BGY-CRP-BLK-L", stock: 14 },
      { size: "XL", color: "Black", sku: "BGY-CRP-BLK-XL", stock: 9 },
    ],
    tags: ["baggy jeans", "carpenter", "black jeans", "denim"],
    isFeatured: true,
    isActive: true,
    soldCount: 89,
    ratingAverage: 4.8,
    ratingCount: 19,
  },
  {
    name: "Vintage Indigo Seam-Detail Baggy Jeans",
    slug: "vintage-indigo-seam-detail-baggy-jeans",
    description:
      "Architectural twisted-seam baggy denim with whiskers and sandblasted knee fade for a worn-in thrifted look.",
    details: [
      "13.5oz mid-indigo vintage wash denim",
      "Articulated knee darts for volume",
      "Unisex sizing (S=30W, M=32W, L=34W, XL=36W)",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "baggy-jeans",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 23000,
    colors: [{ name: "Washed Blue", hex: "#3B82F6" }],
    variants: [
      { size: "S", color: "Washed Blue", sku: "BGY-IND-S", stock: 6 },
      { size: "M", color: "Washed Blue", sku: "BGY-IND-M", stock: 13 },
      { size: "L", color: "Washed Blue", sku: "BGY-IND-L", stock: 11 },
      { size: "XL", color: "Washed Blue", sku: "BGY-IND-XL", stock: 7 },
    ],
    tags: ["baggy jeans", "indigo", "denim", "vintage"],
    isFeatured: false,
    isActive: true,
    soldCount: 55,
    ratingAverage: 4.7,
    ratingCount: 10,
  },

  // 5. JOGGERS
  {
    name: "Heavy Fleece Wide-Leg Uncuffed Joggers",
    slug: "heavy-fleece-wide-leg-uncuffed-joggers",
    description:
      "Straight open-hem sweatpants with hidden drawcord toggles so you can wear them wide-leg or cinched at the ankle.",
    details: [
      "380 GSM brushed cotton-blend fleece",
      "Deep zippered side pockets so your phone never falls out in a korope",
      "Adjustable bungee cord hem toggles",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "joggers",
    images: [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 15500,
    compareAtPrice: 18500,
    colors: [
      { name: "Heather Grey", hex: "#9CA3AF" },
      { name: "Black", hex: "#000000" },
    ],
    variants: [
      { size: "S", color: "Heather Grey", sku: "JOG-WDE-GRY-S", stock: 9 },
      { size: "M", color: "Heather Grey", sku: "JOG-WDE-GRY-M", stock: 16 },
      { size: "L", color: "Heather Grey", sku: "JOG-WDE-GRY-L", stock: 19 },
      { size: "XL", color: "Heather Grey", sku: "JOG-WDE-GRY-XL", stock: 8 },
      { size: "M", color: "Black", sku: "JOG-WDE-BLK-M", stock: 15 },
      { size: "L", color: "Black", sku: "JOG-WDE-BLK-L", stock: 17 },
    ],
    tags: ["joggers", "sweatpants", "wide leg", "fleece"],
    isFeatured: true,
    isActive: true,
    soldCount: 94,
    ratingAverage: 4.8,
    ratingCount: 18,
  },
  {
    name: "Tactical 6-Pocket Ripstop Cargo Joggers",
    slug: "tactical-6-pocket-ripstop-cargo-joggers",
    description:
      "Lightweight water-repellent ripstop cargo joggers with gusseted bellows pockets and elasticated ankle cuffs.",
    details: [
      "Durable cotton-nylon ripstop weave",
      "6 functional pockets with snap-flap closures",
      "Elastic waist with woven belt",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "joggers",
    images: [
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 17000,
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Olive Green", hex: "#3F6212" },
      { name: "Sand Beige", hex: "#D6C7B2" },
    ],
    variants: [
      { size: "M", color: "Black", sku: "JOG-CRG-BLK-M", stock: 12 },
      { size: "L", color: "Black", sku: "JOG-CRG-BLK-L", stock: 14 },
      { size: "M", color: "Olive Green", sku: "JOG-CRG-OLV-M", stock: 10 },
      { size: "L", color: "Olive Green", sku: "JOG-CRG-OLV-L", stock: 11 },
      { size: "L", color: "Sand Beige", sku: "JOG-CRG-SND-L", stock: 8 },
    ],
    tags: ["joggers", "cargos", "ripstop", "streetwear"],
    isFeatured: false,
    isActive: true,
    soldCount: 67,
    ratingAverage: 4.7,
    ratingCount: 14,
  },
  {
    name: "Campus Tech-Fleece Tapered Joggers",
    slug: "campus-tech-fleece-tapered-joggers",
    description:
      "Sleek tapered athletic joggers with bonded zip pocket and articulated knee panelling.",
    details: [
      "Smooth double-faced spacer fleece",
      "Heat-sealed vertical zip thigh pocket",
      "Ribbed ankle cuffs",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "joggers",
    images: [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 14500,
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Navy Blue", hex: "#1E3A8A" },
    ],
    variants: [
      { size: "S", color: "Black", sku: "JOG-TCH-BLK-S", stock: 8 },
      { size: "M", color: "Black", sku: "JOG-TCH-BLK-M", stock: 14 },
      { size: "L", color: "Black", sku: "JOG-TCH-BLK-L", stock: 13 },
      { size: "L", color: "Navy Blue", sku: "JOG-TCH-NVY-L", stock: 9 },
    ],
    tags: ["joggers", "tech fleece", "athletic"],
    isFeatured: false,
    isActive: true,
    soldCount: 41,
    ratingAverage: 4.5,
    ratingCount: 7,
  },

  // 6. HOODIES
  {
    name: "400GSM Cloud-Heavy Boxy Pullover Hoodie",
    slug: "400gsm-cloud-heavy-boxy-pullover-hoodie",
    description:
      "Ultra-plush 400GSM double-lined hood pullover without drawstrings for a clean, structured silhouette during harmattan and rainy mornings.",
    details: [
      "400 GSM 80% cotton / 20% poly heavyweight fleece",
      "Double-layered structured hood (no drawstring clutter)",
      "Kangaroo pouch with hidden inner phone sleeve",
      "Drop-shoulder boxy fit",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "hoodies",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 22000,
    compareAtPrice: 27000,
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Heather Grey", hex: "#9CA3AF" },
      { name: "Navy Blue", hex: "#1E3A8A" },
    ],
    variants: [
      { size: "M", color: "Black", sku: "HOD-CLD-BLK-M", stock: 14 },
      { size: "L", color: "Black", sku: "HOD-CLD-BLK-L", stock: 20 },
      { size: "XL", color: "Black", sku: "HOD-CLD-BLK-XL", stock: 12 },
      { size: "M", color: "Heather Grey", sku: "HOD-CLD-GRY-M", stock: 11 },
      { size: "L", color: "Heather Grey", sku: "HOD-CLD-GRY-L", stock: 15 },
      { size: "L", color: "Navy Blue", sku: "HOD-CLD-NVY-L", stock: 9 },
    ],
    tags: ["hoodie", "heavyweight", "pullover", "harmattan"],
    isFeatured: true,
    isActive: true,
    soldCount: 110,
    ratingAverage: 4.9,
    ratingCount: 27,
  },
  {
    name: "Distressed Vintage Zip-Up Street Hoodie",
    slug: "distressed-vintage-zip-up-street-hoodie",
    description:
      "Full-zip washed charcoal hoodie with antique silver two-way zipper and subtle distressing along the cuffs and pocket edge.",
    details: [
      "360 GSM French terry cotton (breathable year-round)",
      "Two-way metal YKK zipper for styling versatility",
      "Faded pigment wash",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "hoodies",
    images: [
      "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 24000,
    compareAtPrice: 28000,
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Olive Green", hex: "#3F6212" },
    ],
    variants: [
      { size: "M", color: "Black", sku: "HOD-ZIP-BLK-M", stock: 10 },
      { size: "L", color: "Black", sku: "HOD-ZIP-BLK-L", stock: 14 },
      { size: "XL", color: "Black", sku: "HOD-ZIP-BLK-XL", stock: 7 },
      { size: "L", color: "Olive Green", sku: "HOD-ZIP-OLV-L", stock: 8 },
    ],
    tags: ["hoodie", "zip-up", "vintage", "french terry"],
    isFeatured: false,
    isActive: true,
    soldCount: 58,
    ratingAverage: 4.8,
    ratingCount: 13,
  },
  {
    name: "Arch Appliqué Varsity Fleece Hoodie",
    slug: "arch-applique-varsity-fleece-hoodie",
    description:
      "Collegiate chenille patch hoodie with contrast satin stitch embroidery and cozy brushed fleece interior.",
    details: [
      "350 GSM cotton-poly fleece",
      "Tackle-twill and chenille chest appliqué",
      "Rib-knit cuffs and waistband with spandex retention",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "hoodies",
    images: [
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 21500,
    colors: [
      { name: "Crimson Red", hex: "#DC2626" },
      { name: "Navy Blue", hex: "#1E3A8A" },
    ],
    variants: [
      { size: "M", color: "Crimson Red", sku: "HOD-VAR-RED-M", stock: 9 },
      { size: "L", color: "Crimson Red", sku: "HOD-VAR-RED-L", stock: 12 },
      { size: "M", color: "Navy Blue", sku: "HOD-VAR-NVY-M", stock: 11 },
      { size: "L", color: "Navy Blue", sku: "HOD-VAR-NVY-L", stock: 10 },
    ],
    tags: ["hoodie", "varsity", "collegiate"],
    isFeatured: false,
    isActive: true,
    soldCount: 37,
    ratingAverage: 4.6,
    ratingCount: 8,
  },

  // 7. CAPS
  {
    name: "Washed Twill Distressed Dad Cap",
    slug: "washed-twill-distressed-dad-cap",
    description:
      "Unstructured 6-panel cotton twill cap with curved brim, vintage enzyme wash, and antique brass strap buckle.",
    details: [
      "100% heavy washed cotton twill",
      "3D tonal front embroidery",
      "Adjustable self-fabric strap with brass clasp",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "caps",
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 6500,
    compareAtPrice: 8500,
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Sand Beige", hex: "#D6C7B2" },
      { name: "Olive Green", hex: "#3F6212" },
    ],
    variants: [
      { size: "One Size", color: "Black", sku: "CAP-DAD-BLK-OS", stock: 25 },
      { size: "One Size", color: "Sand Beige", sku: "CAP-DAD-SND-OS", stock: 18 },
      { size: "One Size", color: "Olive Green", sku: "CAP-DAD-OLV-OS", stock: 15 },
    ],
    tags: ["cap", "dad hat", "hat", "accessories"],
    isFeatured: true,
    isActive: true,
    soldCount: 156,
    ratingAverage: 4.9,
    ratingCount: 31,
  },
  {
    name: "Two-Tone Corduroy Snapback Cap",
    slug: "two-tone-corduroy-snapback-cap",
    description:
      "Structured 5-panel pinch-front snapback crafted in fine-wale cotton corduroy with contrast visor.",
    details: [
      "Fine-wale 100% cotton corduroy crown",
      "Contrast suede-feel brim",
      "Adjustable snapback closure",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "caps",
    images: [
      "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 7500,
    colors: [
      { name: "Navy Blue", hex: "#1E3A8A" },
      { name: "Crimson Red", hex: "#DC2626" },
    ],
    variants: [
      { size: "One Size", color: "Navy Blue", sku: "CAP-CRD-NVY-OS", stock: 16 },
      { size: "One Size", color: "Crimson Red", sku: "CAP-CRD-RED-OS", stock: 12 },
    ],
    tags: ["cap", "snapback", "corduroy", "hat"],
    isFeatured: false,
    isActive: true,
    soldCount: 49,
    ratingAverage: 4.7,
    ratingCount: 9,
  },
  {
    name: "Street Mesh Foam Trucker Hat",
    slug: "street-mesh-foam-trucker-hat",
    description:
      "High-crown trucker cap with breathable mesh back panels and bold puff-printed front graphic.",
    details: [
      "Structured foam front panel",
      "Breathable nylon mesh back for hot campus days",
      "Adjustable double-row snap closure",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "caps",
    images: [
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 6000,
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" },
    ],
    variants: [
      { size: "One Size", color: "Black", sku: "CAP-TRK-BLK-OS", stock: 20 },
      { size: "One Size", color: "White", sku: "CAP-TRK-WHT-OS", stock: 14 },
    ],
    tags: ["cap", "trucker", "mesh hat"],
    isFeatured: false,
    isActive: true,
    soldCount: 72,
    ratingAverage: 4.6,
    ratingCount: 11,
  },
  {
    name: "Senate Building '88 Retro Jersey",
    slug: "senate-building-88-retro-jersey",
    description:
      "Classic striped campus jersey with embroidered collar badge and moisture-wicking breathable knit.",
    details: [
      "220 GSM breathable jacquard poly-knit",
      "Embroidered chest crest and woven hem tag",
      "Relaxed unisex football fit",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "jerseys",
    images: [
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 13500,
    compareAtPrice: 16500,
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Navy Blue", hex: "#1E3A8A" },
    ],
    variants: [
      { size: "M", color: "White", sku: "JRS-SEN-WHT-M", stock: 14 },
      { size: "L", color: "White", sku: "JRS-SEN-WHT-L", stock: 16 },
      { size: "XL", color: "White", sku: "JRS-SEN-WHT-XL", stock: 9 },
      { size: "L", color: "Navy Blue", sku: "JRS-SEN-NVY-L", stock: 11 },
    ],
    tags: ["jersey", "unilorin", "retro", "white"],
    isFeatured: false,
    isActive: true,
    soldCount: 53,
    ratingAverage: 4.7,
    ratingCount: 9,
  },
  {
    name: "Sandstone Heavyweight Mock-Neck Tee",
    slug: "sandstone-heavyweight-mock-neck-tee",
    description:
      "Elevated high-ribbed mock round neck tee in desert sand tone, cut wide through the chest and shoulders.",
    details: [
      "290 GSM heavyweight combed cotton",
      "High 1.25-inch ribbed collar",
      "Boxy silhouette",
    ],
    faqs: DEFAULT_FAQS,
    categorySlug: "round-necks",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    ],
    basePrice: 9000,
    colors: [
      { name: "Sand Beige", hex: "#D6C7B2" },
      { name: "Black", hex: "#000000" },
    ],
    variants: [
      { size: "S", color: "Sand Beige", sku: "RNK-SND-S", stock: 10 },
      { size: "M", color: "Sand Beige", sku: "RNK-SND-M", stock: 15 },
      { size: "L", color: "Sand Beige", sku: "RNK-SND-L", stock: 14 },
      { size: "L", color: "Black", sku: "RNK-SND-BLK-L", stock: 12 },
    ],
    tags: ["round neck", "mock neck", "sand", "heavyweight"],
    isFeatured: false,
    isActive: true,
    soldCount: 47,
    ratingAverage: 4.8,
    ratingCount: 10,
  },
];

export const SAMPLE_VERIFIED_REVIEWS: SerializedReview[] = [
  {
    _id: "rev_1",
    product: "prod_1",
    user: "usr_1",
    userName: "Tobi A. (Engineering, 400L)",
    rating: 5,
    comment:
      "Ordered the 90s Baggy Jeans and Essential 280GSM Round Neck at 11am and picked up at Old Park for ₦0 delivery fee before my 2pm lecture. Quality is legit heavy.",
    status: "published",
    createdAt: "2026-10-18T14:20:00.000Z",
  },
  {
    _id: "rev_2",
    product: "prod_2",
    user: "usr_2",
    userName: "Zainab M. (Tanke Hostel)",
    rating: 5,
    comment:
      "Finally I don't have to DM five different WhatsApp vendors asking 'how much'. Prices are clear, the UNILORIN retro jersey fits crazy good, and hostel delivery took 2 hours.",
    status: "published",
    createdAt: "2026-10-21T16:05:00.000Z",
  },
  {
    _id: "rev_3",
    product: "prod_3",
    user: "usr_3",
    userName: "Chinedu K. (CIS, 300L)",
    rating: 5,
    comment:
      "The 400GSM Cloud Hoodie is thicker than hoodies I bought for ₦35k elsewhere. Collar on the puff-print tee stays tight even after washing.",
    status: "published",
    createdAt: "2026-10-25T09:40:00.000Z",
  },
  {
    _id: "rev_4",
    product: "prod_4",
    user: "usr_4",
    userName: "Fiyin O. (Law, 200L)",
    rating: 4,
    comment:
      "Super smooth checkout with Paystack. Picked New Park delivery and the rider called me right on time. Definitely getting the carpenter denim next.",
    status: "published",
    createdAt: "2026-10-29T18:12:00.000Z",
  },
];
