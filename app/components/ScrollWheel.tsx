import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";


export const ScoreWheel = ({ value, onValueChange, teamColor }: {
   value: number, 
   onValueChange: (val: number) => void,
  teamColor: string
 }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const itemHeight = 60;
  const scores = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const selectedIndex = Math.round(y / itemHeight);
    if (selectedIndex !== value && selectedIndex >= 0 && selectedIndex < 10) {
      onValueChange(selectedIndex);
      //Haptics.selectionAsync(); // subtle tap
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const scrollToValue = (val: number) => {
    scrollViewRef.current?.scrollTo({ y: val * itemHeight, animated: true });
  };

  useEffect(() => {
    scrollToValue(value);
  }, []);

   

  return (
    <View style={[styles.scoreWheelContainer, { borderColor: teamColor }]}>
      <View style={[styles.scoreWheelIndicator, { backgroundColor: teamColor }]} />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scoreWheel}
        contentContainerStyle={{
          paddingTop: itemHeight,
          paddingBottom: itemHeight,
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
      >
        {scores.map((score) => (
          <TouchableOpacity
            key={score}
            style={[
              styles.scoreItem,
              { height: itemHeight },
              value === score && { backgroundColor: `${teamColor}20` }
            ]}
            onPress={() => {
              onValueChange(score);
              scrollToValue(score);
            }}
          >
            <ThemedText style={[
              styles.scoreText,
              value === score && { color: teamColor, fontWeight: '900',fontSize: 24}
            ]}>
              {score}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
    scoreWheelContainer: {
    width: 120,
    height: 180,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  scoreWheelIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 60,
    marginTop: -30,
    opacity: 0.2,
    zIndex: 1,
  },
  scoreWheel: {
    flex: 1,
  },
  scoreItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
  },
 
});