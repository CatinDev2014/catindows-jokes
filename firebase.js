// TODO: не трогать, работает
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getDatabase, ref, push, onValue, set, get } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB0r-I2FXDY4tvvj3TanYcpCJQf_CzOQFo",
  authDomain: "catindows-all.firebaseapp.com",
  databaseURL: "https://catindows-all-default-rtdb.firebaseio.com",
  projectId: "catindows-all",
  storageBucket: "catindows-all.firebasestorage.app",
  messagingSenderId: "361226897106",
  appId: "1:361226897106:web:1f0502a53f4e07b0ae0f0b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let cloudJokesLoaded = false;
let isRegisterMode = false; // Флаг: сейчас мы регистрируемся или входим?

document.addEventListener("DOMContentLoaded", () => {
  const authContent = document.getElementById("authContent");
  const authFormBlock = document.getElementById("authFormBlock");
  
  const addJokeBtnBlock = document.getElementById("addJokeBtnBlock");
  const btnShowAddJoke = document.getElementById("btnShowAddJoke");
  const jokeModal = document.getElementById("jokeModal");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const btnAddJoke = document.getElementById("btnAddJoke");

  // Поля формы
  const authNickname = document.getElementById("authNickname");
  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const btnLogin = document.getElementById("btnLogin");
  const btnRegister = document.getElementById("btnRegister");
  const authError = document.getElementById("authError");
  const toggleAuthMode = document.getElementById("toggleAuthMode");

  const newJokeText = document.getElementById("newJokeText");
  const newJokeTags = document.getElementById("newJokeTags");
  const addJokeStatus = document.getElementById("addJokeStatus");

  // --- ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ ---
  if (toggleAuthMode) {
    toggleAuthMode.onclick = (e) => {
      e.preventDefault();
      isRegisterMode = !isRegisterMode;
      
      if (isRegisterMode) {
        // Режим регистрации
        authNickname.style.display = "block";
        btnLogin.style.display = "none";
        btnRegister.style.display = "block";
        toggleAuthMode.textContent = "Уже есть аккаунт? Войти";
      } else {
        // Режим входа
        authNickname.style.display = "none";
        btnLogin.style.display = "block";
        btnRegister.style.display = "none";
        toggleAuthMode.textContent = "Нет аккаунта? Зарегистрироваться";
      }
      authError.textContent = "";
    };
  }

  // --- АВТОРИЗАЦИЯ ---
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Пользователь вошел
      let displayName = user.email;
      
      // Пытаемся достать ник из базы данных
      try {
        const userRef = ref(db, 'users/' + user.uid);
        const snapshot = await get(userRef);
        if (snapshot.exists() && snapshot.val().nickname) {
          displayName = snapshot.val().nickname;
        }
      } catch (e) {
        console.warn("Не удалось загрузить ник:", e);
      }

      if (authContent) {
        authContent.innerHTML = `<p style="font-size: 11px; color: green;">✅ Вошел: <strong>${displayName}</strong></p><button id="btnLogout" style="margin-top:5px; width:100%;">Выйти</button>`;
        document.getElementById("btnLogout").onclick = () => signOut(auth);
      }
      
      if (authFormBlock) authFormBlock.style.display = "none";
      if (addJokeBtnBlock) addJokeBtnBlock.style.display = "block";
    } else {
      // Пользователь вышел
      if (authContent) {
        authContent.innerHTML = `<button id="showAuthBtn" style="width:100%;">Войти / Регистрация</button>`;
        document.getElementById("showAuthBtn").onclick = () => {
          if (authFormBlock) authFormBlock.style.display = "block";
          if (authContent) authContent.innerHTML = `<p style="font-size: 11px; color: gray;">Введите данные в форме ниже</p>`;
        };
      }
      
      if (authFormBlock) authFormBlock.style.display = "none";
      if (addJokeBtnBlock) addJokeBtnBlock.style.display = "none";
      if (jokeModal) jokeModal.classList.remove("active");
      
      // Сбрасываем на режим входа
      isRegisterMode = false;
      if (authNickname) authNickname.style.display = "none";
      if (btnLogin) btnLogin.style.display = "block";
      if (btnRegister) btnRegister.style.display = "none";
      if (toggleAuthMode) toggleAuthMode.textContent = "Нет аккаунта? Зарегистрироваться";
    }
  });

  if (btnLogin) {
    btnLogin.onclick = () => {
      authError.textContent = "";
      signInWithEmailAndPassword(auth, authEmail.value, authPassword.value)
        .catch(err => authError.textContent = "Ошибка входа: " + err.message);
    };
  }

  if (btnRegister) {
    btnRegister.onclick = async () => {
      authError.textContent = "";
      const nickname = authNickname.value.trim();
      
      if (!nickname) {
        authError.textContent = "Придумайте никнейм!";
        return;
      }

      try {
        // Создаем пользователя
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail.value, authPassword.value);
        
        // Сохраняем ник в базу по UID пользователя
        await set(ref(db, 'users/' + userCredential.user.uid), {
          nickname: nickname,
          email: authEmail.value
        });
        
        // Обновляем интерфейс принудительно, так как onAuthStateChanged может сработать до сохранения ника
        // (но обычно Firebase успевает, либо мы просто перезагрузим ник в onAuthStateChanged)
      } catch (err) {
        authError.textContent = "Ошибка регистрации: " + err.message;
      }
    };
  }

  // --- МОДАЛЬНОЕ ОКНО ---
  if (btnShowAddJoke) {
    btnShowAddJoke.onclick = () => {
      jokeModal.classList.add("active");
      addJokeStatus.textContent = "";
    };
  }

  if (btnCloseModal) {
    btnCloseModal.onclick = () => jokeModal.classList.remove("active");
  }

  if (jokeModal) {
    jokeModal.onclick = (e) => {
      if (e.target === jokeModal) jokeModal.classList.remove("active");
    };
  }

  // --- ШУТКИ ---
  function loadCloudJokes() {
    const jokesRef = ref(db, 'jokes');
    onValue(jokesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data || cloudJokesLoaded) return;
      
      const cloudJokes = Object.values(data).filter(item => item && item.text);
      
      if (cloudJokes.length > 0 && window.JOKES) {
        window.JOKES = window.JOKES.concat(cloudJokes);
        if (window.redrawJokes) window.redrawJokes();
        cloudJokesLoaded = true;
      }
    }, (error) => {
      if (authContent && !auth.currentUser) {
        authContent.innerHTML = `<p style="font-size: 11px; color: red;">⚠️ Офлайн-режим</p>`;
      }
    });
  }

  if (btnAddJoke) {
    btnAddJoke.onclick = () => {
      const text = newJokeText.value.trim();
      const tagsStr = newJokeTags.value.trim();
      
      if (!text) {
        addJokeStatus.textContent = "Текст не может быть пустым";
        addJokeStatus.style.color = "red";
        return;
      }

      const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(t => t) : [];
      addJokeStatus.textContent = "Отправка...";
      addJokeStatus.style.color = "var(--text-main)";
      
      push(ref(db, 'jokes'), {
        text: text,
        tags: tags,
        author: auth.currentUser.email, // Оставляем email для истории
        timestamp: Date.now()
      }).then(() => {
        addJokeStatus.textContent = "✅ Шутка добавлена!";
        addJokeStatus.style.color = "green";
        newJokeText.value = "";
        newJokeTags.value = "";
        
        cloudJokesLoaded = false; 
        loadCloudJokes();
        
        setTimeout(() => jokeModal.classList.remove("active"), 1500);
      }).catch(err => {
        addJokeStatus.textContent = "❌ Ошибка: " + err.message;
        addJokeStatus.style.color = "red";
      });
    };
  }

  loadCloudJokes();
});