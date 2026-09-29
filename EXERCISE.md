Create a small automation test suite using Playwright and TypeScript that covers both a frontend application and
a backend API. The solution should be readable, maintainable, and runnable locally and inside Docker.
Application Under Test — Frontend
Application: https://www.saucedemo.com/
Username: standard_user
Password: secret_sauce
API Under Test
Base URL: https://dummyjson.com/
Documentation: https://dummyjson.com/docs
Relevant endpoints include:
GET /products
GET /products/{id}
GET /products/search?q=...
GET /users
GET /users/{id}
POST /auth/login
GET /auth/me
Part 1 — API Automation
Scenario A — Product Search
Search for products using the API, for example GET /products/search?q=phone.
• Validate that the request succeeds.
• Validate that the response contains products.
• Validate that each returned product contains the required fields.
• Validate that product IDs are unique.
• Validate that price is a positive number.
Scenario B — Pagination
Retrieve products using pagination, for example GET /products?limit=10&skip;=10.
• Validate the requested number of products.
• Validate pagination metadata.
• Retrieve two different pages and verify that products are not duplicated between them.
Scenario C — Authentication
Authenticate using POST /auth/login. Use the following credentials:
username: emilys
password: emilyspass
• Validate the successful response.
• Validate that an access token is returned.
• Validate that a refresh token is returned.
• Use the access token to call GET /auth/me.
• Validate that the authenticated user matches the login response.
Part 2 — UI Automation
Scenario D — Product Sorting
• Log in to SauceDemo.
• Retrieve the visible product names and prices.
• Select the price sorting option.
• Retrieve the product prices again.
• Verify programmatically that the products are sorted correctly.
Do not rely on a hard-coded expected product order. Extract the values from the UI and validate the sorting
algorithmically.
Part 3 — Dynamic UI Test
• Log in.
• Find the available products.
• Select a product dynamically based on a condition of your choice.
• Open the product details page.
• Validate that the product details match the selected product.
• Add the product to the cart.
• Open the cart.
• Validate that the correct product was added.
Do not depend on a specific product index unless you can justify why it is appropriate.
Part 4 — API + UI
Create one test that demonstrates how API and UI automation can complement each other. Use the DummyJSON
API to retrieve product information and use the SauceDemo UI to validate relevant product information where a
meaningful mapping exists.
You are not required to force an artificial end-to-end relationship between the two systems. If the systems cannot
be meaningfully correlated, explain your design decision.
Part 5 — Docker
The complete automation project must run inside Docker.
• Create: Dockerfile
• Create: .dockerignore
The following commands should work:
docker build -t automation-tests .
docker run --rm automation-tests
• Install all required dependencies inside the container.
• Include everything required to run Playwright.
• Execute the tests.
• Return an appropriate exit code.
Configuration
Avoid hard-coding environment-specific values throughout the test code. Use environment variables or an
appropriate configuration mechanism.
Examples:
UI_BASE_URL
API_BASE_URL
UI_USERNAME
UI_PASSWORD
API_USERNAME
API_PASSWORD
Technical Expectations
• Use Playwright with TypeScript.
• Use appropriate API clients and/or fixtures where useful.
• Use Page Object Model where it adds value.
• Use TypeScript types/interfaces where appropriate.
• Use stable locators and meaningful assertions.
• Keep tests independent and maintainable.
• Do not build an unnecessarily large framework.
What We Will Evaluate
• Test Design: What to test, where to test it, and why.
• Playwright: Locators, assertions, waiting, fixtures, and POM.
• API: HTTP methods, status codes, authentication, query parameters, and response validation.
• TypeScript: Types, readability, reusability, and maintainability.
• Docker: Image vs. container, dependencies, Playwright browsers, environment variables, and reproducibility.
Bonus — If You Finish Early
Option 1 — Negative API Testing
• Invalid login
• Non-existing product
• Invalid pagination parameters
Option 2 — API Schema Validation
• Add schema validation for one API response
Option 3 — CI-friendly execution
• Add separate commands for API, UI, and E2E tests
Option 4 — Debugging artifacts
• Configure screenshots, traces, and/or an HTML report on failure
Time Management
Time Suggested focus
0–5 min Understand requirements and decide test strategy
5–25 min API tests
25–45 min UI tests
45–55 min Docker and execution
55–60 min Run everything, cleanup, and prepare to explain decisions
AI tools may be used. You should be able to explain the implementation, technical decisions, assumptions, and trade-offs in
