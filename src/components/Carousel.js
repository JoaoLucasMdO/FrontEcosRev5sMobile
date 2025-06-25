import { useState, useRef, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList, Animated } from 'react-native';
import { useTheme } from "../contexts/ThemeContext";

const { width } = Dimensions.get('window');

const Carousel = ({ slides }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const theme = useTheme();

  // Auto scroll
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeIndex === slides.length - 1) {
        flatListRef.current.scrollToIndex({
          index: 0,
          animated: true,
        });
      } else {
        flatListRef.current.scrollToIndex({
          index: activeIndex + 1,
          animated: true,
        });
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [activeIndex, slides.length]);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <Image
            source={item.imageSrc}
            style={[
              styles.image,
              { borderRadius: 28 }
            ]}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Render dots
  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          
          const dotSize = scrollX.interpolate({
            inputRange,
            outputRange: [8, 10, 8],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={`dot-${index}`}
              style={[
                styles.dot,
                { 
                  width: dotSize,
                  height: dotSize,
                  opacity,
                  backgroundColor: activeIndex === index 
                    ? theme.colors.primary 
                    : theme.colors.text.secondary
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item, index) => `slide-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
      {renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    position: 'relative',
    marginTop: 15,
  },
  slide: {
    width: width,
    height: 250,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 20,
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 5,
  },
});

export default Carousel;