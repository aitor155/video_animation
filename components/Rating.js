import React from 'react'
import styled from 'styled-components/native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Container = styled.View `
    flex-direction: row;
    margin-vertical: 4px;
    align-items: center;
    justify-content: center;
`

export default function Rating({rating}){
    const totalOfFullStars = Math.floor(rating/2)
    const startOutlineArray = Array(5- totalOfFullStars).fill('star-outline')
    const fullStarArray = Array(totalOfFullStars).fill('star')
    const ratingStars = [...fullStarArray, ...startOutlineArray]

    return (
        <Container>
            {ratingStars.map((icon, index) => {
                return <MaterialCommunityIcons key={index} name={icon} size={16} color="gray" />
            })}
        </Container>
    )
}