const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");
const pgSession = require("connect-pg-simple")(session);
const { vp_pool } = require("./db");

const usersRouter = require("./routes/user");
const adminsRouter = require("./routes/admin");
const crudRouter = require("./routes/crud");
const { panel } = require("./routes/panel");

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(
  session({
    store: new pgSession({
      pool: vp_pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Public routes
app.use("/user", usersRouter);
app.use("/admin", adminsRouter);
app.use("/panel", panel);
app.use("/crud", crudRouter);

// ----------- Swagger Setup -------------
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Valid Panel Core API Documentation",
      version: "1.0.0",
      description:
        "This is the official API documentation for the core Valid Panel platform. It covers all essential user and admin endpoints, including store creation, CRUD operations, authentication, customer support, and complete store management features.",
      contact: {
        name: "Valid Code",
        url: "https://linkedin.com/in/thevalidcode",
        email: "thevalidcode@gmail.com",
      },
    },
    servers: [
      {
        url: "https://validpanel.com:3002",
        description:
          "Live server (recommended for testing production-ready endpoints)",
      },
      {
        url: "http://localhost:3002",
        description:
          "Local development server (for internal testing and development)",
      },
    ],
  },
  apis: [path.join(__dirname, "/routes/*.js")],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware to protect swagger docs for admin only
function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).send("Unauthorized. Admin login required.");
}

app.use("/admin/docs", isAdmin, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ----------- Admin Login Routes -------------

app.get("/admin/login", (req, res) => {
  res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Admin Login</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }

    .login-form {
      background: #fff;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      width: 100%;
      max-width: 400px;
    }

    .login-form h2 {
      margin-bottom: 1.5rem;
      color: #333;
      text-align: center;
    }

    .form-group {
      margin-bottom: 1.2rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    input:focus {
      border-color: #6a0dad;
      outline: none;
    }

    button {
      width: 100%;
      padding: 0.75rem;
      background: #6a0dad;
      color: white;
      font-size: 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    button:hover {
      background: #5800a8;
    }

    @media (max-width: 480px) {
      .login-form {
        padding: 1.5rem;
      }

      h2 {
        font-size: 1.5rem;
      }
    }
  </style>
</head>
<body>

  <form class="login-form" method="POST" action="/admin/swag-login">
    <h2>Admin Login</h2>

    <div class="form-group">
      <label for="username">Username</label>
      <input type="text" name="username" id="username" required />
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" name="password" id="password" required />
    </div>

    <button type="submit">Login</button>
  </form>

</body>
</html>

  `);
});

app.post("/admin/swag-login", (req, res) => {
  const { username, password } = req.body;
  // Replace below with your actual admin credential check (secure it properly)
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isAdmin = true;
    res.redirect("/admin/docs");
  } else {
    res.status(401).send("Invalid credentials");
  }
});

app.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

module.exports = app;
