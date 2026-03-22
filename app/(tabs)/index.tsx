import { StyleSheet } from 'react-native';
import DreamForm from '@/components/DreamForm';
import { View } from '@/components/Themed';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <DreamForm/>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
