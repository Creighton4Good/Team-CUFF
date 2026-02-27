# CUFF — Creighton University Food Finder

## Reducing Food Waste. Increasing Access.

CUFF (Creighton University Free Food) is a mobile application designed to reduce campus food waste while improving access to free meals for students, faculty, and staff.

Campus events often produce excess food that cannot be formally donated due to policy or safety regulations. CUFF provides a real-time platform that notifies users when leftover food is available for pickup.

---

## Features

- Real-time food availability alerts  
- Event location & pickup directions  
- Food type and quantity details  
- Push notifications for nearby food  
- Event time & pickup windows  
- Metrics dashboard for waste reduction tracking *(future feature)*  

---

## Repository Structure

```code
Team-CUFF/
│
├── app/                # Expo Router screens & navigation
├── components/         # Reusable UI components
├── lib/api.ts          # API client used by the mobile app
├── assets/             # Images & fonts
├── spring/             # Spring Boot backend
│   ├── controller/
│   ├── model/
│   ├── repository/
│   └── application.properties
│
├── package.json        # Expo app dependencies
└── README.md
```

---

## Tech Stack

### Frontend
- React Native (Expo)  
- Expo Router  
- TypeScript  

### Backend
- Spring Boot  
- MySQL  
- REST API architecture  

### Authentication
- Clerk Authentication   

---

## How It Works

1. Event organizers post leftover food availability.  
2. Users receive notifications when food is available nearby.  
3. Users view event details including:
   - location  
   - time window  
   - food type  
4. Users pick up the food before it’s gone.  

---

## Running the App Locally

### Prerequisites

Make sure you have installed:
- Node.js (LTS recommended)
- npm or yarn  
- Expo Go (mobile app) or emulator
- Java JDK 17+  
- MySQL Server

---

### 1. Clone the Repository

```bash
git clone https://github.com/Creighton4Good/Team-CUFF.git
cd Team-CUFF
```

---

### 2. Configure Environment Variables
The mobile app currently references a hard-coded backend URL.

Create a .env file in the root:
```code
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8080
```
Then update lib/api.ts:
```typescript
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
```

Use your computer's LAN IP (not localhost) for physical devices.
Android emulator: http://10.0.2.2:8080 <br>
iOS simulator: http://localhost:8080

---

### 3. Setup Backend

```bash
cd spring
```
Open:
```code
spring/src/main/resources/application.properties
```

Update credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cuff
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

## Database Setup

Create a MySQL database:

```sql
CREATE DATABASE cuff;
```

## Run backend

Mac/Linux:
```bash
./mvnw spring-boot:run
```
Windows:
```bash
mvnw spring-boot:run
```
Backend runs at:
```code
http://localhost:8080
```

---

### Start the Mobile App

From the project root:
```bash
npm install
npx expo start
```
Then:
- Scan QR code with Expo Go **OR**
- Run on emulator

---

## API Overview
Base URL:
```code
/api/posts
```
### Example Endpoints

| Method | Endpoint | Description |
|--------|---------|------------|
| GET | `/api/posts` | Retrieve active food posts |
| POST | `/api/posts` | Create a new post |
| GET | `/api/posts/user/{id}` | Get posts by user |

---

## Future Improvements

- User ratings & feedback system  
- Analytics dashboard for sustainability metrics  
- Admin moderation tools  
- Food safety & compliance tagging  
- Integration with campus event systems  

---

## Impact

CUFF promotes sustainability and food equity by:

- reducing food waste  
- supporting food-insecure students  
- increasing awareness of resource sharing  
- strengthening campus community  

---

## Contributing

We welcome contributions!

1. Fork the repository  
2. Create a new branch  
3. Commit changes  
4. Submit a pull request  

---

## License

This project is licensed under the MIT License.
