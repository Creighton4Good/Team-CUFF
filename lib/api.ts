export type EventPayload = {
  title: string;
  location: string;
  description: string;
  dietarySpecification?: string;
  availableFrom: string;
  availableUntil: string;
};

// Base is just host + port
const API_BASE_URL = "http://10.98.20.160:8080";

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
  console.log("createEvent ->", url);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      userId: 1, // TEMP
    }),
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
