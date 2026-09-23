/* ==========================================
   PAVALAM INDUSTRIES
   ORDER.JS
========================================== */

// Get Elements
const product = document.getElementById("product");
const qty = document.getElementById("qty");
const summaryProduct = document.getElementById("summaryProduct");
const summaryQty = document.getElementById("summaryQty");
const orderForm = document.getElementById("orderForm");
const deliveryDate = document.getElementById("date");

// ================================
// Set Minimum Date (Today)
// ================================

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");

deliveryDate.min = `${yyyy}-${mm}-${dd}`;

// ================================
// Live Product Update
// ================================

product.addEventListener("change", function () {
    summaryProduct.textContent = product.value;
});

// ================================
// Live Quantity Update
// ================================

qty.addEventListener("input", function () {

    if (qty.value < 1) {
        qty.value = 1;
    }

    summaryQty.textContent = qty.value;

});

// ================================
// Phone Validation
// ================================

function validPhone(phone) {

    return /^[0-9]{10}$/.test(phone);

}

// ================================
// Email Validation
// ================================

function validEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

// ================================
// Submit Order
// ================================

orderForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const name =
        document.getElementById("name").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const city =
        document.getElementById("city").value.trim();

    const address =
        document.getElementById("address").value.trim();

    if (
        name === "" ||
        phone === "" ||
        email === "" ||
        city === "" ||
        address === ""
    ) {

        alert("Please fill all required fields.");

        return;

    }

    if (!validPhone(phone)) {

        alert("Please enter a valid 10-digit phone number.");

        return;

    }

    if (!validEmail(email)) {

        alert("Please enter a valid email address.");

        return;

    }

    // Generate Order ID

    const orderID =
        "PI" +
        Math.floor(Math.random() * 1000000);

    alert(

`🎉 Order Placed Successfully!

Order ID : ${orderID}

Product : ${product.value}

Quantity : ${qty.value}

Payment : ${document.getElementById("payment").value}

Thank you for choosing
Pavalam Industries.`

    );

    orderForm.reset();

    summaryProduct.textContent = "Pesticides";

    summaryQty.textContent = "1";

});

// ================================
// Quantity Buttons (Future Use)
// ================================

console.log("Order Page Loaded Successfully");