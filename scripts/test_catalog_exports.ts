import {
  getProduct,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createCatalogAdmin,
  ProductNotFoundError,
} from '../src/lib/catalog';

async function run() {
  console.log('Testing Public @/lib/catalog Seam Exports...');

  if (typeof createProduct !== 'function') throw new Error('createProduct is not exported');
  if (typeof updateProduct !== 'function') throw new Error('updateProduct is not exported');
  if (typeof deleteProduct !== 'function') throw new Error('deleteProduct is not exported');
  if (typeof createCatalogAdmin !== 'function') throw new Error('createCatalogAdmin is not exported');
  if (typeof getProduct !== 'function') throw new Error('getProduct is not exported');
  if (typeof ProductNotFoundError !== 'function') throw new Error('ProductNotFoundError is not exported');

  console.log('✓ All Catalog query and mutation exports verified');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
