# ✨ ValidPanel Backend: Powering Your SMM Panel with Express.js! 🚀

A robust and efficient backend built with Express.js, designed to handle user authentication, panel management, and data persistence for your social media marketing (SMM) panel.

## 🛠️ Installation

Get started by setting up the project locally. Follow these steps:

- ⬇️ **Clone the Repository**:

```bash
git clone https://github.com/thevalidcode/validpanel-backend.git
```

- 📂 **Navigate to the Project Directory**:

```bash
cd validpanel-backend
```

- 📦 **Install Dependencies**:

```bash
npm install
```

- ⚙️ **Environment Configuration**:

  - Create a `.env` file in the root directory.
  - Add the following environment variables:

```
DB_HOST=your_db_host
DB_PORT=your_db_port
VSP_DB_NAME=your_vsp_db_name
VSP_DB_USER=your_vsp_db_user
VP_DB_NAME=your_vp_db_name
VP_DB_USER=your_vp_db_user
DB_PASSWORD=your_db_password
NODE_ENV=development (or production)
```

- 🚀 **Run the Application**:

```bash
npm start
```

## ⚙️ Environment Variables

| Variable      | Description           | Example                       |
| :------------ | :-------------------- | :---------------------------- |
| `DB_HOST`     | Database host address | `localhost`                   |
| `DB_PORT`     | Database port number  | `5432`                        |
| `VSP_DB_NAME` | Valid Panel DB Name   | `vsp_db`                      |
| `VSP_DB_USER` | Valid Panel DB User   | `vsp_user`                    |
| `VP_DB_NAME`  | Valid Panel DB Name   | `vp_db`                       |
| `VP_DB_USER`  | Valid Panel DB User   | `vp_user`                     |
| `DB_PASSWORD` | Database password     | `secure_password`             |
| `NODE_ENV`    | Environment mode      | `development` or `production` |

## 💡 Usage

<details>
 <summary>Detailed Instructions</summary>
 
 1.  **Database Setup**:
  - Ensure you have PostgreSQL installed and configured.
  - Create the databases specified in your `.env` file (`VSP_DB_NAME` and `VP_DB_NAME`).
 
 2.  **Running in Production**:
  - If running in production (`NODE_ENV=production`), ensure you have SSL certificates set up and the correct paths in `index.js`.
 
 3. **Transferring the database:**
 - Run `transferdb.js` to import data from `fake_validpanel_db` or `/validpanel_db/` to your database.
 
 4.  **API Base URL**:
  - The base URL will depend on your environment:
  - Development: `http://localhost:3002`
  - Production: `https://validpanel.com:3002`
 </details>

## ✨ Features

- 🔒 **User Authentication**: Secure user login and authentication using bcrypt.
- 🛡️ **Admin Management**: Manage admins with login and data retrieval functionalities.
- 📦 **CRUD Operations**: Comprehensive CRUD operations for data management via API keys.
- 🌐 **DNS Management**: Automated DNS record creation and SSL certificate generation.
- 📧 **Email Notifications**: Send emails for password resets and other notifications.
- 🔄 **Cron Jobs**: Automated tasks such as SSL certificate renewal.

## ⚙️ Technologies Used

| Technology | Description                     | Link                                                                               |
| :--------- | :------------------------------ | :--------------------------------------------------------------------------------- |
| Express.js | Backend framework               | [https://expressjs.com/](https://expressjs.com/)                                   |
| PostgreSQL | Database                        | [https://www.postgresql.org/](https://www.postgresql.org/)                         |
| bcrypt     | Password hashing                | [https://www.npmjs.com/package/bcrypt](https://www.npmjs.com/package/bcrypt)       |
| Nodemailer | Email sending                   | [https://nodemailer.com/](https://nodemailer.com/)                                 |
| node-cron  | Task scheduling                 | [https://www.npmjs.com/package/node-cron](https://www.npmjs.com/package/node-cron) |
| dotenv     | Environment variable management | [https://www.npmjs.com/package/dotenv](https://www.npmjs.com/package/dotenv)       |
| cors       | Cross-origin resource sharing   | [https://www.npmjs.com/package/cors](https://www.npmjs.com/package/cors)           |
| uuid       | Generating unique IDs           | [https://www.npmjs.com/package/uuid](https://www.npmjs.com/package/uuid)           |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author Info

- Author: Ibe Precious
  - Twitter: [https://twitter.com/thevalidcode](https://twitter.com/thevalidcode)
  - LinkedIn: [https://linkedin.com/in/thevalidcode](https://linkedin.com/in/thevalidcode)
  - GitHub: [https://github.com/thevalidcode](https://github.com/thevalidcode)
