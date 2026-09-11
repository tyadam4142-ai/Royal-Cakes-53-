(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        /* =====================================================
           LOCAL WORKING DATABASE
        ====================================================== */

        let config =
            JSON.parse(
                JSON.stringify(
                    window.RC53_CONFIG || {}
                )
            );

        let database =
            Array.isArray(window.PRODUCTS_DATA)
                ? JSON.parse(
                    JSON.stringify(window.PRODUCTS_DATA)
                )
                : [];


        /*
         * Temporary local persistence makes the admin page
         * forgiving if the browser refreshes before export.
         */
        const TEMP_KEY =
            "rc53_admin_working_data";


        function loadTemporaryData() {

            try {

                const saved =
                    localStorage.getItem(TEMP_KEY);

                if (!saved) {
                    return;
                }

                const parsed =
                    JSON.parse(saved);

                if (parsed.config) {
                    config = parsed.config;
                }

                if (
                    Array.isArray(parsed.database)
                ) {
                    database = parsed.database;
                }

            } catch (error) {

                console.warn(
                    "Temporary bakery data could not be loaded."
                );

            }

        }


        function saveTemporaryData() {

            try {

                localStorage.setItem(
                    TEMP_KEY,
                    JSON.stringify({
                        config,
                        database
                    })
                );

            } catch (error) {

                /*
                 * Base64 images can be large.
                 * If localStorage becomes full, the actual
                 * export still works.
                 */

                console.warn(
                    "Temporary storage is full. Export still available."
                );

            }

        }


        loadTemporaryData();


        /* =====================================================
           ELEMENTS
        ====================================================== */

        const sections =
            document.querySelectorAll(
                ".admin-section"
            );

        const sideLinks =
            document.querySelectorAll(
                ".side-link"
            );

        const toast =
            document.getElementById("adminToast");


        /* =====================================================
           NAVIGATION
        ====================================================== */

        function showSection(name) {

            sections.forEach(section => {

                section.classList.remove("active");

            });

            const target =
                document.getElementById(
                    `section-${name}`
                );

            if (target) {
                target.classList.add("active");
            }


            sideLinks.forEach(link => {

                link.classList.toggle(
                    "active",
                    link.dataset.section === name
                );

            });


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }


        sideLinks.forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    showSection(
                        link.dataset.section
                    );

                }
            );

        });


        document
            .querySelectorAll("[data-go]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        showSection(
                            button.dataset.go
                        );

                    }
                );

            });


        /* =====================================================
           TOAST
        ====================================================== */

        let toastTimer = null;

        function showToast(message) {

            const messageElement =
                toast.querySelector("p");

            messageElement.textContent =
                message;

            toast.classList.add("show");

            clearTimeout(toastTimer);

            toastTimer =
                setTimeout(
                    () => {
                        toast.classList.remove("show");
                    },
                    2800
                );

        }


        /* =====================================================
           IMAGE FILE → BASE64
        ====================================================== */

        function fileToBase64(file) {

            return new Promise(
                (resolve, reject) => {

                    if (!file) {
                        resolve("");
                        return;
                    }

                    if (!file.type.startsWith("image/")) {

                        reject(
                            new Error(
                                "Please choose an image file."
                            )
                        );

                        return;
                    }

                    const reader =
                        new FileReader();

                    reader.onload = () => {
                        resolve(
                            reader.result
                        );
                    };

                    reader.onerror = () => {

                        reject(
                            new Error(
                                "The image could not be read."
                            )
                        );

                    };

                    reader.readAsDataURL(file);

                }
            );

        }


        /* =====================================================
           PREVIEW HELPER
        ====================================================== */

        function setPreview(
            element,
            image,
            title = "Photo selected"
        ) {

            if (!element) {
                return;
            }

            if (!image) {

                element.innerHTML = `
                    <div>
                        <span>PHOTO PREVIEW</span>
                        <strong>No photo selected</strong>
                    </div>
                `;

                return;
            }

            element.innerHTML = `
                <img src="${escapeAttribute(image)}" alt="Preview">
            `;

        }


        function escapeHTML(value) {

            return String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        }


        function escapeAttribute(value) {
            return escapeHTML(value);
        }


        /* =====================================================
           DAILY CAKE
        ====================================================== */

        const dailyEnabled =
            document.getElementById(
                "dailyEnabled"
            );

        const dailyTitle =
            document.getElementById(
                "dailyTitle"
            );

        const dailySubtitle =
            document.getElementById(
                "dailySubtitle"
            );

        const dailyLabel =
            document.getElementById(
                "dailyLabel"
            );

        const dailyImage =
            document.getElementById(
                "dailyImage"
            );

        const dailyPreview =
            document.getElementById(
                "dailyPreview"
            );


        function loadDailyForm() {

            const daily =
                config.dailyCake || {};

            dailyEnabled.checked =
                daily.enabled !== false;

            dailyTitle.value =
                daily.title ||
                "Cake of the Day";

            dailySubtitle.value =
                daily.subtitle ||
                "A fresh royal creation, specially selected for today.";

            dailyLabel.value =
                daily.label ||
                "TODAY'S SPECIAL";

            setPreview(
                dailyPreview,
                daily.image || ""
            );

        }


        loadDailyForm();


        dailyEnabled.addEventListener(
            "change",
            () => {

                config.dailyCake.enabled =
                    dailyEnabled.checked;

                saveTemporaryData();

                showToast(
                    dailyEnabled.checked
                        ? "Cake of the Day is on"
                        : "Cake of the Day is hidden"
                );

            }
        );


        dailyTitle.addEventListener(
            "input",
            () => {

                ensureDaily();

                config.dailyCake.title =
                    dailyTitle.value;

                saveTemporaryData();

            }
        );


        dailySubtitle.addEventListener(
            "input",
            () => {

                ensureDaily();

                config.dailyCake.subtitle =
                    dailySubtitle.value;

                saveTemporaryData();

            }
        );


        dailyLabel.addEventListener(
            "input",
            () => {

                ensureDaily();

                config.dailyCake.label =
                    dailyLabel.value;

                saveTemporaryData();

            }
        );


        dailyImage.addEventListener(
            "change",
            async () => {

                const file =
                    dailyImage.files[0];

                if (!file) {
                    return;
                }

                try {

                    const base64 =
                        await fileToBase64(file);

                    ensureDaily();

                    config.dailyCake.image =
                        base64;

                    setPreview(
                        dailyPreview,
                        base64
                    );

                    saveTemporaryData();

                    showToast(
                        "Today's cake photo added"
                    );

                } catch (error) {

                    showToast(
                        error.message
                    );

                }

            }
        );


        function ensureDaily() {

            if (!config.dailyCake) {

                config.dailyCake = {
                    enabled: true,
                    title: "Cake of the Day",
                    subtitle:
                        "A fresh royal creation, specially selected for today.",
                    label: "TODAY'S SPECIAL",
                    image: ""
                };

            }

        }


        /* =====================================================
           STORIES
        ====================================================== */

        const storyName =
            document.getElementById(
                "storyName"
            );

        const storyImages =
            document.getElementById(
                "storyImages"
            );

        const selectedStoryImages =
            document.getElementById(
                "selectedStoryImages"
            );

        const createStoryButton =
            document.getElementById(
                "createStoryButton"
            );

        let pendingStoryImages = [];


        storyImages.addEventListener(
            "change",
            async () => {

                const files =
                    Array.from(
                        storyImages.files || []
                    );

                if (!files.length) {
                    return;
                }

                selectedStoryImages.innerHTML = "";

                pendingStoryImages = [];

                for (
                    let index = 0;
                    index < files.length;
                    index++
                ) {

                    const file =
                        files[index];

                    try {

                        const base64 =
                            await fileToBase64(file);

                        pendingStoryImages.push({
                            image: base64,
                            caption: ""
                        });

                        addPendingStoryPreview(
                            base64,
                            index
                        );

                    } catch (error) {

                        showToast(
                            error.message
                        );

                    }

                }

                showToast(
                    `${pendingStoryImages.length} photo(s) ready`
                );

            }
        );


        function addPendingStoryPreview(
            image,
            index
        ) {

            const item =
                document.createElement("div");

            item.className =
                "selected-image";

            item.dataset.index =
                index;

            item.innerHTML = `
                <img
                    src="${escapeAttribute(image)}"
                    alt="Story photo"
                >

                <button
                    type="button"
                    aria-label="Remove photo"
                >
                    ×
                </button>
            `;

            item
                .querySelector("button")
                .addEventListener(
                    "click",
                    () => {

                        pendingStoryImages.splice(
                            index,
                            1
                        );

                        renderPendingStoryImages();

                    }
                );

            selectedStoryImages.appendChild(
                item
            );

        }


        function renderPendingStoryImages() {

            selectedStoryImages.innerHTML = "";

            pendingStoryImages.forEach(
                (item, index) => {

                    addPendingStoryPreview(
                        item.image,
                        index
                    );

                }
            );

        }


        createStoryButton.addEventListener(
            "click",
            () => {

                const name =
                    storyName.value.trim();

                if (!name) {

                    showToast(
                        "Please give your story a name"
                    );

                    storyName.focus();

                    return;
                }

                if (!pendingStoryImages.length) {

                    showToast(
                        "Please choose at least one photo"
                    );

                    return;
                }


                const story = {

                    type: "story",

                    id:
                        createUniqueId(
                            "story"
                        ),

                    title: name,

                    cover:
                        pendingStoryImages[0].image,

                    slides:
                        pendingStoryImages.map(
                            item => ({
                                image: item.image,
                                caption:
                                    item.caption || ""
                            })
                        ),

                    enabled: true

                };


                /*
                 * New story goes to the beginning
                 * of the public story reel.
                 */
                database =
                    [
                        story,
                        ...database
                    ];


                storyName.value = "";

                storyImages.value = "";

                pendingStoryImages = [];

                selectedStoryImages.innerHTML = "";

                saveTemporaryData();

                renderAdminStories();

                showToast(
                    "Royal Story added successfully"
                );

            }
        );


        function renderAdminStories() {

            const container =
                document.getElementById(
                    "adminStoryList"
                );

            container.innerHTML = "";

            const stories =
                database.filter(
                    item =>
                        item.type === "story"
                );


            if (!stories.length) {

                container.innerHTML = `
                    <div class="dashboard-tip">
                        <div class="tip-icon">✨</div>
                        <div>
                            <strong>No stories yet</strong>
                            <p>
                                Add your first story above.
                            </p>
                        </div>
                    </div>
                `;

                return;

            }


            stories.forEach(story => {

                const element =
                    document.createElement("div");

                element.className =
                    "admin-story";

                const slideCount =
                    Array.isArray(story.slides)
                        ? story.slides.length
                        : 0;

                element.innerHTML = `
                    <div class="admin-story-cover">

                        ${
                            story.cover
                                ? `<img src="${escapeAttribute(story.cover)}" alt="">`
                                : ""
                        }

                    </div>

                    <div class="admin-story-info">

                        <h3>
                            ${escapeHTML(story.title)}
                        </h3>

                        <p>
                            ${slideCount}
                            photo${slideCount === 1 ? "" : "s"}
                            · Visible on website
                        </p>

                    </div>

                    <button
                        class="danger-button"
                        type="button"
                        data-delete-story="${escapeAttribute(story.id)}"
                    >
                        Delete Story
                    </button>
                `;

                container.appendChild(
                    element
                );

            });


            container
                .querySelectorAll(
                    "[data-delete-story]"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const id =
                                button.dataset.deleteStory;

                            deleteStory(id);

                        }
                    );

                });

        }


        function deleteStory(id) {

            const confirmed =
                window.confirm(
                    "Delete this story from your bakery website?"
                );

            if (!confirmed) {
                return;
            }

            database =
                database.filter(
                    item =>
                        String(item.id) !==
                        String(id)
                );

            saveTemporaryData();

            renderAdminStories();

            showToast(
                "Story deleted"
            );

        }


        renderAdminStories();


        /* =====================================================
           PRODUCTS
        ====================================================== */

        const editingProductId =
            document.getElementById(
                "editingProductId"
            );

        const productName =
            document.getElementById(
                "productName"
            );

        const productCategory =
            document.getElementById(
                "productCategory"
            );

        const productPrice =
            document.getElementById(
                "productPrice"
            );

        const productImage =
            document.getElementById(
                "productImage"
            );

        const productDescription =
            document.getElementById(
                "productDescription"
            );

        const productFeatured =
            document.getElementById(
                "productFeatured"
            );

        const productAvailable =
            document.getElementById(
                "productAvailable"
            );

        const productPreview =
            document.getElementById(
                "productPreview"
            );

        const saveProductButton =
            document.getElementById(
                "saveProductButton"
            );

        const cancelProductButton =
            document.getElementById(
                "cancelProductButton"
            );

        const productFormTitle =
            document.getElementById(
                "productFormTitle"
            );


        let pendingProductImage = "";


        productImage.addEventListener(
            "change",
            async () => {

                const file =
                    productImage.files[0];

                if (!file) {
                    return;
                }

                try {

                    pendingProductImage =
                        await fileToBase64(file);

                    setPreview(
                        productPreview,
                        pendingProductImage
                    );

                    showToast(
                        "Product photo added"
                    );

                } catch (error) {

                    showToast(
                        error.message
                    );

                }

            }
        );


        saveProductButton.addEventListener(
            "click",
            saveProduct
        );


        function saveProduct() {

            const name =
                productName.value.trim();

            const category =
                productCategory.value.trim();

            const price =
                Number(
                    productPrice.value
                );

            const description =
                productDescription.value.trim();

            const featured =
                productFeatured.checked;

            const available =
                productAvailable.checked;


            if (!name) {

                showToast(
                    "Please enter the product name"
                );

                productName.focus();

                return;
            }


            if (!category) {

                showToast(
                    "Please enter a category"
                );

                productCategory.focus();

                return;
            }


            if (
                !Number.isFinite(price) ||
                price < 0
            ) {

                showToast(
                    "Please enter a valid price"
                );

                productPrice.focus();

                return;
            }


            const editingId =
                editingProductId.value;


            if (editingId) {

                const product =
                    database.find(
                        item =>
                            item.type !== "story" &&
                            String(item.id) ===
                            String(editingId)
                    );

                if (!product) {

                    showToast(
                        "Product could not be found"
                    );

                    return;
                }


                product.name =
                    name;

                product.category =
                    category;

                product.price =
                    price;

                product.description =
                    description;

                product.featured =
                    featured;

                product.available =
                    available;


                if (pendingProductImage) {

                    product.image =
                        pendingProductImage;

                }


                showToast(
                    "Product updated"
                );

            } else {

                const newProduct = {

                    type: "product",

                    id:
                        createUniqueId(
                            "product"
                        ),

                    name,

                    category,

                    price,

                    description,

                    image:
                        pendingProductImage || "",

                    featured,

                    available

                };


                database.push(
                    newProduct
                );


                showToast(
                    "Product added"
                );

            }


            saveTemporaryData();

            renderAdminProducts();

            resetProductForm();

        }


        function renderAdminProducts() {

            const container =
                document.getElementById(
                    "adminProductList"
                );

            container.innerHTML = "";


            const productList =
                database.filter(
                    item =>
                        item.type !== "story"
                );


            if (!productList.length) {

                container.innerHTML = `
                    <div class="dashboard-tip">
                        <div class="tip-icon">🎂</div>
                        <div>
                            <strong>No products yet</strong>
                            <p>
                                Add your first cake above.
                            </p>
                        </div>
                    </div>
                `;

                return;

            }


            productList.forEach(product => {

                const element =
                    document.createElement("article");

                element.className =
                    "admin-product";


                const imageHTML =
                    product.image
                        ? `
                            <img
                                src="${escapeAttribute(product.image)}"
                                alt="${escapeAttribute(product.name)}"
                            >
                        `
                        : `
                            <div class="admin-product-placeholder">
                                RC53
                            </div>
                        `;


                element.innerHTML = `

                    <div class="admin-product-image">
                        ${imageHTML}
                    </div>

                    <div class="admin-product-body">

                        <h3>
                            ${escapeHTML(product.name)}
                        </h3>

                        <p>
                            ${escapeHTML(product.category)}
                            ·
                            ${
                                product.available
                                    ? "Available"
                                    : "Hidden"
                            }
                        </p>

                        <div class="admin-product-meta">

                            <span class="admin-product-price">
                                ₹${Number(product.price || 0).toLocaleString("en-IN")}
                            </span>

                            <div class="admin-product-actions">

                                <button
                                    class="small-action"
                                    type="button"
                                    data-edit-product="${escapeAttribute(product.id)}"
                                >
                                    Edit
                                </button>

                                <button
                                    class="small-action"
                                    type="button"
                                    data-delete-product="${escapeAttribute(product.id)}"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>

                `;

                container.appendChild(
                    element
                );

            });


            container
                .querySelectorAll(
                    "[data-edit-product]"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            editProduct(
                                button.dataset.editProduct
                            );

                        }
                    );

                });


            container
                .querySelectorAll(
                    "[data-delete-product]"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            deleteProduct(
                                button.dataset.deleteProduct
                            );

                        }
                    );

                });

        }


        function editProduct(id) {

            const product =
                database.find(
                    item =>
                        item.type !== "story" &&
                        String(item.id) ===
                        String(id)
                );

            if (!product) {
                return;
            }


            editingProductId.value =
                product.id;

            productName.value =
                product.name || "";

            productCategory.value =
                product.category || "";

            productPrice.value =
                product.price ?? "";

            productDescription.value =
                product.description || "";

            productFeatured.checked =
                Boolean(product.featured);

            productAvailable.checked =
                product.available !== false;


            pendingProductImage =
                product.image || "";


            setPreview(
                productPreview,
                product.image || ""
            );


            productFormTitle.textContent =
                "Edit Product";

            saveProductButton.textContent =
                "✓ Update Product";

            cancelProductButton.hidden =
                false;


            showSection("products");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


            showToast(
                "Editing " + product.name
            );

        }


        function deleteProduct(id) {

            const product =
                database.find(
                    item =>
                        item.type !== "story" &&
                        String(item.id) ===
                        String(id)
                );

            if (!product) {
                return;
            }


            const confirmed =
                window.confirm(
                    `Remove "${product.name}" from your website?`
                );

            if (!confirmed) {
                return;
            }


            database =
                database.filter(
                    item =>
                        String(item.id) !==
                        String(id)
                );


            saveTemporaryData();

            renderAdminProducts();

            showToast(
                "Product removed"
            );

        }


        cancelProductButton.addEventListener(
            "click",
            resetProductForm
        );


        function resetProductForm() {

            editingProductId.value =
                "";

            productName.value =
                "";

            productCategory.value =
                "";

            productPrice.value =
                "";

            productDescription.value =
                "";

            productFeatured.checked =
                false;

            productAvailable.checked =
                true;

            productImage.value =
                "";

            pendingProductImage =
                "";

            setPreview(
                productPreview,
                ""
            );

            productFormTitle.textContent =
                "Add a Product";

            saveProductButton.textContent =
                "＋ Add Product";

            cancelProductButton.hidden =
                true;

        }


        renderAdminProducts();


        /* =====================================================
           BRAND SETTINGS
        ====================================================== */

        const bakeryName =
            document.getElementById(
                "bakeryName"
            );

        const bakeryTagline =
            document.getElementById(
                "bakeryTagline"
            );

        const bakeryWhatsApp =
            document.getElementById(
                "bakeryWhatsApp"
            );

        const bakeryCurrency =
            document.getElementById(
                "bakeryCurrency"
            );

        const bakeryLogo =
            document.getElementById(
                "bakeryLogo"
            );

        const logoPreview =
            document.getElementById(
                "logoPreview"
            );


        function loadBrandForm() {

            bakeryName.value =
                config.bakeryName ||
                "Royal Cakes 53";

            bakeryTagline.value =
                config.tagline ||
                "Baked with love. Made to remember.";

            bakeryWhatsApp.value =
                config.whatsappNumber ||
                "";

            bakeryCurrency.value =
                config.currency ||
                "₹";


            setLogoPreview();

        }


        function setLogoPreview() {

            if (
                config.logoUrl &&
                config.logoUrl.trim()
            ) {

                logoPreview.innerHTML = `
                    <img
                        src="${escapeAttribute(config.logoUrl)}"
                        alt="Bakery logo"
                        style="object-fit:contain;background:#0B2A1E;padding:30px;"
                    >
                `;

            } else {

                logoPreview.innerHTML = `
                    <div>
                        <span>LOGO PREVIEW</span>
                        <strong>No logo selected</strong>
                    </div>
                `;

            }

        }


        loadBrandForm();


        bakeryName.addEventListener(
            "input",
            () => {

                config.bakeryName =
                    bakeryName.value;

                saveTemporaryData();

            }
        );


        bakeryTagline.addEventListener(
            "input",
            () => {

                config.tagline =
                    bakeryTagline.value;

                saveTemporaryData();

            }
        );


        bakeryWhatsApp.addEventListener(
            "input",
            () => {

                config.whatsappNumber =
                    bakeryWhatsApp.value
                        .replace(/\D/g, "");

                saveTemporaryData();

            }
        );


        bakeryCurrency.addEventListener(
            "input",
            () => {

                config.currency =
                    bakeryCurrency.value || "₹";

                saveTemporaryData();

            }
        );


        bakeryLogo.addEventListener(
            "change",
            async () => {

                const file =
                    bakeryLogo.files[0];

                if (!file) {
                    return;
                }

                try {

                    const base64 =
                        await fileToBase64(file);

                    config.logoUrl =
                        base64;

                    setLogoPreview();

                    saveTemporaryData();

                    showToast(
                        "Bakery logo updated"
                    );

                } catch (error) {

                    showToast(
                        error.message
                    );

                }

            }
        );


        /* =====================================================
           PREVIEW WEBSITE
        ====================================================== */

        document
            .getElementById("previewButton")
            .addEventListener(
                "click",
                () => {

                    window.open(
                        "index.html",
                        "_blank"
                    );

                }
            );


        /* =====================================================
           EXPORT ENGINE
        ====================================================== */

        const exportButton =
            document.getElementById(
                "exportButton"
            );

        const topExportButton =
            document.getElementById(
                "topExportButton"
            );


        exportButton.addEventListener(
            "click",
            exportWebsiteData
        );

        topExportButton.addEventListener(
            "click",
            exportWebsiteData
        );


        function exportWebsiteData() {

            /*
             * Make sure latest form values are captured.
             */
            ensureDaily();

            config.bakeryName =
                bakeryName.value.trim() ||
                "Royal Cakes 53";

            config.tagline =
                bakeryTagline.value.trim() ||
                "Baked with love. Made to remember.";

            config.whatsappNumber =
                bakeryWhatsApp.value
                    .replace(/\D/g, "");

            config.currency =
                bakeryCurrency.value ||
                "₹";

            config.dailyCake.enabled =
                dailyEnabled.checked;

            config.dailyCake.title =
                dailyTitle.value.trim() ||
                "Cake of the Day";

            config.dailyCake.subtitle =
                dailySubtitle.value.trim() ||
                "A fresh royal creation, specially selected for today.";

            config.dailyCake.label =
                dailyLabel.value.trim() ||
                "TODAY'S SPECIAL";


            saveTemporaryData();


            /*
             * The actual offline database file.
             */
            const fileContents =
`(function () {
    "use strict";

    /*
     * ROYAL CAKES 53
     * Generated by the Royal Cakes 53 Bakery Manager.
     * This file is designed to work offline.
     */

    const RC53_CONFIG = ${JSON.stringify(
        config,
        null,
        4
    )};

    const PRODUCTS_DATA = ${JSON.stringify(
        database,
        null,
        4
    )};

    window.PRODUCTS_DATA = PRODUCTS_DATA;
    window.RC53_CONFIG = RC53_CONFIG;
})();
`;


            const blob =
                new Blob(
                    [fileContents],
                    {
                        type:
                            "application/javascript;charset=utf-8"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");

            link.href =
                url;

            link.download =
                "products.js";


            document.body.appendChild(
                link
            );

            link.click();

            link.remove();


            setTimeout(
                () => {
                    URL.revokeObjectURL(url);
                },
                1000
            );


            showToast(
                "products.js downloaded successfully"
            );


            /*
             * Give the user a clear reminder.
             */
            setTimeout(
                () => {

                    window.alert(
                        "Your products.js file has been downloaded.\n\n" +
                        "IMPORTANT:\n" +
                        "Replace the old products.js inside your website's data folder with this new file.\n\n" +
                        "Then double-click index.html to see your updated website."
                    );

                },
                400
            );

        }


        /* =====================================================
           UNIQUE ID
        ====================================================== */

        function createUniqueId(prefix) {

            return (
                prefix +
                "-" +
                Date.now().toString(36) +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 8)
            );

        }


        /* =====================================================
           KEYBOARD SHORTCUT
        ====================================================== */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    (event.metaKey ||
                        event.ctrlKey) &&
                    event.key.toLowerCase() === "s"
                ) {

                    event.preventDefault();

                    exportWebsiteData();

                }

            }
        );


        /* =====================================================
           INITIAL SAVE
        ====================================================== */

        saveTemporaryData();


        /*
         * Tiny entrance effect for cards.
         */
        document
            .querySelectorAll(
                ".quick-card, .editor-card, .story-create-card"
            )
            .forEach(
                (element, index) => {

                    element.style.animation =
                        `adminCardIn 0.65s ${
                            index * 0.08
                        }s both`;

                }
            );


        const animationStyle =
            document.createElement("style");

        animationStyle.textContent = `
            @keyframes adminCardIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }

                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;

        document.head.appendChild(
            animationStyle
        );

    });

})();