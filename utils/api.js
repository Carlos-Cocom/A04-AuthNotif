import axios from "axios";
import * as SecureStore from "expo-secure-store";

const getSession = async () => {
  try {
    const session = await SecureStore.getItemAsync("session_token");
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error("🟣 Error al recuperar la sesión almacenada:", error);
    return null;
  }
};

const api = axios.create({
  baseURL: "https://first-goldfish-conversely.ngrok-free.app",
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    if (config.url === "/profile" || config.url === "/logout") {
      const session = await getSession();
      if (session?.token) {
        console.log(`🔐 Añadiendo token en solicitud a ${config.url}`);
        config.headers.Authorization = `Bearer ${session.token}`;
      } else {
        console.warn(`⚠️ No se encontró token válido para ${config.url}`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (username, password) => {
  try {
    console.log("🔑 Iniciando sesión con credenciales...");

    const response = await api.post("/auth", { username, password });
    console.log("✅ Login exitoso:", response.data);

    if (!response.data?.data) {
      throw new Error("Datos de sesión incompletos");
    }

    const userData = response.data.data;

    await SecureStore.setItemAsync("session_token", JSON.stringify(userData));

    return userData;
  } catch (error) {
    console.error("🚫 Fallo en login:", error?.response?.data?.message || error.message);
    throw new Error("Nombre de usuario o contraseña incorrectos");
  }
};

export const getProfile = async () => {
  try {
    console.log("📄 Consultando datos del perfil...");
    const response = await api.get("/profile");
    if (!response.data) {
      throw new Error("Respuesta vacía del servidor");
    }
    console.log("👤 Perfil recibido:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener el perfil:", error?.response?.data || error.message);
    return null;
  }
};

export const logout = async () => {
  try {
    await api.post("/logout");
    await SecureStore.deleteItemAsync("session_token");
    console.log("🚪 Sesión cerrada con éxito");
  } catch (error) {
    console.error("⚠️ No se pudo cerrar la sesión:", error);
    throw error;
  }
};

export default api;
