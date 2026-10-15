import type { CropProgramId, Product, ProductCategory } from '../types';

import quantis from '../assets/products/quantis-800ml.png';
import enrich from '../assets/products/enrich-8kg.png';
import bundle from '../assets/products/isabion-amistar-bundle.png';
import virtako from '../assets/products/virtako-gold-120gm.png';
import isabionGold from '../assets/products/isabion-gold.png';
import isabion1l from '../assets/products/isabion-1l.png';
import isabion500 from '../assets/products/isabion-500ml.png';
import cruiser from '../assets/products/cruiser-200ml.png';
import topik from '../assets/products/topik-200ml.png';

import cornProgram from '../assets/programs/corn.png';
import cottonProgram from '../assets/programs/cotton.png';
import riceProgram from '../assets/programs/rice.png';
import sugarcaneProgram from '../assets/programs/sugarcane.png';
import wheatProgram from '../assets/programs/wheat.png';

/**
 * PROTOTYPE DATA — names and prices come from the blueprint; categories, descriptions and
 * crop-programme mapping are placeholders. Replace with the Naya Savera catalogue API.
 * Array order is the Product Portfolio order on W02.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'isabion-amistar-bundle',
    name: 'Isabion + Amistar Top Bundle Offer',
    price: 16000,
    category: 'Fungicide',
    description: 'Tank-mix bundle: disease protection from Amistar Top with an Isabion growth boost.',
    image: bundle,
    cropPrograms: ['rice', 'corn'],
  },
  {
    id: 'virtako-gold-120gm',
    name: 'Virtako Gold 60 WG 120 GM',
    price: 1600,
    category: 'Insecticides',
    description: 'Long-lasting control of borers and leaf folders.',
    image: virtako,
    cropPrograms: ['rice', 'corn', 'sugarcane'],
  },
  {
    id: 'isabion-gold',
    name: 'ISABION GOLD',
    price: 2300,
    category: 'Fungicide',
    description: 'Amino-acid biostimulant for flowering and fruit set.',
    image: isabionGold,
    cropPrograms: ['cotton', 'corn'],
  },
  {
    id: 'quantis-800ml',
    name: 'QUANTIS 800 ML',
    price: 1800,
    category: 'Fungicide',
    description:
      'Biostimulant that helps crops recover from heat and drought stress and keeps yield on track.',
    image: quantis,
    cropPrograms: ['corn', 'cotton', 'rice', 'wheat'],
    bestSeller: true,
  },
  {
    id: 'isabion-1l',
    name: 'ISABION 1 L',
    price: 3900,
    category: 'Fungicide',
    description: 'Amino-acid biostimulant that speeds recovery after stress.',
    image: isabion1l,
    cropPrograms: ['cotton', 'rice', 'wheat'],
  },
  {
    id: 'isabion-500ml',
    name: 'ISABION 500 ML',
    price: 2000,
    category: 'Fungicide',
    description: 'Amino-acid biostimulant that speeds recovery after stress.',
    image: isabion500,
    cropPrograms: ['cotton', 'rice', 'wheat'],
  },
  {
    id: 'enrich-8kg',
    name: 'ENRICH 8 KG',
    price: 4500,
    category: 'Fungicide',
    description: 'Soil-applied nutrition that builds stronger roots and healthier tillers.',
    image: enrich,
    cropPrograms: ['rice', 'sugarcane', 'wheat'],
    bestSeller: true,
  },
  {
    id: 'cruiser-200ml',
    name: 'Cruiser 200ml',
    price: 1500,
    category: 'Insecticides',
    description: 'Seed treatment that protects seedlings from early sucking pests.',
    image: cruiser,
    cropPrograms: ['cotton', 'corn', 'wheat'],
  },
  {
    id: 'topik-200ml',
    name: 'Topik 80EC 200ml',
    price: 810,
    category: 'Herbicide',
    description: 'Post-emergence control of grassy weeds in wheat.',
    image: topik,
    cropPrograms: ['wheat'],
  },
];

export const PRODUCTS_BY_ID: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p]),
);

export const PORTFOLIO_TABS: Array<{ label: string; category: ProductCategory | null }> = [
  { label: 'All', category: null },
  { label: 'Insecticides', category: 'Insecticides' },
  { label: 'Herbicide', category: 'Herbicide' },
  { label: 'Fungicide', category: 'Fungicide' },
];

/** Products shown before "Load more products". */
export const PORTFOLIO_PAGE_SIZE = 6;

export const CROP_PROGRAMS: Array<{ id: CropProgramId; label: string; image: string }> = [
  { id: 'corn', label: 'CORN', image: cornProgram },
  { id: 'cotton', label: 'COTTON', image: cottonProgram },
  { id: 'rice', label: 'RICE', image: riceProgram },
  { id: 'sugarcane', label: 'SUGARCANE', image: sugarcaneProgram },
  { id: 'wheat', label: 'WHEAT', image: wheatProgram },
];
