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

## Target Users

- Students seeking free meals  
- Faculty & staff on campus  
- Event organizers with leftover food  
- Sustainability initiatives & campus organizations  

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

- Node.js 
- npm or yarn  
- Expo CLI  
- Java JDK 17+  
- MySQL  

---

### 1. Clone the Repository

```bash
git clone https://github.com/Creighton4Good/Team-CUFF.git
cd cuff-app
```

---

### 2. Setup Frontend

```bash
cd frontend
npm install
npx expo start
```

Then scan the QR code using Expo Go or run on an emulator.

---

### 3. Setup Backend

```bash
cd backend
```

Update `application.properties` with your MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cuff
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

Run the backend:

```bash
./mvnw spring-boot:run
```

---

## Database Setup

Create a MySQL database:

```sql
CREATE DATABASE cuff;
```

Tables will auto-generate on startup *(if JPA/Hibernate is configured)*.

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

---

## Team

Developed by Creighton University students to address food waste and improve access to meals on campus.
