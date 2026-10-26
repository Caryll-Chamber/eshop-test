import { test, expect } from '../fixtures';
import products from '../test_data/products.json';
import { formatPrice } from '../utils/price';

const quantity = 1;

for (const product of products)
{
    test(`${product.name} in Cart`, async ({ productsPage, productDetailPage, cartPage }) =>
        {
            await productsPage.goto();
            await productsPage.search(product.name);
            await productsPage.openProduct(product.name);
            await expect(productDetailPage.productName).toHaveText(product.name);
            await expect(productDetailPage.availability).toContainText('In Stock');
            const response = await productDetailPage.addToCart(quantity);
            expect(response.ok(), 'ERR: server did not accept the add-to-cart request').toBe(true);
            await productDetailPage.openCartFromDialog();
            await expect(cartPage.priceOf(product.name)).toHaveText(formatPrice(product.price));
            await expect(cartPage.quantityOf(product.name)).toHaveText(String(quantity));
        });
}
