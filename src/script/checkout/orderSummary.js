import { getProduct, products } from "../../data/product.js";
import { cart, removetoCart, updateDeliveryOption, updateQuantity } from "../../data/cart.js";
import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import { deliveryOptions, getDeliveryOption } from "../../data/deliveryOptions.js";
import { renderPaymentSummary } from "./paymentSummary.js";

export function renderOrderSummary() {


let checkoutHTMl = '';

cart.forEach((cartItem) => {

  const productId = cartItem.productId;

  const matchingItem = getProduct(productId);

  const deliveryOptionId = cartItem.deliveryOptionId;

  const deliveryOption = getDeliveryOption(deliveryOptionId);

  const today = dayjs();
  const deliveryDate = today.add(deliveryOption.deliveryDay, 'day');
  const formatString = deliveryDate.format('dddd, MMMM D');

  checkoutHTMl += `
  <li class="js-cart-${matchingItem.id} w-full h-5/6 md:w-[70%] md:h-[60%] lg:w-full lg:h-full shadow-md shadow-black-dark  px-6 py-4 bg-dull-white  flex flex-col gap-6 mb-6"> 
      <h1 class="font-bold font-primaryFont"> Delivery Date: ${formatString}</h1>
      <div class="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
        <div class="flex justify-center items-center gap-6 lg:flex-col">
          <div class="flex justify-center items-center">
            <img src="${matchingItem.image}" alt="product1" class="w-[150px]">
          </div>
          <div class="flex flex-col items-start justify-start space-y-4 text-[15px]">
            <div class="font-semibold">${matchingItem.name}</div>
            <div class="font-semibold text-red-600">Price: $${matchingItem.priceCents}</div>
            <div class="flex gap-2 justify-center items-center">
              <div class="font-semibold py-1">quantity: <span class="cart-quantity">${cartItem.quantity}</span> </div>
              <input class="quantity-input js-quantity-input-${matchingItem.id} w-12 border border-black-dark px-2 rounded-md hidden"/>
            </div>
            <div class="flex justify-center items-center gap-2">
              <button class=" md:w-32 lg:w-20 px-3 py-2 bg-green-700 rounded-md text-white ease-linear duration-200 hover:bg-green-500 update-button js-update-button" data-product-id="${matchingItem.id}"> Update </button>
              <button class=" md:w-32 lg:w-20 px-3 py-2 bg-green-700 rounded-md text-white ease-linear duration-200 hover:bg-green-500 hidden save-button js-save-button" data-product-id="${matchingItem.id}"> Save </button>
              <button class="md:w-32 lg:w-20 px-3 py-2 bg-red-700 rounded-md text-white ease-linear duration-200 hover:bg-red-500 js-delete-button" data-product-id="${matchingItem.id}"> Delete </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2 justify-start items-start">
          <h1 class="font-primaryFont delivery-options-title">Choose a delivery options:</h1>
          ${renderDeliveryOption(matchingItem, cartItem)}
        </div>
      </div>
  </li>
  `;
});

function renderDeliveryOption(matchingItem, cartItem) {
  let html = '';

  deliveryOptions.forEach((deliveryOption) => {

    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDay, 'day');
    const formatString = deliveryDate.format('dddd, MMMM D');

    const priceString = deliveryOption.priceCents === 0
    ? 'FREE'
    : `$${deliveryOption.priceCents} - `;

    const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

    html += `
    <div class="delivery-option js-delivery-option"
    data-product-id="${matchingItem.id}"
    data-delivery-option-id="${deliveryOption.id}">
      <input type="radio"
        ${isChecked ? 'checked' : ''}
        class="delivery-option-date"
        name="delivery-option-${matchingItem.id}">
      <div>
        <div class="delivery-option-date">
          ${formatString}
        </div>
        <div class="delivery-option-price">
          ${priceString} Shipping
        </div>
      </div>
    </div> 
    `;
  })

  return html;
}

document.querySelector('.js-checkout-page').innerHTML = checkoutHTMl;

document.querySelectorAll('.js-delete-button')
  .forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      removetoCart(productId);
      renderPaymentSummary();
      addtoCartQuantity();
      
      const deleteCartItem = document.querySelector( `
        .js-cart-${productId}`
      );
      deleteCartItem.remove();
    })
});

document.querySelectorAll('.js-update-button')
  .forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      
      const updateCartItem = document.querySelector( `
        .js-cart-${productId}`
      );
      updateCartItem.classList.add("is-editing-quantity"); 
    });
  });

document.querySelectorAll('.js-save-button')
  .forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;

      const inputValue = document.querySelector(
        `.js-quantity-input-${productId}`
      );
      const newQuantity = Number(inputValue.value);

      if(newQuantity < 0 || newQuantity >= 1000 ) {
        alert('Quantity must be at least 0 and less than 1000');
        return;
      }

      updateQuantity(productId, newQuantity);
      
      const saveCartItem = document.querySelector( `
        .js-cart-${productId}`
      );
      saveCartItem.classList.remove("is-editing-quantity");

      renderOrderSummary();
      renderPaymentSummary();
    })
  })

document.querySelectorAll('.js-delivery-option')
  .forEach((element) => {
    element.addEventListener('click', () => {
      const { productId, deliveryOptionId } = element.dataset;
      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummary();
      renderPaymentSummary();
  })
})

function addtoCartQuantity() {
  let cartQuantity = 0;

  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });
  document.querySelector('.js-cart-item').innerHTML = `CheckOut(Items ${cartQuantity})`;

  document.querySelector('.js-checkout-cart-quantity').innerHTML = `Carts(${cartQuantity})`;

  document.querySelector('.js-checkout-footer-cart-quantity').innerHTML = `Carts(${cartQuantity})`;
}

addtoCartQuantity();
};


