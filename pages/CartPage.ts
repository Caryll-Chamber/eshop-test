import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

// Shopping cart: /view_cart
export class CartPage extends BasePage
{
    readonly rows: Locator;
    readonly emptyCartMessage: Locator;

    constructor(page: Page)
    {
        super(page);
        this.rows = page.locator('#cart_info_table tbody tr');
        this.emptyCartMessage = page.locator('#empty_cart');
    }

    async goto()
    {
        await this.open('/view_cart');
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
