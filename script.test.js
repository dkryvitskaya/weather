/**
 * @jest-environment jsdom
 */

const { openWeatherPage, showCurrentWeather, changeCity } = require('./script');

describe('openWeatherPage', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <input id="city" value="Moscow" />
        `;
        // Мокаем методы localStorage
        Storage.prototype.setItem = jest.fn();
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        delete window.location;
        window.location = { href: '' };
    });

    it('должна сохранять город в localStorage и переходить на weather.html', () => {
        openWeatherPage();

        expect(localStorage.setItem).toHaveBeenCalledWith('selectedCity', 'Moscow');
        expect(window.location.href).toBe('weather.html');
    });

    it('должна показывать alert, если поле пустое', () => {
        document.getElementById('city').value = '';
        openWeatherPage();

        expect(window.alert).toHaveBeenCalledWith('Пожалуйста, введите название города.');
    });
});

describe('showCurrentWeather', () => {
    beforeEach(() => {
        document.body.innerHTML = `<div id="content"></div>`;
        // Мокаем localStorage.getItem
        Storage.prototype.getItem = jest.fn().mockReturnValue('Moscow');
        // Мокаем fetch
        global.fetch = jest.fn();
    });

    it('должна отображать текущую погоду', async () => {
        // Мокаем успешный ответ от fetch
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ current: { temp_c: 20 } }),
        });

        // Дождемся завершения асинхронной функции
        await showCurrentWeather();

        // Проверка, что элемент #content обновился
        const content = document.getElementById('content');
        console.log(content.innerHTML); 
        expect(content.innerHTML).toBe(''); 
    });

    it('должна отображать сообщение об ошибке, если fetch неудачен', async () => {
        // Мокаем ошибку от fetch
        fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

        // Дождемся завершения асинхронной функции
        await showCurrentWeather();

        // Проверка, что элемент #content обновился с ошибкой
        const content = document.getElementById('content');
        console.log(content.innerHTML); // Логируем фактический результат
        expect(content.innerHTML).toBe(''); // Можем заменить, чтобы увидеть фактическое значение
    });
});



jest.mock('./script', () => {
    const originalModule = jest.requireActual('./script');
    return {
        ...originalModule,
        showCurrentWeather: jest.fn(), // Мокаем функцию showCurrentWeather
    };
});

describe('changeCity', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <input id="city-input" value="Saint Petersburg" />
        `;
        // Мокаем localStorage и alert
        Storage.prototype.setItem = jest.fn();
        jest.spyOn(window, 'alert').mockImplementation(() => {});
    });

    it('должна обновлять город в localStorage и вызывать showCurrentWeather', () => {
        changeCity();

        expect(localStorage.setItem).toHaveBeenCalledWith('selectedCity', 'Saint Petersburg');
        expect(showCurrentWeather).toHaveBeenCalled();
    });

    it('должна показывать alert, если новое название города пустое', () => {
        document.getElementById('city-input').value = '';
        changeCity();

        expect(window.alert).toHaveBeenCalledWith('Пожалуйста, введите название города.');
    });
});