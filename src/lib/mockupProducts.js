// Blank garment mockups. print_area and body_clip are in % of the mockup image box.
// body_clip roughly traces the garment silhouette so all-over prints stay on the fabric.
export const MOCKUP_PRODUCTS = [
  {
    id: "tee-white",
    name: "White T-Shirt",
    image: "https://media.base44.com/images/public/6a6e71f4736ae8f4ae275d25/02243c5d4_generated_image.png",
    print_area: { x: 30, y: 28, width: 40, height: 40 },
    body_clip: "polygon(30% 26%, 38% 21%, 62% 21%, 70% 26%, 83% 34%, 76% 47%, 70% 42%, 70% 79%, 30% 79%, 30% 42%, 24% 47%, 17% 34%)",
  },
  {
    id: "tee-black",
    name: "Black T-Shirt",
    image: "https://media.base44.com/images/public/6a6e71f4736ae8f4ae275d25/dc030aa76_generated_image.png",
    print_area: { x: 30, y: 28, width: 40, height: 40 },
    body_clip: "polygon(30% 26%, 38% 21%, 62% 21%, 70% 26%, 83% 34%, 76% 47%, 70% 42%, 70% 79%, 30% 79%, 30% 42%, 24% 47%, 17% 34%)",
  },
  {
    id: "hoodie-grey",
    name: "Grey Hoodie",
    image: "https://media.base44.com/images/public/6a6e71f4736ae8f4ae275d25/f5cb1c1b5_generated_image.png",
    print_area: { x: 32, y: 34, width: 36, height: 32 },
    body_clip: "polygon(30% 28%, 38% 22%, 62% 22%, 70% 28%, 84% 36%, 77% 50%, 70% 44%, 70% 80%, 30% 80%, 30% 44%, 23% 50%, 16% 36%)",
  },
  {
    id: "shirt-satin",
    name: "Satin Shirt",
    image: "https://media.base44.com/images/public/6a6e71f4736ae8f4ae275d25/fa864e2d0_generated_image.png",
    print_area: { x: 33, y: 32, width: 34, height: 34 },
    body_clip: "polygon(32% 24%, 40% 19%, 60% 19%, 68% 24%, 84% 34%, 88% 66%, 78% 68%, 70% 44%, 70% 82%, 30% 82%, 30% 44%, 22% 68%, 12% 66%, 16% 34%)",
  },
  {
    id: "dress-slip",
    name: "Slip Dress",
    image: "https://media.base44.com/images/public/6a6e71f4736ae8f4ae275d25/32fca1c0c_generated_image.png",
    print_area: { x: 36, y: 32, width: 28, height: 30 },
    body_clip: "polygon(39% 20%, 61% 20%, 65% 38%, 70% 84%, 30% 84%, 35% 38%)",
  },
  {
    id: "blazer-ivory",
    name: "Ivory Blazer",
    image: "https://media.base44.com/images/public/6a6e71f4736ae8f4ae275d25/aacbec0c8_generated_image.png",
    print_area: { x: 34, y: 34, width: 32, height: 30 },
    body_clip: "polygon(34% 20%, 66% 20%, 76% 26%, 80% 70%, 70% 72%, 70% 84%, 30% 84%, 30% 72%, 20% 70%, 24% 26%)",
  },
  {
    id: "skirt-pleated",
    name: "Pleated Midi Skirt",
    image: "https://media.base44.com/images/public/6a6e71f4736ae8f4ae275d25/de1d37bff_generated_image.png",
    print_area: { x: 36, y: 38, width: 28, height: 28 },
    body_clip: "polygon(36% 26%, 64% 26%, 76% 82%, 24% 82%)",
  },
  {
    id: "leggings-white",
    name: "Leggings",
    image: "https://media.base44.com/images/public/6a6e71f4736ae8f4ae275d25/89d74724f_generated_image.png",
    print_area: { x: 38, y: 30, width: 24, height: 24 },
    body_clip: "polygon(37% 22%, 63% 22%, 62% 86%, 52% 86%, 50% 52%, 48% 86%, 38% 86%)",
  },
  {
    id: "scarf-silk",
    name: "Silk Scarf",
    image: "https://media.base44.com/images/public/6a6e71f4736ae8f4ae275d25/220f6b093_generated_image.png",
    print_area: { x: 20, y: 20, width: 60, height: 60 },
    body_clip: "polygon(11% 11%, 89% 11%, 89% 89%, 11% 89%)",
  },
  {
    id: "tote-canvas",
    name: "Canvas Tote",
    image: "https://media.base44.com/images/public/6a6e71f4736ae8f4ae275d25/ccbf33965_generated_image.png",
    print_area: { x: 30, y: 34, width: 40, height: 36 },
    body_clip: "polygon(28% 34%, 72% 34%, 72% 76%, 28% 76%)",
  },
];

export const getProduct = (id) => MOCKUP_PRODUCTS.find((p) => p.id === id) || MOCKUP_PRODUCTS[0];

export const TEXT_FONTS = [
  { label: "Serif", value: "var(--font-heading)" },
  { label: "Sans", value: "var(--font-body)" },
  { label: "Mono", value: "var(--font-mono)" },
];