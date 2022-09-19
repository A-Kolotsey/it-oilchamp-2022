# it-oilchamp-2022
Решение кейса IT-чемпионата нефтяной отрасли от команды BelOil.TU
____
## Запуск проекта
### Для запуска потребуется
* Операционная система: `Linux`. При разработке использовалась CentOS 7.
* СУБД: `PostgreSQL`. При разработке использовалась PostgreSQL 11.12
* Резидентная СУБД: `REDIS`. При разработке использовалась redis-3.2.127
* JavaScript-окружение: `Node.js`. При разработке использовалась node v12.22.12
____
### Подготовка к запуску
1. Сделать клон репозитория (предпологается /opt/itcase).  
2. Установить REDIS `sudo yum install redis`
2. Установить Node.js `sudo yum install nodejs`
3. Развернуть дамп данных в PostgreSQL (предпологается что PostgreSQL уже установлена). Находится `/opt/itcase/install/itcase.7z`
    * В СУБД должен быть пользователь (предпологается user_itcase с паролем itcase) 
    * Создана база данных (предпологается itcase) на которую у пользователя есть полные права.
4. Редактируем конфик подключения к PostgreSQL. Находится `/opt/itcase/nodejs-srv/pg_config.json`
5. Запуск Back-End 
    * Вариант 1: В консоли сервера из папки `/opt/itcase/nodejs-srv/` командой node `./srv.js`
    * Вариант 2: Запуск как сервис. Создать в `/etc/systemd/system/<имя сервиса>.service` или скопировать из `/opt/itcase/install/nodejs-srv-itcase.service`
    * После удачного запуска в консоли выводятся два сообщения `: Сервер стартовал!` и `: REDIS connected`
    * Интерфейс будет доступен по адресу `http://<имя сервера>:8080/itcase/`
____
## Демонстрация
Для тестирования развернут интерфейс по адресу [https://dev.beloil.by/tudev/itcase/](https://dev.beloil.by/tudev/itcase/)

Для входа созданы пользователи:
+ Со стороны организации заказчика
    - Имя пользователя: `corp_user`
    - Пароль: `corp`
    - Имя пользователя: `corp_user2`
    - Пароль: `corp`
+ Со стороны подрядной организации
    - Имя пользователя: `contr_user`
    - Пароль: `contr`
    - Имя пользователя: `contr_user2`
    - Пароль: `contr`

В зависимости от выбора пользователя доступны разные ветки интерфейса, разные возможности на back-end и выбираются разные данные из базы