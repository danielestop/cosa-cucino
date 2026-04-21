import { RECIPES } from '@/data/recipes';

export async function generateStaticParams() {
  return RECIPES.map((r) => ({ id: r.id }));
}

export default function Layout({ children }) {
  return children;
}