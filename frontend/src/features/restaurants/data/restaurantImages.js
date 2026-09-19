const restaurantImages = {
  "R_001": "/assets/restaurants/swastik-veg.jpg",
  "R_002": "/assets/restaurants/royal-veg.png",
  "R_003": "/assets/restaurants/niramish-bhojanalaya.png",
  "R_004": "/assets/restaurants/jagannaths-prasadam.jpg",
  "R_005": "/assets/restaurants/amazing-food-house.png",
  "R_006": "/assets/restaurants/sherowali-sweet-snacks.png",
  "R_007": "/assets/restaurants/tripura-pride.png",
  "R_008": "/assets/restaurants/Gopal.png",
  "R_009": "/assets/restaurants/sherowali-sweets.png",
  "R_010": "/assets/restaurants/Sanskar.png",
  "R_011": "/assets/restaurants/eatopia-zannat.png",
  "R_012": "/assets/restaurants/one-and-only.webp",
  "R_013": "/assets/restaurants/s22-cafe.png",
  "R_014": "/assets/restaurants/Social Klub.png"
};

// Per-restaurant image positioning hints.
// Portrait photos with signage at the top need "top" so the name isn't cropped.
const restaurantImagePositions = {
  "R_011": "top",   // Eatopia Zannat — signage at top of photo
  "R_005": "top",   // Sherowali Sweets — signage at top of photo
};

export { restaurantImagePositions };
export default restaurantImages;
