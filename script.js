/* ==========================================
   PAVALAM INDUSTRIES
   script.js
========================================== */

// Welcome message (shown once per browser session)

if (!sessionStorage.getItem("welcomeShown")) {
    window.addEventListener("load", () => {
        alert("Welcome to Pavalam Industries!");
        sessionStorage.setItem("welcomeShown", "true");
    });
}

// ==========================================
// Floating Chat Button
// ==========================================

const chatBtn = document.getElementById("chatBtn");

if (chatBtn) {

    chatBtn.addEventListener("click", () => {

        alert(
`Hello 👋

Welcome to Pavalam Industries.

Our full AI Product Assistant will be available here.

You can ask about:

• Pesticides
• Sambrani
• Agarbatti
• Manufacturing
• Packing
• Delivery
• Online Orders`
        );

    });

}

// ==========================================
// Back To Top Button
// ==========================================

const topBtn = document.getElementById("topBtn");

window.onscroll = function () {

    if (!topBtn) return;

    if (
        document.body.scrollTop > 400 ||
        document.documentElement.scrollTop > 400
    ) {

        topBtn.style.display = "block";

    }

    else {

        topBtn.style.display = "none";

    }

};

if (topBtn) {

    topBtn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

// ==========================================
// Fade Animation
// ==========================================

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {

    threshold: 0.2

});

document.querySelectorAll("section").forEach(section => {

    section.classList.add("fade");

    observer.observe(section);

});

// ==========================================
// Card Hover Effect
// ==========================================

const cards = document.querySelectorAll(".card");

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-12px)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "translateY(0px)";

    });

});

// ==========================================
// Smooth Scroll for Explore Button
// ==========================================

const exploreBtn = document.querySelector(".exploreBtn");

if (exploreBtn) {

    exploreBtn.addEventListener("click", function (e) {

        e.preventDefault();

        document.querySelector("#products").scrollIntoView({

            behavior: "smooth"

        });

    });

}

// ==========================================
// Review Auto Highlight
// ==========================================

const reviews = document.querySelectorAll(".review");

let reviewIndex = 0;

if (reviews.length > 0) {

    setInterval(() => {

        reviews.forEach(r => {

            r.style.border = "none";

        });

        reviews[reviewIndex].style.border =

            "3px solid #2E7D32";

        reviewIndex++;

        if (reviewIndex >= reviews.length)

            reviewIndex = 0;

    }, 2500);

}

// ==========================================
// Navbar Shadow
// ==========================================

const header = document.querySelector("header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 40) {

        header.style.boxShadow =

            "0 8px 20px rgba(0,0,0,.2)";

    }

    else {

        header.style.boxShadow =

            "0 5px 15px rgba(0,0,0,.15)";

    }

});

// ==========================================
// Image Fade Animation
// ==========================================

const images = document.querySelectorAll("img");

images.forEach(img => {

    img.addEventListener("load", () => {

        img.style.opacity = "0";

        setTimeout(() => {

            img.style.transition = "1s";

            img.style.opacity = "1";

        }, 100);

    });

});

// ==========================================
// Console Message
// ==========================================

console.log("Pavalam Industries Website Loaded Successfully.");