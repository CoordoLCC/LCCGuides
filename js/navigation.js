// ===== NAVIGATION MANAGER =====

let hamburger, navSidebar;

export function initNavigation() {
    hamburger = document.getElementById("guide-hamburger");
    navSidebar = document.getElementById("guide-nav-sidebar");

    hamburger.addEventListener("click", toggleMenu);
}

function toggleMenu() {
    hamburger.classList.toggle("guide-open");
    navSidebar.classList.toggle("guide-open");
}

export function closeMenu() {
    hamburger.classList.remove("guide-open");
    navSidebar.classList.remove("guide-open");
}

export function renderNavigation(sections, navMenu) {
    navMenu.innerHTML = "";

    sections.forEach((section) => {
        const li = document.createElement("li");
        li.className = "guide-nav-item";

        if (section.subsections.length > 0) {
            const button = document.createElement("button");
            button.className = "guide-nav-link";

            const titleSpan = document.createElement("span");
            titleSpan.className = "guide-nav-title";
            titleSpan.textContent = section.title;

            const arrow = document.createElement("span");
            arrow.className = "guide-nav-arrow";
            arrow.textContent = "›";

            button.appendChild(titleSpan);
            button.appendChild(arrow);

            const subUl = document.createElement("ul");
            subUl.className = "guide-nav-submenu";

            section.subsections.forEach((subsection) => {
                const subLi = document.createElement("li");
                subLi.className = "guide-nav-subitem";
                const subA = document.createElement("a");
                subA.href = `#${subsection.id}`;
                subA.className = "guide-nav-sublink";
                subA.textContent = subsection.title;
                subA.onclick = (e) => {
                    e.preventDefault();
                    scrollToSection(subsection.id);
                    closeMenu();
                };
                subLi.appendChild(subA);
                subUl.appendChild(subLi);
            });

            // Click on title - on mobile only toggle submenu, on desktop also scroll
            titleSpan.addEventListener("click", (e) => {
                e.stopPropagation();
                const isMobile = window.innerWidth <= 768;

                if (isMobile) {
                    // On mobile, only toggle the submenu
                    button.classList.toggle("guide-expanded");
                    subUl.classList.toggle("guide-show");
                } else {
                    // On desktop, scroll to section and toggle submenu
                    scrollToSection(section.id);
                    button.classList.toggle("guide-expanded");
                    subUl.classList.toggle("guide-show");
                    closeMenu();
                }
            });

            // Click on arrow toggles submenu
            arrow.addEventListener("click", (e) => {
                e.stopPropagation();
                button.classList.toggle("guide-expanded");
                subUl.classList.toggle("guide-show");
            });

            li.appendChild(button);
            li.appendChild(subUl);
        } else {
            const a = document.createElement("a");
            a.href = `#${section.id}`;
            a.className = "guide-nav-link";
            a.textContent = section.title;
            a.onclick = (e) => {
                e.preventDefault();
                scrollToSection(section.id);
                closeMenu();
            };
            li.appendChild(a);
        }

        navMenu.appendChild(li);
    });
}

function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}
