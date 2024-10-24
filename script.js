// Базовый URL для запросов к API
const baseUrl = "https://li7scheduleapi-production.up.railway.app/api/";

// Функция получения списка уведомлений
async function fetchNotifications() {
    try {
        const response = await fetch(baseUrl + "notifications"); // Запрос к API
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return await response.json(); // Ожидаем JSON с уведомлениями
    } catch (error) {
        console.error("Ошибка при получении уведомлений:", error);
        return [];
    }
}

// Функция получения расписания дня
async function fetchDailyRoutine() {
    try {
        const response = await fetch(baseUrl + "daily_routine"); // Запрос к API
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return await response.json(); // Ожидаем JSON с распорядком дня
    } catch (error) {
        console.error("Ошибка при получении распорядка дня:", error);
        return null;
    }
}

// Функция получения полного списка уроков
async function fetchFullLessonSchedule() {
    try {
        const response = await fetch(baseUrl + "full_lesson_schedule"); // Запрос к API
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return await response.json(); // Ожидаем JSON с полным расписанием
    } catch (error) {
        console.error("Ошибка при получении полного расписания:", error);
        return null;
    }
}


// Функция для отображения уведомлений на странице
async function displayNotifications() {
    const notificationsContainer = document.getElementById('notifications-container');
    const notifications = await fetchNotifications(); // Получаем уведомления из API

    if (!notifications || notifications.length === 0) {
        notificationsContainer.innerHTML = '<p>Нет новых уведомлений.</p>';
        return;
    }

    // Очищаем содержимое контейнера перед вставкой данных
    notificationsContainer.innerHTML = '';

    // Создаем элементы для каждого уведомления
    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.classList.add('notification-item');
        notificationItem.innerHTML = `
            <h3>${notification.title || 'Без заголовка'}</h3>
            <p>${notification.description || 'Без содержания'}</p>
        `;

        notificationsContainer.appendChild(notificationItem); // Вставляем уведомление в контейнер
    });
}



// Функция для обновления даты и времени
function updateDateTime() {
    const dateElement = document.getElementById('current-date');
    const timeElement = document.getElementById('current-time');

    const now = new Date();
    const date = now.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const time = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    dateElement.textContent = date;
    timeElement.textContent = time;
}

// Обновляем время каждую секунду
setInterval(updateDateTime, 1000);

function formatTime(isoString) {
    return isoString ? isoString : 'Время не указано';
}

// Функция для отображения распорядка дня на странице
async function displayDailyRoutine() {
    const routineDiv = document.getElementById('daily-routine');
    const routine = await fetchDailyRoutine(); // Получаем распорядок дня с API

    if (!routine || !Array.isArray(routine) || routine.length === 0) {
        routineDiv.textContent = 'Распорядок дня недоступен.';
        return;
    }

    // Очищаем содержимое перед вставкой
    routineDiv.innerHTML = '<h3>Распорядок дня:</h3>';

    // Проходим по каждому уроку и выводим его красиво
    routine.forEach(lesson => {
        const lessonElement = document.createElement('p');

        // Просто отображаем время начала и окончания, как оно есть
        const startTime = formatTime(lesson.start_time);
        const endTime = formatTime(lesson.end_time);

        // Пример вывода: "Математика — 08:00 до 09:00"
        lessonElement.textContent = `${lesson.name}: ${startTime} - ${endTime}`;

        routineDiv.appendChild(lessonElement);
    });
}

// Запуск функций при загрузке страницы
window.addEventListener('DOMContentLoaded', async () => {
    await displayDailyRoutine(); // Отображаем распорядок дня
});

// Добавляем распорядок дня в элемент div


// Функция для скрытия лоадера и показа контента
function hideLoader() {
    const loader = document.getElementById('loader');
    const mainContent = document.getElementById('main-content');
    loader.style.display = 'none'; // Скрываем лоадер
    mainContent.style.display = 'block'; // Показываем основной контент
}


