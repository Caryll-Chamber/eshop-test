import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { routes } from './routes';

// Shopping cart: /view_cart
export class CartPage extends BasePage
{
    readonly rows: Locator;

    constructor(page: Page)
    {
        super(page);
        this.rows = page.locator('#cart_info_table tbody tr');
    }

    async goto()
    {
        await this.open(routes.cart);
    }

    productRow(name: string): Locator
    {
        return this.rows.filter({ has: this.page.getByRole('link', { name, exact: true }) });
    }

    priceOf(name: string): Locator
    {
        return this.productRow(name).locator('.cart_price');
    }

    quantityOf(name: string): Locator
    {
        return this.productRow(name).locator('.cart_quantity');
    }

    totalOf(name: string): Locator
    {
        return this.productRow(name).locator('.cart_total');
    }
}
