import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type TimerDuration = 
  | 'TEN_SECONDS'
  | 'FIFTEEN_SECONDS' 
  | 'TWENTY_SECONDS'
  | 'TWENTY_FIVE_SECONDS'
  | 'THIRTY_SECONDS'
  | 'FORTY_FIVE_SECONDS';

interface CountdownTimerProps {
  timerDuration: TimerDuration;
  onTimeUp: () =>void;
  isActive?: boolean;
  style?: ViewStyle;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
    timerDuration, 
    onTimeUp,
    isActive = true,
    style = {} 
    }) => {

    const [timeLeft, setTimeLeft] = useState<number>(0);
    const intervalRef: any = useRef<NodeJS.Timeout | null>(null);

    // Circle properties
    const size = 70;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Convert enum string to seconds
    const getSecondsFromDuration = (duration: TimerDuration): number => {
        const durationMap: Record<TimerDuration, number> = {
        'TEN_SECONDS': 10,
        'FIFTEEN_SECONDS': 15,
        'TWENTY_SECONDS': 20,
        'TWENTY_FIVE_SECONDS': 25,
        'THIRTY_SECONDS': 30,
        'FORTY_FIVE_SECONDS': 45,
        };
        return durationMap[duration] || 30;
    };

  // Initialize timer when timerDuration changes
  useEffect(() => {
    if (timerDuration) {
      const seconds = getSecondsFromDuration(timerDuration);
      setTimeLeft(seconds);
    }
  
  }, [timerDuration]);

    onTimeUp = ():void =>{
        console.log("cannot submit time is up");
    }
  // Handle countdown logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            if (onTimeUp) {
              onTimeUp();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, onTimeUp]);

   const getTimerColor = (): string => {
    if (timeLeft <= 5) return '#E74C3C'; 
    if (timeLeft <= 10) return '#F39C12'; 
    return '#27AE60'; 
  };

  const getScale = (): number => {
    if (timeLeft <= 5) return 1.1;
    if (timeLeft <= 10) return 1.05;
    return 1.0;
  };
  
  const progress = timeLeft / getSecondsFromDuration(timerDuration);
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.timerWrapper}>
        {/* Circular Progress Bar using SVG */}
        <Svg
          width={size}
          height={size}
          style={styles.circularProgress}
        >
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E9ECEF"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getTimerColor()}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`} // Start from top
          />
        </Svg>
        
        {/* Timer content */}
        <View style={styles.timerContent}>
          <Text 
            style={[
              styles.timerText, 
              { 
                color: getTimerColor(),
                transform: [{ scale: getScale() }]
              }
            ]}
          >
            {timeLeft}
          </Text>
          <Text style={styles.secondsLabel}>
            {timeLeft === 1 ? 'sec' : 'secs'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  timerWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgress: {
    transform: [{ rotate: '0deg' }],
  },
  timerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '75%',
    height: '75%',
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  secondsLabel: {
    fontSize: 8,
    color: '#6C757D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: -2,
  },
});

export default CountdownTimer;