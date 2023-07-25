import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useUserData } from "@/utils/authUtils";
import Loading from "@/components/utilityComponents/loadingMainContent";
import { useEffect, useState } from "react";
import useNotification from "@/components/utilityComponents/notificationContext";
import { FetchError, apiPostJson } from "@/utils/fetchApiUtils";
import { IUserMe } from "@/pages/api/user/me";

export default function EditMe() {
  const { user, isLoading, error, mutate } = useUserData();

  const { addAlert } = useNotification();

  const [name, setName] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  if (isLoading) return <Loading />;

  if (error)
    return (
      <Alert severity="error">
        Fehler beim Abrufen der Nutzerdaten: {error}
      </Alert>
    );

  const unsavedChanges = user.name !== name;

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  async function handleSave() {
    const res = await apiPostJson<IUserMe>("/api/user/me", { name });
    if (res instanceof FetchError)
      addAlert({
        message: `Fehler bei der Verbindung zum Server: ${res.error}`,
        severity: "error",
      });
    else {
      if (res.error)
        addAlert({ message: "Fehler beim Speichern", severity: "error" });
      else addAlert({ message: "Änderungen gespeichert", severity: "success" });
      mutate();
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <Typography variant="h4">Meine Daten bearbeiten</Typography>

      <TextField value={name} onChange={handleNameChange} label={"Name"} />

      <Button onClick={handleSave} disabled={!unsavedChanges}>
        Speichern
      </Button>
    </Box>
  );
}
