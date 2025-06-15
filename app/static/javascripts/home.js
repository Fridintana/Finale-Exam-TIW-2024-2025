// JS per la ricerca per categorie

let categoryInput = document.querySelector(".search input");
const categoriesContainer = document.querySelector(".search .categories-container");
let categories = [];

categoryInput.onkeydown = (e) => {
  if (e.key === "Enter" && categoryInput.value.trim() !== "") {
    categories.push(categoryInput.value.trim());
    categoryInput.value = "";
    renderCategories();
    updateCurrentTabContent();
  }
  else if (e.key === "Escape") {
  	categoryInput.value = "";
    renderCategories();
  }
};

function renderCategories() {
  categoriesContainer.innerHTML = "";

  categories.forEach((category, idx) => {
    const tag = document.createElement("div");
    tag.classList.add("tag");
    tag.textContent = category;

    const removeBtn = document.createElement("span");
    removeBtn.classList.add("remove-btn");
    removeBtn.textContent = "✖";
    removeBtn.onclick = () => {
      categories.splice(idx, 1);
      renderCategories();
      updateCurrentTabContent();
    };

    tag.appendChild(removeBtn);

    categoriesContainer.appendChild(tag);
  });
}

// JS per i tab e il loro contenuto

const tabsContainer = document.querySelector(".tabs");
const contentDiv = document.querySelector(".content");
let currentTabIndex = -1;

const tabs = [];

tabs.push({
  "name": "Nearer events",
  "content": async function() {
    let nearestEvents = await fetchUpcomingEvents();
    nearestEvents = filterEvents(nearestEvents);
    nearestEvents = await addNumParts(nearestEvents);
    return renderEvents(nearestEvents);
  }
});

tabs.push({
  "name": "Farther events",
  "content": async function () {
    let fartherEvents = await fetchUpcomingEvents();
    fartherEvents.reverse();
    fartherEvents = filterEvents(fartherEvents);
    fartherEvents = await addNumParts(fartherEvents);
    return renderEvents(fartherEvents);
  }
});

function renderEvents(events) {
  const content = document.createElement("div");
  content.classList.add("events");

  if (events.length === 0) {
    content.innerHTML = "<p>At the moment, there are no upcoming events available.</p>";
    return content;
  }

  events.forEach(event => {
    const dateTime = new Date(event.dateTime);
    // Sistema l'ora (X - in maniera hardcoded - X)
    dateTime.setHours(dateTime.getHours() - 2);
    const strDateTime = dateTime.toLocaleString('it-IT', {
              dateStyle: 'long',
              timeStyle: 'short'
            });

    let strSeats = "";
    if (event.hasCapacity) {
      strSeats = `${event.capacity - event.nParts} / ${event.capacity}`;
    }
    else {
      strSeats = "No limit";
    }

    const catLength = event.categories.length;
    let strCategories = "";
    if (catLength !== 0) {
      strCategories = '<div><strong>Category</strong>: <div class="categories-container">';
      if (catLength >= 1) {
        strCategories += `<div class="tag">${event.categories[0]}</div>`;
      }
      if (catLength >= 2) {
        strCategories += `<div class="tag">${event.categories[1]}</div>`;
      }
      if (catLength >= 3) {
        strCategories += '<div class="tag">+</div>';
      }
      strCategories += "</div></div>";
    }

    const div = document.createElement("div");
    div.classList.add("event-card");
    div.innerHTML = `
      <h4>${event.name}</h4>
      <section class="info">
        <p>${strDateTime}</p>
        <p><strong>Location</strong>: ${event.location}</p>
        <p><strong>Seats still available</strong>: ${strSeats}</p>
        ${strCategories}
      </section>
      <a class="btn detail" href="/events/${event._id}">Detail</a>
    `;
    content.appendChild(div);
  });
  return content;
}

async function fetchUpcomingEvents() {
  try {
    const res = await fetch('/api/events/upcoming.json');
    const data = await res.json();
    return data;
  }
  catch (err) {
    console.error("Errore nel fetch:", err);
    return [];
  }
}

function filterEvents(events) {
  //console.log("Categorie");
  //console.log(categories);
	if (categories.length === 0) {
		return events;
	}

	const filteredEvents = events.filter((event) => {
    //console.log("Categorie dell'evento corrente");
    //console.log(event.categories);
		return categories.every(category => 
			event.categories.some(eventCat => eventCat.toLowerCase() === category.toLowerCase())
    );
	});
	//console.log("Eventi filtrati");
	//console.log(filteredEvents);
	return filteredEvents;
}

// Uso di Promise!!!
async function addNumParts(events) {
  await Promise.all(events.map(async (event) => {
    const res = await fetch(`/api/events/${event._id}/signups/count`);
    const data = await res.json();
    event.nParts = parseInt(data.count, 10);
  }));
  return events;
}

tabs.forEach((tab, index) => {
  let span = document.createElement("span");
  span.textContent = tab.name;
  tabsContainer.appendChild(span);

  span.onclick = async () => {
    let ts = document.querySelectorAll(".tabs span");
    ts.forEach(t => t.classList.remove("active"));
    
    span.classList.add("active");
    currentTabIndex = index;
    
    // Svuota il contenuto del contenitore degli eventi
    contentDiv.innerHTML = "";
    const content = await tab.content();
    contentDiv.appendChild(content);
    return false;
  };
});

async function updateCurrentTabContent() {
  const content = await tabs[currentTabIndex].content();
  contentDiv.innerHTML = "";
  contentDiv.appendChild(content);
}

// Aggiorna ogni 30 secondi
setInterval(() => {
  if (currentTabIndex !== -1) {
    console.log(currentTabIndex);
    updateCurrentTabContent();
  }
}, 30000);

$(".tabs span:first-child").trigger("click");
// Trigger senza jQuery
// tabsContainer.querySelector("span")?.click();

// JS per il messaggio flash

setTimeout(() => {
  const flash = document.querySelector('.flash');
  if (flash) {
    $(flash).fadeOut();
    //flash.style.display = "none";
  }
}, 8000);