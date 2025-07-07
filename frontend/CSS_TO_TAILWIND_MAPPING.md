# CSS to Tailwind Mapping Guide

## Global Styles
- `box-sizing: border-box` → Already handled by Tailwind base styles
- `margin: 0` → `m-0`
- `font-family: var(--font-family)` → `font-sans`
- `min-height: 100vh` → `min-h-screen`

## Layout Classes
- `.container` → `max-w-container-max mx-auto px-4`
- `.App` → `min-h-screen`

## Button Classes
- `.btn` → `px-6 py-3 border-0 rounded-lg cursor-pointer text-base font-semibold no-underline inline-block text-center transition-all duration-250 leading-tight`
- `.btn:focus` → `focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-10`
- `.btn-primary` → `bg-primary text-white hover:bg-primary-hover active:bg-primary-active`
- `.btn-secondary` → `bg-secondary text-white hover:bg-secondary-hover`
- `.btn-danger` → `bg-accent text-white hover:bg-accent-hover`

## Card Classes
- `.card` → `bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition-all duration-250 hover:shadow-md`
- `.card-header` → `mb-4 pb-4 border-b border-gray-100`
- `.card-title` → `text-lg font-semibold text-gray-900 m-0`
- `.card-body` → `text-gray-600`

## Form Classes
- `.form-group` → `mb-4`
- `.form-label` → `block mb-2 font-medium text-gray-900`
- `.form-control` → `w-full px-3 py-3 border border-gray-200 rounded-md text-base font-sans transition-all duration-250 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-10 placeholder-gray-400`

## Utility Classes
- `.text-primary` → `text-text-primary`
- `.text-secondary` → `text-text-secondary`
- `.text-muted` → `text-text-muted`
- `.text-success` → `text-success`
- `.text-warning` → `text-warning`
- `.text-danger` → `text-accent`
- `.bg-primary` → `bg-bg-primary`
- `.bg-secondary` → `bg-bg-secondary`
- `.bg-tertiary` → `bg-bg-tertiary`
- `.border` → `border border-gray-200`
- `.border-light` → `border-gray-100`
- `.border-dark` → `border-gray-300`
- `.rounded` → `rounded`
- `.rounded-md` → `rounded-md`
- `.rounded-lg` → `rounded-lg`
- `.rounded-xl` → `rounded-xl`
- `.shadow-sm` → `shadow-sm`
- `.shadow` → `shadow`
- `.shadow-md` → `shadow-md`
- `.shadow-lg` → `shadow-lg`

## Custom Component Classes to Convert

### Header Component
- `.header` → `bg-white shadow-md sticky top-0 z-50`
- `.header-content` → `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- `.header-nav` → `flex justify-between items-center h-16`

### Homepage Component
- `.hero-section` → `bg-gradient-to-r from-primary to-primary-hover text-white py-20`
- `.hero-content` → `max-w-4xl mx-auto text-center px-4`
- `.hero-title` → `text-5xl font-bold mb-6`
- `.hero-subtitle` → `text-xl mb-8 opacity-90`
- `.featured-products` → `py-16 bg-gray-50`
- `.product-grid` → `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`

### Product Card Component
- `.product-card` → `bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6`
- `.product-image` → `w-full h-48 object-cover rounded-lg mb-4`
- `.product-title` → `text-lg font-semibold text-gray-900 mb-2`
- `.product-price` → `text-2xl font-bold text-primary mb-4`
- `.product-description` → `text-gray-600 mb-4`

### Cart Component
- `.cart-item` → `flex items-center justify-between p-4 border-b border-gray-200`
- `.cart-summary` → `bg-gray-50 p-6 rounded-lg`
- `.cart-total` → `text-2xl font-bold text-gray-900`

### Checkout Component
- `.checkout-form` → `max-w-2xl mx-auto p-6`
- `.checkout-section` → `mb-8`
- `.checkout-title` → `text-2xl font-semibold text-gray-900 mb-6`
- `.shipping-options` → `space-y-4`
- `.shipping-option` → `p-4 border border-gray-200 rounded-lg hover:border-primary cursor-pointer`

### Dashboard Component
- `.dashboard-layout` → `flex min-h-screen bg-gray-50`
- `.dashboard-sidebar` → `w-64 bg-white shadow-sm`
- `.dashboard-content` → `flex-1 p-6`
- `.dashboard-header` → `bg-white p-6 shadow-sm mb-6`
- `.stats-grid` → `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
- `.stat-card` → `bg-white p-6 rounded-lg shadow-sm`

### User Dropdown Component
- `.user-dropdown` → `relative`
- `.dropdown-menu` → `absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50`
- `.dropdown-item` → `block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900`

## Media Queries
- Mobile: `sm:` (640px+)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)
- Large Desktop: `xl:` (1280px+)
- Extra Large: `2xl:` (1536px+)

## Animation Classes
- `transition: var(--transition-base)` → `transition-all duration-250`
- `transition: var(--transition-fast)` → `transition-all duration-150`
- `transition: var(--transition-slow)` → `transition-all duration-350`

## Focus States
- `focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-10`
- `focus:border-primary`

## Hover States
- `hover:bg-primary-hover`
- `hover:shadow-md`
- `hover:scale-105`

## Active States
- `active:bg-primary-active`
- `active:scale-95`