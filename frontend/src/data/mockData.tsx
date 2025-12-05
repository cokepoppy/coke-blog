import type { JSX } from 'react';

export interface Post {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  coverColor: string;
  content: JSX.Element; // In a real app this would be string (markdown/html)
}

export const COVER_COLORS = [
  "#D6D1CB", // Warm Stone (Darker)
  "#C9C4BC", // Taupe
  "#D1D5DB", // Cool Grey
  "#CED4C8", // Sage Green Grey
  "#DBCDC8", // Dusty Rose
  "#C8D1D6", // Muted Blue Grey
  "#D4CFC5", // Sand
  "#D1C8C3"  // Warm Brown Grey
];

export const getRandomColor = () => COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
