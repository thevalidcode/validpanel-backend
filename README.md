# ✨ ValidPanel Backend: Your SMM Supercharger! 🚀

A robust and scalable backend built with **Express.js** and **Node.js**, designed to power your social media management panel. It handles user authentication, panel data management, and more!

## 🛠️ Installation

Get started in a few easy steps:

- ⬇️ **Clone the Repository:**

```bash
git clone https://github.com/thevalidcode/validpanel-backend.git
cd validpanel-backend
```

- 📦 **Install Dependencies:**

```bash
npm install
```

- ⚙️ **Configure Environment Variables:**

Create a `.env` file in the root directory and add the following:

```
NODE_ENV=development
#Add other necessary env variables here
```

- 🚀 **Run the Application:**

```bash
npm start
```

The server will start at `http://localhost:3002/` in development mode.

## 🔑 Environment Variables

| Variable  | Description                                   | Example                         |
| :-------- | :-------------------------------------------- | :------------------------------ |
| `NODE_ENV` | Environment mode (development or production) | `development` or `production` |

## 💻 Usage

Here are some examples to get you started:

<details>
<summary><strong>Setting up a new panel</strong></summary>

1.  Make a `POST` request to `/panel/create` with the following JSON payload:

```json
{
  "domain": "newpanel.com",
  "uid": "user_uid"
}
```

2.  The backend will create a new panel, configure the DNS, and set up the virtual host.
</details>

## ✨ Features

- ✅ **User Authentication:** Secure user login and registration.
- 🔐 **Admin Management:** Tools for managing admins and their roles.
- 🗄️ **Data Management:** Efficient CRUD operations for panel data.
- 📧 **Email Notifications:** Sends transactional emails for password resets.
- 🌐 **Domain Management:** Automated DNS configuration and SSL certificate creation.
- 🛡️ **API Key Authentication:** Secure API endpoints with key-based authentication.

## 🚀 API Documentation

### Base URL

`/`

### Endpoints

