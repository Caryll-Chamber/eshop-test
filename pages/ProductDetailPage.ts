import { Locator, Page, Response } from '@playwright/test';
import { BasePage } from './BasePage';
import { routes } from './routes';

// Detail of one product: /product_details/<id>
export class ProductDetailPage extends BasePage
{
    readonly productName: Locator;
    readonly availability: Locator;
    readonly quantityInput: Locator;
    readonly addToCartButton: Locator;
    readonly viewCartLink: Locator;

    constructor(page: Page)
    {
        super(page);
        this.productName = page.locator('.product-information h2');
        this.availability = page.locator('.product-information p', { hasText: 'Availability:' });
        this.quantityInput = page.locator('#quantity');
        this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
        this.viewCartLink = page.getByRole('link', { name: 'View Cart' });
    }

    async goto(productId: number)
    {
        await this.open(`${routes.productDetail}${productId}`);
    }

    // Returns the server response, so a test can check whether the server accepted the request.
    async addToCart(quantity: number = 1): Promise<Response>
    {
        await this.quantityInput.fill(String(quantity));
        // Trap is set BEFORE the click, otherwise a fast response could be missed (race condition).
        const serverResponse = this.page.waitForResponse(/add_to_cart/);
        await this.addToCartButton.click();
        return await serverResponse;
    }

    // "View Cart" link in the "Added!" dialog shown after adding a product.
    async openCartFromDialog()
    {
        await this.viewCartLink.click();
        await this.page.waitForURL((url) => url.pathname === routes.cart);
    }
}