// Функция для отображения даты и расписания уроков на странице
async function displayLessonSchedule() {
    const timetableDiv = document.getElementById('timetable');
    const dateHeading = document.getElementById('date-heading');
    const today = new Date(); // Получаем текущую дату
    const weekday = today.getDay(); // Номер дня недели (0 - воскресенье, 1 - понедельник, и т.д.)
    
    const schedule = await fetchFullLessonSchedule(); // Получаем полное расписание с API

    if (!schedule || schedule.length === 0) {
        timetableDiv.innerHTML = '<p>Не удалось загрузить расписание.</p>';
        return;
    }

    // Найдем расписание для текущего дня недели
    const todaySchedule = schedule.find(day => day.weekday === weekday);
    
    if (!todaySchedule || !todaySchedule.lessons.length || !todaySchedule.lessons[0].lessons.length) {
        timetableDiv.innerHTML = '<p>Расписание на сегодня отсутствует.</p>';
        return;
    }

    // Устанавливаем текущую дату в заголовок
    const formattedDate = today.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    dateHeading.textContent = `Расписание на ${formattedDate}`;

    // Очищаем содержимое div перед вставкой данных
    timetableDiv.innerHTML = '';

    // Создаем таблицу для расписания уроков
    const table = document.createElement('table');
    
    // Проходим по каждому классу и добавляем строки для класса и его уроков
    todaySchedule.lessons.forEach(lesson => {
        // Строка с номером класса
        const classRow = document.createElement('tr');
        const classCell = document.createElement('th');
        classCell.textContent = lesson.class || "Не указано";
        classCell.colSpan = 2; // Объединяем две колонки (для предметов и кабинетов)
        classRow.appendChild(classCell);
        table.appendChild(classRow);

        // Строки с предметами и кабинетами для текущего класса
        lesson.lessons.forEach(l => {
            const lessonRow = document.createElement('tr');
            const subjectCell = document.createElement('td');
            const classroomCell = document.createElement('td');

            subjectCell.textContent = l.name || "Без названия";
            classroomCell.textContent = l.classroom || "Не указано";

            lessonRow.appendChild(subjectCell);
            lessonRow.appendChild(classroomCell);
            table.appendChild(lessonRow);
        });
    });

    // Вставляем таблицу в контейнер расписания
    timetableDiv.appendChild(table);
}




// Запуск функций при загрузке страницы
window.addEventListener('DOMContentLoaded', async () => {
    updateDateTime(); // Запускаем обновление даты и времени

    await displayNotifications(); // Отображаем уведомления
    await displayDailyRoutine(); // Отображаем распорядок дня
    await displayLessonSchedule(); // Отображаем расписание уроков
    await hideLoader(); // Скрываем лоадер после загрузки данных
});

// Базовый URL для запросов к API

// URL для погоды (замените на свой API ключ)
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?q=Kazan&appid=a085877b6e1ad5171ee38632eab7e1ec&units=metric&lang=ru";

// Функция получения списка уведомлений
async function fetchNotifications() {
    try {
        const response = await fetch(baseUrl + "notifications"); // Запрос к API
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return await response.json(); // Ожидаем JSON с уведомлениями
    } catch (error) {
        console.error("Ошибка при получении уведомлений:", error);
        return [];
    }
}

// Функция получения данных о погоде
async function fetchWeather() {
    try {
        const response = await fetch(weatherApiUrl); // Запрос к API погоды
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return await response.json(); // Ожидаем JSON с данными о погоде
    } catch (error) {
        console.error("Ошибка при получении погоды:", error);
        return null;
    }
}

// Функция для отображения уведомлений
async function displayNotifications() {
    const notificationsContainer = document.getElementById('notifications-container');
    const notifications = await fetchNotifications(); // Получаем уведомления из API

    if (!notifications || notifications.length === 0) {
        notificationsContainer.innerHTML = '<p>Нет новых уведомлений.</p>';
        return;
    }

    // Очищаем содержимое контейнера перед вставкой данных
    notificationsContainer.innerHTML = '';

    // Создаем элементы для каждого уведомления
    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.classList.add('notification-item');
        notificationItem.innerHTML = `
            <h3>${notification.title || 'Без заголовка'}</h3>
            <p>${notification.description || 'Без содержания'}</p>
        `;

        notificationsContainer.appendChild(notificationItem); // Вставляем уведомление в контейнер
    });
}

// Функция для отображения погоды
async function displayWeather() {
    const notificationsContainer = document.getElementById('notifications-container');
    const weatherData = await fetchWeather(); // Получаем данные о погоде из API

    if (!weatherData) {
        notificationsContainer.innerHTML = '<p>Не удалось загрузить данные о погоде.</p>';
        return;
    }

    // Очищаем контейнер перед вставкой данных о погоде
    notificationsContainer.innerHTML = `
        <h3>${weatherData.name}</h3>
        <p class="weather">${weatherData.main.temp}°C</p>
    `;
}

// Функция для чередования уведомлений и погоды
function toggleNotificationsAndWeather() {
    let showWeather = true;

    setInterval(async () => {
        const notificationsContainer = document.getElementById('notifications-container');
        notificationsContainer.style.opacity = 0; // Плавное исчезновение

        setTimeout(async () => {
            if (showWeather) {
                await displayWeather(); // Отображаем погоду
            } else {
                await displayNotifications(); // Отображаем уведомления
            }

            showWeather = !showWeather; // Переключаем флаг

            notificationsContainer.style.opacity = 1; // Плавное появление
        }, 1000); // Время для плавного перехода
    }, 10000); // Интервал смены каждые 10 секунд
}

// Запуск функций при загрузке страницы
window.addEventListener('DOMContentLoaded', async () => {
    await displayNotifications(); // Отображаем уведомления по умолчанию
    toggleNotificationsAndWeather(); // Запускаем чередование уведомлений и погоды
});
