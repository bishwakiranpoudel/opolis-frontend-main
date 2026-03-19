# Resources from WordPress (Guides & FAQ)

The Resources page can pull **Guides** and **FAQ** from WordPress instead of static data, so content and links are managed in the CMS. If the optional endpoints are not implemented or fail, the app falls back to the static data in `src/lib/resourcesData.ts`.

---

## How it works

- **Blog** — Already WordPress-driven: posts from `getBlogPosts()`, list on the Resources **Blog** tab, individual posts at `/blog/[slug]`.
- **Guides** — Optional: if `GET /wp-json/opolis/v1/guides` returns valid JSON, the **Guides** tab uses it; otherwise the static `GUIDES_DATA` list is used. Each guide item has `type`, `label`, and `url`; `url` can be external (PDF, learn.opolis.co, etc.) or internal (e.g. `/blog/my-post`). Internal links use the app router; external links open in a new tab.
- **FAQ** — Optional: if `GET /wp-json/opolis/v1/faq` returns valid JSON, the **FAQ** tab uses it; otherwise the static `FAQ_SECTIONS` are used.

Same pattern as the blog: list from WordPress, redirect/internal links instead of hardcoded static lists.

---

## Optional REST endpoints

Base URL is `WORDPRESS_URL` (e.g. `https://opolis.co`). The app fetches:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/wp-json/opolis/v1/guides` | GET | Guides tab: categories and items (type, label, url). |
| `/wp-json/opolis/v1/faq`    | GET | FAQ tab: sections and Q&A pairs. |

If `WORDPRESS_URL` is not set, or the request fails or returns invalid data, the app uses the static data from `resourcesData.ts`.

---

## Expected JSON shape

### Guides

**Response:** JSON with a `guides` array (or the response body can be the array directly).

Each element:

```ts
{
  "cat": string,   // Category name, e.g. "Entity Creation", "Payroll"
  "cc": string,   // Hex color for the category, e.g. "#a78bfa"
  "items": [
    {
      "type": string,  // e.g. "Guide", "Article", "Video", "Whitepaper"
      "label": string,  // Display title
      "url": string    // Full URL: external (https://...) or internal (/blog/slug, /resources/...)
    }
  ]
}
```

Example:

```json
{
  "guides": [
    {
      "cat": "Entity Creation",
      "cc": "#a78bfa",
      "items": [
        { "type": "Guide", "label": "How to create your S-Corp", "url": "https://opolis.co/..." },
        { "type": "Article", "label": "Sole Proprietor vs. LLC", "url": "/blog/sole-prop-vs-llc" }
      ]
    }
  ]
}
```

- **Internal URLs** (path starting with `/`, not `//`) are rendered with Next.js `Link` (in-app navigation).
- **External URLs** are rendered as `<a target="_blank" rel="noreferrer">`.

### FAQ

**Response:** JSON with a `faq` array (or the response body can be the array directly).

Each element:

```ts
{
  "id": string,    // Unique id for the section, e.g. "overview", "membership"
  "label": string, // Sidebar label, e.g. "Overview", "Membership & Pricing"
  "items": [
    { "q": string, "a": string }  // Question and answer
  ]
}
```

Example:

```json
{
  "faq": [
    {
      "id": "overview",
      "label": "Overview",
      "items": [
        { "q": "What is Opolis?", "a": "Opolis is a member-owned employment cooperative..." }
      ]
    }
  ]
}
```

---

## Implementing the endpoints in WordPress

You can register the routes in a small plugin or in your theme.

1. **Register the namespace** and two routes: `opolis/v1/guides` and `opolis/v1/faq`.
2. **Return JSON** in the shapes above. Data can come from:
   - Options (e.g. `get_option('opolis_guides')`),
   - Custom post types (e.g. “Guide” and “FAQ” with meta),
   - Or any other source in WordPress.

Example (PHP) for registering and returning static JSON:

```php
add_action('rest_api_init', function () {
  register_rest_route('opolis/v1', '/guides', [
    'methods' => 'GET',
    'permission_callback' => '__return_true',
    'callback' => function () {
      $data = get_option('opolis_guides', []); // or build from CPT
      return new WP_REST_Response(['guides' => $data], 200);
    },
  ]);
  register_rest_route('opolis/v1', '/faq', [
    'methods' => 'GET',
    'permission_callback' => '__return_true',
    'callback' => function () {
      $data = get_option('opolis_faq', []); // or build from CPT
      return new WP_REST_Response(['faq' => $data], 200);
    },
  ]);
});
```

After the endpoints return valid JSON, the Resources page will use them automatically (with ISR revalidation, same as the blog). No front-end deploy is required to switch from static to WordPress-driven Guides or FAQ.

---

## Caching

Guides and FAQ responses are cached with the same revalidate window as the blog (e.g. 60 seconds). So updates in WordPress appear within about a minute unless you change the revalidate value in `src/lib/wordpressResources.ts`.

---

## Summary

| Resource | Source when WP endpoints exist | Fallback |
|----------|-------------------------------|----------|
| Blog     | WordPress `wp/v2/posts` (existing) | `ALL_POSTS` (empty) |
| Guides   | `GET /wp-json/opolis/v1/guides`   | `GUIDES_DATA` (static) |
| FAQ      | `GET /wp-json/opolis/v1/faq`      | `FAQ_SECTIONS` (static) |

Links in Guides can be external (redirect) or internal (e.g. `/blog/slug`); the app uses the same pattern as the blog list and redirect links.
