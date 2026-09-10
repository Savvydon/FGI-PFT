import { API_BASE } from "../config/env.js";
// Helper for headers - no token needed, cookies handle auth
const getHeaders = (contentType = true) => {
  const headers = {};
  if (contentType) {
    headers["Content-Type"] = "application/json";
  }
  // No Authorization header - using cookies instead
  return headers;
};

// Helper for error handling
async function handleError(res) {
  let data = {};
  try {
    data = await res.json();
  } catch {}
  const message =
    data.detail || data.message || `Request failed (status ${res.status})`;
  throw new Error(message);
}

// AUTH ENDPOINTS

// LOGIN (email + password)
export async function loginUser(credentials) {
  console.log("Login Payload:", credentials);
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include", // Important: receives cookie
    body: JSON.stringify(credentials),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    throw new Error(data.detail || `Login failed (status ${response.status})`);
  }

  return data;
}

// LOGOUT
export async function logoutUser() {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  return response.json();
}

// GET CURRENT USER
export async function getCurrentUser() {
  const response = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get user info (status ${response.status})`);
  }

  return response.json();
}

// CHECK SESSION
export async function checkSession() {
  const response = await fetch(`${API_BASE}/auth/session`, {
    credentials: "include",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Session invalid");
  }

  return response.json();
}

// PFT / EVALUATOR ENDPOINTS

// COMPUTE FITNESS - Evaluator only
export async function computeFitness(payload) {
  const response = await fetch(`${API_BASE}/api/compute`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error(
        data.detail ||
          "A record already exists for this Participant ID and Year.",
      );
    }
    if (response.status === 422) {
      throw new Error(data.detail || "Invalid input data");
    }
    if (response.status === 403) {
      throw new Error(
        "You don't have permission to perform evaluations. Admins cannot evaluate.",
      );
    }
    throw new Error(
      data.detail || `Submission failed (status ${response.status})`,
    );
  }

  return data;
}

// CHECK IF RECORD EXISTS
export async function checkExists(participantId, year) {
  const response = await fetch(
    `${API_BASE}/api/exists/${encodeURIComponent(participantId)}/${year}`,
    {
      credentials: "include",
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to check existence");
  }

  return response.json();
}

// SEND EMAIL REPORT
export async function sendEmailReport(email, reportData) {
  const response = await fetch(`${API_BASE}/send-report`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({
      email: email,
      report_data: reportData,
    }),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    throw new Error(data.detail || "Failed to send email");
  }

  return data;
}

// ADMIN ENDPOINTS 

// Get all PFT results (Admin only)
export async function getAllPFTResults() {
  const response = await fetch(`${API_BASE}/api/pft-results`, {
    credentials: "include",
    headers: getHeaders(),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Admin access required");
    }
    throw new Error("Failed to fetch results");
  }

  return response.json();
}

// Get PFT result by ID (Admin only)
export async function getPFTResultById(id) {
  const response = await fetch(`${API_BASE}/api/pft-results/${id}`, {
    credentials: "include",
    headers: getHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Record not found");
    }
    throw new Error("Failed to fetch record");
  }

  return response.json();
}

// Get PFT results by Participant ID (Admin only)
export async function searchPFTByParticipantId(participantId) {
  const response = await fetch(`${API_BASE}/api/pft-results/participant/${encodeURIComponent(participantId)}`, {
    credentials: "include",
    headers: getHeaders(),
  });

  if (response.status === 404) {
    return []; // Return empty array if not found
  }

  if (!response.ok) {
    throw new Error("Search failed");
  }

  return response.json();
}

// Update PFT result (Admin only) - Returns full updated record
export async function updatePFTResult(id, updateData) {
  const response = await fetch(`${API_BASE}/api/pft-results/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to update record");
  }

  return response.json();
}

// Delete PFT result (Admin only)
export async function deletePFTResult(id) {
  const response = await fetch(`${API_BASE}/api/pft-results/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete record");
  }

  return response.json();
}
