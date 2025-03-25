// Generate sample data for orders
export const generateOrders = (count: number) => {
  const statuses = ["Pending", "Shipping", "Completed", "On Hold"];
  const customers = [
    "Ronald Jones",
    "Jacob McKinney",
    "Samuel Murphy",
    "Philip Wells",
    "Annie Bell",
    "Gregory Nguyen",
    "Deborah Harris",
    "Jenny Hendrix",
    "Diana Cooper",
    "Max Williamson",
    "Sarah Johnson",
    "Michael Smith",
    "Emily Davis",
    "Robert Wilson",
    "Jennifer Brown",
    "William Taylor",
    "Elizabeth Anderson",
    "David Thomas",
    "Jessica Jackson",
    "James White",
  ];

  const orders = [];

  for (let i = 1; i <= count; i++) {
    const id = `#${(Math.floor(Math.random() * 90000) + 10000).toString()}`;
    const productCount = Math.floor(Math.random() * 3) + 1;
    const products = Array.from({ length: productCount }, (_, index) => ({
      image: "/placeholder.svg",
      name: `Product ${i}-${index + 1}`,
    }));

    const itemCount = Math.floor(Math.random() * 8) + 1;

    // Random date in 2023
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    const dateObj = new Date(2023, month, day);
    const date = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const customer = customers[Math.floor(Math.random() * customers.length)];
    const revenueValue = Math.floor(Math.random() * 900) + 100 + Math.random();
    const revenue = `$${revenueValue.toFixed(2)}`;
    const netProfitValue = revenueValue * (Math.random() * 0.3 + 0.1);
    const netProfit = `$${netProfitValue.toFixed(2)}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    orders.push({
      id,
      products,
      itemCount,
      date,
      dateObj,
      customer,
      revenue,
      revenueValue,
      netProfit,
      netProfitValue,
      status,
    });
  }

  return orders;
};

// Sample products for new order form
export const sampleProducts = [
  { id: 1, name: "Men Grey Hoodie", price: 49.9, image: "/placeholder.svg" },
  {
    id: 2,
    name: "Women Striped T-Shirt",
    price: 34.9,
    image: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Women White T-Shirt",
    price: 40.9,
    image: "/placeholder.svg",
  },
  { id: 4, name: "Men White T-Shirt", price: 49.9, image: "/placeholder.svg" },
  { id: 5, name: "Women Red T-Shirt", price: 34.9, image: "/placeholder.svg" },
  { id: 6, name: "Denim Jacket", price: 89.9, image: "/placeholder.svg" },
  { id: 7, name: "Leather Boots", price: 129.9, image: "/placeholder.svg" },
  { id: 8, name: "Winter Scarf", price: 24.9, image: "/placeholder.svg" },
  { id: 9, name: "Running Shoes", price: 79.9, image: "/placeholder.svg" },
  { id: 10, name: "Wool Beanie", price: 19.9, image: "/placeholder.svg" },
];

// Sample customers for new order form
export const sampleCustomers = [
  {
    id: 1,
    name: "Ronald Jones",
    email: "ronald.jones@example.com",
    address: "123 Main St, New York, NY 10001",
  },
  {
    id: 2,
    name: "Jacob McKinney",
    email: "jacob.mckinney@example.com",
    address: "456 Oak Ave, Los Angeles, CA 90001",
  },
  {
    id: 3,
    name: "Samuel Murphy",
    email: "samuel.murphy@example.com",
    address: "789 Pine Rd, Chicago, IL 60007",
  },
  {
    id: 4,
    name: "Philip Wells",
    email: "philip.wells@example.com",
    address: "101 Maple Dr, Houston, TX 77001",
  },
  {
    id: 5,
    name: "Annie Bell",
    email: "annie.bell@example.com",
    address: "202 Cedar Ln, Miami, FL 33101",
  },
  {
    id: 6,
    name: "Gregory Nguyen",
    email: "gregory.nguyen@example.com",
    address: "303 Birch St, Seattle, WA 98101",
  },
  {
    id: 7,
    name: "Deborah Harris",
    email: "deborah.harris@example.com",
    address: "404 Elm Blvd, Boston, MA 02101",
  },
  {
    id: 8,
    name: "Jenny Hendrix",
    email: "jenny.hendrix@example.com",
    address: "505 Walnut Ave, Denver, CO 80201",
  },
  {
    id: 9,
    name: "Diana Cooper",
    email: "diana.cooper@example.com",
    address: "606 Cherry St, Atlanta, GA 30301",
  },
  {
    id: 10,
    name: "Max Williamson",
    email: "max.williamson@example.com",
    address: "707 Spruce Rd, Phoenix, AZ 85001",
  },
];
