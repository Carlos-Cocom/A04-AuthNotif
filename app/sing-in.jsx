import { useState } from "react";
import {View,Text,TextInput,TouchableOpacity,StyleSheet,ImageBackground,ActivityIndicator,Alert,} from "react-native";
import { router } from "expo-router";
import { useSession } from "../utils/ctx";
import { StatusBar } from "expo-status-bar";

export default function SignIn() {
  const { signIn } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await signIn(username, password);
      if (!response.success) {
        setErrorMessage(response.message);
        Alert.alert("Error", response.message || "Credenciales inválidas ❌");
        return;
      }
      router.replace("/");
    } catch (error) {
      console.warn("Error en inicio de sesión:", error.message);
      setErrorMessage("Error al iniciar sesión");
      Alert.alert("Error", "No se pudo iniciar sesión ❌");
    } finally {
      setLoading(false);
    }
  };

  const showDevelopmentAlert = () => {
    Alert.alert("🚧 En desarrollo", "Esta funcionalidad aún no está disponible.");
  };

  return (
    <ImageBackground
      source={require("../assets/image.png")}
      style={styles.background}
    >
      <StatusBar style="auto" />
      <View style={styles.overlay} />

      <View style={styles.container}>
        <Text style={styles.title}>MobileApp</Text>

        <TextInput
          style={styles.input}
          placeholder="Usuario"
          keyboardType="email-address"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="gray"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="gray"
        />

        <View style={styles.optionsContainer}>
          <TouchableOpacity onPress={showDevelopmentAlert}>
            <Text style={styles.optionText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={showDevelopmentAlert}>
            <Text style={styles.optionText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#6200ea" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <TouchableOpacity onPress={showDevelopmentAlert}>
          <Text style={styles.createAccount}>Create an account</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0)",
  },
  container: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    marginBottom: 20,
  },
  input: {
    width: "90%",
    padding: 12,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    color: "black",
  },
  button: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    color: "#6200ea",
    fontSize: 16,
    fontWeight: "bold",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 10,
  },
  optionText: {
    color: "black",
  },
  createAccount: {
    marginTop: 10,
    color: "black",
  },
  error: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});
