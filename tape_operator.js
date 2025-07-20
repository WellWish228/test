(function() {
    'use strict';

    /**
     * Этот плагин добавляет интеграцию с плеером Tape Operator в Lampa.
     * Он добавляет кнопку в карточку фильма/сериала, которая генерирует
     * специальную ссылку и открывает контент в плеере Tape Operator.
     *
     * @author Kirlovon (оригинальный скрипт)
     * @author Gemini (адаптация для Lampa)
     * @version 3.2.0 (версия оригинального скрипта)
     */

    // Хеш-функция, полностью идентичная той, что используется в Tape Operator.
    // Это гарантирует, что генерируемые нами ссылки будут правильными.
    function hashCode(str) {
        var hash = 0,
            i,
            chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Преобразование в 32-битное целое число
        }
        return hash;
    }

    // Функция для создания и добавления кнопки в интерфейс Lampa
    function addButton(e) {
        var movie = e.data.movie;

        // Иконка-баннер из оригинального скрипта Tape Operator
        var banner_icon_base64 = 'data:image/webp;base64,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';

        var button = $('<div class="videos__button selector" title="Tape Operator"><img src="' + banner_icon_base64 + '" style="width: 24px; height: 96px; object-fit: contain;"></div>');

        button.on('hover:enter', function() {
            var movieData = {};

            // Важно: в оригинальном скрипте название берется с веб-страницы.
            // Мы используем название из карточки Lampa. Это может вызвать
            // несовпадение хеша, если названия сильно отличаются.
            // Часто на сайтах в названии есть год, например "Фильм (2023)".
            // Попробуем добавить год, если он есть, чтобы повысить шанс совпадения.
            var title = movie.title || movie.name;
            var year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
            if (year) {
                movieData.title = title + ' (' + year + ')';
            }
            else {
                movieData.title = title;
            }

            // Выбираем первый доступный ID в порядке приоритета:
            // Кинопоиск -> IMDB -> TMDB
            if (movie.kinopoisk_id) {
                movieData.kinopoisk = String(movie.kinopoisk_id);
            } else if (movie.imdb_id) {
                movieData.imdb = movie.imdb_id;
            } else if (movie.id) {
                movieData.tmdb = String(movie.id);
            } else {
                Lampa.Noty.show('Не найден подходящий ID для Tape Operator');
                return;
            }

            // Генерируем хеш
            var data_string = JSON.stringify(movieData);
            var movie_hash = hashCode(data_string);
            var player_url = 'https://tapeop.dev/?movie=' + movie_hash;

            Lampa.Utils.openUrl(player_url, true);
        });

        e.body.find('.videos__buttons').append(button);
    }

    // Запуск плагина
    function startPlugin() {
        if (window.plugin_tape_operator_started) return;
        window.plugin_tape_operator_started = true;

        // Следим за событием отрисовки детальной карточки
        Lampa.Listener.follow('full', function(e) {
            if (e.type == 'render') {
                addButton(e);
            }
        });
    }

    // Проверяем, готова ли Lampa, и запускаем плагин
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') {
                startPlugin();
            }
        });
    }

})(); 
