import { StoreSettings } from '../types';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Gauge House",
  tagline: "Precision You Can Trust",
  businessType: "Industrial Equipment Supplier, Importer & Exporter",
  address: "Al-Makkah Market-3, Dewan Street #42, Brandreth Road, Lahore – Pakistan",
  phones: [
    "0335-4499186",
    "0300-8497778",
    "042-37639090",
    "042-37666688",
    "042-37634777"
  ],
  emails: [
    "gaugehouse1998@gmail.com",
    "Parus.k@hotmail.com"
  ],
  currency: "PKR",
  currencySymbol: "Rs.",
  shippingFlatRate: 450,
  freeShippingThreshold: 20000,
  whatsappNumber: "923354499186",
};

export const OFFICIAL_CATEGORIES = [
  {
    name: "Pressure Gauges",
    slug: "pressure-gauges",
    description: "Industrial analog and digital pressure gauges with stainless steel and brass internals.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    displayOrder: 1,
    active: true
  },
  {
    name: "Temperature Gauges",
    slug: "temperature-gauges",
    description: "Bimetallic and gas-actuated industrial thermometers for high-precision thermal monitoring.",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
    displayOrder: 2,
    active: true
  },
  {
    name: "Pressure Transmitters",
    slug: "pressure-transmitters",
    description: "4-20mA and 0-10V analog/digital pressure transducers and transmitters for process automation.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    displayOrder: 3,
    active: true
  },
  {
    name: "WIKA",
    slug: "wika",
    description: "Authentic German WIKA pressure, temperature, and calibration instruments.",
    image: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=600&q=80",
    displayOrder: 4,
    active: true
  },
  {
    name: "Industrial Accessories",
    slug: "industrial-accessories",
    description: "Gauge cocks, needle valves, syphon tubes, pulsation dampeners, and snubber protectors.",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80",
    displayOrder: 5,
    active: true
  },
  {
    name: "Electrical Contact Gauges",
    slug: "electrical-contact-gauges",
    description: "Pressure gauges equipped with magnetic snap-action and inductive electrical limit contacts.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    displayOrder: 6,
    active: true
  },
  {
    name: "Magnehelic",
    slug: "magnehelic",
    description: "Differential pressure gauges for clean rooms, HVAC filtration, and laminar flow hoods.",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
    displayOrder: 7,
    active: true
  },
  {
    name: "Other Products",
    slug: "other-products",
    description: "Flow meters, level switches, diaphragms, calibration hand pumps and accessories.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    displayOrder: 8,
    active: true
  }
];

export const DEFAULT_BANNERS = [
  {
    title: "Precision Industrial Instrumentation",
    subtitle: "Supplying Pakistan's heavy industries, manufacturing plants, and refineries since 1998.",
    buttonText: "Browse Product Catalog",
    destination: "/catalog",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80",
    active: true,
    displayOrder: 1
  },
  {
    title: "Authorized WIKA & Industrial Gauges",
    subtitle: "Complete range of pressure, vacuum, temperature and differential instruments.",
    buttonText: "View Pressure Gauges",
    destination: "/category/pressure-gauges",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80",
    active: true,
    displayOrder: 2
  }
];

