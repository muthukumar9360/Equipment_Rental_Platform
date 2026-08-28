# strict-ui-preservation

## Description
This rule strictly forbids agents from modifying the UI layout, design, and navigational flow of the core product pages without explicit, unambiguous user consent.

## Context
The user has established a very specific, permanent UI and navigational flow for the Equipment Catalog and Product Hub, and does not want agents to inadvertently change it during subsequent feature development.

## Rule Instructions
1. **PERMANENT UI CONSTRAINT**: You are strictly forbidden from modifying the visual design, layout, layout classes (like removing or adding `relative`, `absolute`, `sticky`, or `min-h`), or core React structure of the following files, unless the user explicitly tells you to change the UI of these pages:
   - `frontend/src/pages/ProviderPreview.jsx` (The Product Hub / Compare Providers page)
   - `frontend/src/pages/ProductDetails.jsx`
   - `frontend/src/pages/ProductsPage.jsx`
   - `frontend/src/components/ProductQuickViewModal.jsx`
   
2. **Navigational Flow**: The current navigation flow must be preserved:
   - `ProductsPage` -> clicks product -> `ProviderPreview` (Product Hub).
   - In `ProviderPreview` (right side) -> clicks alternative provider -> `ProductQuickViewModal`.
   - In `ProductQuickViewModal` -> clicks "Show Full Details" -> `ProductDetails`.

3. **My Products Flow**:
   - The My Products listing (`MyProducts.jsx`) must continue linking to `/my-product-preview/:id` for previews, which uses the `MyProductPreview.jsx` (the 6-angle image layout). Do not mix this up with the public catalog flow.

4. If you are asked to add logic (e.g., API calls, simple bug fixes) to these pages, you must **preserve the existing UI completely**. Do not redesign the page.
