const BASE_URL = 'https://jsonplaceholder.typicode.com';

const postsContainer = document.getElementById('posts-container');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error-message');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resetBtn = document.getElementById('reset-btn');
const parallelBtn = document.getElementById('parallel-btn');
const parallelResults = document.getElementById('parallel-results');
const parallelContent = document.getElementById('parallel-content');
const detailCard = document.getElementById('detail-card');
const detailContent = document.getElementById('detail-content');
const closeDetailBtn = document.getElementById('close-detail-btn');

// Функция отображения/скрытия загрузки
function setLoading(isLoading) {
  if (isLoading) {
    loadingEl.classList.remove('hidden');
  } else {
    loadingEl.classList.add('hidden');
  }
}

// Функция показа ошибки
function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

function clearError() {
  errorEl.textContent = '';
  errorEl.classList.add('hidden');
}

// 1. Загрузка постов через fetch + async/await с обработкой ошибок
async function fetchPosts(query = '') {
  setLoading(true);
  clearError();
  detailCard.classList.add('hidden');
  parallelResults.classList.add('hidden');

  try {
    // 3. Запрос с параметром фильтрации (например, ?userId=1)
    const url = query ? `${BASE_URL}/posts?userId=${query}` : `${BASE_URL}/posts?_limit=10`;
    
    const response = await fetch(url);

    // Проверка response.ok
    if (!response.ok) {
      throw new Error(`Ошибка сервера: статус ${response.status}`);
    }

    const posts = await response.json();
    renderPosts(posts);
  } catch (error) {
    showError(`Не удалось загрузить данные: ${error.message}. Проверьте подключение к сети.`);
    postsContainer.innerHTML = '';
  } finally {
    setLoading(false);
  }
}

// Рендеринг списка постов
function renderPosts(posts) {
  postsContainer.innerHTML = '';

  if (posts.length === 0) {
    postsContainer.innerHTML = '<p>Посты не найдены.</p>';
    return;
  }

  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post-item';
    div.innerHTML = `
      <h4>${post.title}</h4>
      <p>${post.body}</p>
      <button class="btn btn-primary" onclick="fetchPostDetails(${post.id})">Подробнее (ID: ${post.id})</button>
    `;
    postsContainer.appendChild(div);
  });
}

// 4. Детальный просмотр одного элемента (второй запрос по id)
async function fetchPostDetails(id) {
  setLoading(true);
  clearError();

  try {
    const response = await fetch(`${BASE_URL}/posts/${id}`);
    if (!response.ok) {
      throw new Error(`Не удалось загрузить пост (статус ${response.status})`);
    }

    const post = await response.json();
    detailContent.innerHTML = `
      <h4>${post.title}</h4>
      <p><strong>ID автора:</strong> ${post.userId}</p>
      <p>${post.body}</p>
    `;
    detailCard.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    showError(`Ошибка загрузки деталей: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

// 5. Два параллельных запроса с Promise.all
async function fetchParallelData() {
  setLoading(true);
  clearError();
  detailCard.classList.add('hidden');

  try {
    const [usersResponse, postsResponse] = await Promise.all([
      fetch(`${BASE_URL}/users/1`),
      fetch(`${BASE_URL}/posts/1`)
    ]);

    if (!usersResponse.ok || !postsResponse.ok) {
      throw new Error('Ошибка при параллельном запросе данных');
    }

    const user = await usersResponse.json();
    const post = await postsResponse.json();

    parallelContent.innerHTML = `
      <p><strong>Случайный пользователь (Promise 1):</strong> ${user.name} (${user.email})</p>
      <p><strong>Случайный пост (Promise 2):</strong> "${post.title}"</p>
    `;
    parallelResults.classList.remove('hidden');
  } catch (error) {
    showError(`Ошибка Promise.all: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

// События кнопок поиска и сброса
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) {
    fetchPosts(query);
  }
});

resetBtn.addEventListener('click', () => {
  searchInput.value = '';
  fetchPosts();
});

parallelBtn.addEventListener('click', fetchParallelData);
closeDetailBtn.addEventListener('click', () => detailCard.classList.add('hidden'));

// Первоначальная загрузка при открытии страницы
fetchPosts();