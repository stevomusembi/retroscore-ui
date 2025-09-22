import React, { useState } from 'react';
import { Animated, StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native';

interface TeamPredictionSelectorProps {
  homeTeamName: string;
  awayTeamName: string;
  onSelectionChange?: (optionId: string, optionLabel: string) => void;
  initialSelection?: string | null;
}

type OptionId = 'home' | 'draw' | 'away';

const ResultSelector: React.FC<TeamPredictionSelectorProps> = ({ 
  homeTeamName, 
  awayTeamName, 
  onSelectionChange,
  initialSelection = null 
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [animatedValue] = useState(new Animated.Value(0));

  const colors = {
    charcoalGray: '#171717',
    obsidian: '#0B1215',
    primary: '#101720', 
    selected: '#011222', 
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
  };

  const options = [
    { id: 'home_win', label: homeTeamName, emoji: '🏆' },
    { id: 'draw', label: 'Draw', emoji: '🤝' },
    { id: 'away_win', label: awayTeamName, emoji: '🏆' }
  ];

  const handleSelection = (optionId: string) => {
    setSelectedOption(optionId);
    
    // Trigger animation
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Call callback if provided
    if (onSelectionChange) {
      onSelectionChange(optionId, optionId === 'home' ? homeTeamName : optionId === 'away' ? awayTeamName : 'Draw');
    }
  };

  const getButtonStyle = (optionId: string) => {
    const isSelected = selectedOption === optionId;
    return [
      styles.optionButton,
      {
        backgroundColor: isSelected ? colors.selected : colors.primary,
        borderColor: isSelected ? colors.selected : colors.charcoalGray,
        transform: [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, isSelected ? 1.05 : 0.98],
            }),
          },
        ],
      },
    ];
  };

  const getTextStyle = (optionId: string): TextStyle => {
    const isSelected = selectedOption === optionId;
    return {
      ...styles.optionText,
      color: isSelected ? '#FFFFFF' : colors.textSecondary,
      fontWeight: isSelected ? '600' : '500',
    };
  };

  const getEmojiStyle = (optionId: string) => {
    const isSelected = selectedOption === optionId;
    return [
      styles.emoji,
      {
        opacity: isSelected ? 1 : 0.6,
        transform: [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, isSelected ? 1.2 : 0.9],
            }),
          },
        ],
      },
    ];
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        Select Your Prediction
      </Text>
      
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={getButtonStyle(option.id)}
            onPress={() => handleSelection(option.id)}
            activeOpacity={0.8}
          >
            <Animated.Text style={getEmojiStyle(option.id)}>
              {option.emoji}
            </Animated.Text>
            <Text style={getTextStyle(option.id)} numberOfLines={1}>
              {option.label}
            </Text>
            
            {selectedOption === option.id && (
              <Animated.View
                style={[
                  styles.selectionIndicator,
                  {
                    backgroundColor: colors.selected,
                    opacity: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    position: 'relative',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  }
});

export default ResultSelector;