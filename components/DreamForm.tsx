import { Text } from "@/components/Themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Rating } from "react-native-ratings";

import {
  Button,
  Checkbox,
  Divider,
  SegmentedButtons,
  TextInput,
} from "react-native-paper";
import uuid from "react-native-uuid";

export default function DreamForm() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const [dreamText, setDreamText] = useState("");
  const [isLucidDream, setIsLucidDream] = useState(false);
  const [dreamType, setDreamType] = useState("");

  const [hashtag1, setHashtag1] = useState("");
  const [hashtag2, setHashtag2] = useState("");
  const [hashtag3, setHashtag3] = useState("");

  //list de personnes
  const [characters, setCharacters] = useState([]);
  const [characterInput, setCharacterInput] = useState("");
  //pour l'humeur
  const [humorBefore, setHumorBefore] = useState("");
  const [humorAfter, setHumorAfter] = useState("");

  //pour les dates
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  //pour les lieux
  const [place, setPlace] = useState("");

  //pour la qualite de sommeil
  const [sleepQuality, setSleepQuality] = useState(0);

  //pour l'analyse du rêve
  const [dreamanalyse, setDreamAnalyse] = useState("");

  //clarete du reve
  const [dreamclarity, setDreamClarity] = useState(0);

  //pour récuperer les parametre de la list
  const { editIndex } = useLocalSearchParams();

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (editIndex === undefined) return;

      const loadDream = async () => {
        const data = await AsyncStorage.getItem("dreamFormDataArray");
        const dreams = data ? JSON.parse(data) : [];
        const dream = dreams[Number(editIndex)];
        if (!dream) return;

        setDreamText(dream.dreamText);
        setIsLucidDream(dream.isLucidDream);
        setDreamType(dream.dreamType);
        setHashtag1(dream.hashtags[0]?.label ?? "");
        setHashtag2(dream.hashtags[1]?.label ?? "");
        setHashtag3(dream.hashtags[2]?.label ?? "");
        setCharacters(dream.characters);
        setPlace(dream.place);
        setHumorBefore(dream.humorBefore);
        setHumorAfter(dream.humorAfter);
        setSleepQuality(dream.sleepQuality);
        setDreamAnalyse(dream.dreamanalyse);
        setDreamClarity(dream.dreamclarity);
        if (dream.date) setDate(new Date(dream.date));
      };

      loadDream();
    }, [editIndex]),
  );

  const onFinishRatingClarity = (rating) => {
    setDreamClarity(rating);
  };
  const onFinishRatingQuality = (rating) => {
    setSleepQuality(rating);
  };
  const addCharacter = () => {
    if (characterInput.trim() === "") return;
    setCharacters([...characters, characterInput.trim()]);
    setCharacterInput("");
  };

  const removeCharacter = (index) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

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
      const dreamData = {
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
        characters: characters,
        place: place,
        sleepQuality: sleepQuality,
        dreamanalyse: dreamanalyse,
        dreamclarity: dreamclarity,
      };

      if (editIndex !== undefined) {
        // remplace le rêve
        formDataArray[Number(editIndex)] = {
          ...formDataArray[Number(editIndex)],
          ...dreamData,
        };
      } else {
        formDataArray.push({ id: uuid.v4(), ...dreamData });
      }

      // Sauvegarder le tableau mis à jour dans AsyncStorage
      await AsyncStorage.setItem(
        "dreamFormDataArray",
        JSON.stringify(formDataArray),
      );
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données:", error);
    }

    // Réinitialiser les champs du formulaire
    setDreamText("");
    setIsLucidDream(false);
    setHashtag1("");
    setHashtag2("");
    setHashtag3("");
    setCharacters([]);
    setPlace("");
    setDreamAnalyse("");
    setDreamType("neutre");

    router.push({
      pathname: "/",
    });
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.formContainer}>
        {/* Date + Lieu — côte à côte sur grand écran */}
        <View style={[styles.twoCol, isLargeScreen && styles.twoColLarge]}>
          <View style={[styles.col, isLargeScreen && styles.colLarge]}>
            <Text style={styles.sectionTitle}>Date et heure du rêve :</Text>
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
          </View>
          <View style={[styles.col, isLargeScreen && styles.colLarge]}>
            <Text style={styles.sectionTitle}>Lieu du rêve :</Text>
            <TextInput
              label="Lieu"
              value={place}
              onChangeText={(text) => setPlace(text)}
              mode="outlined"
              style={styles.input}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Description du rêve :</Text>
        <TextInput
          label="Rêve"
          value={dreamText}
          onChangeText={(text) => setDreamText(text)}
          mode="outlined"
          multiline
          numberOfLines={6}
          style={styles.input}
        />

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Personnes présentes :</Text>
        {characters.map((char, index) => (
          <View key={index} style={styles.characterRow}>
            <Text style={{ flex: 1 }}>{char}</Text>
            <Button onPress={() => removeCharacter(index)}>X</Button>
          </View>
        ))}
        <View style={styles.addRow}>
          <TextInput
            label="Personnage"
            value={characterInput}
            onChangeText={(text) => setCharacterInput(text)}
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
          />
          <Button
            onPress={addCharacter}
            mode="outlined"
            style={styles.addButton}
          >
            Ajouter
          </Button>
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Éléments Principaux du rêve :</Text>
        <View
          style={[styles.hashtagRow, isLargeScreen && styles.hashtagRowLarge]}
        >
          <TextInput
            label="Hashtag 1"
            value={hashtag1}
            onChangeText={setHashtag1}
            mode="outlined"
            style={[styles.input, isLargeScreen && { flex: 1 }]}
          />
          <TextInput
            label="Hashtag 2"
            value={hashtag2}
            onChangeText={setHashtag2}
            mode="outlined"
            style={[styles.input, isLargeScreen && { flex: 1 }]}
          />
          <TextInput
            label="Hashtag 3"
            value={hashtag3}
            onChangeText={setHashtag3}
            mode="outlined"
            style={[styles.input, isLargeScreen && { flex: 1 }]}
          />
        </View>

        <Divider style={styles.divider} />

        <View style={[styles.twoCol, isLargeScreen && styles.twoColLarge]}>
          <View style={[styles.col, isLargeScreen && styles.colLarge]}>
            <Text style={styles.sectionTitle}>Humeur avant rêve :</Text>
            <SegmentedButtons
              value={humorBefore}
              onValueChange={setHumorBefore}
              buttons={[
                { value: "triste", label: "Triste" },
                { value: "neutre", label: "Neutre" },
                { value: "content", label: "Content" },
              ]}
            />
          </View>
          <View style={[styles.col, isLargeScreen && styles.colLarge]}>
            <Text style={styles.sectionTitle}>Humeur après rêve :</Text>
            <SegmentedButtons
              value={humorAfter}
              onValueChange={setHumorAfter}
              buttons={[
                { value: "triste", label: "Triste" },
                { value: "neutre", label: "Neutre" },
                { value: "content", label: "Content" },
              ]}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Type de rêve :</Text>
        <SegmentedButtons
          value={dreamType}
          onValueChange={setDreamType}
          buttons={[
            { value: "cauchemard", label: "Cauchemard" },
            { value: "neutre", label: "Neutre" },
            { value: "reve", label: "Rêve" },
          ]}
        />

        <Divider style={styles.divider} />

        <Checkbox.Item
          label="Rêve Lucide"
          status={isLucidDream ? "checked" : "unchecked"}
          onPress={() => setIsLucidDream(!isLucidDream)}
        />

        <Divider style={styles.divider} />

        <View style={[styles.twoCol, isLargeScreen && styles.twoColLarge]}>
          <View style={[styles.col, isLargeScreen && styles.colLarge]}>
            <Text style={styles.sectionTitle}>Clareté du rêve :</Text>
            <Rating
              type="star"
              ratingCount={5}
              imageSize={30}
              startingValue={3}
              onFinishRating={onFinishRatingClarity}
            />
          </View>
          <View style={[styles.col, isLargeScreen && styles.colLarge]}>
            <Text style={styles.sectionTitle}>Qualité du sommeil :</Text>
            <Rating
              type="star"
              ratingCount={5}
              imageSize={30}
              startingValue={3}
              onFinishRating={onFinishRatingQuality}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Interprétation du rêve :</Text>
        <TextInput
          label="Interprétation"
          value={dreamanalyse}
          onChangeText={(text) => setDreamAnalyse(text)}
          mode="outlined"
          multiline
          numberOfLines={6}
          style={styles.input}
        />

        <Divider style={styles.divider} />

        <Button
          mode="contained"
          onPress={handleDreamSubmission}
          style={styles.button}
        >
          Soumettre
        </Button>
        <Button mode="contained" onPress={resetDreams} style={styles.button}>
          Clear
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formContainer: {
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  twoCol: {},
  twoColLarge: {
    flexDirection: "row",
    gap: 16,
  },
  col: {},
  colLarge: {
    flex: 1,
  },
  hashtagRow: {},
  hashtagRowLarge: {
    flexDirection: "row",
    gap: 8,
  },
  characterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addButton: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
  divider: {
    marginTop: 24,
    marginBottom: 24,
  },
});
