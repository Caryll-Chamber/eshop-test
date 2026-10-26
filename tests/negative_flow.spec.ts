import { test, expect } from '../fixtures';
import products from '../test_data/products.json';

const product = products[0];

test('Negative quantity is accepted (known bug)',
    {
        annotation: { type: 'bug', description: 'E-shop accepts quantity -1, cart total becomes a negative number' },
    },
    async ({ productDetailPage, cartPage }) =>
    {
        await test.step('1. Open product details', async () =>
        {
            await productDetailPage.goto(product.id);
            await expect(productDetailPage.quantityInput, 'ERR: product detail page did not load').toBeVisible();
        });

        await test.step('2. Add -1 piece to cart', async () =>
        {
            const response = await productDetailPage.addToCart(-1);
            expect(response.ok(), 'ERR: server did not accept the add-to-cart request').toBe(true);
        });

        await test.step('3. KNOWN BUG: cart contains -1 piece', async () =>
        {
            await cartPage.goto();
            await expect(cartPage.quantityOf(product.name), 'BUG FIXED? Cart no longer contains -1 piece, update this test').toHaveText('-1');
            await expect(cartPage.totalOf(product.name), 'BUG FIXED? Cart total is no longer negative, update this test').toHaveText(`Rs. -${product.price}`);
        });
    });
