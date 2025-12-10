export type EventPayload = {
  title: string;
  location: string;
  description: string;
  dietarySpecification?: string;
  availableFrom: string;
  availableUntil: string;
  imageUrl?: string;
  userId: number;
};

// Base is just host + port
const API_BASE_URL = "http://10.98.17.177:8080";

// GET /api/posts
export async function fetchEvents() {
  const url = `${API_BASE_URL}/api/posts`;
  console.log("fetchEvents ->", url);

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch events", res.status, text);
    throw new Error("Failed to fetch events");
  }
  return res.json();
}

// POST /api/posts
export async function createEvent(payload: EventPayload) {
  const url = `${API_BASE_URL}/api/posts`;
  console.log("createEvent ->", url, payload);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to create event", res.status, text);
    throw new Error("Failed to create event");
  }

  return res.json();
}

// DELETE /api/posts/{id}
export async function deleteEvent(id: number): Promise<void> {
    const url = `${API_BASE_URL}/api/posts/${id}`;
    console.log("deleteEvent ->", url);

    const res = await fetch(url, {
        method: "DELETE",
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("Failed to delete event", res.status, text);
        throw new Error("Failed to delete event");
    }
}

export async function fetchUserById(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/users/${id}`);

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch user", res.status, text);
    throw new Error("Failed to fetch user");
  }

  return res.json();
}

export type UpdatePreferencesPayload = {
  notificationType: string;
  dietaryPreferences: string;
};

// PUT /api/users/preferences/{userId}
export async function updateUserPreferences(
  userId: number,
  payload: UpdatePreferencesPayload
) {
  const url = `${API_BASE_URL}/api/users/preferences/${userId}`;
  console.log("updateUserPreferences ->", url, payload);

  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to update preferences", res.status, text);
    throw new Error("Failed to update preferences");
  }

  return res.json(); // returns updated User
}

export type Notification = {
  id: number;
  postId: number;
  userId: number;
  notificationType: string;
  messageContent: string | null;
  sentAt: string | null;
  status: string | null;
};

// GET /api/notifications/user/{userId}
export async function fetchNotificationsForUser(
  userId: number
): Promise<Notification[]> {
  const url = `${API_BASE_URL}/api/notifications/user/${userId}`;
  console.log("fetchNotificationsForUser ->", url);

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch notifications", res.status, text);
    throw new Error("Failed to fetch notifications");
  }

  return res.json();
}

export async function fetchUserByEmail(email: string) {
  const url = `${API_BASE_URL}/api/users/by-email?email=${encodeURIComponent(
    email
  )}`;
  console.log("fetchUserByEmail ->", url);

  const res = await fetch(url);

  // If backend says "no user with that email", just return null
  if (res.status === 404) {
    console.log("No CUFF user found for email, treating as non-admin");
    return null;
  }

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch user by email", res.status, text);
    throw new Error("Failed to fetch user by email");
  }

  return res.json();
}