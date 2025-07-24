// This is a mock implementation for demonstration purposes
// In a real app, this would connect to your database

import { UserDetails } from "@/type/user";

export async function getUserDetails(
  email: string | undefined
): Promise<UserDetails | null> {
  // In a real app, this would fetch user data from your database
  // For demonstration, we'll return mock data

  if (!email) return null;

  return {
    id: "user_1",
    name: "John Doe",
    email: email,
    phone: "+1 (555) 123-4567",
    memberSince: "2022-03-15",
    loyaltyPoints: 450,
    rewardLevel: "Gold",
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      orderUpdates: true,
      promotions: true,
    },
    orders: [
      {
        id: "ORD12345",
        date: "2023-11-15",
        status: "delivered",
        items: [
          {
            id: "prod_1",
            name: "Premium Wireless Headphones",
            price: 129.99,
            quantity: 1,
            image: "/placeholder.svg",
            color: "Black",
          },
          {
            id: "prod_2",
            name: "Smart Fitness Tracker",
            price: 89.99,
            quantity: 1,
            image: "/placeholder.svg",
            color: "Blue",
          },
        ],
        subtotal: 219.98,
        shipping: 5.99,
        tax: 18.0,
        total: 243.97,
        shippingAddress: {
          name: "John Doe",
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zip: "10001",
          country: "United States",
        },
      },
      {
        id: "ORD12346",
        date: "2023-10-22",
        status: "delivered",
        items: [
          {
            id: "prod_3",
            name: "Organic Cotton T-Shirt",
            price: 24.99,
            quantity: 2,
            image: "/placeholder.svg",
            color: "White",
            size: "L",
          },
        ],
        subtotal: 49.98,
        shipping: 4.99,
        tax: 4.5,
        total: 59.47,
        shippingAddress: {
          name: "John Doe",
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zip: "10001",
          country: "United States",
        },
      },
      {
        id: "ORD12347",
        date: "2023-12-05",
        status: "processing",
        items: [
          {
            id: "prod_4",
            name: "Smart Home Speaker",
            price: 79.99,
            quantity: 1,
            image: "/placeholder.svg",
            color: "Gray",
          },
        ],
        subtotal: 79.99,
        shipping: 0.0,
        tax: 6.6,
        total: 86.59,
        shippingAddress: {
          name: "John Doe",
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zip: "10001",
          country: "United States",
        },
      },
    ],
    addresses: [
      {
        id: "addr_1",
        name: "John Doe",
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "United States",
        phone: "+1 (555) 123-4567",
        isDefault: true,
      },
      {
        id: "addr_2",
        name: "John Doe",
        street: "456 Work Ave, Suite 500",
        city: "New York",
        state: "NY",
        zip: "10002",
        country: "United States",
        phone: "+1 (555) 123-4567",
        isDefault: false,
      },
    ],
    paymentMethods: [
      {
        id: "pm_1",
        cardType: "Visa",
        last4: "4242",
        expiryMonth: "12",
        expiryYear: "2025",
        isDefault: true,
      },
      {
        id: "pm_2",
        cardType: "Mastercard",
        last4: "5555",
        expiryMonth: "08",
        expiryYear: "2024",
        isDefault: false,
      },
    ],
    wishlist: [
      {
        id: "prod_5",
        name: "Ultra HD Smart TV",
        price: 599.99,
        image: "/placeholder.svg",
        inStock: true,
        color: "Black",
      },
      {
        id: "prod_6",
        name: "Leather Crossbody Bag",
        price: 79.99,
        image: "/placeholder.svg",
        inStock: true,
        color: "Brown",
      },
      {
        id: "prod_7",
        name: "Limited Edition Sneakers",
        price: 129.99,
        image: "/placeholder.svg",
        inStock: false,
        color: "White/Red",
      },
    ],
  };
}