#### POST /user/create
**Request**:
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```
**Response**:
```json
{
  "user": {
    "uid": "string",
    "email": "string",
    "name": "string",
    "timestamp": "string",
    "password": "string",
    "apiKey": "string",
    "panelIds": []
  },
  "success": "User Created Successfully"
}
```
**Errors**:
- 400: Email already exists
- 500: Error creating user

#### POST /user/auth
**Request**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Response**:
```json
{
  "uid": "string",
  "email": "string",
  "name": "string",
  "timestamp": "string",
  "password": "string",
  "apiKey": "string",
  "panelIds": []
}
```
**Errors**:
- 400: Invalid Login Details

#### POST /user/data
**Request**:
```json
{
  "uid": "string"
}
```
**Response**:
```json
{
  "uid": "string",
  "email": "string",
  "name": "string",
  "timestamp": "string",
  "password": "string",
  "apiKey": "string",
  "panelIds": []
}
```
**Errors**:
- 400: Invalid Login Details

#### POST /user/forget-password
**Request**:
```json
{
  "email": "string"
}
```
**Response**:
```json
{
  "error": "Email sent successfully"
}
```
**Errors**:
- 400: User doesn't exist
- 500: Error sending email

#### POST /admin/login
**Request**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Response**:
```json
{
  "adminData": {
    "uid": "string",
    "email": "string",
    "name": "string",
    "timestamp": "string",
    "password": "string",
    "apiKey": "string"
  }
}
```
**Errors**:
- 400: Incorrect Password
- 400: Error.message

#### POST /admin/data
**Request**:
```json
{
  "uid": "string"
}
```
**Response**:
```json
{
  "adminData": {
    "uid": "string",
    "email": "string",
    "name": "string",
    "timestamp": "string",
    "password": "string",
    "apiKey": "string"
  }
}
```
**Errors**:
- 400: No UID
- 400: Error checking admin

#### POST /panel/getId
**Request**:
```json
{
  "uid": "string"
}
```
**Response**:
```json
{
  "id": "number"
}
```
**Errors**:
- 400: Missing uid
- 404: Not found

#### POST /panel/get/orders
**Request**:
```json
{
  "key": "string"
}
```
**Response**:
```json
[
  {
    "orderId": "string",
    "service": "string",
    "quantity": "number",
    "link": "string",
    "status": "string",
    "panelId": "number"
  }
]
```
**Errors**:
- 400: Unauthorized Access

#### POST /panel/get/users
**Request**:
```json
{
  "key": "string"
}
```
**Response**:
```json
[
  {
    "uid": "string",
    "email": "string",
    "name": "string",
    "timestamp": "string",
    "panelId": "number"
  }
]
```
**Errors**:
- 400: Unauthorized Access

#### POST /panel/get
**Request**:
```json
{
  "uid": "string"
}
```
**Response**:
```json
[
  {
    "value": "number",
    "label": "string"
  }
]
```
**Errors**:
- 400: Missing uid

#### POST /panel/checkuser
**Request**:
```json
{
  "uid": "string",
  "panelId": "number"
}
```
**Response**:
```json
{
  "success": "boolean"
}
```
**Errors**:
- 400: Missing uid
- 500: Internal server error

#### POST /panel/create
**Request**:
```json
{
  "domain": "string",
  "panelId": "number",
  "uid": "string"
}
```
**Response**:
```json
{
  "message": "Server created successfully",
  "panelId": "number"
}
```
**Errors**:
- 400: Missing domain

#### POST /crud/get/docs
**Request**:
```json
{
  "panelId": "string",
  "collection": "string",
  "key": "string",
  "query": {}
}
```
**Response**:
```json
[
  {
    "uid": "string",
    "otherData": "string"
  }
]
```
**Errors**:
- 400: Unauthorized Access

#### POST /crud/add/doc
**Request**:
```json
{
  "panelId": "string",
  "collection": "string",
  "data": {},
  "key": "string"
}
```
**Response**:
```json
{
  "uid": "string"
}
```
**Errors**:
- 400: Unauthorized Access

#### POST /crud/delete/doc
**Request**:
```json
{
  "panelId": "string",
  "collection": "string",
  "uid": "string",
  "key": "string"
}
```
**Response**:
```json
{
  "success": "Deleted Successfully"
}
```
**Errors**:
- 400: Unauthorized Access

#### POST /crud/update/doc
**Request**:
```json
{
  "panelId": "string",
  "collection": "string",
  "uid": "string",
  "data": {},
  "key": "string"
}
```
**Response**:
```json
{
  "success": "Updated Successfully"
}
```
**Errors**:
- 400: Unauthorized Access

#### POST /crud/add/docs
**Request**:
```json
{
  "panelId": "string",
  "collection": "string",
  "data": [],
  "key": "string"
}
```
**Response**:
```json
{
  "uid": "string"
}
```
**Errors**:
- 400: Unauthorized Access

#### POST /crud/add/sub/doc
**Request**:
```json
{
  "panelId": "string",
  "collection": "string",
  "subDocKey": "string",
  "data": {},
  "key": "string"
}
```
**Response**:
```json
{
  "uid": "string"
}
```
**Errors**:
- 400: Unauthorized Access

#### POST /crud/add/sub/docs
**Request**:
```json
{
  "panelId": "string",
  "collection": "string",
  "subDocKey": "string",
  "data": [],
  "key": "string"
}
```
**Response**:
```json
{
  "uid": "string"
}
```
**Errors**:
- 400: Unauthorized Access

#### POST /crud/delete/docs
**Request**:
```json
{
  "panelId": "string",
  "collection": "string",
  "uids": [],
  "key": "string"
}
```
**Response**:
```json
{
  "uid": "string"
}
```
**Errors**:
- 400: Unauthorized Access

#### POST /crud/delete/sub/doc
**Request**:
```json
{
  "panelId": "string",
  "collection": "string",
  "subDocKey": "string",
  "uid": "string",
  "key": "string"
}
```
**Response**:
```json
{
  "uid": "string"
}
```
**Errors**:
- 400: Unauthorized Access

#### POST /crud/delete/sub/docs
**Request**:
```json
{
  "panelId": "string",
  "collection": "string",
  "subDocKey": "string",
  "uids": [],
  "key": "string"
}
```
**Response**:
```json
{
  "uid": "string"
}
```
**Errors**:
- 400: Unauthorized Access

#### POST /crud/update/sub/doc
**Request**:
```json
{
  "panelId": "string",
  "collection": "string",
  "subDocKey": "string",
  "uid": "string",
  "data": {},
  "key": "string"
}
```
**Response**:
```json
{
  "uid": "string"
}
```
**Errors**:
- 400: Unauthorized Access

## 🧰 Technologies Used

| Technology  | Description                                                     |
| :---------- | :-------------------------------------------------------------- |
| Node.js     | The JavaScript runtime                                          |
| Express.js  | Web framework for Node.js                                       |
| bcrypt      | Password hashing library                                        |
| cors        | Middleware to enable Cross-Origin Resource Sharing             |
| dotenv      | Loads environment variables from a .env file                   |
| nodemailer  | Send emails from Node.js                                       |
| uuid        | Library for generating unique identifiers                       |

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author Info

- GitHub: [thevalidcode](https://github.com/thevalidcode)
- Twitter: [https://x.com/thevalidcode]
- LinkedIn: [https://linkedin.com/in/thevalidcode]

## 🛡️ Badges

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express.js-%23000000.svg?style=for-the-badge&logo=express&logoColor=%23FFFFFF)](https://expressjs.com/)
