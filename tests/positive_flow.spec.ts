import { test, expect } from '../fixtures';
import products from '../test_data/products.json';

for (const product of products)
{
    test(`${product.name} in Cart`, async ({ productsPage, productDetailPage, cartPage }) =>
        {
            await productsPage.goto();
            await productsPage.search(product.name);
            await productsPage.openProduct(product.name);
            await expect(productDetailPage.productName).toHaveText(product.name);
            await expect(productDetailPage.availability).toContainText('In Stock');
            await productDetailPage.addToCart(1);
            await productDetailPage.openCartFromDialog();
            await expect(cartPage.priceOf(product.name)).toHaveText(`Rs. ${product.price}`);
            await expect(cartPage.quantityOf(product.name)).toHaveText('1');
        });
}
