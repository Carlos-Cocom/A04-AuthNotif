import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSession } from "../../utils/ctx";
import { getProfile, logout } from "../../utils/api";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Main() {
  const { session, signOut } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
    }
  }, [loading, session]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        try {
          const data = await getProfile();
          if (!data || !data.user || !data.user.email) {
            throw new Error("Perfil incompleto o no disponible");
          }
          setProfile(data.user);
        } catch (error) {
          console.error("❌ Error obteniendo perfil:", error.message || error);
          Alert.alert("Error", "No fue posible recuperar tus datos.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("❌ Error cerrando sesión:", error);
    } finally {
      signOut();
      router.replace("/sign-in");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Usuario</Text>

      {session && profile ? (
        <View style={styles.profileCard}>
          <Text style={styles.text}>
            <Ionicons name="id-card-outline" size={20} color="#6d28d9" />{" "}
            <Text style={styles.label}>Nombre completo:</Text> {profile.name} {profile.lastName}
          </Text>
          <Text style={styles.text}>
            <Ionicons name="person-circle-outline" size={20} color="#6d28d9" />{" "}
            <Text style={styles.label}>Usuario:</Text> {profile.username}
          </Text>
          <Text style={styles.text}>
            <Ionicons name="mail-outline" size={20} color="#6d28d9" />{" "}
            <Text style={styles.label}>Email:</Text> {profile.email}
          </Text>
        </View>
      ) : (
        <Text style={styles.warning}>No se pudo mostrar el perfil.</Text>
      )}

      {session && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f3ff", // lavanda claro
    padding: 20,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#6b21a8",
  },
  profileCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#ede9fe",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: "#4b0082",
  },
  label: {
    fontWeight: "bold",
    color: "#4c1d95",
  },
  warning: {
    fontSize: 16,
    color: "#a78bfa",
    fontStyle: "italic",
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9333ea",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
