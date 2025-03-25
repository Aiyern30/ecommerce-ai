// Sample product categories
export const productCategories = [
  "T-Shirt",
  "Hoodies",
  "Jeans",
  "Shoes",
  "Accessories",
  "Jackets",
  "Dresses",
  "Pants",
  "Shorts",
  "Sweaters",
];

// Sample colors
export const productColors = [
  "White",
  "Black",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Purple",
  "Orange",
  "Grey",
  "Brown",
];

// Generate sample products
export const generateProducts = (count: number) => {
  const products = [];

  const productNames = [
    "Men Grey Hoodie",
    "Women Striped T-Shirt",
    "Women White T-Shirt",
    "Men White T-Shirt",
    "Women Red T-Shirt",
    "Denim Jacket",
    "Leather Boots",
    "Winter Scarf",
    "Running Shoes",
    "Wool Beanie",
    "Slim Fit Jeans",
    "Casual Sneakers",
    "Cotton Sweater",
    "Formal Shirt",
    "Summer Shorts",
  ];

  for (let i = 1; i <= count; i++) {
    const nameIndex = Math.floor(Math.random() * productNames.length);
    const name = productNames[nameIndex];

    // Determine category based on name
    let category = "";
    if (name.includes("T-Shirt")) category = "T-Shirt";
    else if (name.includes("Hoodie")) category = "Hoodies";
    else if (name.includes("Jacket")) category = "Jackets";
    else if (
      name.includes("Boots") ||
      name.includes("Shoes") ||
      name.includes("Sneakers")
    )
      category = "Shoes";
    else if (name.includes("Scarf") || name.includes("Beanie"))
      category = "Accessories";
    else if (name.includes("Jeans")) category = "Jeans";
    else if (name.includes("Shorts")) category = "Shorts";
    else if (name.includes("Sweater")) category = "Sweaters";
    else
      category =
        productCategories[Math.floor(Math.random() * productCategories.length)];

    // Determine color based on name or random
    let color = "";
    if (name.includes("White")) color = "White";
    else if (name.includes("Grey") || name.includes("Gray")) color = "Grey";
    else if (name.includes("Red")) color = "Red";
    else if (name.includes("Blue")) color = "Blue";
    else if (name.includes("Black")) color = "Black";
    else
      color = productColors[Math.floor(Math.random() * productColors.length)];

    // Generate price between $19.90 and $99.90
    const price = (Math.floor(Math.random() * 80) + 20 - 0.1).toFixed(2);

    // Generate inventory
    const stockStatus = Math.random() > 0.7 ? "Out of Stock" : "In Stock";
    const inventory =
      stockStatus === "Out of Stock" ? 0 : Math.floor(Math.random() * 100) + 1;

    // Generate rating
    const rating = (Math.floor(Math.random() * 20) + 30) / 10; // Between 3.0 and 5.0
    const votes = Math.floor(Math.random() * 50) + 10;

    // Generate SKU
    const sku = `SKU-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;

    products.push({
      id: i,
      name,
      category,
      color,
      price: Number.parseFloat(price),
      priceFormatted: `$${price}`,
      inventory,
      stockStatus,
      rating,
      votes,
      sku,
      image: "/placeholder.svg",
    });
  }

  return products;
};

// Generate 150 products for our sample data
export const allProducts = generateProducts(150);