// Rich sample product data for admin demonstration & testing multi-variant selection
export const SAMPLE_PRODUCTS = [
  {
    title: "Stainless Steel Glycerin Filled Pressure Gauge",
    slug: "stainless-steel-glycerin-filled-pressure-gauge",
    category: "Pressure Gauges",
    brand: "Gauge House",
    sku: "GH-PG-SS-GLY",
    description: "Heavy-duty industrial pressure gauge filled with glycerin for shock and vibration dampening. Built with 304 stainless steel case and 316 stainless steel wetted parts for corrosive process environments, petrochemical, and hydraulic systems.",
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80"
    ],
    price: 3200,
    salePrice: 2850,
    stock: 85,
    unit: "Piece",
    specifications: {
      "Brand": "Gauge House",
      "Model": "GH-PG-100-SS",
      "Case Material": "SS 304 Weatherproof",
      "Wetted Parts": "SS 316L",
      "Accuracy": "± 1.0% Full Scale (Class 1)",
      "Window": "Laminated Safety Glass",
      "Filling": "99.7% Pure Vegetable Glycerin",
      "Temperature Range": "-20°C to +80°C",
      "Protection Class": "IP65 Waterproof",
      "Mounting": "Bottom Entry Direct"
    },
    tags: ["pressure", "glycerin", "stainless steel", "hydraulic", "best seller"],
    featured: true,
    published: true,
    isSample: true,
    variantDimensions: [
      {
        name: "Dial Size",
        options: ["2.5 inch (63mm)", "4 inch (100mm)", "6 inch (150mm)"]
      },
      {
        name: "Pressure Range",
        options: ["0–10 bar (150 psi)", "0–16 bar (230 psi)", "0–25 bar (350 psi)", "0–40 bar (600 psi)"]
      },
      {
        name: "Connection",
        options: ["1/4\" NPT Male", "1/2\" NPT Male", "1/2\" BSP Male"]
      }
    ],
    variants: [
      {
        id: "v1",
        attributes: {
          "Dial Size": "4 inch (100mm)",
          "Pressure Range": "0–10 bar (150 psi)",
          "Connection": "1/2\" NPT Male"
        },
        sku: "GH-PG-4-10B-12NPT",
        price: 3200,
        salePrice: 2850,
        stock: 25,
        enabled: true
      },
      {
        id: "v2",
        attributes: {
          "Dial Size": "4 inch (100mm)",
          "Pressure Range": "0–16 bar (230 psi)",
          "Connection": "1/2\" NPT Male"
        },
        sku: "GH-PG-4-16B-12NPT",
        price: 3200,
        salePrice: 2850,
        stock: 30,
        enabled: true
      },
      {
        id: "v3",
        attributes: {
          "Dial Size": "4 inch (100mm)",
          "Pressure Range": "0–25 bar (350 psi)",
          "Connection": "1/2\" NPT Male"
        },
        sku: "GH-PG-4-25B-12NPT",
        price: 3450,
        salePrice: 3100,
        stock: 18,
        enabled: true
      },
      {
        id: "v4",
        attributes: {
          "Dial Size": "2.5 inch (63mm)",
          "Pressure Range": "0–10 bar (150 psi)",
          "Connection": "1/4\" NPT Male"
        },
        sku: "GH-PG-25-10B-14NPT",
        price: 2400,
        salePrice: 2150,
        stock: 40,
        enabled: true
      },
      {
        id: "v5",
        attributes: {
          "Dial Size": "6 inch (150mm)",
          "Pressure Range": "0–25 bar (350 psi)",
          "Connection": "1/2\" NPT Male"
        },
        sku: "GH-PG-6-25B-12NPT",
        price: 5800,
        stock: 12,
        enabled: true
      }
    ]
  },
  {
    title: "WIKA Model 232.50 Industrial Pressure Gauge",
    slug: "wika-model-232-50-industrial-pressure-gauge",
    category: "WIKA",
    brand: "WIKA (Germany)",
    sku: "WIKA-232-50",
    description: "Genuine German-engineered WIKA 232.50 all stainless steel bourdon tube pressure gauge. Designed for the harsh requirements of the chemical and petrochemical industries, oil and gas, and power engineering.",
    images: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
    ],
    price: 14500,
    stock: 22,
    unit: "Piece",
    specifications: {
      "Brand": "WIKA",
      "Model": "232.50",
      "Country of Origin": "Germany",
      "Accuracy": "Grade 1A (± 1.0% ASME B40.100)",
      "Case Material": "304 Stainless Steel with blow-out back",
      "Wetted Parts": "316L Stainless Steel",
      "Window": "Instrument glass",
      "Pressure Limitation": "Steady: Full Scale Value"
    },
    tags: ["WIKA", "German", "stainless steel", "high precision", "chemical"],
    featured: true,
    published: true,
    isSample: true,
    variantDimensions: [
      {
        name: "Dial Size",
        options: ["100 mm (4 inch)", "160 mm (6 inch)"]
      },
      {
        name: "Pressure Range",
        options: ["0–6 bar", "0–10 bar", "0–25 bar", "0–100 bar", "0–400 bar"]
      }
    ],
    variants: [
      {
        id: "w1",
        attributes: {
          "Dial Size": "100 mm (4 inch)",
          "Pressure Range": "0–10 bar"
        },
        sku: "WIKA-232-100-10B",
        price: 14500,
        stock: 10,
        enabled: true
      },
      {
        id: "w2",
        attributes: {
          "Dial Size": "100 mm (4 inch)",
          "Pressure Range": "0–25 bar"
        },
        sku: "WIKA-232-100-25B",
        price: 14500,
        stock: 8,
        enabled: true
      },
      {
        id: "w3",
        attributes: {
          "Dial Size": "160 mm (6 inch)",
          "Pressure Range": "0–100 bar"
        },
        sku: "WIKA-232-160-100B",
        price: 22000,
        stock: 4,
        enabled: true
      }
    ]
  },
  {
    title: "Industrial Bimetal Temperature Gauge (Every-Angle)",
    slug: "industrial-bimetal-temperature-gauge-every-angle",
    category: "Temperature Gauges",
    brand: "Gauge House",
    sku: "GH-TG-BM-EA",
    description: "Heavy-duty bimetallic thermometer with 360-degree adjustable every-angle stem. Stainless steel hermetically sealed case prevents fogging and internal corrosion. Ideal for boilers, chillers, and piping headers.",
    images: [
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80"
    ],
    price: 4800,
    stock: 35,
    unit: "Piece",
    specifications: {
      "Brand": "Gauge House",
      "Dial Size": "4 inch (100mm)",
      "Temperature Range": "-50°C to +500°C available",
      "Stem Material": "SS 316 Stainless Steel",
      "Accuracy": "± 1.0% Full Scale",
      "External Reset": "External calibration screw on rear of case",
      "Process Connection": "1/2\" NPT Adjustable sliding union"
    },
    tags: ["temperature", "thermometer", "bimetal", "boiler", "process"],
    featured: true,
    published: true,
    isSample: true,
    variantDimensions: [
      {
        name: "Temperature Range",
        options: ["0 to 100°C", "0 to 200°C", "0 to 300°C", "0 to 500°C"]
      },
      {
        name: "Stem Length",
        options: ["4 inch (100mm)", "6 inch (150mm)", "9 inch (230mm)"]
      }
    ],
    variants: [
      {
        id: "t1",
        attributes: {
          "Temperature Range": "0 to 100°C",
          "Stem Length": "6 inch (150mm)"
        },
        sku: "GH-TG-100C-6IN",
        price: 4800,
        stock: 12,
        enabled: true
      },
      {
        id: "t2",
        attributes: {
          "Temperature Range": "0 to 200°C",
          "Stem Length": "6 inch (150mm)"
        },
        sku: "GH-TG-200C-6IN",
        price: 4800,
        stock: 15,
        enabled: true
      },
      {
        id: "t3",
        attributes: {
          "Temperature Range": "0 to 300°C",
          "Stem Length": "9 inch (230mm)"
        },
        sku: "GH-TG-300C-9IN",
        price: 5600,
        stock: 8,
        enabled: true
      }
    ]
  },
  {
    title: "Magnehelic Differential Pressure Gauge Series 2000",
    slug: "magnehelic-differential-pressure-gauge-series-2000",
    category: "Magnehelic",
    brand: "Dwyer / Magnehelic",
    sku: "DW-MAG-2000",
    description: "Industry-standard low differential pressure gauge for measuring positive, negative (vacuum) or differential clean air pressure. Resists shock, vibration, and overpressures up to 25 psig.",
    images: [
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80"
    ],
    price: 9800,
    stock: 18,
    unit: "Piece",
    specifications: {
      "Brand": "Dwyer Magnehelic",
      "Model": "Series 2000",
      "Accuracy": "± 2% of full scale",
      "Housing": "Die cast aluminum case and bezel",
      "Connections": "1/8\" female NPT duplicate high and low pressure taps",
      "Application": "Cleanrooms, HVAC filters, laminar benches"
    },
    tags: ["differential", "cleanroom", "hvac", "filter pressure"],
    featured: false,
    published: true,
    isSample: true,
    variantDimensions: [
      {
        name: "Range (Pascal / mmWC)",
        options: ["0–60 Pa", "0–250 Pa", "0–500 Pa", "0–1000 Pa", "0–50 mmWC"]
      }
    ],
    variants: [
      {
        id: "m1",
        attributes: { "Range (Pascal / mmWC)": "0–250 Pa" },
        sku: "DW-MAG-250PA",
        price: 9800,
        stock: 6,
        enabled: true
      },
      {
        id: "m2",
        attributes: { "Range (Pascal / mmWC)": "0–500 Pa" },
        sku: "DW-MAG-500PA",
        price: 9800,
        stock: 7,
        enabled: true
      },
      {
        id: "m3",
        attributes: { "Range (Pascal / mmWC)": "0–50 mmWC" },
        sku: "DW-MAG-50MMWC",
        price: 9800,
        stock: 5,
        enabled: true
      }
    ]
  },
  {
    title: "Heavy-Duty Stainless Steel Needle Valve",
    slug: "heavy-duty-stainless-steel-needle-valve",
    category: "Industrial Accessories",
    brand: "Gauge House",
    sku: "GH-ACC-NV-SS",
    description: "Forged SS 316 needle valve rated for 6000 psi (414 bar) high pressure throttling and gauge isolation. Non-rotating tip stem design eliminates galling and ensures long service life.",
    images: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
    ],
    price: 2600,
    stock: 50,
    unit: "Piece",
    specifications: {
      "Brand": "Gauge House",
      "Body Material": "Forged Stainless Steel 316",
      "Pressure Rating": "6000 PSI (414 Bar)",
      "Stem Type": "Non-rotating hardened needle tip",
      "Packing": "PTFE / Graphoil high temperature",
      "Handle": "T-bar SS handle"
    },
    tags: ["accessories", "valve", "isolation", "6000psi", "stainless"],
    featured: false,
    published: true,
    isSample: true,
    variantDimensions: [
      {
        name: "Size & Connection",
        options: ["1/4\" NPT Female x Female", "1/2\" NPT Female x Female", "1/2\" NPT Male x Female"]
      }
    ],
    variants: [
      {
        id: "nv1",
        attributes: { "Size & Connection": "1/4\" NPT Female x Female" },
        sku: "GH-NV-14-FF",
        price: 2400,
        stock: 25,
        enabled: true
      },
      {
        id: "nv2",
        attributes: { "Size & Connection": "1/2\" NPT Female x Female" },
        sku: "GH-NV-12-FF",
        price: 2800,
        stock: 25,
        enabled: true
      }
    ]
  }
];
