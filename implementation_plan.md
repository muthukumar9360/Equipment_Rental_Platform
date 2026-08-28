# Goal
Implement the Preview and Edit flows for a user's own products in `MyProducts.jsx`. Specifically, update the preview flow to use the `ProductQuickViewModal` and standard `ProductDetails.jsx` (with a specialized "Preview Mode" widget for the owner), and ensure the Edit product page works correctly.

## User Review Required
> [!IMPORTANT]
> This plan will override rule #3 in `AGENTS.md` (which currently mandates using `/my-product-preview/:id`). We will change `MyProducts.jsx` to open the `ProductQuickViewModal` instead, and use the public `ProductDetails.jsx` page to show the full preview, exactly as you requested.

## Proposed Changes

### `frontend/src/pages/MyProducts.jsx`
- [MODIFY] Add state for `selectedPreviewProduct` and import `ProductQuickViewModal`.
- [MODIFY] Change the "Preview Listing" link to a button that opens the `ProductQuickViewModal` when clicked.

### `frontend/src/pages/ProductDetails.jsx`
- [MODIFY] Import `AuthContext` to determine if the currently logged-in user is the owner of the product being viewed.
- [MODIFY] If the user is the owner, hide the standard "Request to Rent" booking widget.
- [MODIFY] Replace it with a "Preview Mode" widget that displays "This is how your product looks to customers" along with an "Edit Product" button that links to `/edit-product/:id`.

### `frontend/src/pages/AddProduct.jsx`
- [MODIFY] Update the component to check if an `id` is present in the URL (`useParams`).
- [MODIFY] If an `id` is present, fetch the product details on mount and pre-fill all the form fields.
- [MODIFY] Change the submit logic to send a `PUT /api/products/:id` request when in edit mode, instead of a `POST` request.

## Verification Plan
1. Log in as a user with products.
2. Go to "My Products" and click the Preview button. Verify the modal opens.
3. Click "View Full Details" inside the modal.
4. Verify you arrive at `ProductDetails.jsx` and see the "Preview Mode / Edit" widget instead of the booking widget.
5. Click "Edit" and verify the form pre-fills correctly.
