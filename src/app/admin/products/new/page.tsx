import AdminProductEditPage from '../[id]/page';

export default function NewProductPage() {
  return <AdminProductEditPage params={Promise.resolve({ id: 'new' })} />;
}
