import { View, Text } from "react-native";
import api from "../services/api.service";
import { useEffect, useState } from "react";

export default function HealthCheck() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    api.get("/health")
      .then(() => setStatus("Backend Connected"))
      .catch(() => setStatus("Backend Not Reachable"));
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>{status}</Text>
    </View>
  );
}
