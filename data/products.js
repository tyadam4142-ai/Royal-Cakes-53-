(function () {
    "use strict";

    /*
     * ROYAL CAKES 53
     * Offline local database
     *
     * IMPORTANT:
     * The Admin Panel exports this entire file.
     * Replace data/products.js with the exported file.
     */

    const RC53_CONFIG = {
        bakeryName: "Royal Cakes 53",
        tagline: "Baked with love. Made to remember.",
        whatsappNumber: "918149915605",
        currency: "₹",
        logoUrl: "",
        dailyCake: {
            enabled: true,
            title: "Cake of the Day",
            subtitle: "A fresh royal creation, specially selected for today.",
            label: "TODAY'S SPECIAL",
            image: ""
        }
    };

    /*
     * Tiny 1x1 SVG Base64 demo images.
     * They are intentionally generic placeholders.
     * Replace them from the Admin Panel.
     */
    const DEMO_IMAGE_1 =
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iODAwIiB2aWV3Qm94PSIwIDAgNjAwIDgwMCI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI4MDAiIGZpbGw9IiMwYjJhMWUiLz48dGV4dCB4PSIzMDAiIHk9IjM5MCIgZmlsbD0iI2Q0YWYzNyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI0OCI+Um95YWwgQ2FrZXMgNTM8L3RleHQ+PC9zdmc+";

    const DEMO_IMAGE_2 =
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iODAwIiB2aWV3Qm94PSIwIDAgNjAwIDgwMCI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI4MDAiIGZpbGw9IiNmZGY0ZTkiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSIzNjAiIHI9IjE1MCIgZmlsbD0iI2Q0YWYzNyIvPjx0ZXh0IHg9IjMwMCIgeT0iNjIwIiBmaWxsPSIjMGIyYTFlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjQ4Ij5OZXcgQ2FrZTwvdGV4dD48L3N2Zz4=";

    const DEMO_IMAGE_3 =
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iODAwIiB2aWV3Qm94PSIwIDAgNjAwIDgwMCI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI4MDAiIGZpbGw9IiMxMzQyMzIiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSIzNTAiIHI9IjE2MCIgZmlsbD0iI2Q0YWYzNyIvPjx0ZXh0IHg9IjMwMCIgeT0iNjEwIiBmaWxsPSIjZmRmYmY3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjQ4Ij5GcmVzaCBUb2RheTwvdGV4dD48L3N2Zz4=";

    const PRODUCTS_DATA = [
        /*
         * No bakery products are included initially.
         *
         * Product structure:
         *
         * {
         *   id: "unique-id",
         *   name: "Chocolate Truffle",
         *   category: "Cakes",
         *   price: 850,
         *   description: "...",
         *   image: "data:image/...",
         *   featured: true,
         *   available: true
         * }
         */

        {
            type: "story",
            id: "demo-story",
            title: "New Arrivals",
            cover: DEMO_IMAGE_1,
            slides: [
                {
                    image: DEMO_IMAGE_1,
                    caption: "Welcome to Royal Cakes 53"
                },
                {
                    image: DEMO_IMAGE_2,
                    caption: "Fresh creations are coming soon"
                },
                {
                    image: DEMO_IMAGE_3,
                    caption: "Your baker can update this story"
                }
            ],
            enabled: true
        }

        /*
         * Add products here through Admin Panel.
         */
    ];

    window.PRODUCTS_DATA = PRODUCTS_DATA;
    window.RC53_CONFIG = RC53_CONFIG;
})();