import { expect, Page } from '@playwright/test';

export abstract class BasePage
{
    constructor(protected readonly page: Page) {}

    // Opens a URL and fails immediately with a clear message if the server returns an error page
    protected async open(url: string)
    {
        const response = await this.page.goto(url);
        expect(response?.status(), `ERR: server returned an error page for ${url}`).toBe(200);
    }
}
