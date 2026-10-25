// TODO: не трогать, работает
// Делаем JOKES глобальной, чтобы firebase.js мог её дополнять
window.JOKES = window.JOKES || JOKES;

document.addEventListener("DOMContentLoaded", () => {
  let activeTag = null;
  let searchQuery = "";

  const jokesEl = document.getElementById("jokes");
  const tagsEl = document.getElementById("tags");
  const searchEl = document.getElementById("search");
  const totalCountEl = document.getElementById("totalCount");
  const visibleCountEl = document.getElementById("visibleCount");
  const randomBtn = document.getElementById("randomBtn");
  const resetBtn = document.getElementById("resetBtn");
  const mainMenuLinks = document.querySelectorAll("#mainMenu a");

  // Автоматически обновляем год в подвале
  const yearSpan = document.getElementById("currentYear");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Собираем все уникальные теги
  function getUniqueTags() {
    const tagsSet = new Set();
    window.JOKES.forEach(j => j.tags.forEach(t => tagsSet.add(t)));
    return [...tagsSet].sort();
  }

  function renderTags() {
    tagsEl.innerHTML = "";
    const allTags = getUniqueTags();
    
    const allBtn = document.createElement("button");
    allBtn.className = "tag-btn" + (activeTag === null ? " active" : "");
    allBtn.textContent = "Показать все";
    allBtn.onclick = () => { activeTag = null; updateMenuActive(); drawJokes(); };
    tagsEl.appendChild(allBtn);

    allTags.forEach(tag => {
      const btn = document.createElement("button");
      btn.className = "tag-btn" + (activeTag === tag ? " active" : "");
      btn.textContent = "# " + tag;
      btn.onclick = () => { activeTag = (activeTag === tag ? null : tag); updateMenuActive(); drawJokes(); };
      tagsEl.appendChild(btn);
    });
  }

  function updateMenuActive() {
    mainMenuLinks.forEach(link => {
      link.classList.remove("active");
      const filter = link.getAttribute("data-filter");
      if ((activeTag === null && filter === "all") || activeTag === filter) {
        link.classList.add("active");
      }
    });
  }

  function matches(joke) {
    const q = searchQuery.toLowerCase();
    const textMatch = !q || joke.text.toLowerCase().includes(q) || joke.tags.some(t => t.includes(q));
    const tagMatch = !activeTag || joke.tags.includes(activeTag);
    return textMatch && tagMatch;
  }

  // Основная функция отрисовки
  function drawJokes() {
    jokesEl.innerHTML = "";
    const visible = window.JOKES.filter(matches);

    totalCountEl.textContent = window.JOKES.length;
    visibleCountEl.textContent = visible.length;

    if (visible.length === 0) {
      jokesEl.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">По вашему запросу ничего не найдено.</div>';
    } else {
      visible.forEach(joke => {
        const div = document.createElement("div");
        div.className = "joke";
        
        const p = document.createElement("p");
        p.innerHTML = joke.text;
        div.appendChild(p);

        const tagWrap = document.createElement("div");
        tagWrap.className = "joke-tags";
        joke.tags.forEach(t => {
          const span = document.createElement("span");
          span.textContent = "#" + t;
          tagWrap.appendChild(span);
        });
        div.appendChild(tagWrap);

        jokesEl.appendChild(div);
      });
    }
    renderTags();
  }

  // Экспортируем функцию обновления, чтобы firebase.js мог вызвать её после загрузки облачных данных
  window.redrawJokes = drawJokes;

  mainMenuLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const filter = link.getAttribute("data-filter");
      activeTag = (filter === "all") ? null : filter;
      updateMenuActive();
      drawJokes();
    });
  });

  searchEl.addEventListener("input", e => {
    searchQuery = e.target.value;
    drawJokes();
  });

  randomBtn.addEventListener("click", () => {
    const visible = window.JOKES.filter(matches);
    const pool = visible.length > 0 ? visible : window.JOKES;
    const randomJoke = pool[Math.floor(Math.random() * pool.length)];
    
    const all = jokesEl.querySelectorAll(".joke");
    const idx = visible.indexOf(randomJoke);
    if (idx >= 0 && all[idx]) {
      all[idx].scrollIntoView({ behavior: "smooth", block: "center" });
      all[idx].classList.remove("highlight");
      void all[idx].offsetWidth;
      all[idx].classList.add("highlight");
      setTimeout(() => all[idx].classList.remove("highlight"), 2000);
    }
  });

  resetBtn.addEventListener("click", () => {
    searchEl.value = "";
    searchQuery = "";
    activeTag = null;
    updateMenuActive();
    drawJokes();
  });
	
  drawJokes();
    // --- УБЕГАЮЩАЯ КНОПКА ---
  const runawayBtn = document.getElementById("runawayBtn");
  
  if (runawayBtn) {
    // Функция телепортации
    const teleport = () => {
      // Делаем кнопку фиксированной, чтобы она могла летать по экрану
      runawayBtn.classList.add("teleported");
      
      // Вычисляем случайные координаты (с отступами, чтобы не улетела за край)
      const maxX = window.innerWidth - runawayBtn.offsetWidth - 20;
      const maxY = window.innerHeight - runawayBtn.offsetHeight - 20;
      
      const randomX = Math.max(20, Math.floor(Math.random() * maxX));
      const randomY = Math.max(20, Math.floor(Math.random() * maxY));
      
      runawayBtn.style.left = randomX + "px";
      runawayBtn.style.top = randomY + "px";
    };

    // Убегает при клике
    runawayBtn.addEventListener("click", (e) => {
      e.preventDefault();
      teleport();
    });

    // Убегает, если мышка подобралась слишком близко (на 50 пикселей)
    document.addEventListener("mousemove", (e) => {
      const rect = runawayBtn.getBoundingClientRect();
      
      // Центр кнопки
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      
      // Расстояние от мышки до центра кнопки
      const distX = Math.abs(e.clientX - btnCenterX);
      const distY = Math.abs(e.clientY - btnCenterY);
      
      // Если мышка ближе 50px по X и Y, и кнопка ещё не улетала
      if (distX < 50 && distY < 50 && !runawayBtn.classList.contains("teleported")) {
        teleport();
      } else if (distX < 40 && distY < 40 && runawayBtn.classList.contains("teleported")) {
        // Если она уже летает, но мышка снова подкралась - телепортируем ещё раз
        teleport();
      }
    });
  }
});