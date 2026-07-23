import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

/*
|--------------------------------------------------------------------------
| CSRF
|--------------------------------------------------------------------------
*/

api.interceptors.request.use((config) => {
  const csrfCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrfToken="));

  if (csrfCookie) {
    const csrfToken = decodeURIComponent(
      csrfCookie.split("=")[1]
    );

    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

export const loginUser = (emailOrData, password) => {
  const payload =
    typeof emailOrData === "object"
      ? emailOrData
      : {
          email: emailOrData,
          password
        };

  return api.post("/auth/login", payload);
};

export const registerUser = (usernameOrData, email, password) => {
  const payload =
    typeof usernameOrData === "object"
      ? usernameOrData
      : {
          username: usernameOrData,
          email,
          password
        };

  return api.post("/auth/register", payload);
};

export const logoutUser = () => {
  return api.post("/auth/logout");
};

export const getCurrentUser = () => {
  return api.get("/auth/me");
};

/*
|--------------------------------------------------------------------------
| MOODS
|--------------------------------------------------------------------------
*/

export const getMoods = () => {
  return api.get("/moods");
};

export const createMood = (moodOrData, intensity, notes) => {
  const payload =
    typeof moodOrData === "object"
      ? moodOrData
      : {
          mood: moodOrData,
          intensity,
          notes
        };

  return api.post("/moods", payload);
};

/*
|--------------------------------------------------------------------------
| JOURNAL
|--------------------------------------------------------------------------
*/

export const getEntries = () => {
  return api.get("/entries");
};

export const createEntry = (titleOrData, content, mood) => {
  const payload =
    typeof titleOrData === "object"
      ? titleOrData
      : {
          title: titleOrData,
          content,
          mood
        };

  return api.post("/entries", payload);
};

export const updateEntry = (id, titleOrData, content, mood) => {
  const payload =
    typeof titleOrData === "object"
      ? titleOrData
      : {
          title: titleOrData,
          content,
          mood
        };

  return api.put(`/entries/${id}`, payload);
};

export const deleteEntry = (id) => {
  return api.delete(`/entries/${id}`);
};

/*
|--------------------------------------------------------------------------
| SKILLS
|--------------------------------------------------------------------------
*/

export const getAllSkills = () => {
  return api.get("/skills");
};

export const getSkillsForMood = (mood) => {
  return api.get(`/skills/for-mood/${mood}`);
};

export const getUserSkills = () => {
  return api.get("/skills/my-skills");
};

export const addUserSkill = (skillId) => {
  return api.post(`/skills/my-skills/${skillId}`, {});
};

export const removeUserSkill = (skillId) => {
  return api.delete(`/skills/my-skills/${skillId}`);
};

export const markSkillAsPracticed = (skillId) => {
  return api.post(`/skills/my-skills/${skillId}/practice`, {});
};

/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

export const getEvents = () => {
  return api.get("/events");
};

export default api;