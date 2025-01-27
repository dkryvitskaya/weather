function openWeatherPage() {
    const cityInput = document.getElementById('city').value.trim();
    if (cityInput) {
        localStorage.setItem('selectedCity', cityInput);
        window.location.href = 'weather.html';
    } else {
        alert('Пожалуйста, введите название города.');
    }
}

async function showCurrentWeather() {
    
    const city = localStorage.getItem('selectedCity');
    const content = document.getElementById('content');

    if (!content) return; // Добавляем проверку на null

    try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=YOUR_API_KEY&q=${city}`);
        if (!response.ok) throw new Error('Failed to fetch weather data');

        const data = await response.json();
        content.innerHTML = `Погода в ${city}: ${data.current.temp_c}°C`;
    } catch (error) {
        content.innerHTML = 'Ошибка загрузки данных о погоде.';
    }
}

function changeCity() {
    const cityInput = document.getElementById('city-input').value.trim();
    if (cityInput) {
        localStorage.setItem('selectedCity', cityInput);
        showCurrentWeather();
    } else {
        alert('Пожалуйста, введите название города.');
    }
}

// Экспортируем функции
module.exports = { openWeatherPage, showCurrentWeather, changeCity };

// Устанавливаем город в верхний input при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const city = localStorage.getItem("selectedCity");
    if (city) {
        document.getElementById('city-input').value = city;
    }
});

function showWeatherForecast() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="forecast-menu">
            <label for="forecast-days">Выберите количество дней:</label>
            <select id="forecast-days">
                <option value="1">1 день</option>
                <option value="2">2 дня</option>
                <option value="3">3 дня</option>
                <option value="4">4 дня</option>
                <option value="5">5 дней</option>
            </select>
            <button onclick="getWeatherForecast()">Показать прогноз</button>
        </div>
        <div id="forecast-results"></div>
    `;
}

// Получение прогноза погоды
async function getWeatherForecast() {
    const days = document.getElementById('forecast-days').value;
    const city = localStorage.getItem("selectedCity");
    if (!city) {
        alert("Город не выбран.");
        return;
    }

    const apiKey = '26c726bd7955073bbe527882a23807c0'; 
    const geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

    try {
        // Получаем координаты города
        const geoResponse = await fetch(geocodingUrl);
        const geoData = await geoResponse.json();
        if (!geoData.length) {
            document.getElementById('forecast-results').innerHTML = `<p>Город не найден.</p>`;
            return;
        }

        const { lat, lon } = geoData[0];

        // Получаем прогноз погоды
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=${days * 8}&appid=${apiKey}&units=metric&lang=ru`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        if (forecastResponse.ok) {
            displayForecast(forecastData, days);
        } else {
            document.getElementById('forecast-results').innerHTML = `<p>Ошибка: ${forecastData.message}</p>`;
        }
    } catch (error) {
        document.getElementById('forecast-results').innerHTML = `<p>Ошибка загрузки данных. Попробуйте снова.</p>`;
    } 
}

// Отображение прогноза
function displayForecast(data, days) {
    const forecastDiv = document.getElementById('forecast-results');
    forecastDiv.innerHTML = `<h2>Прогноз погоды на ${days} дней</h2>`;

    const forecastHTML = data.list
        .filter((_, index) => index % 8 === 0) // Берем данные раз в сутки
        .slice(0, days) // Ограничиваем по количеству дней
        .map(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString('ru-RU');
            return `
                <div class="forecast-item">
                    <p><strong>Дата:</strong> ${date}</p>
                    <p><strong>Температура:</strong> ${item.main.temp}°C</p>
                    <p><strong>Погода:</strong> ${item.weather[0].description}</p>
                    <p><strong>Ветер:</strong> ${item.wind.speed} м/с</p>
                </div>
            `;
        })
        .join('');

    forecastDiv.innerHTML += forecastHTML;
}

// Функция для отображения меню "Исторические данные"
function showHistoricalData() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Исторические данные</h2>
        <div id="historical-menu">
            <label for="historical-date">Выберите дату:</label>
            <input type="date" id="historical-date" />
            <button onclick="getHistoricalData()">Получить данные</button>
        </div>
        <div id="historical-results"></div>
    `;
}


async function getHistoricalData() {
    const historicalResults = document.getElementById('historical-results');
    historicalResults.innerHTML = `
        <div class="forecast-item">
            <h3>Исторические данные</h3>
            <p>Функционал будет разработан позднее</p>
        </div>
    `;

    /*const apiKey = '26c726bd7955073bbe527882a23807c0';
    const city = localStorage.getItem("selectedCity");
    const selectedDate = document.getElementById('historical-date').value;

    if (!selectedDate) {
        alert("Пожалуйста, выберите дату.");
        return;
    }

    try {
        // Получаем координаты города
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData.length) {
            alert("Не удалось найти координаты города.");
            return;
        }

        const { lat, lon } = geoData[0];

        // Преобразуем дату в UNIX
        const unixDate = Math.floor(new Date(selectedDate).getTime() / 1000);

        // API для исторических данных
        const historicalUrl = `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${unixDate}&appid=${apiKey}&units=metric&lang=ru`;
        const response = await fetch(historicalUrl);
        const data = await response.json();

        if (response.ok) {
            displayHistoricalData(data, selectedDate);
        } else {
            document.getElementById('historical-results').innerHTML = `<p style="color: red;">Ошибка: ${data.message}</p>`;
        }
    } catch (error) {
        document.getElementById('historical-results').innerHTML = `<p style="color: red;">Ошибка загрузки данных. Попробуйте снова.</p>`;
    }*/
}

// Функция отображения данных
/*function displayHistoricalData(data, date) {
    const historicalResults = document.getElementById('historical-results');
    historicalResults.innerHTML = `
        <div class="forecast-item">
            <h3>Погода на ${date}</h3>
            <p><strong>Температура:</strong> ${data.current.temp}°C</p>
            <p><strong>Описание:</strong> ${data.current.weather[0].description}</p>
            <p><strong>Влажность:</strong> ${data.current.humidity}%</p>
            <p><strong>Скорость ветра:</strong> ${data.current.wind_speed} м/с</p>
        </div>
    `;
}*/
