import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const MapsScreen: React.FC = () => {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Maps</Text>
      <Text style={styles.sub}>Coming soon.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 20, fontWeight: '900', color: '#111' },
  sub: { marginTop: 8, color: 'rgba(17,17,17,0.65)', fontWeight: '700' },
});

export default MapsScreen;

