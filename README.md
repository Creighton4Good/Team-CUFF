# CUFF – Creighton University Food Finder  
*A React Native + Spring Boot application reducing food waste and improving student access to leftover food on campus.*

---

## Overview

CUFF is a mobile application designed for Creighton University to help students quickly locate leftover food available on campus after events. Student organizations often have surplus food but no centralized way to notify students — leading to unnecessary waste and missed opportunities for students facing food insecurity.

CUFF provides:

- A **real-time dashboard** of available food events  
- **In-app notifications** when new food is posted  
- **Dietary filtering** (gluten-free, dairy-free, nut-free, vegan/vegetarian)  
- **Admin tools** to post events instantly  
- A full **authentication system** for secure access  

This repository contains the full prototype built with **React Native (Expo)** and **Spring Boot + MySQL**.

---

## Features

### **For Students**
- Create an account with email verification  
- Sign in, sign out, change password, reset password  
- Choose notification preferences  
- View available food listings in real time  
- Filter posts by dietary needs  
- Receive in-app notifications when admins post new events  

### **For Admins**
- Post new food events  
- Upload event information and images  
- View event analytics (total posts, active posts, locations)  
- Delete events  
- Manage notifications generated for users  

---

## Frontend (React Native with Expo)

### **Tech Stack**
- **React Native & Expo** – cross-platform development  
- **Expo Router** – file-based navigation  
- **Clerk** – authentication, email verification, password reset  
- **AsyncStorage** – dietary preferences stored locally  
- **TypeScript** – type safety  
- **Fetch API** – communication with backend  
- **Expo SecureStore** – encrypted token storage  
- **React Navigation** – themes and tabs  
- **Creighton brand styling** – theme.ts for color consistency  

### **Folder Structure**

app/
  (auth)/
    _layout.tsx
    forgot-password.tsx
    sign-in.tsx
    sign-up.tsx
  (tabs)/
    _layout.tsx
    admin.tsx
    index.tsx
    preferences.tsx
  _layout.tsx
  change-password.tsx
  modal.tsx

hooks/
  UserContext.tsx

lib/
  api.ts

constants/
  theme.ts

### **Core Frontend Features**
- File-based routing with protected routes  
- Dashboard showing active food events  
- Admin dashboard for posting events  
- Preferences screen with dietary filters and notification type selection  
- UserContext merges Clerk authentication with backend user record  
- Realtime filtering using FlatList  
- Consistent Creighton-branded UI  

---

## Backend (Spring Boot + MySQL)

### **Tech Stack**
- Spring Boot  
- JPA + Hibernate ORM  
- MySQL database  
- RESTful API design  
- Notification table for in-app alerts  

### **Main Endpoints**
GET /api/posts
POST /api/posts
DELETE /api/posts/{id}

GET /api/users/{id}
GET /api/users/email/{email}
PUT /api/users/preferences/{id}

GET /api/notifications/user/{userId}
POST /api/notifications/send

Backend responsibilities:
- Stores all user, event, and notification data  
- Determines admin roles  
- Generates notifications when new events are posted  
- Serves JSON responses to Expo app  

---

## Installation & Setup

### **1. Clone repository**
```bash
git clone <your-repo-url>
cd CUFF
```
## Frontend Setup

### Install dependencies

Run the following command inside the project root:

    npm install

### Add environment variables

Create a file named `.env` in the project root with:

    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here

Replace `your_key_here` with the publishable key from your Clerk dashboard.

### Configure API base URL (IMPORTANT for device testing)

In `lib/api.ts`, update the base URL to match **your machine’s local IP address**:

    const API_BASE_URL = "http://YOUR_LOCAL_IP:8080";

To find your IP:

- On macOS: `System Settings → Network → Wi-Fi → IP Address`
- Or run `ipconfig getifaddr en0` in the Terminal

This step is required because Expo Go on a physical device **cannot reach** `localhost` — it must connect to your laptop’s local network IP.

### Start the Expo development server

    npx expo start

You can now run the app on:

- iOS Simulator  
- Android Emulator  
- Expo Go on your physical device  


## Backend Setup

### Navigate to the backend

    cd spring

### Configure MySQL connection

Open `src/main/resources/application.properties` and update:

    spring.datasource.url=jdbc:mysql://localhost:3306/cuff
    spring.datasource.username=root
    spring.datasource.password=your_mysql_password

    spring.jpa.hibernate.ddl-auto=update
    spring.jpa.show-sql=true

Ensure your MySQL server is running locally.

### Start the Spring Boot backend

    mvn spring-boot:run

The backend will run at:

    http://localhost:8080


## Current Limitations

- Admin role detection works, but full role-based access control will be expanded in future versions.  
- Notifications are stored and displayed in-app, but push notifications and SMS delivery are not yet implemented.  
- Dietary preferences are stored locally using AsyncStorage and are not yet synced back to the backend.  
- Images are referenced by URL and are not yet uploaded to a persistent hosting service directly from the app.  
- Some analytics on the admin dashboard (for example, breakdowns by location over time) are placeholders that will be expanded in a production release.  


## Future Enhancements

- Expo push notifications for real-time alerts  
- SMS notifications (e.g., via Twilio)  
- Calendar integration so students can add events to their device calendars  
- Backend storage and syncing of dietary preferences and notification settings  
- Richer admin analytics (usage, waste reduction metrics, event engagement)  
- Migration from Clerk to Creighton’s official SSO system  
- Accessibility improvements (larger text presets, better screen reader support)  
- Role expansion for student organization leaders to post events directly  


## Team Members

- **Erika Germinario**  
- **Becca Borgmeier**  
- **Malaynee Opocensky**  


## References

Full ACM-formatted references for external libraries, documentation, and data sources are included in the written project report (e.g., React Native, Expo, Clerk, Spring Boot, MySQL, Food Recovery Network, ReFED, and Creighton brand guidelines).


## License

Developed as part of **CSC 318 – Mobile App Development** at Creighton University.  
This project is intended for educational and non-commercial use.

