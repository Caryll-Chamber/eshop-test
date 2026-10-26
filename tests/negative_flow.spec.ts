import { test, expect } from '../fixtures';
import products from '../test_data/products.json';
import { formatPrice } from '../utils/price';

// The bug does not depend on the product, so any product from the test data works; the first one is used.
const product = products[0];
const quantity = -1;

test('Negative quantity is accepted (known bug)',
    {
        annotation: { type: 'bug', description: 'E-shop accepts quantity -1, cart total becomes a negative number' },
    },
    async ({ productDetailPage, cartPage }) =>
    {
        await test.step('1. Open product details', async () =>
        {
            await productDetailPage.goto(product.id);
            await expect(productDetailPage.productName, 'ERR: test data mismatch, product id and name in products.json do not match').toHaveText(product.name);
        });

        await test.step(`2. Add ${quantity} piece to cart`, async () =>
        {
            const response = await productDetailPage.addToCart(quantity);
            expect(response.ok(), 'ERR: server did not accept the add-to-cart request').toBe(true);
        });

        await test.step(`3. KNOWN BUG: cart contains ${quantity} piece`, async () =>
        {
            await cartPage.goto();
            await expect(cartPage.productRow(product.name), 'BUG FIXED? Product was not added to the cart at all, update this test').toBeVisible();
            await expect(cartPage.quantityOf(product.name), `BUG FIXED? Cart no longer contains ${quantity} piece, update this test`).toHaveText(String(quantity));
            await expect(cartPage.totalOf(product.name), 'BUG FIXED? Cart total is no longer negative, update this test').toHaveText(formatPrice(quantity * product.price));
        });
    });
