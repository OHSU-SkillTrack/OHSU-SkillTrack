import React from "react";
import * as DocumentPicker from 'expo-document-picker';
import { AppText } from "@/components/AppText";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native"; // ✅ make sure it's from 'react-native'
import { Button } from "@react-navigation/elements";
import styles from "@/app/styles";






export default function AddStudentsTab() {

  async function pickFile(){

    //const selectedFile = await DocumentPicker.getDocumentAsync({
    //  type: ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.csv']
    //})

    try{
      const selectedFile = await DocumentPicker.getDocumentAsync()
      console.log(selectedFile.assets[0].name)
      let fileName = selectedFile.assets[0].name

      //If not the correct file format, ie. csv or xlsx, return with an error
      fileName = fileName.toLowerCase()
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx')){
        Alert.alert('Error', 'Wrong file format. Please select a .csv or .xlsx file')
        return;
      }

      //ok


    }
    catch (err){
      Alert.alert('Error', 'Error selecting file, please try again')
      return;


    }



  }



  return (

    <View>

      <Text>
        INSTRUCTIONS: Lorem Ipsum, Lorem ipsum Lorem Ipsum, Lorem ipsum Lorem Ipsum, Lorem ipsum Lorem Ipsum, Lorem ipsum Lorem Ipsum, Lorem ipsum
      </Text>

      <Pressable
        style = {styles.templateButton}
        onPress={pickFile}>


        <AppText >
          {"Select a CSV file to upload"}
        </AppText>
      </Pressable>

    </View>



  );
}
