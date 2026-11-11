const products = [
  { id: "p1", name: "Casque sans fil Ultra Bass", category: "electronique", price: 7000, img: "images/produits/casque.png" },
  { id: "p3", name: "Coque IPhone silicone", category: "electronique", price: 2000, img: "images/produits/coque-iphone.jpeg" },
  { id: "p18", name: "Support pour ordinateur", category: "electronique", price: 4000, img: "images/produits/support-ordinateur.jpg" },
  { id: "p19", name: "Support pour téléphone", category: "electronique", price: 4000, img: "images/produits/support-telephone.jpg" },

  { id: "p4", name: "Diffuseur feu de camp", category: "decoration", price: 8000, img: "images/produits/diffuseur-feu-de-camp.png" },
  { id: "p5", name: "Diffuseur minimal grand", category: "decoration", price: 5000, img: "images/produits/diffuseur-grand.png" },
  { id: "p6", name: "Diffuseur compact petit", category: "decoration", price: 4500, img: "images/produits/diffuseur-petit.png" },

  { id: "p17", name: "Montres polycarbone", category: "accessoires", price: 3000, img: "images/produits/montres-polycarbone.jpeg" }
];

let cart = JSON.parse(localStorage.getItem("eden_cart_v2") || "[]");

const navButtons = [...document.querySelectorAll(".nav-btn")];
const pages = [...document.querySelectorAll(".page")];
const productsGrid = document.getElementById("productsGrid");
const cartCount = document.getElementById("cartCount");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const toast = document.getElementById("toast");

function showPage(pageName) {
  pages.forEach((page) => page.classList.toggle("active", page.dataset.page === pageName));
  navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.page === pageName));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatPrice(value) {
  return value.toLocaleString("fr-FR") + " F CFA";
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1700);
}

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === "\"") return "&quot;";
    return char;
  });
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, oldPrice: product.oldPrice || null, img: product.img, qty: 1 });
  }
  saveCart();
  notify(product.name + " ajouté au panier");
}

function changeQty(productId, delta) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((entry) => entry.id !== productId);
  saveCart();
}

function saveCart() {
  localStorage.setItem("eden_cart_v2", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  cartCount.textContent = String(totalQty);
  cartTotal.textContent = formatPrice(totalPrice);

  if (cart.length === 0) {
    cartItems.innerHTML = "<p style='color:#6F5A52;padding:.7rem;'>Ton panier est vide.</p>";
    return;
  }

  cartItems.innerHTML = cart.map((item) => `
    <article class="cart-item">
      <img src="${item.img}" alt="${escapeHtml(item.name)}" onerror="this.src='https://placehold.co/120x120?text=Item'">
      <div>
        <h4 style="font-size:.95rem;">${escapeHtml(item.name)}</h4>
        <p style="color:#8C5A3C;font-weight:600;">${item.oldPrice ? '<span style="text-decoration:line-through;color:var(--text-soft);font-weight:400;font-size:.85em;margin-right:.3rem;">' + formatPrice(item.oldPrice) + '</span>' : ''}${formatPrice(item.price)}</p>
      </div>
      <div class="qty">
        <button data-action="minus" data-id="${item.id}">-</button>
        <span>${item.qty}</span>
        <button data-action="plus" data-id="${item.id}">+</button>
      </div>
    </article>
  `).join("");
}

function getFilteredProducts() {
  const text = document.getElementById("searchInput").value.trim().toLowerCase();
  const cat = document.getElementById("categoryFilter").value;
  const sort = document.getElementById("priceSort").value;

  let result = products.filter((item) => {
    const matchText = item.name.toLowerCase().includes(text);
    const matchCat = cat === "all" || item.category === cat;
    return matchText && matchCat;
  });

  if (sort === "low-high") result = [...result].sort((a, b) => a.price - b.price);
  if (sort === "high-low") result = [...result].sort((a, b) => b.price - a.price);
  return result;
}

function renderPrice(item) {
  if (item.oldPrice) {
    return '<span style="text-decoration:line-through;color:var(--text-soft);font-weight:400;font-size:.85em;margin-right:.3rem;">' + formatPrice(item.oldPrice) + '</span>' + formatPrice(item.price);
  }
  return formatPrice(item.price);
}

function renderProducts() {
  const list = getFilteredProducts();
  if (!list.length) {
    productsGrid.innerHTML = "<p style='color:#6F5A52;'>Aucun produit ne correspond aux filtres.</p>";
    return;
  }
  productsGrid.innerHTML = list.map((item) => `
    <article class="product">
      <img src="${item.img}" alt="${escapeHtml(item.name)}" onerror="this.src='https://placehold.co/600x600?text=Produit'">
      <div class="product-body">
        <h3 class="product-title">${escapeHtml(item.name)}</h3>
        <p class="product-cat">${item.category}</p>
        <div class="product-bottom">
          <span class="price">${renderPrice(item)}</span>
          <button class="add-btn" data-id="${item.id}">
            <i class="fa-solid fa-cart-plus"></i> Ajouter
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

function openCart() {
  cartOverlay.classList.add("open");
}

function closeCart() {
  cartOverlay.classList.remove("open");
}

function checkoutWhatsApp() {
  if (!cart.length) {
    notify("Panier vide");
    return;
  }
  const lines = cart.map((item) => {
    var priceLabel = item.oldPrice ? (item.oldPrice + " - " + item.price + " F") : (item.price + " F");
    return "- " + item.name + " x" + item.qty + " : " + priceLabel;
  });
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const message = encodeURIComponent("Bonjour, je souhaite commander :\n" + lines.join("\n") + "\nTotal : " + total + " F");
  window.open("https://wa.me/221774180379?text=" + message, "_blank");
}

document.addEventListener("click", (event) => {
  const navBtn = event.target.closest(".nav-btn");
  if (navBtn) showPage(navBtn.dataset.page);

  const goToBtn = event.target.closest("[data-goto]");
  if (goToBtn) showPage(goToBtn.dataset.goto);

  const addBtn = event.target.closest(".add-btn");
  if (addBtn) addToCart(addBtn.dataset.id);

  const categoryCard = event.target.closest(".category-card");
  if (categoryCard) {
    document.getElementById("categoryFilter").value = categoryCard.dataset.cat;
    showPage("shop");
    renderProducts();
  }

  const qtyBtn = event.target.closest(".qty button");
  if (qtyBtn) {
    const delta = qtyBtn.dataset.action === "plus" ? 1 : -1;
    changeQty(qtyBtn.dataset.id, delta);
  }
});

document.getElementById("searchInput").addEventListener("input", renderProducts);
document.getElementById("categoryFilter").addEventListener("change", renderProducts);
document.getElementById("priceSort").addEventListener("change", renderProducts);
document.getElementById("openCartBtn").addEventListener("click", openCart);
document.getElementById("closeCartBtn").addEventListener("click", closeCart);
document.getElementById("checkoutBtn").addEventListener("click", checkoutWhatsApp);
cartOverlay.addEventListener("click", (event) => { if (event.target === cartOverlay) closeCart(); });

window.addEventListener("load", () => {
  renderProducts();
  renderCart();
  setTimeout(() => document.getElementById("loader").classList.add("hide"), 1000);
});
