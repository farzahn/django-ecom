## **Project Goal: Build & Deploy "pasargadprints" E-commerce Platform**

Your primary objective is to act as an expert full-stack developer. You will plan, design, develop, and test, in prepare for deployment a complete e-commerce platform called "pasargadprints". The platform's main purpose is to sell custom 3D printed items.

The final product should be a robust, secure, and user-friendly application, similar in core functionality to platforms like Shopify.

---

### **Core Technology Stack**

* **Backend:** Django & Django REST Framework
* **Frontend:** React
* **Database:** PostgreSQL
* **Payments:** Stripe API
* **Shipping:** GoShippo API
* **CI/CD:** Use the "gh" command

---

### **Phase 1: Backend Development (Django)**

Your first phase is to build the entire backend infrastructure.

1.  **Project Setup:**
    * Initialize a new Django project named `pasargadprints`.
    * Create a core Django app named `store`.
    * Set up Django REST Framework and configure it for the project.
    * Configure the project to use a PostgreSQL database.

2.  **Database Models:**
    * Define the following Django models in `store/models.py`:
        * `Product`: Fields for name, description, high-resolution images (multiple per product), price, stock quantity, dimensions (length, width, height), weight, and a unique slug for URLs.
        * `Customer`: To store user information, linked to Django's built-in `User` model.
        * `Order`: Fields to track the customer, order date, completion status, total price, and a unique order ID.
        * `OrderItem`: A through-model to connect `Product` and `Order`, storing the quantity of each product per order.
        * `ShippingAddress`: Fields for the customer's full name, address line 1, address line 2, city, state, postal code, and country.

3.  **API Endpoints (Django REST Framework):**
    * Create serializers for all your models.
    * Develop a comprehensive set of API views/viewsets for the following actions:
        * **Products:** List all products, retrieve a single product by its slug.
        * **Cart:** A virtual cart managed through the API to add items, update quantities, and remove items. This will likely be managed via session state for guests and linked to the `Customer` for logged-in users.
        * **Orders:** Create a new order (the checkout process).
        * **User Authentication:** Endpoints for user registration, login, and logout.

4.  **API Integrations:**
    * **Stripe:**
        * Integrate the Stripe Python library.
        * Create an API endpoint that takes cart information and a shipping address to create a `Stripe Checkout Session`.
        * Implement a webhook endpoint to listen for `checkout.session.completed` events from Stripe. When this event is received, you must:
            1.  Verify the event's signature to ensure it's from Stripe.
            2.  Fulfill the order: mark the `Order` model as paid, decrease the stock quantity of the purchased `Product`(s), and prepare the order for shipping.
    * **GoShippo:**
        * Integrate the GoShippo Python library.
        * Create an API endpoint that accepts a customer's `ShippingAddress` and cart contents (for weight/dimensions).
        * This endpoint must call the GoShippo API to fetch real-time shipping rates from various carriers.
        * The rates should be returned to the frontend so the user can select a shipping option.

5.  **Admin Panel:**
    * Customize the Django Admin site.
    * Register all models so that the site owner can manage products, view orders, and see customer information directly through the admin interface.
    * Add an action to the `Order` admin page to generate a shipping label via the GoShippo API.

---

### **Phase 2: Frontend Development (React)**

Once the backend APIs are functional, build the user-facing application.

1.  **Project Setup:**
    * Initialize a new React application using `create-react-app` or Vite.
    * Set up React Router for client-side navigation.
    * Use a state management library like Redux Toolkit or Zustand for managing global state (e.g., cart, user authentication).



2.  **Component & Page Development:**
    * **Homepage:** A visually appealing landing page that showcases featured products.
    * **Products Page:** A grid or list view of all available products, with sorting and filtering capabilities.
    * **Product Detail Page:** A dedicated page for each product, displaying all its information, images, and an "Add to Cart" button.
    * **Shopping Cart Page:** A summary of all items in the cart, with options to change quantities or remove items.
    * **Checkout Flow (Multi-Step):**
        1.  **Step 1:** Collect Shipping Information. This form should call the backend's GoShippo endpoint to fetch and display shipping rates after the address is entered.
        2.  **Step 2:** Order & Payment Summary. Display the final cart contents, selected shipping option, and total price. A "Proceed to Payment" button will initiate the Stripe Checkout process.
        3.  **Step 3:** Redirect to Stripe Checkout for secure payment entry.
        4.  **Order Confirmation Page:** A success page shown after the user completes the payment on Stripe.
    * **User Profile Page:** A private page for logged-in users to view their order history and manage their saved addresses.

3.  **API Consumption:**
    * Use `axios` or `fetch` to interact with all the Django backend endpoints you created in Phase 1.
    * Ensure all state is synchronized correctly between the frontend and backend.

---

### **Phase 3: Testing & Finalization**

1.  **Backend Testing:**
    * Write unit tests for your Django models and API logic.
    * Test the Stripe and GoShippo integrations thoroughly, using mock API calls to simulate different scenarios (e.g., successful payment, failed payment, invalid address).

2.  **Frontend Testing:**
    * Write component tests using Jest and React Testing Library to ensure individual components work as expected.
    * Write end-to-end tests using a framework like Cypress to simulate a full user journey: from adding an item to the cart to completing a purchase.

3.  **Final Deliverables:**
    * A complete, well-documented codebase hosted in a GitHub repository.
    * Clear instructions in a `README.md` file on how to set up and run the project locally.
    * The application should be containerized using Docker for easy deployment.