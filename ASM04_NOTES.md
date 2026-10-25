# ASM04 - Full-stack Quiz Application

## Architecture

```text
React + React Router + Redux Toolkit (client/)
                  |
                  | JSON + Bearer JWT
                  v
Express REST API (app.js, routes/, controllers/)
                  |
                  v
Mongoose -> MongoDB
```

The React production build is served by Express. In development, Vite runs on port 5173 and proxies `/api`, `/auth`, and `/users` to Express on port 3000.

## Assignment requirements

- Backend CRUD for Quiz and Question through Express/Mongoose.
- React frontend with Redux Toolkit state and React Router routes.
- Signup, login, logout, and protected frontend routes.
- User must log in before quizzes are fetched.
- Participant can browse and take quizzes, select answers, finish, view score, and review answers.
- Admin can CRUD quizzes and questions and view registered users.
- Bootstrap 5 styles the application; local CSS provides the product layout.

## Run

```bash
npm install
npm --prefix client install
npm run seed
npm run build
npm start
```

Open `http://localhost:3000`.

Demo accounts after `npm run seed`:

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `Admin@123` |
| Participant | `student` | `Student@123` |

For separate development servers:

```bash
npm run dev
npm run client:dev
```

Open `http://localhost:5173`.

## API access

- `POST /auth/register`, `POST /auth/login`
- Signed-in user: `GET /api/quizzes`, `GET /api/quizzes/:quizId`
- Admin: all Quiz POST/PUT/DELETE routes
- Admin: all `/api/questions` CRUD routes
- Admin: `GET /users`

Protected requests use `Authorization: Bearer <token>`.
