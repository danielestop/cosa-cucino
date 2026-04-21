import { CATEGORIES } from '@/data/categories';

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default function Layout({ children }) {
  return children;
}