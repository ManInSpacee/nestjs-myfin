# MyFin

Fullstack-приложение для учёта личных финансов: доходы и расходы по категориям, баланс,
сводки и фильтрация операций. Авторизация на JWT с refresh-токенами.

## Стек

**Бэкенд:** Node.js · NestJS 11 · TypeScript · Prisma 7 · PostgreSQL · Passport JWT · bcrypt

**Фронтенд:** React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router · axios

**Инфраструктура:** Docker · docker-compose · nginx (раздача статики и reverse proxy) · multi-stage сборка

## Запуск

```bash
docker compose -f docker-compose.local.yml up -d --build
```

| Сервис         | Адрес                   |
|----------------|-------------------------|
| веб-приложение | `http://localhost:8080` |
| API            | `http://localhost:3000` |
| PostgreSQL     | порт `5444`             |

Миграции применяются автоматически при старте контейнера API.

`docker-compose.yml` — конфигурация для продакшена: база внешняя, секреты передаются
через переменные окружения (`DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`).

## Архитектура

```
браузер ──► nginx (web) ──┬── /        → статика React-приложения (SPA)
                          └── /api/    → NestJS API ──► PostgreSQL
```

- **nginx** отдаёт собранный фронтенд и проксирует `/api/` на бэкенд. Фронт и API получаются
  на одном источнике, поэтому CORS не нужен.
- **API** разделён на модули: `auth`, `transactions`, `category`. Внутри каждого —
  контроллер, сервис, DTO с валидацией.
- **Запуск по порядку:** API ждёт готовности базы через healthcheck (`pg_isready`)
  и `depends_on: condition: service_healthy`, а `entrypoint.sh` повторяет `prisma migrate deploy`,
  пока база не начнёт принимать подключения.

## Авторизация

- Пароли хранятся как хеш bcrypt.
- **Access-токен** (15 минут) хранится **в памяти** фронтенда, а не в `localStorage` —
  его нельзя украсть через XSS-скрипт, читающий хранилище.
- **Refresh-токен** (7 дней) — в httpOnly-cookie, в базе хранится только его хеш.
- При загрузке страницы фронтенд делает **silent refresh**: получает новый access-токен по cookie.
- Cookie выдаётся с путём `/auth/refresh`, а браузер обращается к `/api/auth/refresh`.
  Путь переписывается в nginx через `proxy_cookie_path`, иначе браузер не отправил бы cookie.

## API

Все маршруты, кроме `/auth/register`, `/auth/login` и `/auth/refresh`, требуют access-токен.

| Метод    | Путь                        | Описание                                   |
|----------|-----------------------------|--------------------------------------------|
| `POST`   | `/auth/register`            | регистрация                                |
| `POST`   | `/auth/login`               | вход, выдача токенов                       |
| `POST`   | `/auth/refresh`             | новый access-токен по refresh-cookie       |
| `POST`   | `/auth/logout`              | выход, инвалидация refresh-токена          |
| `GET`    | `/transactions`             | список операций с фильтрами и пагинацией   |
| `GET`    | `/transactions/{id}`        | операция по id                             |
| `GET`    | `/transactions/summary`     | сводка: доходы, расходы                    |
| `GET`    | `/transactions/by-category` | суммы по категориям                        |
| `POST`   | `/transactions`             | добавить операцию                          |
| `PATCH`  | `/transactions/{id}`        | изменить операцию                          |
| `DELETE` | `/transactions/{id}`        | удалить операцию                           |
| `GET`    | `/categories`               | категории пользователя                     |
| `POST`   | `/categories`               | создать категорию                          |
| `PATCH`  | `/categories/{id}`          | переименовать категорию                    |
| `DELETE` | `/categories/{id}`          | удалить категорию                          |

## Бизнес-правила

1. **Баланс меняется атомарно вместе с операцией.** Создание, изменение и удаление операции
   и изменение баланса пользователя выполняются в одной транзакции (`prisma.$transaction`):
   либо применяются оба изменения, либо ни одно.
2. **Название категории уникально в пределах пользователя** (`@@unique([userId, name])`):
   у разных пользователей могут быть категории с одинаковым именем.
3. **Удаление категории не удаляет операции** — у них просто сбрасывается категория
   (`onDelete: SetNull`).
4. Суммы хранятся в `Decimal(15, 2)`, а не в `float`, — без ошибок округления.

## Модель данных

```
User 1 ──── N Transaction N ──── 1 Category
  └──────────────── 1 ──── N ───────┘
```

**User**

| Поле               | Тип             | Ограничения             |
|--------------------|-----------------|-------------------------|
| `id`               | `uuid`          | первичный ключ          |
| `email`            | `string`        | уникальное              |
| `passwordHash`     | `string`        | хеш bcrypt              |
| `refreshTokenHash` | `string`        | необязательное          |
| `balance`          | `decimal(15,2)` | по умолчанию 0          |
| `createdAt`        | `datetime`      | по умолчанию — текущее  |

**Transaction**

| Поле              | Тип                  | Ограничения                                 |
|-------------------|----------------------|---------------------------------------------|
| `id`              | `uuid`               | первичный ключ                              |
| `type`            | `INCOME` / `EXPENSE` | обязательное                                |
| `amount`          | `decimal(15,2)`      | обязательное                                |
| `description`     | `string`             | необязательное                              |
| `transactionDate` | `datetime`           | по умолчанию — текущее                      |
| `userId`          | `uuid`               | внешний ключ на `User`, индекс              |
| `categoryId`      | `uuid`               | необязательный внешний ключ, `SET NULL`     |

**Category**

| Поле     | Тип      | Ограничения                                  |
|----------|----------|----------------------------------------------|
| `id`     | `uuid`   | первичный ключ                               |
| `name`   | `string` | уникальное в паре с `userId`                 |
| `userId` | `uuid`   | необязательный внешний ключ на `User`        |
