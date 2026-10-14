import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { catalogApi } from "../../api/client";
import ProductCard from "../../components/ProductCard";

/* =========================================================
   Home page — Amazon-style, data-driven:
   1) Hero strip — real product photos per category, fallback stock
   2) Category rows — 2x2 subcategory tiles, real product photos
   3) Personalized banner
   4) Trending products (live featured API)
========================================================= */

// Stable Unsplash photo IDs (no API key needed, free for any use).
const UNSPLASH = (id, w = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

const STOCK = {
  // ---------- Hero promos ----------
  kitchen:  UNSPLASH("1556909114-f6e7ad7d3136", 900),
  beauty:   UNSPLASH("1522335789203-aabd1fc631afa", 900),
  fashion:  UNSPLASH("1483985988355-763728e1935b", 900),
  toys:     UNSPLASH("1558060370-d644479cb6f7", 900),
  laptops:  UNSPLASH("1496181133206-80ce9b88a853", 900),

  // ---------- Electronics ----------
  headphones:    UNSPLASH("1505740420928-5e560c06d30e"),
  tablets:       UNSPLASH("1561154464-82e9adf32764"),
  gaming:        UNSPLASH("1612287230202-1ff1d85d1bdf"),
  speakers:      UNSPLASH("1545454675-3531b543be11d"),
  desktops:      UNSPLASH("1593640408182-31c70c8268f5"),
  laptop:        UNSPLASH("1496181133206-80ce9b88a853"),
  hardDrives:    UNSPLASH("1597872200969-2c65bb565657"),
  pcAccessories: UNSPLASH("1527443224154-c4a3942d3acf"),
  pcs:           UNSPLASH("1587201372620-0b2b2b2b3a3a"),
  monitors:      UNSPLASH("1527443224154-c4a3942d3acf"),

  // ---------- Fitness ----------
  clothing:  UNSPLASH("1521572163474-6864f9cf17ab"),
  trackers: UNSPLASH("1523275335684-37898b6baf30"),
  equipment:UNSPLASH("1517836357463-d25dfeac3438"),
  deals:    UNSPLASH("1571019613454-1cb2f99b2d8b"),

  // ---------- Apparel ----------
  women: UNSPLASH("1483985988355-763728e1935b"),
  men:   UNSPLASH("1490578474895-699cd4e2cf59"),
  girls: UNSPLASH("1518831959646-e1d6e1e6f6c1"),
  boys:  UNSPLASH("1503454537195-1dcabb73ffb9"),

  // ---------- Home ----------
  homeDecor: UNSPLASH("1493663284031-b7e3aefcae8e"),
  dining:    UNSPLASH("1414235077428-338989a2e8c0"),
  smartHome: UNSPLASH("1558089689-f947d766de29"),

  // ---------- Fashion ----------
  jewelry:  UNSPLASH("1602173574767-37ac01994b2a"),
  handbags: UNSPLASH("1584917865442-de89df76afd3"),
  footwear: UNSPLASH("1543163521-1bf539c55dd2"),

  // ---------- Beauty ----------
  hairCare:  UNSPLASH("1556228720-195a672e8a03"),
  fragrances:UNSPLASH("1541643600914-78b084683601"),
  makeup:    UNSPLASH("1522335789203-aabd1fc631afa"),
  skinCare:  UNSPLASH("1556228578-8c89eecadf883"),

  // ---------- Shoes ----------
  sneakers: UNSPLASH("1542291026-7eec264c27ff"),
  heels:    UNSPLASH("1543163521-1bf539c55dd2"),
  boots:    UNSPLASH("1520639888713-7851133b6b4d"),
  sandals:  UNSPLASH("1562273138-f46be4ebdf33"),

  // ---------- Home harmony ----------
  bedding:    UNSPLASH("1522771739844-6a9f6d5f14af"),
  lighting:   UNSPLASH("1513506003901-1e6a229e2d15"),
  curtains:   UNSPLASH("1513694203232-719a280e022f"),
  furniture:  UNSPLASH("1493663284031-b7e3aefcae8e"),

  // ---------- Pets ----------
  dogFood: UNSPLASH("1601758228041-f3b2795255f1"),
  catFood: UNSPLASH("1574144611937-0df059b5ef3e"),
  petToys: UNSPLASH("1583511655857-daf52bd6f81a"),

  // ---------- Beauty routine ----------
  brushes: UNSPLASH("1487412947147-5cebf100ffc2"),
  sponges: UNSPLASH("1571781926291-c477ebfd024b"),
  mirrors: UNSPLASH("1612462769365-3b9a9b3c5a3b"),

  // ---------- Home theater ----------
  televisions: UNSPLASH("1593359677879-a4bb92f829d1"),
  soundbars:   UNSPLASH("1545454675-3531b543be11d"),
  projectors:  UNSPLASH("1626218174358-776948690cbf"),

  // ---------- Curate your space ----------
  candles:            UNSPLASH("1602874801006-9b27ce5b2f7f"),
  stylishPillows:     UNSPLASH("1592078615290-033ee584e267"),
  indoorGardening:    UNSPLASH("1485955900006-10f4d324d411"),
  storageOrganization:UNSPLASH("1558997519-83ea9252edf8"),

  // ---------- Look your best ----------
  forHer:  UNSPLASH("1483985988355-763728e1935b"),
  forHim:  UNSPLASH("1490578474895-699cd4e2cf59"),
  forTeens:UNSPLASH("1503944583220-79d8926fcb"),
  forKids: UNSPLASH("1503454537195-1dcabb73ffb9"),

  // ---------- Generic ----------
  default: UNSPLASH("1483985988355-763728e1935b"),
};

/* Match a tile keyword against the live products. Returns first product whose
   name/brand/category contains the keyword (case-insensitive). */
function matchProduct(keyword, products) {
  if (!keyword || !products?.length) return null;
  const k = keyword.toLowerCase();
  return (
    products.find((p) => {
      const hay = [p.Name, p.Brand, p.Category?.Name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(k);
    }) || null
  );
}

/* Per-category fallback — distinct real-looking photo for each major category,
   so even when the DB has no product images, each tile is unique. */
const CATEGORY_STOCK = {
  electronics:      UNSPLASH("1496181133206-80ce9b88a853"),
  fashion:          UNSPLASH("1483985988355-763728e1935b"),
  "home & kitchen": UNSPLASH("1556909114-f6e7ad7d3136"),
  watches:          UNSPLASH("1523275335684-37898b6baf30"),
  beauty:           UNSPLASH("1522335789203-aabd1fc631afa"),
  toys:             UNSPLASH("1558060370-d644479cb6f7"),
  sports:           UNSPLASH("1517836357463-d25dfeac3438"),
  books:            UNSPLASH("1544947950-fa07a98d237f"),
  automotive:       UNSPLASH("1492144534655-ae79c964c9d7"),
  grocery:          UNSPLASH("1542838132-92c53300491e"),
  pets:             UNSPLASH("1601758228041-f3b2795255f1"),
  health:           UNSPLASH("1559757175-5700dde675bc"),
  jewelry:          UNSPLASH("1602173574767-37ac01994b2a"),
  shoes:            UNSPLASH("1542291026-7eec264c27ff"),
  furniture:        UNSPLASH("1493663284031-b7e3aefcae8e"),
  phones:           UNSPLASH("1556656793-08538906a9f8"),
  laptops:          UNSPLASH("1496181133206-80ce9b88a853"),
  accessories:      UNSPLASH("1556909114-f6e7ad7d3136"),
  default:          UNSPLASH("1483985988355-763728e1935b"),
};

/* Resolve a category's image:
   1) admin-uploaded category image
   2) latest product in this category that has an image
   3) category-name stock photo (distinct per category) */
function pickCategoryImage(category, latest) {
  if (!category) return STOCK.default;
  if (category.ImagePath) return category.ImagePath;
  const latestForCat = latest.find(
    (p) => p.CategoryId === category.Id && p.Images?.length
  );
  if (latestForCat) return latestForCat.Images[0].FilePath;
  const key = (category.Name || "").toLowerCase();
  return CATEGORY_STOCK[key] || CATEGORY_STOCK.default;
}

/* Each tile carries: label (display), keyword (for live match),
   stock (fallback key in STOCK map), tint (soft accent color for hover). */
const CATEGORY_ROWS = [
  {
    title: "Plug in with our electronics",
    tiles: [
      { label: "Headphones",     keyword: "headphone",  stock: "headphones",    tint: "#FCE8DD" },
      { label: "Tablets",        keyword: "tablet",     stock: "tablets",       tint: "#DCD6F7" },
      { label: "Gaming",         keyword: "gaming",     stock: "gaming",        tint: "#E9D6F7" },
      { label: "Speakers",       keyword: "speaker",    stock: "speakers",      tint: "#1F1F1F" },
    ],
  },
  {
    title: "Score the top PCs & Accessories",
    tiles: [
      { label: "Desktops",       keyword: "desktop",    stock: "desktops",      tint: "#C9E0EE" },
      { label: "Laptops",        keyword: "laptop",     stock: "laptop",        tint: "#E0EAE0" },
      { label: "Hard Drives",    keyword: "drive",      stock: "hardDrives",    tint: "#BFD3C4" },
      { label: "PC Accessories", keyword: "accessory",  stock: "pcAccessories", tint: "#DCE7D6" },
    ],
  },
  {
    title: "Gear up to get fit",
    tiles: [
      { label: "Clothing",  keyword: "shirt",       stock: "clothing",  tint: "#FFE17A" },
      { label: "Trackers",  keyword: "watch",       stock: "trackers",  tint: "#1A1A1A" },
      { label: "Equipment", keyword: "dumbbell",    stock: "equipment", tint: "#FFE17A" },
      { label: "Deals",     keyword: "fitness",     stock: "deals",     tint: "#FFC83D" },
    ],
  },
  {
    title: "Apparel under $25",
    tiles: [
      { label: "Women", keyword: "women", stock: "women", tint: "#FFD8E0" },
      { label: "Men",   keyword: "men",   stock: "men",   tint: "#E1D6F0" },
      { label: "Girls", keyword: "girls", stock: "girls", tint: "#FFE6CC" },
      { label: "Boys",  keyword: "boys",  stock: "boys",  tint: "#CDE7F7" },
    ],
  },
  {
    title: "Fantastic Finds for Home",
    tiles: [
      { label: "Kitchen",    keyword: "kitchen",   stock: "kitchen",    tint: "#E8D6C8" },
      { label: "Home Decor", keyword: "decor",     stock: "homeDecor",  tint: "#DCC6B0" },
      { label: "Dining",     keyword: "dining",    stock: "dining",     tint: "#E3C9A8" },
      { label: "Smart Home", keyword: "smart",     stock: "smartHome",  tint: "#C2BCAA" },
    ],
  },
  {
    title: "Shine brighter with your fashion faves",
    tiles: [
      { label: "Jewelry",  keyword: "jewel",  stock: "jewelry",  tint: "#E6DFCF" },
      { label: "Handbags", keyword: "bag",    stock: "handbags", tint: "#F1E2D2" },
      { label: "Footwear", keyword: "shoe",   stock: "footwear", tint: "#F5E1D2" },
      { label: "Beauty",   keyword: "beauty", stock: "makeup",   tint: "#F0DCC4" },
    ],
  },
  {
    title: "Unveil your radiance",
    tiles: [
      { label: "Hair Care",  keyword: "hair",  stock: "hairCare",   tint: "#FBE3D0" },
      { label: "Fragrances", keyword: "scent", stock: "fragrances", tint: "#FDEAE3" },
      { label: "Make-up",    keyword: "makeup",stock: "makeup",     tint: "#FBD9C8" },
      { label: "Skin Care",  keyword: "skin",  stock: "skinCare",   tint: "#FCE5C2" },
    ],
  },
  {
    title: "Level up your PC here",
    tiles: [
      { label: "Laptops",    keyword: "laptop",  stock: "laptop",     tint: "#E8D6F0" },
      { label: "PCs",        keyword: "pc",      stock: "pcs",        tint: "#1A1A1A" },
      { label: "Hard Drives",keyword: "drive",   stock: "hardDrives", tint: "#D8B5E8" },
      { label: "Monitors",   keyword: "monitor", stock: "monitors",   tint: "#E2D5F1" },
    ],
  },
  {
    title: "Fashion trends in Shoes",
    tiles: [
      { label: "Sneakers", keyword: "sneaker", stock: "sneakers", tint: "#E8EDF5" },
      { label: "Heels",    keyword: "heel",    stock: "heels",    tint: "#F5DDE5" },
      { label: "Boots",    keyword: "boot",    stock: "boots",    tint: "#D6C3A8" },
      { label: "Sandals",  keyword: "sandal",  stock: "sandals",  tint: "#F5E6CC" },
    ],
  },
  {
    title: "Home harmony",
    tiles: [
      { label: "Bedding",   keyword: "bed",     stock: "bedding",   tint: "#E6DFD0" },
      { label: "Lighting",  keyword: "lamp",    stock: "lighting",  tint: "#FBE5B7" },
      { label: "Curtains",  keyword: "curtain", stock: "curtains",  tint: "#D8E0E8" },
      { label: "Furniture", keyword: "sofa",    stock: "furniture", tint: "#D6CBB8" },
    ],
  },
  {
    title: "Shoes Under $50",
    tiles: [
      { label: "Running", keyword: "running", stock: "sneakers", tint: "#D8E8F0" },
      { label: "Casual",  keyword: "casual",  stock: "footwear", tint: "#E0D8E8" },
      { label: "Formal",  keyword: "formal",  stock: "men",      tint: "#1A1A1A" },
      { label: "Sports",  keyword: "sports",  stock: "deals",    tint: "#FFE17A" },
    ],
  },
  {
    title: "What you need for furry friends",
    tiles: [
      { label: "Dog Food",    keyword: "dog",     stock: "dogFood", tint: "#F5E6CC" },
      { label: "Cat Food",    keyword: "cat",     stock: "catFood", tint: "#F0E0D0" },
      { label: "Toys",        keyword: "pet toy", stock: "petToys", tint: "#C9E0F4" },
      { label: "Accessories", keyword: "pet",     stock: "petToys", tint: "#F5D0E0" },
    ],
  },
  {
    title: "Level up your beauty routine",
    tiles: [
      { label: "Makeup",  keyword: "makeup", stock: "makeup",  tint: "#FBD9C8" },
      { label: "Brushes", keyword: "brush",  stock: "brushes", tint: "#FBD9C8" },
      { label: "Sponges", keyword: "sponge", stock: "sponges", tint: "#FCD8B5" },
      { label: "Mirrors", keyword: "mirror", stock: "mirrors", tint: "#F5C5C5" },
    ],
  },
  {
    title: "Handpicked home theater",
    tiles: [
      { label: "Televisions", keyword: "tv",       stock: "televisions", tint: "#DCE7D6" },
      { label: "Speakers",    keyword: "speaker",  stock: "speakers",    tint: "#E3D3B5" },
      { label: "Soundbars",   keyword: "soundbar", stock: "soundbars",   tint: "#C9C5A8" },
      { label: "Projectors",  keyword: "projector",stock: "projectors",  tint: "#C9E0F4" },
    ],
  },
  {
    title: "Curate your space",
    tiles: [
      { label: "Candles",             keyword: "candle",    stock: "candles",            tint: "#FBE5B7" },
      { label: "Stylish pillows",     keyword: "pillow",    stock: "stylishPillows",     tint: "#F0E6D8" },
      { label: "Indoor gardening",    keyword: "plant",     stock: "indoorGardening",    tint: "#D8E5C9" },
      { label: "Storage organization",keyword: "storage",   stock: "storageOrganization",tint: "#E8DFCF" },
    ],
  },
  {
    title: "Look your best this season",
    tiles: [
      { label: "For Her",   keyword: "her",     stock: "forHer",   tint: "#F8C5A8" },
      { label: "For Him",   keyword: "him",     stock: "forHim",   tint: "#FFB088" },
      { label: "For Teens", keyword: "teen",    stock: "forTeens", tint: "#F5C58E" },
      { label: "For Kids",  keyword: "kid",     stock: "forKids",  tint: "#C9E0F4" },
    ],
  },
];

/* Hero promo definitions — same data-driven approach */
const HERO_PROMOS = [
  {
    title: "Shop kitchen must-haves",
    keyword: "kitchen",
    stock: "kitchen",
    tint: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
    text: "#fff",
  },
  {
    title: "Shop all things beauty",
    keyword: "beauty",
    stock: "beauty",
    tint: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)",
    text: "#fff",
  },
  {
    title: "Start looking sharp",
    keyword: "fashion",
    stock: "fashion",
    tint: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)",
    text: "#fff",
  },
  {
    title: "Toys for little ones",
    keyword: "toy",
    stock: "toys",
    tint: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)",
    text: "#fff",
  },
  {
    title: "Level up your PC here",
    keyword: "laptop",
    stock: "laptops",
    tint: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)",
    text: "#fff",
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [cats, setCats] = useState([]);
  const stripRef = useRef(null);

  useEffect(() => {
    catalogApi.featured().then(setFeatured).catch(() => {});
    // One large fetch for the entire page — gives us every keyword match.
    catalogApi
      .products({ sort: "newest", pageSize: 64 })
      .then((d) => setLatest(d.items || []))
      .catch(() => {});
    catalogApi.categories().then(setCats).catch(() => {});
  }, []);

  // Each hero pulls the live photo matching its keyword
  const heroPhotos = useMemo(() => {
    const map = {};
    HERO_PROMOS.forEach((p) => {
      const matched = matchProduct(p.keyword, latest);
      map[p.keyword] = matched?.Images?.[0]?.FilePath || STOCK[p.stock];
    });
    return map;
  }, [latest]);

  const stripStyle = (key) => ({
    backgroundImage: `${HERO_PROMOS.find((p) => p.keyword === key)?.tint}, url(${heroPhotos[key]})`,
    color: HERO_PROMOS.find((p) => p.keyword === key)?.text || "#fff",
  });

  function scrollStrip(dir) {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  }

  // Each tile picks its photo (live product first, stock fallback)
  const tilePhotos = useMemo(() => {
    const map = {};
    CATEGORY_ROWS.forEach((row) => {
      row.tiles.forEach((t) => {
        const matched = matchProduct(t.keyword, latest);
        map[`${row.title}-${t.label}`] = matched?.Images?.[0]?.FilePath || STOCK[t.stock];
      });
    });
    return map;
  }, [latest]);

  const tileStyle = (key, tint) => ({
    backgroundImage: `url(${tilePhotos[key]})`,
    "--tile-tint": tint,
  });

  return (
    <div className="mn-home">
      {/* ============== HERO STRIP ============== */}
      <section className="mn-hero-strip-wrap">
        <button className="mn-strip-arrow mn-strip-arrow-left" onClick={() => scrollStrip(-1)} aria-label="Previous">‹</button>
        <div className="mn-hero-strip" ref={stripRef}>
          {HERO_PROMOS.map((p) => (
            <Link
              key={p.keyword}
              to={`/search?q=${encodeURIComponent(p.keyword)}`}
              className="mn-hero-card"
              style={stripStyle(p.keyword)}
            >
              <span className="mn-hero-card-eyebrow">Shop now</span>
              <h3 className="mn-hero-card-title">{p.title}</h3>
            </Link>
          ))}
        </div>
        <button className="mn-strip-arrow mn-strip-arrow-right" onClick={() => scrollStrip(1)} aria-label="Next">›</button>
      </section>

      {/* ============== CATEGORY ROWS ============== */}
      <section className="mn-rows-wrap">
        {CATEGORY_ROWS.map((row) => (
          <div key={row.title} className="mn-row-card">
            <Link to={`/search?q=${encodeURIComponent(row.title.split(" ")[0])}`} className="mn-row-head">
              <h3>{row.title}</h3>
              <span className="mn-row-chevron">›</span>
            </Link>
            <div className="mn-row-tiles">
              {row.tiles.map((t) => {
                const key = `${row.title}-${t.label}`;
                return (
                  <Link
                    key={t.label}
                    to={`/search?q=${encodeURIComponent(t.keyword)}`}
                    className="mn-tile"
                    style={tileStyle(key, t.tint)}
                  >
                    <span className="mn-tile-label">{t.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {cats.length > 0 && (
          <div className="mn-row-card mn-row-card--full">
            <Link to="/search" className="mn-row-head">
              <h3>Browse by store category</h3>
              <span className="mn-row-chevron">›</span>
            </Link>
            <div className="mn-row-tiles mn-row-tiles--wide">
              {cats.slice(0, 8).map((c) => {
                const img = pickCategoryImage(c, latest);
                return (
                  <Link
                    key={c.Id}
                    to={`/category/${c.Id}`}
                    className="mn-tile"
                    style={{
                      backgroundImage: `url(${img})`,
                      "--tile-tint": "#F0F0F0",
                    }}
                  >
                    <span className="mn-tile-label">{c.Name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ============== PERSONALIZED RECOMMENDATIONS BANNER ============== */}
      <section className="mn-personalized">
        <Link to={featured.length ? "/search" : "/register"} className="mn-personalized-link">
          See personalized recommendations
          <span className="mn-row-chevron">›</span>
        </Link>
      </section>

      {/* ============== FEATURED PRODUCTS ============== */}
      {featured.length > 0 && (
        <section className="mn-page-pad">
          <h3 className="mn-section-title">Trending now</h3>
          <p className="mn-section-subtitle">Verified sellers, admin-reviewed, ready to ship.</p>
          <div className="mn-product-grid">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p.Id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}