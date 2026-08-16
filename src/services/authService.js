import api from "./api";

export async function loginRequest(data) {
  const response = await api.post("/auth/login", data);
  return response.data;
}

export async function signupRequest(data) {
  const response = await api.post("/auth/signup", data);
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}

export async function updateProfileRequest(data) {
  const response = await api.patch("/auth/profile", data);
  return response.data;
}

export async function changePasswordRequest(currentPassword, newPassword) {
  const response = await api.post("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
}

export async function deleteAccountRequest() {
  const response = await api.delete("/auth/account");
  return response.data;
}

export async function requestPasswordReset(email) {
  const response = await api.post("/auth/password-reset/request", { email });
  return response.data;
}

export async function verifyPasswordReset(email, code) {
  const response = await api.post("/auth/password-reset/verify", { email, code });
  return response.data;
}

export async function confirmPasswordReset(email, code, password) {
  const response = await api.post("/auth/password-reset/confirm", {
    email,
    code,
    password,
  });
  return response.data;
}


export async function uploadProfileAvatarRequest(file) {
  const form = new FormData();
  form.append("file", file, file.name);
  const response = await api.post("/auth/profile/avatar", form, {
    timeout: 180000,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
