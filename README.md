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

Follow these steps to run CUFF on your phone using Expo Go.

### Prerequisites

Make sure you have installed:
- Node.js (LTS recommended)
- Expo Go app (iOS or Android)
- Java JDK 17+
- MySQL Server
- Maven

---

## Important: Same Wi-Fi Network

Your **computer and phone must be connected to the same Wi-Fi network** so the mobile app can communicate with the backend.

---

## Step 1: Find Your Computer’s IP Address

You must use your computer’s **local IP address**, NOT `localhost`.

### macOS
1. Open **System Settings**
2. Go to **Network**
3. Select **Wi-Fi → Details**
4. Find **IP Address**  
   Example: `192.168.1.42`

### Windows
1. Open Command Prompt
2. Run:
```code
ipconfig
```
3. Find **IPv4 Address**
   Example: `192.168.1.42`

---

## Step 2: Update API URL

Open:
```
lib/api.ts
```

Update the base URL:

```ts
const API_BASE_URL = "http://YOUR_IP_ADDRESS:8080";
```

Example:

```ts
const API_BASE_URL = "http://192.168.1.42:8080";
```

Do **NOT** use `localhost` when running on a physical device.

---

## Step 3: Start the Backend (Spring Boot)

Open a terminal window and navigate to the backend:

```bash
cd spring
```

Start the Spring Boot server:

```bash
mvn spring-boot:run
```

Backend runs at:

```
http://localhost:8080
```

---

## Step 4: Start the Mobile App (Expo)

Open a **second terminal window** from the project root and run:

```bash
npx expo start
```

This will display a QR code in your terminal/browser.

---

## Step 5: Run on Your Phone (Expo Go)

1. Open **Expo Go**
2. Scan the QR code
3. The CUFF app should load automatically

---

## Test Login (Development Only)

Use the following credentials for testing:

- Email: `emg03814@creighton.edu`
- Password: `TestPassWord123!!!`

---

## Troubleshooting

### App cannot connect to backend
- Confirm phone & computer are on the same Wi-Fi
- Verify the IP address in `lib/api.ts`
- Ensure the backend is running

### Expo loads but no data appears
- Restart Expo (`Ctrl + C` then `npx expo start`)
- Check the backend terminal for incoming requests
- Re-check the API URL

### Backend won’t start
- Ensure MySQL is running
- Verify database credentials in  
  `spring/src/main/resources/application.properties`

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
