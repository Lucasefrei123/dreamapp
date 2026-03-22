// components/DreamList.tsx

import { Text } from "@/components/Themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Button,
  Card,
  Chip,
  Divider,
  SegmentedButtons,
  Surface,
  TextInput,
} from "react-native-paper";

export default function DreamList() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const numColumns = width >= 1100 ? 3 : isLargeScreen ? 2 : 1;
  const [dreams, setDreams] = useState<any[]>([]);

  const [filterhashtag, setHashtag] = useState("");
  const [filterEmotion, setFilterEmotion] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCharacter, setFilterCharacter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [
    filterhashtag,
    filterEmotion,
    filterType,
    filterCharacter,
  ].filter(Boolean).length;

  const filteredDreams = dreams.filter((dream) => {
    if (
      filterhashtag &&
      !dream.hashtags.some((h) =>
        h.label.toLowerCase().includes(filterhashtag.toLowerCase()),
      )
    )
      return false;

    if (
      filterEmotion &&
      dream.humorBefore !== filterEmotion &&
      dream.humorAfter !== filterEmotion
    )
      return false;

    if (filterType && dream.dreamType !== filterType) return false;

    if (filterCharacter && !dream.characters.includes(filterCharacter))
      return false;
    return true;
  });

  const deleteDream = async (index) => {
    const updatedDreams = dreams.filter((_, i) => i !== index);
    setDreams(updatedDreams);
    await AsyncStorage.setItem(
      "dreamFormDataArray",
      JSON.stringify(updatedDreams),
    );
  };

  const updateDream = async (index) => {
    router.push({
      pathname: "/",
      params: { editIndex: index },
    });
  };

  // Ce useEffect est exécuté à l'instanciation du composant pour charger la liste initiale
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await AsyncStorage.getItem("dreamFormDataArray");
        const dreamFormDataArray = data ? JSON.parse(data) : [];
        setDreams(dreamFormDataArray);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };

    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const data = await AsyncStorage.getItem("dreamFormDataArray");
          const dreamFormDataArray = data ? JSON.parse(data) : [];
          setDreams(dreamFormDataArray);
        } catch (error) {
          console.error("Erreur lors de la récupération des données:", error);
        }
      };

      fetchData();

      return () => {
        console.log("This route is now unfocused.");
      };
    }, []),
  );

  const cardStyle =
    numColumns > 1
      ? [
          styles.card,
          {
            flex: 1,
            minWidth: 280,
            maxWidth: `${Math.floor(100 / numColumns) - 1}%` as any,
          },
        ]
      : styles.card;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.pageContainer}>
        <Button
          mode={activeFilterCount > 0 ? "contained" : "outlined"}
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterToggle}
        >
          {showFilters
            ? "Masquer les filtres"
            : `Filtres${activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}`}
        </Button>

        {showFilters && (
          <Surface style={styles.filterPanel} elevation={1}>
            <View
              style={[styles.filterRow, isLargeScreen && styles.filterRowLarge]}
            >
              <TextInput
                label="Hashtag"
                value={filterhashtag}
                onChangeText={setHashtag}
                left={<TextInput.Icon icon="pound" />}
                dense
                style={[styles.filterInput, isLargeScreen && { flex: 1 }]}
              />
              <TextInput
                label="Personnage"
                value={filterCharacter}
                onChangeText={setFilterCharacter}
                left={<TextInput.Icon icon="account" />}
                dense
                style={[styles.filterInput, isLargeScreen && { flex: 1 }]}
              />
            </View>
            <View
              style={[styles.filterRow, isLargeScreen && styles.filterRowLarge]}
            >
              <View
                style={[styles.filterSegment, isLargeScreen && { flex: 1 }]}
              >
                <Text style={styles.filterLabel}>Type de rêve</Text>
                <SegmentedButtons
                  value={filterType}
                  onValueChange={setFilterType}
                  buttons={[
                    { value: "", label: "Tous" },
                    { value: "cauchemard", label: "Cauchemard" },
                    { value: "neutre", label: "Neutre" },
                    { value: "reve", label: "Rêve" },
                  ]}
                />
              </View>
              <View
                style={[styles.filterSegment, isLargeScreen && { flex: 1 }]}
              >
                <Text style={styles.filterLabel}>Humeur</Text>
                <SegmentedButtons
                  value={filterEmotion}
                  onValueChange={setFilterEmotion}
                  buttons={[
                    { value: "", label: "Toutes" },
                    { value: "triste", label: "Triste" },
                    { value: "neutre", label: "Neutre" },
                    { value: "content", label: "Content" },
                  ]}
                />
              </View>
            </View>
            {activeFilterCount > 0 && (
              <Button
                onPress={() => {
                  setHashtag("");
                  setFilterType("");
                  setFilterEmotion("");
                  setFilterCharacter("");
                }}
                style={{ marginTop: 8 }}
              >
                Réinitialiser ({activeFilterCount})
              </Button>
            )}
          </Surface>
        )}

        <Divider style={{ marginVertical: 8 }} />

        <Text style={styles.title}>Liste des Rêves :</Text>

        <View
          style={[styles.cardsGrid, numColumns > 1 && styles.cardsGridMulti]}
        >
          {filteredDreams.map((dream, index) => (
            <Card key={index} style={cardStyle}>
              <Card.Title
                title={
                  dream.dreamText?.slice(0, 60) +
                  (dream.dreamText?.length > 60 ? "..." : "")
                }
                subtitle={`${new Date(dream.date).toLocaleDateString("fr-FR")} · ${dream.dreamType} ${dream.isLucidDream ? "· Lucide" : ""}`}
              />
              <Card.Content>
                <View style={styles.row}>
                  {dream.hashtags
                    .filter((h: any) => h.label)
                    .map((h: any, i: number) => (
                      <Chip key={i} icon="pound" compact style={styles.chip}>
                        {h.label}
                      </Chip>
                    ))}
                </View>

                {dream.characters?.length > 0 && (
                  <View style={styles.row}>
                    {dream.characters.map((c: string, i: number) => (
                      <Chip key={i} icon="account" compact style={styles.chip}>
                        {c}
                      </Chip>
                    ))}
                  </View>
                )}

                <View style={styles.row}>
                  <Text style={styles.label}>Humeur avant :</Text>
                  <Text>{dream.humorBefore}</Text>
                  <Text style={[styles.label, { marginLeft: 12 }]}>
                    après :
                  </Text>
                  <Text>{dream.humorAfter}</Text>
                </View>

                {dream.place ? (
                  <View style={styles.row}>
                    <Text style={styles.label}>Lieu :</Text>
                    <Text>{dream.place}</Text>
                  </View>
                ) : null}

                <View style={styles.row}>
                  <Text style={styles.label}>Sommeil :</Text>
                  <Text>
                    {"★".repeat(dream.sleepQuality)}
                    {"☆".repeat(5 - dream.sleepQuality)}
                  </Text>
                  <Text style={[styles.label, { marginLeft: 12 }]}>
                    Clarté :
                  </Text>
                  <Text>
                    {"★".repeat(dream.dreamclarity)}
                    {"☆".repeat(5 - dream.dreamclarity)}
                  </Text>
                </View>

                {dream.dreamanalyse ? (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.label}>Interprétation :</Text>
                    <Text>{dream.dreamanalyse}</Text>
                  </View>
                ) : null}
              </Card.Content>

              <Card.Actions>
                <Button onPress={() => updateDream(index)}>Modifier</Button>
                <Button onPress={() => deleteDream(index)} textColor="red">
                  Supprimer
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 8,
  },
  pageContainer: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  filterToggle: {
    margin: 8,
  },
  filterPanel: {
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterRow: {},
  filterRowLarge: {
    flexDirection: "row",
    gap: 12,
  },
  filterInput: {
    marginBottom: 8,
  },
  filterSegment: {},
  filterLabel: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: "bold",
  },
  cardsGrid: {},
  cardsGridMulti: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 8,
  },
  card: {
    marginHorizontal: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 6,
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
  label: {
    fontWeight: "bold",
    marginRight: 4,
  },
});
