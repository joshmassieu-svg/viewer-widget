(function () {
    const script = document.currentScript;
    const siteId = script && script.dataset ? script.dataset.siteId : null;
    if (!siteId) return;

    const page = window.location.pathname + window.location.search;

    const isProduct =
        /\/product(s)?\//i.test(page) ||
        document.querySelector('[data-hook="ProductPage"], .product, [itemtype*="Product"]');

    if (!isProduct) return;

    // POST view
    fetch("https://bazbooyah.wixstudio.com/my-site/_functions/trackView", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, page, ts: Date.now() })
    }).catch(()=>{});

    // POLL stats
    let last = 0;
    setInterval(() => {
        fetch(`https://bazbooyah.wixstudio.com/my-site/_functions/stats?siteId=${encodeURIComponent(siteId)}&page=${encodeURIComponent(page)}`)
            .then(r => r.json())
            .then(data => {
                if (!data || data.error) return;
                if (data.count !== last) {
                    last = data.count;
                    show(`${data.count} people are viewing this`);
                }
            })
            .catch(()=>{});
    }, 5000);

    function show(text) {
        let el = document.getElementById("viewer-popup");
        if (!el) {
            el = document.createElement("div");
            el.id = "viewer-popup";
            Object.assign(el.style, {
                position: "fixed",
                bottom: "20px",
                left: "20px",
                padding: "12px 16px",
                background: "rgba(0,0,0,0.85)",
                color: "#fff",
                borderRadius: "10px",
                zIndex: "999999",
                opacity: "0",
                transition: "opacity .3s"
            });
            document.body.appendChild(el);
        }
        el.textContent = text;
        el.style.opacity = "1";
        clearTimeout(el._t);
        el._t = setTimeout(() => (el.style.opacity = "0"), 3500);
    }
})();

