import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

export const ScoreWheel = ({ 
  value, 
  onValueChange, 
  teamColor 
}: {
  value: number,
  onValueChange: (val: number) => void,
  teamColor: string
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isWrapping, setIsWrapping] = useState(false);
  
  const itemHeight = 60;
  const scores = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const minScore = 0;
  const maxScore = 9;

  const handleScroll = (event: any) => {
    if (isWrapping) return; // Prevent handling during wrap animation
    
    const y = event.nativeEvent.contentOffset.y;
    const selectedIndex = Math.round(y / itemHeight);
    
    // Check for wrap-around conditions
    if (selectedIndex < minScore) {
      // Scrolled past 0, wrap to 9
      handleWrapAround(maxScore);
      return;
    } else if (selectedIndex > maxScore) {
      // Scrolled past 9, wrap to 0
      handleWrapAround(minScore);
      return;
    }
    
    // Normal selection update
    if (selectedIndex !== value && selectedIndex >= minScore && selectedIndex <= maxScore) {
      onValueChange(selectedIndex);
      if (isScrolling) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleWrapAround = (newValue: number) => {
    setIsWrapping(true);
    onValueChange(newValue);
    
    // Haptic feedback for wrap-around
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Scroll to new position without animation to create seamless wrap
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ 
        y: newValue * itemHeight, 
        animated: false 
      });
      setIsWrapping(false);
    }, 50);
  };

  const scrollToValue = (val: number) => {
    scrollViewRef.current?.scrollTo({ 
      y: val * itemHeight, 
      animated: true 
    });
  };

  const handleItemPress = (score: number) => {
    setIsScrolling(false);
    onValueChange(score);
    scrollToValue(score);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleScrollBegin = () => {
    setIsScrolling(true);
  };

  const handleScrollEnd = () => {
    setIsScrolling(false);
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
          paddingTop: itemHeight *1.25, // Extra padding to allow over-scroll
          paddingBottom: itemHeight * 1.25,
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        bounces={true} // Enable bouncing to allow over-scroll detection
      >
        {scores.map((score) => (
          <TouchableOpacity
            key={score}
            style={[
              styles.scoreItem,
              { height: itemHeight },
              value === score && { backgroundColor: `${teamColor}20` }
            ]}
            onPress={() => handleItemPress(score)}
          >
            <ThemedText style={[
              styles.scoreText,
              value === score && { 
                color: teamColor, 
                fontWeight: '900',
                fontSize: 24
              }
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
  wrapIndicators: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
  },
  wrapIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topIndicator: {
    top: 0,
  },
  bottomIndicator: {
    bottom: 0,
  },
  wrapText: {
    fontSize: 12,
    color: '#8E8E93',
    opacity: 0.6,
  },
  scoreWheel: {
    flex: 1,
  },
  scoreItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom:15
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
  },
});