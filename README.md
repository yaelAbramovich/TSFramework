# TS Framework

Playwright + TypeScript automation suite covering the UI (SauceDemo) and API (DummyJSON) scenarios described in [`EXERCISE.md`](./EXERCISE.md).

## Running the tests

```bash
npm install
npx playwright install chromium
cp .env.example .env   # fill in real values; .env.example only has placeholders
npm test                # everything
npm run test:api        # API scenarios only
npm run test:ui          # UI scenarios only
npm run report           # open the last HTML report
```

## Design decisions

### Part 4 — API + UI: no forced correlation

The exercise pairs two independent demo systems: **SauceDemo** (the UI under test) and **DummyJSON** (the API under test). They are unrelated applications with unrelated catalogs — SauceDemo sells backpacks, bike lights, and t-shirts; DummyJSON's product catalog is phones, laptops, and skincare. There is no shared backend, no overlapping product, and nothing that identifies "the same item" across both systems.

Because of that, a test that fetches a product from the DummyJSON API and asserts it appears in the SauceDemo UI (or vice versa) is not just difficult — it's impossible to write honestly. The two product sets never intersect, so such a test could only ever pass by accident (if it happened to assert something trivially true) or by quietly faking a relationship that doesn't exist, which would misrepresent what's actually being verified.

The exercise explicitly allows for this:

> "You are not required to force an artificial end-to-end relationship between the two systems. If the systems cannot be meaningfully correlated, explain your design decision."

This file is that explanation. No Part 4 test was written, because:

1. **No real-world relationship exists to validate.** The entire value of an API+UI test is confirming that two views of the *same* underlying data agree with each other. Here there is no shared underlying data.
2. **A fabricated correlation would be misleading, not useful.** A test built on arbitrarily pairing "the cheapest DummyJSON product" with "the cheapest SauceDemo product" would look like a meaningful cross-system check in test reports, while actually asserting nothing about the two systems' consistency with each other.
3. **A convention-level check (e.g., "both systems represent price as a positive number") would only test a coincidence, not a design decision either system actually made in relation to the other** — it's not evidence the systems complement each other, just that two unrelated APIs both chose sensible number types.

If SauceDemo and DummyJSON shared a real relationship — for example, if SauceDemo's product catalog were actually backed by the DummyJSON API — the correct Part 4 test would use the API to fetch the authoritative product data (price, name, description) and use the UI purely to verify that data renders correctly on screen, rather than duplicating business logic in both layers. That pattern is already demonstrated within this suite: [`tests/ui/dynamic-product-flow.spec.ts`](./tests/ui/dynamic-product-flow.spec.ts) reads a product's data from the products listing (the "source of truth" for that test) and verifies the same data reappears correctly on the product details page and in the cart — the same complementary-verification shape Part 4 asks for, just applied within one system instead of across two that don't actually relate.
