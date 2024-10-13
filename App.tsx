import React, { useState, useEffect, useRef } from 'react';
import { FlatList, ActivityIndicator, View, Animated } from 'react-native'; // Import ActivityIndicator for loading

import { StatusBar } from 'react-native'; // Use the built-in StatusBar

import styled from 'styled-components/native'; // Styled-components for styling
import Rating from './components/Rating';
import Genre from './components/Genre';
import { getMovies } from './api';
import * as CONSTANTS from './constants/constants'; // Import your constants

import LinearGradient from 'react-native-linear-gradient';


const Container = styled.View`
    flex:1;
    padding-top: 50px;
    background-color: #000;
`

const PosterContainer = styled.View`
    width: ${CONSTANTS.ITEM_SIZE}px;
    margin-top: ${CONSTANTS.TOP}px;
`

const Poster = styled.View`
  margin-horizontal: ${CONSTANTS.SPACING}px;
  padding: ${CONSTANTS.SPACING * 2}px;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
`;

const PosterImage = styled.Image`
  width: 100%;
  height: ${CONSTANTS.ITEM_SIZE * 1.2}px;
  resize-mode: cover;
  border-radius: 16px;
  margin: 0 10px 0;
`;

const PosterTitle = styled.Text`
  font-family: 'SyneMono-Regular';
  font-size: 18px;
  color: #FFF;
`;

const PosterDescription = styled.Text`
  font-family: 'SyneMono-Regular';
  font-size: 12px;
  color: #FFF;
`;

const DummyContainer = styled.View`
  width: ${CONSTANTS.SPACER_ITEM_SIZE}px;
`

const ContentContainer = styled.View`
  position: absolute;
  width: ${CONSTANTS.WIDTH}px;
  height: ${CONSTANTS.BACKDROP_HEIGHT}px;
`
const BackdropContainer = styled.View`
  width: ${CONSTANTS.WIDTH}px;
  position: absolute;
  height: ${CONSTANTS.BACKDROP_HEIGHT}px;
  overflow: hidden;
`;

const BackdropImage = styled.Image`
    position: absolute;
    width: ${CONSTANTS.WIDTH}px;
    height: ${CONSTANTS.BACKDROP_HEIGHT}px;
`;


type Movie = {
  key: string;
  posterPath: string;
  originalTitle: string;
  voteAverage: number;
  genres: string[];
  description: string;
};



export default function  App() {
    const [movies, setMovies] = useState<Movie[]>([]); // Define the state with the correct Movie type
    const [loaded, setLoaded] = useState(false); // State to track loading status
    const scrollX = useRef(new Animated.Value(0)).current

    // Fetch movies data
    useEffect(() => {
        const fetchData = async () => {
          const data: Movie[] = await getMovies(); // Make sure getMovies returns the correct type

          const spacerMovie = {
            key: 'spacer', // Can use any string as key
            posterPath: '', // Placeholder or empty for spacers
            originalTitle: '', // Empty title for spacer
            voteAverage: 0, // Default rating
            genres: [], // No genres for spacer
            description: '', // Empty description
          };

          setMovies([
            { ...spacerMovie, key: 'left-spacer' }, // Left spacer
            ...data, // Original movie data
            { ...spacerMovie, key: 'right-spacer' } // Right spacer
          ]);
          setLoaded(true);
        };

        fetchData();
    }, []);

    // Show loading indicators while fonts or movies are loading
    if (!loaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <Container>
          {/* Backdrop component is now above the StatusBar */}
          <Backdrop movies={movies} scrollX={scrollX} />

          <StatusBar />
          <Animated.FlatList // Change to Animated.FlatList
                showsHorizontalScrollIndicator={false}
                data={movies}
                keyExtractor={(item) => item.key}
                horizontal
                snapToInterval={CONSTANTS.ITEM_SIZE}
                decelerationRate={0}
                scrollEventThrottle={16}
                contentContainerStyle={{
                    alignItems: 'center',
                }}
                // Add the onScroll event here
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true } // Use native driver for better performance
                )}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 2) * CONSTANTS.ITEM_SIZE,
                (index - 1 ) * CONSTANTS.ITEM_SIZE,
                 index  * CONSTANTS.ITEM_SIZE,
            ];

            const translateY = scrollX.interpolate({
                inputRange,
                outputRange: [0, -50, 0],
            });

            if (!item.originalTitle) {
              return <DummyContainer />; // Render DummyContainer if there's no title
            }
  
            // Render the actual movie item
              return (
                <PosterContainer>
                  <Poster as={Animated.View} style={{transform: [{translateY}]}}>
                    <PosterImage source={{ uri: item.posterPath }} />
                    <PosterTitle numberOfLines={1}>{item.originalTitle}</PosterTitle>
                    <Rating rating={item.voteAverage} />
                    <Genre genres={item.genres} />
                    <PosterDescription numberOfLines={5}>{item.description}</PosterDescription>
                  </Poster>
                </PosterContainer>
              );
            }}
          />
        </Container>
      );
}

// Backdrop Component
const Backdrop = ({ movies, scrollX }) => {
  return (
      <ContentContainer>
          <FlatList
              data={movies}
              keyExtractor={item => `${item.key}-back`}
              removeClippedSubviews={false}
              contentContainerStyle={{ width: CONSTANTS.WIDTH, height: CONSTANTS.BACKDROP_HEIGHT }}
              renderItem={({ item, index }) => {
                  if (!item.backdropPath) {
                      return null; // Skip rendering if backdropPath is missing
                  }
                  const translateX = scrollX.interpolate({
                      inputRange: [(index - 1) * CONSTANTS.ITEM_SIZE, index * CONSTANTS.ITEM_SIZE],
                      outputRange: [8, CONSTANTS.WIDTH]
                  });
                  return (
                      <BackdropContainer
                          as={Animated.View}
                          style={{ transform: [{ translateX }] }}>
                          <BackdropImage source={{ uri: item.backdropPath }} />
                      </BackdropContainer>
                  );
              }}
          />

          {/* Linear Gradient */}
          <LinearGradient
              colors={['rgba(0, 8, 6, 0)', 'black']}
              style={{
                  height: CONSTANTS.BACKDROP_HEIGHT,
                  width: CONSTANTS.WIDTH,
                  position: 'absolute',
                  bottom: 0,
              }}
          />
      </ContentContainer>
  );
};
