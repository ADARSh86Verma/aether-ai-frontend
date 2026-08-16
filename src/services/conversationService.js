import api from "./api";

export async function createConversation() {
  console.log("API createConversation");
  const response = await api.post("/conversations/");
  return response.data;
}

export async function getConversations() {
  const response = await api.get("/conversations/");
  return response.data;
}
  
export async function getConversation(id) {
  const response = await api.get(`/conversations/${id}`);
  return response.data;
}

export async function deleteConversation(id) {
  const response = await api.delete(`/conversations/${id}`);
  return response.data;
}

export async function renameConversation(id, title) {
  const response = await api.put(`/conversations/${id}/rename`, {
    title,
  });

  return response.data;
}

export async function favoriteConversation(id, favorite) {
  const response = await api.put(`/conversations/${id}/favorite`, {
    favorite,
  });

  return response.data;
}