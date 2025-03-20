let allColleges = [];

document.addEventListener("DOMContentLoaded", function () { 
  loadColleges();
  setupSearch();
});

function loadColleges() {
  fetch("http://localhost:3000/api/colleges")
    .then(response => response.json())
    .then(data => {
      allColleges = data;

      const collegesList = document.getElementById("collegesList");
      const gridContainer = document.getElementById("gridView");

      // Clear containers if they exist
      if (collegesList) {
        collegesList.innerHTML = "";
      }
      if (gridContainer) {
        gridContainer.innerHTML = "";
      }

      // Sort data (ensure property name is correct)
      data.sort((a, b) => a.colleges.localeCompare(b.colleges));

      data.forEach(college => {
        const collegeCard = createCollegeCard(college);

        // Add to carousel container if it exists
        if (collegesList) {
          const slide = document.createElement("div");
          slide.classList.add("swiper-slide");
          slide.innerHTML = collegeCard;
          collegesList.appendChild(slide);
        }

        // Add to grid container if it exists
        if (gridContainer) {
          const gridItem = document.createElement("div");
          gridItem.classList.add("grid-item");
          gridItem.innerHTML = collegeCard;
          gridContainer.appendChild(gridItem);
        }
      });

      // Initialize Swiper carousel if container exists
      if (collegesList) {
        new Swiper('.swiper-container', {
          slidesPerView: 3,
          spaceBetween: 10,
          loop: true,
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
          autoplay: {
            delay: 3000,
            disableOnInteraction: false,
          },
          breakpoints: {
            640: { slidesPerView: 4 },
            1024: { slidesPerView: 6 }
          }
        });
      }
    })
    .catch(error => console.error("❌ Error fetching colleges:", error));
}

function createCollegeCard(college) {
  let sanitizedCollegeName = college.colleges.toLowerCase()
    .replace(/[^a-z0-9_\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  const exceptions = {
    "minnesota_state_university_mankato": "Minnesota_State_Mankato_University",
    "mount_st_marys_university": "Mount_St_Marys_University"
  };
  if (exceptions[sanitizedCollegeName]) {
    sanitizedCollegeName = exceptions[sanitizedCollegeName];
  }

  const logoPath = `./logos/${sanitizedCollegeName}.png`;

  const scholarshipBadge = college.has_scholarship
    ? `<div class="scholarship-badge">Scholarships</div>`
    : "";

  return `
    <div class="college-card">
      ${scholarshipBadge}
      <div class="logo-container">
        <img 
          src="${logoPath}" 
          alt="${college.colleges} Logo"
          onerror="this.src='./logos/default.png';"
        >
      </div>
      <div class="divider-line"></div>
      <div class="college-info">
        <h3>${college.colleges}</h3>
        <p>${college.location}</p>
      </div>
      <a href="${college.website}" target="_blank" class="learn-more">Learn More</a>
    </div>
  `;
}

function displayCollegesInGrid(colleges) {
  const gridView = document.getElementById("gridView");
  if (!gridView) return;

  gridView.innerHTML = "";
  colleges.sort((a, b) => a.colleges.localeCompare(b.colleges));

  colleges.forEach(college => {
    const cardHTML = createCollegeCard(college);
    const gridItem = document.createElement("div");
    gridItem.classList.add("grid-item");
    gridItem.innerHTML = cardHTML;
    gridView.appendChild(gridItem);
  });
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    filterAndDisplay(query);
  });

  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.toLowerCase().trim();
    filterAndDisplay(query);
  });
}

function filterAndDisplay(query) {
  if (!query) {
    displayCollegesInGrid(allColleges);
    return;
  }
  const filtered = allColleges.filter(college => {
    return (
      college.colleges.toLowerCase().includes(query) ||
      (college.location && college.location.toLowerCase().includes(query)) ||
      (college.esports_name && college.esports_name.toLowerCase().includes(query))
    );
  });
  displayCollegesInGrid(filtered);
};
