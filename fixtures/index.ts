import { test as base } from '@playwright/test';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';

type PageObjects =
{
    productsPage: ProductsPage;
    productDetailPage: ProductDetailPage;
    cartPage: CartPage;
};

// Our own `test`: tests import it from here instead of '@playwright/test'.
// Every test then gets a prepared page and ready-made page objects.
export const test = base.extend<PageObjects>(
{
    page: async ({ page, baseURL }, use) =>
    {
        // Allow only requests to the shop itself. Ads and trackers (~20 domains) slow the tests down
        // and can cover buttons; blocking them makes tests faster and more stable.
        const shopHost = new URL(baseURL!).hostname;
        await page.route('**/*', (route) =>
            new URL(route.request().url()).hostname === shopHost ? route.continue() : route.abort());

        // Cookie dialog appears only in some regions (e.g. EU), so it is clicked only if it shows up.
        await page.addLocatorHandler
        (
            page.getByRole('button', { name: 'Consent', exact: true }),
            async (button) =>
            {
                await button.click();
            }
        );

        await use(page);
    },

    productsPage: async ({ page }, use) =>
    {
        await use(new ProductsPage(page));
    },

    productDetailPage: async ({ page }, use) =>
    {
        await use(new ProductDetailPage(page));
    },

    cartPage: async ({ page }, use) =>
    {
        await use(new CartPage(page));
    },
});

export { expect } from '@playwright/test';
