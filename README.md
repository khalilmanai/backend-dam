<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>


# Project Management Backend

This repository contains the backend services for the Project Management mobile application. The backend is built with **NestJS** and provides a robust and scalable API to support mobile clients developed with **Jetpack Compose** (Android) and **SwiftUI** (iOS).

## Features

- **User Authentication**: Secure user registration and login with JWT.
- **Project Management**: Create, manage, and delete projects.
- **Task Management**: Assign, update, and track tasks.
- **Team Collaboration**: Add team members and manage roles.
- **Real-Time Updates**: WebSocket support for live updates.
- **API Documentation**: Comprehensive API documentation with Swagger.

## Technologies Used

### Backend
- **NestJS**: A progressive Node.js framework for building efficient, scalable server-side applications.
- **MongoDB Compass**: GUI for MongoDB to visualize and manage database content.
- **Swagger**: For generating API documentation.
  
### Frontend (Mobile Clients)
- **Jetpack Compose**: Modern UI toolkit for building native Android interfaces.
- **SwiftUI**: Declarative framework for building native iOS interfaces.

## Installation

### Prerequisites

- Node.js (>= v18.x.x)
- MongoDB (locally or MongoDB Atlas)
- NestJS CLI (optional but recommended: `npm install -g @nestjs/cli`)

### Clone the Repository

```bash
git clone https://github.com/khalilmanai/backend-dam.git
cd project-management-backend
