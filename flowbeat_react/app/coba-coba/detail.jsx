import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const Detail = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detail Page</Text>
      <Link href={'/'} style={styles.link}>Home Page</Link>
      <Link href={'/about'} style={styles.link}>About Page</Link>
    </View>
  )
}

export default Detail

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',

    },
    title:{
        fontWeight: 'bold',
        fontSize:18
    },
    link:{
        marginVertical:10,
        borderBottomWidth:1
    },
})