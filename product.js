/*==========================================
    PAVALAM INDUSTRIES
    PRODUCTS.JS
==========================================*/

// ============================
// FAQ ACCORDION
// ============================

const accordions = document.querySelectorAll(".accordion");

accordions.forEach((accordion) => {
    accordion.addEventListener("click", function () {

        this.classList.toggle("active");

        const panel = this.nextElementSibling;

        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }

    });
});

// ============================
// BACK TO TOP BUTTON
// ============================

const topBtn = document.getElementById("topBtn");

window.onscroll = function () {

    if (document.documentElement.scrollTop > 300) {
        topBtn.style.display = "block";
    } else {
        topBtn.style.display = "none";
    }

};

topBtn.onclick = function () {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

};

// ============================
// SMOOTH NAVIGATION
// ============================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});

// ============================
// FADE-IN ANIMATION
// ============================

const observer = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if (entry.isIntersecting) {

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";

        }

    });

}, {

    threshold: 0.2

});

document.querySelectorAll("section").forEach((section) => {

    section.style.opacity = "0";
    section.style.transform = "translateY(50px)";
    section.style.transition = "all .8s ease";

    observer.observe(section);

});

// ============================
// IMAGE LIGHTBOX
// ============================

const galleryImages = document.querySelectorAll(".gallery-grid img");

galleryImages.forEach((img) => {

    img.addEventListener("click", function () {

        const overlay = document.createElement("div");

        overlay.style.position = "fixed";
        overlay.style.left = "0";
        overlay.style.top = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0,0,0,.9)";
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "9999";

        const image = document.createElement("img");

        image.src = this.src;
        image.style.maxWidth = "90%";
        image.style.maxHeight = "90%";
        image.style.borderRadius = "15px";

        overlay.appendChild(image);

        document.body.appendChild(overlay);

        overlay.onclick = function () {

            overlay.remove();

        };

    });

});

// ============================
// SIMPLE AI CHAT ASSISTANT
// ============================

function askAssistant() {

    const question = prompt(
        "Ask about our products, manufacturing, delivery or orders:"
    );

    if (!question) return;

    const q = question.toLowerCase();

    if (q.includes("manufacture") || q.includes("made")) {

        alert(
            "Our products are manufactured using quality raw materials, advanced machinery, laboratory testing and secure packaging."
        );

    }

    else if (q.includes("delivery")) {

        alert(
            "Orders are packed carefully and delivered through trusted logistics partners across India."
        );

    }

    else if (q.includes("order")) {

        alert(
            "You can place an order using the Order Now page or contact our sales team."
        );

    }

    else if (q.includes("pesticide")) {

        alert(
            "We manufacture quality agricultural pesticides suitable for crop protection."
        );

    }

    else {

        alert(
            "Thank you for your question! Please contact Pavalam Industries for more information."
        );

    }

}

// ============================
// CREATE CHAT BUTTON
// ============================

const chatButton = document.createElement("button");

chatButton.innerHTML = "💬";

chatButton.style.position = "fixed";
chatButton.style.right = "25px";
chatButton.style.bottom = "95px";
chatButton.style.width = "60px";
chatButton.style.height = "60px";
chatButton.style.borderRadius = "50%";
chatButton.style.border = "none";
chatButton.style.background = "#0d6efd";
chatButton.style.color = "white";
chatButton.style.fontSize = "24px";
chatButton.style.cursor = "pointer";
chatButton.style.zIndex = "999";

chatButton.onclick = askAssistant;

document.body.appendChild(chatButton);

// ============================
// ACTIVE NAVIGATION LINK
// ============================

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach((section) => {

        const sectionTop = section.offsetTop - 120;

        if (scrollY >= sectionTop) {

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach((link) => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

});

console.log("Pavalam Industries Product Page Loaded Successfully");