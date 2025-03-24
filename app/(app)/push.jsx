import { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
} from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import Ionicons from "@expo/vector-icons/Ionicons";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "🔔 ¡Tienes una alerta!",
    body: "Este es un mensaje de prueba desde el sistema.",
    data: { someData: "Información adjunta 💾" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#c084fc",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      Alert.alert("Permisos requeridos", "Debes aceptar los permisos.");
      return;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      Alert.alert("Error", "Falta el Project ID.");
      return;
    }

    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;
      console.log("Expo Push Token:", pushTokenString);
      return pushTokenString;
    } catch (e) {
      Alert.alert("Error", "No se pudo obtener el token de notificación.");
    }
  } else {
    Alert.alert("Solo dispositivos físicos", "No disponible en emulador.");
  }
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(undefined);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error) => setExpoPushToken(`${error}`));

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <Ionicons name="notifications" size={28} color="#7c3aed" /> Notificaciones Push
      </Text>

      {expoPushToken ? (
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenText}>
            <Ionicons name="key" size={16} color="#7c3aed" /> Token de Acceso:
          </Text>
          <Text selectable style={styles.tokenValue}>{expoPushToken}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.button}
        onPress={async () => await sendPushNotification(expoPushToken)}
      >
        <Ionicons name="send" size={18} color="#fff" />
        <Text style={styles.buttonText}> Enviar Push</Text>
      </TouchableOpacity>

      {notification && (
        <View style={styles.notificationContainer}>
          <Text style={styles.notificationTitle}>
            <Ionicons name="mail" size={16} color="#6b21a8" /> Mensaje Recibido
          </Text>
          <Text style={styles.notificationText}>
            <Ionicons name="bookmark" size={14} color="#6b21a8" />{" "}
            <Text style={styles.bold}>Título:</Text>{" "}
            {notification.request.content.title}
          </Text>
          <Text style={styles.notificationText}>
            <Ionicons name="chatbubble" size={14} color="#6b21a8" />{" "}
            <Text style={styles.bold}>Contenido:</Text>{" "}
            {notification.request.content.body}
          </Text>
          <Text style={styles.notificationText}>
            <Ionicons name="information-circle" size={14} color="#6b21a8" />{" "}
            <Text style={styles.bold}>Datos:</Text>{" "}
            {JSON.stringify(notification.request.content.data)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ede9fe",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#6b21a8",
    flexDirection: "row",
    alignItems: "center",
  },
  tokenContainer: {
    backgroundColor: "#f5f3ff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    alignItems: "center",
  },
  tokenText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#7c3aed",
  },
  tokenValue: {
    fontSize: 12,
    color: "#4b0082",
    textAlign: "center",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#9333ea",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    alignItems: "center",
    width: "90%",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  notificationContainer: {
    backgroundColor: "#f3e8ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8b4fe",
    padding: 15,
    alignItems: "center",
    width: "90%",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6b21a8",
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 14,
    color: "#4c1d95",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
  },
});
