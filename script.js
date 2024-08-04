const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");
const retiradaLojaCheckbox = document.getElementById("retiradaLoja");

function updateStatus() {
  const statusElement = document.getElementById("date-span");

  const brasiliaOffset = -3; 
  const now = new Date();
  const brasiliaTime = new Date(now.getTime() + brasiliaOffset * 60 * 60 * 1000);

  const openHour = 18; 
  const closeHour = 23; 

  const currentHour = brasiliaTime.getHours();
  
  
  if (currentHour >= openHour && currentHour < closeHour) {
      statusElement.classList.remove("bg-red-600");
      statusElement.classList.add("bg-green-600");
      statusElement.innerHTML = `<span class="text-white font-medium bg-green-500 status-indicator px-4 py-1 rounded-lg mt-5">Aberto 18:00 às 23:00</span>`;
  } else {
      statusElement.classList.remove("bg-green-600");
      statusElement.classList.add("bg-red-600");
      statusElement.innerHTML = `<span class="text-white font-medium bg-red-500 status-indicator px-4 py-1 rounded-lg mt-5">Fechado até 18:00</span>`;
  }
}

document.addEventListener("DOMContentLoaded", updateStatus);

document.addEventListener("DOMContentLoaded", updateStatus);


let cart = [];

cartBtn.addEventListener("click", function() {
  updateCartModal();
  cartModal.style.display = "flex";
});

cartModal.addEventListener("click", function(event) {
  if(event.target === cartModal) {
    cartModal.style.display = "none";
  }
});

closeModalBtn.addEventListener("click", function() {
  cartModal.style.display = "none";
});

menu.addEventListener("click", function(event) {
  let parentButton = event.target.closest(".add-to-cart-btn");

  if(parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));

    addToCart(name, price);
  }
});

function addToCart(name, price) {
  const existingItem = cart.find(item => item.name === name);

  if(existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price,
      quantity: 1
    });
  }

  updateCartModal();
}

function updateCartModal() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

    cartItemElement.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium">${item.name}</p>
          <p>Qtd: ${item.quantity}</p>
          <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
        </div>

        <button class="remove-from-cart-btn" data-name="${item.name}">
          Remover
        </button>
      </div>
    `;

    total += item.price * item.quantity;

    cartItemsContainer.appendChild(cartItemElement);
  });

  const taxaEntrega = retiradaLojaCheckbox.checked ? 0 : 10;
  total += taxaEntrega;

  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  cartCounter.innerHTML = cart.length;
}

cartItemsContainer.addEventListener("click", function(event) {
  if(event.target.classList.contains("remove-from-cart-btn")) {
    const name = event.target.getAttribute("data-name");

    removeItemCart(name);
  }
});

function removeItemCart(name) {
  const index = cart.findIndex(item => item.name === name);

  if(index !== -1) {
    const item = cart[index];

    if(item.quantity > 1) {
      item.quantity -= 1;
      updateCartModal();
      return;
    }

    cart.splice(index, 1);
    updateCartModal();
  }
}

addressInput.addEventListener("input", function(event) {
  let inputValue = event.target.value;

  if(inputValue !== "") {
    addressInput.classList.remove("border-red-500");
    addressWarn.classList.add("hidden");
  }
});

retiradaLojaCheckbox.addEventListener("change", function() {
  updateCartModal();
});

checkoutBtn.addEventListener("click", function() {
  let total = 0;

  if(cart.length === 0) return;

  const retiradaLojaMarcada = retiradaLojaCheckbox.checked;

  const taxaEntrega = retiradaLojaMarcada ? 0 : 10; 

  if (!retiradaLojaMarcada && addressInput.value === "") {
    addressWarn.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    return;
  }

  const cartItems = cart.map((item) => {
    total += item.price * item.quantity;
    return `(${item.quantity}) ${item.name}: R$${item.price.toFixed(2)} \n`;
  }).join("");

  total += taxaEntrega;

  const message = encodeURIComponent(cartItems);
  const phone = "32998541274";
  const endereco = retiradaLojaMarcada ? "Retirada na loja" : addressInput.value;

  const whatsappLink = `https://wa.me/${phone}?text=${message} Total: R$${total.toFixed(2)} Endereço: ${endereco} \n`;

  window.open(whatsappLink, "_blank");

  cart = [];
  updateCartModal();
});
