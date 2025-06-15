const tabsContainer = document.querySelector(".tabs");
const contentDiv = document.querySelector(".content");
let currentTabIndex = -1;

const tabs = [];

tabs.push({
	"name": "Past subscribed events",
	"content": async function() {
		const target = "past";
		let pastEvents = await fetchTargetEvents(target);
    pastEvents = await addNumParts(pastEvents);
		return renderEvents(pastEvents, target);
	}
});

tabs.push({
	"name": "Today's subscribed events",
	"content": async function () {
		const target = "today";
		let todayEvents = await fetchTargetEvents(target);
    todayEvents = await addNumParts(todayEvents);
		return renderEvents(todayEvents, target);
	}
});

tabs.push({
	"name": "Upcoming subscribed events",
	"content": async function () {
		const target = "upcoming";
		let upcomingEvents = await fetchTargetEvents(target);
    upcomingEvents = await addNumParts(upcomingEvents);
		return renderEvents(upcomingEvents, target);
	}
});

function renderEvents(events, target) {
  const content = document.createElement("div");
  content.classList.add("events");

  if (events.length === 0) {
		content.innerHTML = `<p>There are no ${target} events you are registered for.</p>`;
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

async function fetchTargetEvents(target) {
  try {
		const res = await fetch(`/api/events/subscribed/${target}.json`);
		const data = await res.json();
		return data;
  }
  catch (err) {
		console.error("Errore nel fetch:", err);
		return [];
  }
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