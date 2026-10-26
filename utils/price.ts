// Price exactly as the shop displays it (e.g. 500 -> "Rs. 500", -500 -> "Rs. -500").
// Test data keeps prices as numbers; only this function knows the currency format.
export function formatPrice(amount: number): string
{
    return `Rs. ${amount}`;
}
