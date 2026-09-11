(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        const config = window.RC53_CONFIG || {};
        const database = Array.isArray(window.PRODUCTS_DATA)
            ? window.PRODUCTS_DATA
            : [];

        const products = database.filter(
            item => item && item.type !== "story"
        );

        const stories = database.filter(
            item => item && item.type === "story" && item.enabled !== false
        );


        /* =====================================================
           ELEMENTS
        ====================================================== */

        const preloader =
            document.getElementById("preloader");

        const header =
            document.getElementById("siteHeader");

        const brandLogo =
            document.getElementById("brandLogo");

        const textLogo =
            document.getElementById("textLogo");

        const cursorGlow =
            document.getElementById("cursorGlow");

        const productGrid =
            document.getElementById("productGrid");

        const categoryFilter =
            document.getElementById("categoryFilter");

        const emptyMenu =
            document.getElementById("emptyMenu");

        const storyReel =
            document.getElementById("storyReel");

        const cartDrawer =
            document.getElementById("cartDrawer");

        const cartOverlay =
            document.getElementById("cartOverlay");

        const cartItems =
            document.getElementById("cartItems");

        const cartEmpty =
            document.getElementById("cartEmpty");

        const cartTotal =
            document.getElementById("cartTotal");

        const navCartCount =
            document.getElementById("navCartCount");

        const toast =
            document.getElementById("toast");

        const toastMessage =
            document.getElementById("toastMessage");

        const storyViewer =
            document.getElementById("storyViewer");

        const storyProgress =
            document.getElementById("storyProgress");

        const storyMedia =
            document.getElementById("storyMedia");

        const storyCaption =
            document.getElementById("storyCaption");

        const storyAccountImage =
            document.getElementById("storyAccountImage");

        const dailySection =
            document.getElementById("dailySpecialSection");

        const dailyCakeTitle =
            document.getElementById("dailyCakeTitle");

        const dailyCakeSubtitle =
            document.getElementById("dailyCakeSubtitle");

        const dailyCakeImage =
            document.getElementById("dailyCakeImage");

        const dailyLabel =
            document.getElementById("dailyLabel");

        const dailyDay =
            document.getElementById("dailyDay");

        const dailyDate =
            document.getElementById("dailyDate");


        /* =====================================================
           PRELOADER
        ====================================================== */

        window.addEventListener("load", () => {

            setTimeout(() => {
                preloader.classList.add("loaded");
            }, 700);

        });


        /* =====================================================
           BRANDING
        ====================================================== */

        function applyBranding() {

            document.title =
                config.bakeryName || "Royal Cakes 53";

            if (config.logoUrl && config.logoUrl.trim()) {

                brandLogo.src = config.logoUrl;
                brandLogo.style.display = "block";
                textLogo.style.display = "none";

            } else {

                brandLogo.style.display = "none";
                textLogo.style.display = "flex";

            }
        }

        applyBranding();


        /* =====================================================
           DAILY CAKE
        ====================================================== */

        function applyDailyCake() {

            const daily =
                config.dailyCake || {};

            if (daily.enabled === false) {
                dailySection.style.display = "none";
                return;
            }

            dailySection.style.display = "block";

            dailyCakeTitle.textContent =
                daily.title || "Cake of the Day";

            dailyCakeSubtitle.textContent =
                daily.subtitle ||
                "A fresh royal creation, specially selected for today.";

            dailyLabel.textContent =
                daily.label || "TODAY'S SPECIAL";

            const now = new Date();

            dailyDay.textContent =
                now.toLocaleDateString("en-IN", {
                    weekday: "long"
                }).toUpperCase();

            dailyDate.textContent =
                now.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                });

            if (daily.image) {

                dailyCakeImage.style.backgroundImage =
                    `url("${daily.image}")`;

                dailyCakeImage.classList.add("has-image");

                dailyCakeImage.innerHTML = "";

            } else {

                dailyCakeImage.style.backgroundImage = "";

                dailyCakeImage.classList.remove("has-image");

                dailyCakeImage.innerHTML = `
                    <div class="daily-placeholder">
                        <span>ROYAL</span>
                        <strong>CAKES 53</strong>
                        <small>Today's Creation</small>
                    </div>
                `;
            }
        }

        applyDailyCake();


        /* =====================================================
           HEADER SCROLL
        ====================================================== */

        function updateHeader() {

            if (window.scrollY > 40) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }

        window.addEventListener(
            "scroll",
            updateHeader,
            { passive: true }
        );

        updateHeader();


        /* =====================================================
           MOBILE MENU
        ====================================================== */

        const mobileMenuButton =
            document.getElementById("mobileMenuButton");

        const mobileNav =
            document.getElementById("mobileNav");

        function toggleMobileMenu() {
            mobileNav.classList.toggle("open");
        }

        mobileMenuButton.addEventListener(
            "click",
            toggleMobileMenu
        );

        mobileNav.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {
                mobileNav.classList.remove("open");
            });

        });


        /* =====================================================
           CATEGORIES
        ====================================================== */

        let activeCategory = "All";

        function getCategories() {

            const categorySet =
                new Set(
                    products
                        .map(product => product.category)
                        .filter(Boolean)
                );

            return [
                "All",
                ...Array.from(categorySet)
            ];
        }

        function renderCategories() {

            categoryFilter.innerHTML = "";

            getCategories().forEach(category => {

                const button =
                    document.createElement("button");

                button.type = "button";
                button.className =
                    "category-button magnetic-btn ripple-button";

                if (category === activeCategory) {
                    button.classList.add("active");
                }

                button.textContent = category;

                button.addEventListener(
                    "click",
                    () => {

                        activeCategory = category;

                        document
                            .querySelectorAll(".category-button")
                            .forEach(btn =>
                                btn.classList.remove("active")
                            );

                        button.classList.add("active");

                        renderProducts();

                    }
                );

                categoryFilter.appendChild(button);
            });

        }


        /* =====================================================
           PRODUCT RENDERING
        ====================================================== */

        function renderProducts() {

            productGrid.innerHTML = "";

            let filtered =
                products.filter(product => {

                    if (activeCategory === "All") {
                        return true;
                    }

                    return product.category === activeCategory;
                });

            if (!filtered.length) {

                productGrid.style.display = "none";
                emptyMenu.hidden = false;

                return;

            }

            productGrid.style.display = "grid";
            emptyMenu.hidden = true;

            filtered.forEach((product, index) => {

                const card =
                    document.createElement("article");

                card.className = "product-card";

                card.style.animation =
                    `revealProduct 0.6s ${index * 0.06}s both`;

                const imageHTML =
                    product.image
                        ? `<img src="${escapeAttribute(product.image)}" alt="${escapeAttribute(product.name)}">`
                        : `
                            <div class="product-placeholder">
                                <div>
                                    <span>ROYAL CAKES 53</span>
                                    <strong>${escapeHTML(product.name || "Royal Creation")}</strong>
                                </div>
                            </div>
                        `;

                card.innerHTML = `
                    <div class="product-image">
                        ${imageHTML}
                    </div>

                    <div class="product-body">

                        <span class="product-category">
                            ${escapeHTML(product.category || "Bakery")}
                        </span>

                        <h3 class="product-name">
                            ${escapeHTML(product.name || "Royal Creation")}
                        </h3>

                        <p class="product-description">
                            ${escapeHTML(
                                product.description ||
                                "A handcrafted creation from Royal Cakes 53."
                            )}
                        </p>

                        <div class="product-bottom">

                            <strong class="product-price">
                                ${formatCurrency(product.price)}
                            </strong>

                            <button
                                class="add-product magnetic-btn ripple-button"
                                type="button"
                                aria-label="Add ${escapeAttribute(product.name)} to cart"
                                data-product-id="${escapeAttribute(product.id)}"
                            >
                                +
                            </button>

                        </div>

                    </div>
                `;

                productGrid.appendChild(card);

            });

            productGrid
                .querySelectorAll(".add-product")
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const id =
                                button.dataset.productId;

                            addToCart(id);

                        }
                    );

                });

            activateMicroInteractions();

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


        function formatCurrency(value) {

            const number =
                Number(value) || 0;

            return `${config.currency || "₹"}${number.toLocaleString("en-IN")}`;
        }


        const dynamicProductAnimation =
            document.createElement("style");

        dynamicProductAnimation.textContent = `
            @keyframes revealProduct {
                from {
                    opacity: 0;
                    transform: translateY(25px);
                }

                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;

        document.head.appendChild(
            dynamicProductAnimation
        );


        renderCategories();
        renderProducts();


        /* =====================================================
           CART
        ====================================================== */

        let cart =
            loadCart();

        function loadCart() {

            try {

                const saved =
                    localStorage.getItem("rc53_cart");

                return saved
                    ? JSON.parse(saved)
                    : [];

            } catch (error) {

                return [];

            }
        }


        function saveCart() {

            try {
                localStorage.setItem(
                    "rc53_cart",
                    JSON.stringify(cart)
                );
            } catch (error) {
                console.warn("Cart could not be saved.");
            }
        }


        function addToCart(productId) {

            const product =
                products.find(
                    item => String(item.id) === String(productId)
                );

            if (!product) {
                return;
            }

            const existing =
                cart.find(
                    item =>
                        String(item.id) === String(productId)
                );

            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    quantity: 1
                });
            }

            saveCart();
            renderCart();

            showToast(
                `${product.name} added to your cart`
            );

        }


        function changeQuantity(productId, amount) {

            const item =
                cart.find(
                    cartItem =>
                        String(cartItem.id) === String(productId)
                );

            if (!item) {
                return;
            }

            item.quantity += amount;

            if (item.quantity <= 0) {

                cart =
                    cart.filter(
                        cartItem =>
                            String(cartItem.id) !==
                            String(productId)
                    );
            }

            saveCart();
            renderCart();

        }


        function removeFromCart(productId) {

            cart =
                cart.filter(
                    item =>
                        String(item.id) !== String(productId)
                );

            saveCart();
            renderCart();

            showToast("Item removed from cart");

        }


        function renderCart() {

            cartItems.innerHTML = "";

            let total = 0;
            let totalQuantity = 0;

            cart.forEach(cartItem => {

                const product =
                    products.find(
                        item =>
                            String(item.id) ===
                            String(cartItem.id)
                    );

                if (!product) {
                    return;
                }

                const quantity =
                    Number(cartItem.quantity) || 1;

                totalQuantity += quantity;

                total +=
                    (Number(product.price) || 0) *
                    quantity;

                const item =
                    document.createElement("div");

                item.className = "cart-item";

                item.innerHTML = `
                    <div class="cart-item-image">
                        ${
                            product.image
                                ? `<img src="${escapeAttribute(product.image)}" alt="">`
                                : `<span>RC53</span>`
                        }
                    </div>

                    <div>

                        <div class="cart-item-name">
                            ${escapeHTML(product.name)}
                        </div>

                        <div class="cart-item-price">
                            ${formatCurrency(product.price)}
                        </div>

                        <div class="quantity-control">

                            <button
                                type="button"
                                data-action="minus"
                                data-id="${escapeAttribute(product.id)}"
                            >
                                −
                            </button>

                            <span>${quantity}</span>

                            <button
                                type="button"
                                data-action="plus"
                                data-id="${escapeAttribute(product.id)}"
                            >
                                +
                            </button>

                        </div>

                    </div>

                    <button
                        type="button"
                        class="remove-item"
                        data-action="remove"
                        data-id="${escapeAttribute(product.id)}"
                    >
                        Remove
                    </button>
                `;

                cartItems.appendChild(item);

            });


            if (!cart.length) {

                cartEmpty.classList.add("visible");

            } else {

                cartEmpty.classList.remove("visible");

            }

            cartTotal.textContent =
                formatCurrency(total);

            navCartCount.textContent =
                totalQuantity;

            cartItems
                .querySelectorAll("[data-action]")
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const id =
                                button.dataset.id;

                            const action =
                                button.dataset.action;

                            if (action === "plus") {
                                changeQuantity(id, 1);
                            }

                            if (action === "minus") {
                                changeQuantity(id, -1);
                            }

                            if (action === "remove") {
                                removeFromCart(id);
                            }

                        }
                    );

                });

        }


        renderCart();


        function openCart() {

            cartDrawer.classList.add("open");
            cartOverlay.classList.add("open");
            document.body.classList.add("no-scroll");

        }


        function closeCart() {

            cartDrawer.classList.remove("open");
            cartOverlay.classList.remove("open");
            document.body.classList.remove("no-scroll");

        }


        document
            .getElementById("navCartButton")
            .addEventListener("click", openCart);

        document
            .getElementById("mobileCartButton")
            .addEventListener(
                "click",
                () => {

                    mobileNav.classList.remove("open");
                    openCart();

                }
            );

        document
            .getElementById("closeCart")
            .addEventListener("click", closeCart);

        cartOverlay.addEventListener(
            "click",
            closeCart
        );


        /* =====================================================
           WHATSAPP CHECKOUT
        ====================================================== */

        function checkoutWhatsApp() {

            if (!cart.length) {

                showToast(
                    "Add something delicious first"
                );

                return;
            }

            const lines = [
                `Hello ${config.bakeryName || "Royal Cakes 53"}!`,
                "",
                "I would like to place an order:",
                ""
            ];

            let total = 0;

            cart.forEach(cartItem => {

                const product =
                    products.find(
                        item =>
                            String(item.id) ===
                            String(cartItem.id)
                    );

                if (!product) {
                    return;
                }

                const quantity =
                    Number(cartItem.quantity) || 1;

                const subtotal =
                    (Number(product.price) || 0) *
                    quantity;

                total += subtotal;

                lines.push(
                    `• ${product.name} × ${quantity} — ${formatCurrency(subtotal)}`
                );

            });

            lines.push("");
            lines.push(`Total: ${formatCurrency(total)}`);
            lines.push("");
            lines.push("Please let me know the next steps. Thank you!");

            const message =
                encodeURIComponent(
                    lines.join("\n")
                );

            const number =
                String(
                    config.whatsappNumber || ""
                ).replace(/\D/g, "");

            if (!number) {

                showToast(
                    "WhatsApp number has not been configured yet"
                );

                return;
            }

            window.open(
                `https://wa.me/${number}?text=${message}`,
                "_blank",
                "noopener,noreferrer"
            );

        }

        document
            .getElementById("whatsappCheckout")
            .addEventListener(
                "click",
                checkoutWhatsApp
            );


        document
            .getElementById("footerWhatsApp")
            .addEventListener(
                "click",
                () => {

                    const number =
                        String(
                            config.whatsappNumber || ""
                        ).replace(/\D/g, "");

                    if (!number) {
                        showToast(
                            "WhatsApp number is not configured"
                        );
                        return;
                    }

                    window.open(
                        `https://wa.me/${number}`,
                        "_blank",
                        "noopener,noreferrer"
                    );

                }
            );


        /* =====================================================
           STORIES
        ====================================================== */

        let currentStory = 0;
        let currentSlide = 0;
        let storyTimer = null;

        function renderStoryReel() {

            storyReel.innerHTML = "";

            if (!stories.length) {
                return;
            }

            stories.forEach((story, index) => {

                const card =
                    document.createElement("button");

                card.type = "button";
                card.className = "story-card";

                const cover =
                    story.cover ||
                    story.slides?.[0]?.image ||
                    "";

                card.innerHTML = `
                    <div class="story-avatar-ring">

                        <div class="story-avatar">

                            ${
                                cover
                                    ? `<img src="${escapeAttribute(cover)}" alt="${escapeAttribute(story.title)}">`
                                    : `<div></div>`
                            }

                        </div>

                    </div>

                    <span>
                        ${escapeHTML(story.title || "Story")}
                    </span>
                `;

                card.addEventListener(
                    "click",
                    () => openStory(index)
                );

                storyReel.appendChild(card);

            });

        }

        renderStoryReel();


        function openStory(storyIndex) {

            if (!stories[storyIndex]) {
                return;
            }

            currentStory = storyIndex;
            currentSlide = 0;

            storyViewer.classList.add("open");
            storyViewer.setAttribute(
                "aria-hidden",
                "false"
            );

            document.body.classList.add("no-scroll");

            updateStory();

        }


        function closeStory() {

            clearTimeout(storyTimer);

            storyViewer.classList.remove("open");

            storyViewer.setAttribute(
                "aria-hidden",
                "true"
            );

            document.body.classList.remove("no-scroll");

        }


        function updateStory() {

            clearTimeout(storyTimer);

            const story =
                stories[currentStory];

            if (!story) {
                closeStory();
                return;
            }

            const slides =
                Array.isArray(story.slides)
                    ? story.slides
                    : [];

            if (!slides.length) {
                closeStory();
                return;
            }

            if (
                currentSlide < 0
            ) {
                currentSlide = 0;
            }

            if (
                currentSlide >= slides.length
            ) {
                currentSlide = slides.length - 1;
            }

            const slide =
                slides[currentSlide];

            storyMedia.src =
                slide.image || "";

            storyCaption.textContent =
                slide.caption || "";

            storyAccountImage.src =
                story.cover ||
                slide.image ||
                "";

            buildStoryProgress(
                slides.length
            );

            storyMedia.style.animation = "none";

            void storyMedia.offsetWidth;

            storyMedia.style.animation =
                "storyImageIn 0.45s cubic-bezier(0.22, 1, 0.36, 1)";

            storyTimer =
                setTimeout(
                    nextStorySlide,
                    4000
                );

        }


        function buildStoryProgress(length) {

            storyProgress.innerHTML = "";

            for (
                let index = 0;
                index < length;
                index++
            ) {

                const segment =
                    document.createElement("div");

                segment.className =
                    "story-progress-segment";

                const fill =
                    document.createElement("span");

                segment.appendChild(fill);

                if (index < currentSlide) {
                    segment.classList.add("done");
                }

                if (index === currentSlide) {
                    segment.classList.add("active");
                }

                storyProgress.appendChild(segment);

            }

        }


        function nextStorySlide() {

            const story =
                stories[currentStory];

            const slides =
                story?.slides || [];

            if (
                currentSlide <
                slides.length - 1
            ) {

                currentSlide++;
                updateStory();

            } else if (
                currentStory <
                stories.length - 1
            ) {

                currentStory++;
                currentSlide = 0;
                updateStory();

            } else {

                closeStory();

            }

        }


        function previousStorySlide() {

            clearTimeout(storyTimer);

            if (currentSlide > 0) {

                currentSlide--;
                updateStory();

            } else if (currentStory > 0) {

                currentStory--;

                const slides =
                    stories[currentStory]?.slides || [];

                currentSlide =
                    Math.max(
                        0,
                        slides.length - 1
                    );

                updateStory();

            } else {

                updateStory();

            }

        }


        document
            .getElementById("storyNext")
            .addEventListener(
                "click",
                nextStorySlide
            );

        document
            .getElementById("storyPrev")
            .addEventListener(
                "click",
                previousStorySlide
            );

        document
            .getElementById("storyClose")
            .addEventListener(
                "click",
                closeStory
            );


        storyViewer.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    storyViewer
                ) {
                    closeStory();
                }

            }
        );


        let storyTouchStartX = 0;

        storyViewer.addEventListener(
            "touchstart",
            event => {

                storyTouchStartX =
                    event.changedTouches[0].clientX;

            },
            { passive: true }
        );

        storyViewer.addEventListener(
            "touchend",
            event => {

                const endX =
                    event.changedTouches[0].clientX;

                const difference =
                    endX - storyTouchStartX;

                if (Math.abs(difference) < 50) {
                    return;
                }

                if (difference < 0) {
                    nextStorySlide();
                } else {
                    previousStorySlide();
                }

            },
            { passive: true }
        );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    !storyViewer.classList.contains("open")
                ) {
                    return;
                }

                if (event.key === "Escape") {
                    closeStory();
                }

                if (event.key === "ArrowRight") {
                    nextStorySlide();
                }

                if (event.key === "ArrowLeft") {
                    previousStorySlide();
                }

            }
        );


        /* =====================================================
           TOAST
        ====================================================== */

        let toastTimeout = null;

        function showToast(message) {

            toastMessage.textContent =
                message;

            toast.classList.add("show");

            clearTimeout(toastTimeout);

            toastTimeout =
                setTimeout(
                    () => {
                        toast.classList.remove("show");
                    },
                    2600
                );

        }


        /* =====================================================
           RIPPLE EFFECT
        ====================================================== */

        function addRipple(event) {

            const button =
                event.currentTarget;

            const existing =
                button.querySelector(".ripple");

            if (existing) {
                existing.remove();
            }

            const circle =
                document.createElement("span");

            circle.className = "ripple";

            const rect =
                button.getBoundingClientRect();

            const size =
                Math.max(
                    rect.width,
                    rect.height
                );

            circle.style.width =
                `${size}px`;

            circle.style.height =
                `${size}px`;

            circle.style.left =
                `${event.clientX - rect.left - size / 2}px`;

            circle.style.top =
                `${event.clientY - rect.top - size / 2}px`;

            button.appendChild(circle);

            setTimeout(
                () => circle.remove(),
                750
            );

        }


        function activateMicroInteractions() {

            document
                .querySelectorAll(".ripple-button")
                .forEach(button => {

                    if (
                        button.dataset.rippleReady
                    ) {
                        return;
                    }

                    button.dataset.rippleReady =
                        "true";

                    button.addEventListener(
                        "click",
                        addRipple
                    );

                });


            document
                .querySelectorAll(".magnetic-btn")
                .forEach(button => {

                    if (
                        button.dataset.magneticReady
                    ) {
                        return;
                    }

                    button.dataset.magneticReady =
                        "true";

                    button.addEventListener(
                        "mousemove",
                        event => {

                            if (
                                window.innerWidth <= 800
                            ) {
                                return;
                            }

                            const rect =
                                button.getBoundingClientRect();

                            const x =
                                event.clientX -
                                rect.left -
                                rect.width / 2;

                            const y =
                                event.clientY -
                                rect.top -
                                rect.height / 2;

                            button.style.transform =
                                `translate(${x * 0.12}px, ${y * 0.12}px)`;

                        }
                    );

                    button.addEventListener(
                        "mouseleave",
                        () => {

                            button.style.transform = "";

                        }
                    );

                });

        }

        activateMicroInteractions();


        /* =====================================================
           CURSOR GLOW
        ====================================================== */

        if (cursorGlow) {

            document.addEventListener(
                "mousemove",
                event => {

                    cursorGlow.style.left =
                        `${event.clientX}px`;

                    cursorGlow.style.top =
                        `${event.clientY}px`;

                }
            );

        }


        /* =====================================================
           FOOTER YEAR
        ====================================================== */

        const footerYear =
            document.getElementById("footerYear");

        if (footerYear) {
            footerYear.textContent =
                new Date().getFullYear();
        }

    });

})();