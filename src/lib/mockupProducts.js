// Blank garment mockups. print_area is expressed in % of the mockup image box.
export const MOCKUP_PRODUCTS = [
  {
    id: "tee-white",
    name: "White T-Shirt",
    image: "https://media.base44.com/images/public/6a6e71f4736ae8f4ae275d25/02243c5d4_generated_image.png",
    print_area: { x: 30, y: 28, width: 40, height: 40 },
  },
  {
    id: "tee-black",
    name: "Black T-Shirt",
    image: "https://media.base44.com/images/public/6a6e71f4736ae8f4ae275d25/dc030aa76_generated_image.png",
    print_area: { x: 30, y: 28, width: 40, height: 40 },
  },
  {
    id: "hoodie-grey",
    name: "Grey Hoodie",
    image: "https://media.base44.com/images/public/6a6e71f4736ae8f4ae275d25/f5cb1c1b5_generated_image.png",
    print_area: { x: 32, y: 34, width: 36, height: 32 },
  },
  {
    id: "tote-canvas",
    name: "Canvas Tote",
    image: "https://media.base44.com/images/public/6a6e71f4736ae8f4ae275d25/ccbf33965_generated_image.png",
    print_area: { x: 30, y: 34, width: 40, height: 36 },
  },
];

export const getProduct = (id) => MOCKUP_PRODUCTS.find((p) => p.id === id) || MOCKUP_PRODUCTS[0];

export const TEXT_FONTS = [
  { label: "Serif", value: "var(--font-heading)" },
  { label: "Sans", value: "var(--font-body)" },
  { label: "Mono", value: "var(--font-mono)" },
];