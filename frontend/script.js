let allColleges = [];

document.addEventListener("DOMContentLoaded", function () { 
  loadColleges();
  setupSearch();
  initMap();
  setupRegionSearchSidebar();
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

      // Sort the data (verify the property name is correct)
      data.sort((a, b) => a.colleges.localeCompare(b.colleges));

      data.forEach(college => {
        const collegeCard = createCollegeCard(college);

        // Add to carousel container (swiper)
        if (collegesList) {
          const slide = document.createElement("div");
          slide.classList.add("swiper-slide");
          slide.innerHTML = collegeCard;
          collegesList.appendChild(slide);
        }

        // Add to grid, if it exists
        if (gridContainer) {
          const gridItem = document.createElement("div");
          gridItem.classList.add("grid-item");
          gridItem.innerHTML = collegeCard;
          gridContainer.appendChild(gridItem);
        }
      });

      // Initialize Swiper for the carousel, if it exists
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

// 2. Function to render colleges in the #gridView container
function displayCollegesInGrid(colleges) {
  const gridView = document.getElementById("gridView");
  if (!gridView) return;

  // Clear existing content
  gridView.innerHTML = "";

  // Sort if needed
  colleges.sort((a, b) => a.colleges.localeCompare(b.colleges));

  // Create a card for each college
  colleges.forEach(college => {
    const cardHTML = createCollegeCard(college);
    const gridItem = document.createElement("div");
    gridItem.classList.add("grid-item");
    gridItem.innerHTML = cardHTML;
    gridView.appendChild(gridItem);
  });
}

// 3. Setup the search bar
function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  if (searchInput) {
    // Real-time filtering as user types
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();
      filterAndDisplay(query);
    });
  }

  if (searchBtn) {
    // Filter on button click
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.toLowerCase().trim();
      filterAndDisplay(query);
    });
  }
}

// 4. Filter colleges by query and re-display
function filterAndDisplay(query) {
  if (!query) {
    // Show all if empty
    displayCollegesInGrid(allColleges);
    return;
  }
  // Filter by college name, region, or esports (adjust fields as needed)
  const filtered = allColleges.filter(college => {
    return (
      college.colleges.toLowerCase().includes(query) ||
      (college.location && college.location.toLowerCase().includes(query)) ||
      (college.esports_name && college.esports_name.toLowerCase().includes(query))
    );
  });
  displayCollegesInGrid(filtered);
}
