import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { routes } from './routes';

// Page with the product list and the search box: /products
export class ProductsPage extends BasePage
{
    readonly searchInput: Locator;
    readonly searchButton: Locator;
    readonly searchedProductsHeading: Locator;
    readonly productCards: Locator;

    constructor(page: Page)
    {
        super(page);
        this.searchInput = page.getByPlaceholder('Search Product');
        this.searchButton = page.locator('#submit_search');
        this.searchedProductsHeading = page.getByRole('heading', { name: 'Searched Products' });
        this.productCards = page.locator('.product-image-wrapper');
    }

    async goto()
    {
        await this.open(routes.products);
    }

    async search(term: string)
    {
        await this.searchInput.fill(term);
        await this.searchButton.click();
        // The heading appears only after a search, so the test cannot pass if search did nothing.
        await expect(this.searchedProductsHeading).toBeVisible();
    }

    // One product card selected by its exact name (not just the first match).
    productCard(name: string): Locator
    {
        return this.productCards.filter({
            has: this.page.locator('.productinfo').getByText(name, { exact: true }),
        });
    }

    async openProduct(name: string)
    {
        await this.productCard(name).getByRole('link', { name: 'View Product' }).click();
        // Wait for the full page load, otherwise "Add to cart" may not have its JS handler yet.
        await this.page.waitForURL((url) => url.pathname.startsWith(routes.productDetail));
    }
}
