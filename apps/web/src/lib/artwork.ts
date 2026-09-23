/**
 * Category-matched real photography from Unsplash's curated photo pools.
 * Each design gets a photo of the actual subject matter (poster wall, tee,
 * interior, device UI, car/bike custom, ad creative) instead of vector art.
 * Unsplash's CDN serves optimized crops via the `w`/`h`/`fit` params.
 */

const U = (id: string, w = 900, h = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

/** Real photos grouped by what we actually sell. */
const PHOTOS: Record<string, string[]> = {
  // Poster walls, gallery prints, framed art
  Posters: [
    "photo-1541961017774-22349e4a1262", "photo-1549289524-06cf8837ace5", "photo-1554907984-15263bfd63bd",
    "photo-1579783902614-a3fb3927b6a5", "photo-1578301978693-85fa9c0320b9", "photo-1550684376-efcbd6e3f031",
    "photo-1618005182384-a83a8bd57fbe", "photo-1561214115-f2f134cc4912"
  ],
  // Screens, dashboards, devices, apps
  UI: [
    "photo-1551288049-bebda4e38f71", "photo-1547658719-da2b51169166", "photo-1559028012-481c04fa702d",
    "photo-1581291518857-4e27b48ff24e", "photo-1526498460520-4c246339dccb", "photo-1551650975-87deedd944c3",
    "photo-1460925895917-afdab827c52f", "photo-1504868584819-f8e8b4b6d7e3"
  ],
  // Tees, hoodies, apparel
  Merch: [
    "photo-1521572163474-6864f9cf17ab", "photo-1503341504253-dff4815485f1", "photo-1576566588028-4147f3842f27",
    "photo-1618354691373-d851c5c3a990", "photo-1620799140408-edc6dcb6d633", "photo-1556821840-3a63f95609a7",
    "photo-1523381210434-271e8be1f52b", "photo-1562157873-818bc0726f68"
  ],
  // Rooms, furniture, interior styling
  Interiors: [
    "photo-1586023492125-27b2c045efd7", "photo-1567016432779-094069958ea5", "photo-1554995207-c18c203602cb",
    "photo-1616486338812-3dadae4b4ace", "photo-1615873968403-89e068629265", "photo-1617806118233-18e1de247200",
    "photo-1615529182904-14819c35db37", "photo-1616594039964-ae9021a400a0"
  ],
  // Social content, creator setups, editorial
  Social: [
    "photo-1611162617213-7d7a39e9b1d7", "photo-1611926653458-09294b3142bf", "photo-1563986768609-322da13575f3",
    "photo-1611162616475-46b635cb6868", "photo-1574717024653-61fd2cf4d44d", "photo-1611262588024-d12430b98920",
    "photo-1611605698335-8b1569810432", "photo-1611162616305-c69b3fa7fbe0"
  ],
  // Print: stationery, invitations, packaging, zines
  Print: [
    "photo-1603484477859-abe6a73f9366", "photo-1586075010923-2dd4570fb338", "photo-1544716278-ca5e3f4abd8c",
    "photo-1589998059171-988d887df646", "photo-1544441893-675973e31985", "photo-1626785774573-4b799315345d",
    "photo-1586953208448-b95a79798f07", "photo-1512314889357-e157c22f938d"
  ],
  // Custom/modified cars & bikes
  Rides: [
    "photo-1552519507-da3b142c6e3d", "photo-1583121274602-3e2820c69888", "photo-1558981403-c5f9899a28bc",
    "photo-1568605117036-5fe5e7bab0b7", "photo-1609630875171-b1321377ee65", "photo-1591768793355-74d04bb6608f",
    "photo-1615172282427-9a57ef2d142e", "photo-1605559424843-9e4c228bf1c2"
  ],
  // Ads / banners / campaigns
  Ads: [
    "photo-1561070791-2526d30994b5", "photo-1542744094-24638eff58bb", "photo-1557804506-669a67965ba0",
    "photo-1533750349088-cd871a92f312", "photo-1587614382346-4ec70e388b28", "photo-1432888622747-4eb9a8efeb07",
    "photo-1553877522-43269d4ea984", "photo-1542744173-8e7e53415bb0"
  ]
};

const ALL_KEYS = Object.keys(PHOTOS);

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

function poolFor(category: string): string[] {
  const cat = category.toLowerCase();
  if (cat.includes("poster") || cat.includes("wall") || cat.includes("art")) return PHOTOS.Posters;
  if (cat === "ui" || cat.includes("app") || cat.includes("web") || cat.includes("dashboard")) return PHOTOS.UI;
  if (cat.includes("brand") || cat.includes("logo")) return PHOTOS.Ads;
  if (cat.includes("merch") || cat.includes("apparel") || cat.includes("tee") || cat.includes("shirt")) return PHOTOS.Merch;
  if (cat.includes("interior") || cat.includes("furniture") || cat.includes("decor") || cat.includes("room")) return PHOTOS.Interiors;
  if (cat.includes("social") || cat.includes("content") || cat.includes("creator")) return PHOTOS.Social;
  if (cat.includes("print") || cat.includes("invit") || cat.includes("station") || cat.includes("packag")) return PHOTOS.Print;
  if (cat.includes("ride") || cat.includes("car") || cat.includes("bike") || cat.includes("auto") || cat.includes("mod")) return PHOTOS.Rides;
  if (cat.includes("ad") || cat.includes("banner") || cat.includes("campaign")) return PHOTOS.Ads;
  return PHOTOS[ALL_KEYS[hashString(category) % ALL_KEYS.length]];
}

/** Real category-matched photo for a design tile. Deterministic per id. */
export function designPhoto(id: string, category: string, w = 900, h = 1200): string {
  const pool = poolFor(category);
  const seed = hashString(id);
  return U(pool[seed % pool.length], w, h);
}

/** Square photo for the home "Shop by category" circles. */
export function categoryPhoto(name: string): string {
  return designPhoto(`cat-${name}`, name, 500, 500);
}

/** Wide photo for the hero carousel — one fixed subject per slide. */
export function heroPhoto(seedKey: string): string {
  const heroShots: Record<string, string> = {
    "dooniq-hero": PHOTOS.Posters[0],
    "dooniq-hero-drops": PHOTOS.Merch[1],
    "dooniq-hero-studio": PHOTOS.UI[2],
    "dooniq-hero-made": PHOTOS.Interiors[0]
  };
  const id = heroShots[seedKey] || PHOTOS.Posters[hashString(seedKey) % PHOTOS.Posters.length];
  return U(id, 1600, 1000);
}

/** Generic photo for gallery alternates / unknown designs. */
export function photoForId(id: string, w = 1200, h = 1500): string {
  const flat = Object.values(PHOTOS).flat();
  return U(flat[hashString(id) % flat.length], w, h);
}
