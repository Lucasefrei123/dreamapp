// components/DreamForm.tsx

import { Text } from "@/components/Themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";

import {
  Button,
  Checkbox,
  Divider,
  SegmentedButtons,
  TextInput,
} from "react-native-paper";
import uuid from "react-native-uuid";

const { width } = Dimensions.get("window");

export default function DreamForm() {
  const [dreamText, setDreamText] = useState("");
  const [isLucidDream, setIsLucidDream] = useState(false);
  const [dreamType, setDreamType] = React.useState("");

  const [hashtag1, setHashtag1] = useState("");
  const [hashtag2, setHashtag2] = useState("");
  const [hashtag3, setHashtag3] = useState("");



  //list de personnes
  const [people, setPeople] = React.useState("");
  //pour l'humeur
  const [humorBefore, setHumorBefore] = React.useState("");
  const [humorAfter, setHumorAfter] = React.useState("");

  //pour les dates
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    setShow(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleDreamSubmission = async () => {
    try {
      // Récupérer le tableau actuel depuis AsyncStorage
      const existingData = await AsyncStorage.getItem("dreamFormDataArray");
      const formDataArray = existingData ? JSON.parse(existingData) : [];

      const hashtag1Id = await findHashtagIdByLabel(hashtag1);
      const hashtag2Id = await findHashtagIdByLabel(hashtag2);
      const hashtag3Id = await findHashtagIdByLabel(hashtag3);

      // Ajouter le nouveau formulaire au tableau
      formDataArray.push({
        id: uuid.v4(),
        dreamText: dreamText,
        isLucidDream: isLucidDream,
        dreamType: dreamType,
        hashtags: [
          { id: hashtag1Id, label: hashtag1 },
          { id: hashtag2Id, label: hashtag2 },
          { id: hashtag3Id, label: hashtag3 },
        ],
        date: date,
        humorBefore: humorBefore,
        humorAfter: humorAfter,
      });

      // Sauvegarder le tableau mis à jour dans AsyncStorage
      await AsyncStorage.setItem(
        "dreamFormDataArray",
        JSON.stringify(formDataArray),
      );

      // Réinitialiser les champs du formulaire
      setDreamText("");
      setIsLucidDream(false);
      setHashtag1("");
      setHashtag2("");
      setHashtag3("");

      console.log(
        "AsyncStorage: ",
        JSON.parse(await AsyncStorage.getItem("dreamFormDataArray")),
      );
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données:", error);
    }

    setDreamText("");
    setIsLucidDream(false);
    setDreamType("neutre");
  };

  const resetDreams = async () => {
    try {
      await AsyncStorage.setItem("dreamFormDataArray", JSON.stringify([]));
      console.log(
        "AsyncStorage: ",
        JSON.parse((await AsyncStorage.getItem("dreamFormDataArray")) || "[]"),
      );
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des données:", error);
    }
  };

  const findHashtagIdByLabel = async (hashtag) => {
    try {
      // Récupère les données des rêves stockées dans le AsyncStorage
      const existingDreams = await AsyncStorage.getItem("dreamFormDataArray");
      let dreamsData = existingDreams ? JSON.parse(existingDreams) : [];

      // Parcours tous les rêves pour trouver un hashtag existant
      for (let dream of dreamsData) {
        for (let hashtagKey in dream.hashtags) {
          const hashtagStored = dream.hashtags[hashtagKey]; // Récupère l'objet du hashtag stocké

          if (hashtagStored.label === hashtag) {
            // Si le hashtag est trouvé, renvoie son ID
            return hashtagStored.id;
          }
        }
      }

      // Si le hashtag n'existe pas, crée un nouvel ID
      const newId = `hashtag-${uuid.v4()}`;
      return newId;
    } catch (error) {
      console.error("Erreur lors de la gestion des hashtags:", error);
      return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Divider style={styles.divider} />
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        Date et heure du rêve :
      </Text>
      <Button onPress={() => setShow(true)}>Choisir l'heure</Button>

      {show && (
        <DateTimePicker
          value={date}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}

      <Divider style={styles.divider} />

      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        Description du rêve :
      </Text>
      <TextInput
        label="Rêve"
        value={dreamText}
        onChangeText={(text) => setDreamText(text)}
        mode="outlined"
        multiline
        numberOfLines={6}
        style={[styles.input, { width: width * 0.8, alignSelf: "center" }]}
      />

      <Divider style={styles.divider} />

      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        Personnes présente :
      </Text>
      
      <TextInput
        label="Personnes"
        value={people}
        onChangeText={(text) => setPeople(text)}
        mode="outlined"
        style={[styles.input, { width: width * 0.8, alignSelf: "center" }]}
      />

      <Divider style={styles.divider} />

      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        Éléments Principaux du rêve :
      </Text>
      <TextInput
        label="Hashtag 1"
        value={hashtag1}
        onChangeText={(hashtag1) => setHashtag1(hashtag1)}
        mode="outlined"
        style={[styles.input, { width: width * 0.8, alignSelf: "center" }]}
      />

      <TextInput
        label="Hashtag 2"
        value={hashtag2}
        onChangeText={(hashtag2) => setHashtag2(hashtag2)}
        mode="outlined"
        style={[styles.input, { width: width * 0.8, alignSelf: "center" }]}
      />

      <TextInput
        label="Hashtag 3"
        value={hashtag3}
        onChangeText={(hashtag3) => setHashtag3(hashtag3)}
        mode="outlined"
        style={[styles.input, { width: width * 0.8, alignSelf: "center" }]}
      />

      <Divider style={styles.divider} />

      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        Humeur avant rêve:
      </Text>
      <SegmentedButtons
        style={styles.segmentedButtons}
        value={humorBefore}
        onValueChange={setHumorBefore}
        buttons={[
          {
            value: "triste",
            label: "Triste",
          },
          {
            value: "neutre",
            label: "Neutre",
          },
          { value: "content", label: "Content" },
        ]}
      />

      <Divider style={styles.divider} />

      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Type de rêve :</Text>

      <SegmentedButtons
        style={styles.segmentedButtons}
        value={dreamType}
        onValueChange={setDreamType}
        buttons={[
          {
            value: "cauchemard",
            label: "Cauchemard",
          },

          { value: "neutre", label: "Neutre" },

          {
            value: "reve",
            label: "Rêve",
          },
        ]}
      />
      <Divider style={styles.divider} />

      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        Humeur après rêve:
      </Text>
      <SegmentedButtons
        style={styles.segmentedButtons}
        value={humorAfter}
        onValueChange={setHumorAfter}
        buttons={[
          {
            value: "triste",
            label: "Triste",
          },
          {
            value: "neutre",
            label: "Neutre",
          },
          { value: "content", label: "Content" },
        ]}
      />

      <Divider style={styles.divider} />

      <View style={styles.checkboxContainer}>
        <Checkbox.Item
          label="Rêve Lucide"
          status={isLucidDream ? "checked" : "unchecked"}
          onPress={() => setIsLucidDream(!isLucidDream)}
        />
      </View>
      <Divider style={styles.divider} />
      <Button
        mode="contained"
        onPress={handleDreamSubmission}
        style={styles.button}
      >
        Soumettre
      </Button>
      <Button mode="contained" onPress={resetDreams} style={styles.button}>
        CLear
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  input: {},

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  button: {
    marginTop: 16,
  },

  segmentedButtons: {},

  divider: {
    marginTop: 32,
    marginBottom: 32,
  },
});
