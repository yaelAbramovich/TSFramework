# Technical Interview Exercise — API Automation & Docker

## Overview

You are working with an online store API.

Your task is to create a small API automation test suite using **Playwright and TypeScript**.

The solution should be maintainable, readable, and easy to run locally and inside a Docker container.

### API

Use the following API:

[https://api.practicesoftwaretesting.com/](https://api.practicesoftwaretesting.com/)

---

## Task

Create an automated test that validates the following flow:

1. Authenticate using the available login endpoint.
2. Extract and store the authentication token from the response.
3. Retrieve the list of available products.
4. Dynamically select a product from the response based on a condition of your choice.

   * Do not hard-code a product ID.
   * Do not simply select the first product in the list.
5. Retrieve the selected product's details.
6. Validate that the product response contains the expected information.
7. Add the selected product to the shopping cart.
8. Retrieve the cart.
9. Validate that the selected product was added successfully.

---

## Technical Requirements

### Playwright

Use **Playwright with TypeScript** for the automation.

Use Playwright's API testing capabilities rather than using an external HTTP library.

### Code Structure

Organize the code in a maintainable way.

For example, you may use:

* API clients
* fixtures
* configuration/environment variables
* reusable helper methods
* appropriate TypeScript types/interfaces

You are free to choose the project structure and architecture.

### Authentication

The authentication token should not be hard-coded.

Design the solution so that authenticated API requests can reuse the token.

### Validation

Validate more than just the HTTP status code.

At minimum, validate relevant response data such as:

* response status
* required fields
* selected product information
* cart contents

---

## Docker

The test suite must be runnable inside a Docker container.

Create the necessary:

* `Dockerfile`
* `.dockerignore`

The following should work:

```bash
docker build -t api-tests .
```

and:

```bash
docker run --rm api-tests
```

The tests should execute successfully inside the container without requiring manual installation of dependencies inside the container.

---

## Configuration

Do not hard-code credentials or environment-specific configuration in the test code.

Use environment variables where appropriate.

For example:

```text
API_USERNAME
API_PASSWORD
API_BASE_URL
```

You may provide reasonable defaults for non-sensitive configuration such as the API base URL.

---

## Expectations

Focus on:

* Clean and readable code
* Maintainability
* Reusability
* Appropriate test assertions
* Proper authentication handling
* Good TypeScript practices
* Test independence
* Clear project structure
* Dockerization

You do **not** need to implement a large framework. Keep the solution appropriately scoped for the exercise.

---

## Bonus

If time allows, consider one or more of the following:

* Add negative authentication tests.
* Handle unexpected API responses gracefully.
* Add a reusable authenticated API fixture.
* Add additional cart validations.
* Add an HTML test report.
* Make the Docker image suitable for running the tests in CI.

---

## Time Limit

Suggested implementation time: **45–60 minutes**.

You may use AI tools during the exercise, but you should be able to explain and justify the code, architecture, and technical decisions you make.
