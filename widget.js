(function () {
    const script = document.currentScript;
    const siteId = script?.dataset?.siteId;
    if (!siteId) return;

    const page = window.location.pathname;

    // Product detection (Wix Studio compatible)
    const isProductUrl = /\/product(s)?\//i.test(page);
    const isProductDom = () => {
        return document.querySelector('[data-hook="ProductPage"], [itemtype*="Product"], .product-page');
    };

    // Wait until DOM is ready, then re-check
    function waitForProduct() {
        return new Promise(resolve => {
            if (isProductUrl || isProductDom()) return resolve(true);
            const obs = new MutationObserver(() => {
                if (isProductDom()) {
                    obs.disconnect();
                    resolve(true);
                }
            });
            obs.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => resolve(false), 3000);
        });
    }

    waitForProduct().then(isProduct => {
        if (!isProduct) return;

        // Send view event
        fetch("https://bazbooyah.wixstudio.com/my-site/_functions/trackView", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ siteId, page, ts: Date.now() })
        }).catch(() => {});

        // Poll for viewer count
        let lastCount = 0;
        setInterval(() => {
            fetch(`https://bazbooyah.wixstudio.com/my-site/_functions/stats?siteId=${siteId}&page=${encodeURIComponent(page)}`)
                .then(r => r.json())
                .then(data => {
                    if (!data?.count) return;
                    if (data.count !== lastCount) {
                        lastCount = data.count;
                        showPopup(`${data.count} people are viewing this right now`);
                    }
                })
                .catch(() => {});
        }, 6000);
    });

    function showPopup(text) {
        let el = document.getElementById("viewer-popup");
        if (!el) {
            el = document.createElement("div");
            el.id = "viewer-popup";
            el.style.position = "fixed";
            el.style.bottom = "20px";
            el.style.left = "20px";
            el.style.padding = "10px 14px";
            el.style.background = "rgba(0,0,0,0.85)";
            el.style.color = "#fff";
            el.style.borderRadius = "10px";
            el.style.fontFamily = "Arial, sans-serif";
            el.style.fontSize = "14px";
            el.style.zIndex = "999999";
            el.style.opacity = "0";
            el.style.transition = "opacity .35s, transform .35s";
            el.style.transform = "translateY(6px)";
            document.body.appendChild(el);
        }

        el.textContent = text;
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";

        clearTimeout(el._hideTimeout);
        el._hideTimeout = setTimeout(() => {
            el.style.opacity = "0";
            el.style.transform = "translateY(6px)";
        }, 3500);
    }
})();


