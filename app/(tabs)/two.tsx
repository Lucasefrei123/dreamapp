import { StyleSheet } from 'react-native';

import { View } from '@/components/Themed';
import DreamList from '@/components/DreamList';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <DreamList/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
