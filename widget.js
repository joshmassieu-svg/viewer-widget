// widget.js (upload this file to Site Files)
(function () {
    // this script runs inside visitors' browsers on customers' sites
    const script = document.currentScript;
    const siteId = script && script.dataset && script.dataset.siteId;
    if (!siteId) return;

    const page = window.location.pathname + window.location.search; // include query string

    // Detect product page (flexible)
    const isProductUrl = /\/product(s)?\//i.test(page) || /\/product(s)?\b/i.test(page);
    const isProductDom = !!document.querySelector('[data-hook="ProductPage"], .product, [itemtype*="Product"]');

    if (!isProductUrl && !isProductDom) return;

    // Post view event to your Wix backend
    fetch("https://bazbooyah.wixstudio.com/my-site/_functions/trackView", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, page, ts: Date.now() })
    }).catch(() => {});

    // Poll for viewer count every 5 seconds (lightweight)
    let lastCount = 0;
    setInterval(() => {
        fetch(`https://bazbooyah.wixstudio.com/my-site/_functions/stats?siteId=${encodeURIComponent(siteId)}&page=${encodeURIComponent(page)}`)
            .then(r => r.json())
            .then(data => {
                if (!data || typeof data.count !== 'number') return;
                if (data.count !== lastCount) {
                    lastCount = data.count;
                    showPopup(`${data.count} people are viewing this right now`);
                }
            })
            .catch(()=>{});
    }, 5000);

    // UI: small floating bubble (non-blocking)
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
            el.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
            el.style.fontFamily = "Arial, sans-serif";
            el.style.fontSize = "14px";
            el.style.zIndex = "2147483647";
            el.style.opacity = "0";
            el.style.transition = "opacity .35s, transform .35s";
            el.style.transform = "translateY(6px)";
            document.body.appendChild(el);
        }

        el.textContent = text;
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";

        // hide after 3.5s
        clearTimeout(el._hideTimeout);
        el._hideTimeout = setTimeout(() => {
            el.style.opacity = "0";
            el.style.transform = "translateY(6px)";
        }, 3500);
    }
})();
