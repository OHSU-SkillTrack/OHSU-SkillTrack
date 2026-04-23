import React from "react";
import * as DocumentPicker from 'expo-document-picker';
import { AppText } from "@/components/AppText";
import { View, Text, StyleSheet, Pressable, Alert, TextInput } from "react-native"; // ✅ make sure it's from 'react-native'
import { Button } from "@react-navigation/elements";
import styles from "@/app/styles";
import * as FileSystem from 'expo-file-system/legacy';
import { Directory } from "expo-file-system/build/ExpoFileSystem.types";
import * as XLSX from 'xlsx';
import { Header } from "@/components/ui/Header";
import { Image, Dimensions, ScrollView} from 'react-native';
import { useState } from "react";
import { fetchAuthSession } from 'aws-amplify/auth';
import { BASE_URL } from '@/src/constants/api';


type UserRole = "Student" | "Teacher" | "Admin";



type User = {
  FirstName: string;
  LastName: string;
  Password: string;
  Role: UserRole;
};


interface CreateUsersRequest{
  NewUsers:{
    Email: string
    Password: string
    Role: string
    FirstName: string
    LastName: string

  }[]
}



//You must pass a correctly formatted JSON body into this function for it to work
async function createUsersWithAPICall(jsonBody: CreateUsersRequest ){

  try{
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString()
    if (!token) {
        throw new Error("No idToken found")
    }

    console.log('testing that we get here')


    const response = await fetch(`${BASE_URL}/CreateUser`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify(jsonBody),
    })

    return response

  }
  catch(err){
    Alert.alert('Error', 'Error processing user creation. Finished wit this error: ' + err)
    return;
  }

}


function parseRows(rows: string[][]){

  const newUserDictionary: { [key: string]: any } = {};


  //construct each new student (or other type of user) to be added
  for(const row of rows){

    //if this is the header row, skip it. Even if they forgot the header row though, this loop should still work just fine
    //We will verify by just checking the first cell
    if(row[0].toLowerCase().trim() == "email" )
      continue


    const capitalizedRole = capitalizeFirstLetter(row[3].toLowerCase()).trim()



    newUserDictionary[row[0].toLowerCase().trim()] = {FirstName: row[1], LastName: row[2], Role: capitalizedRole, Password: randomString() }

  }

  return newUserDictionary

}


function capitalizeFirstLetter(str: string){
  if (!str) return str

  return str.charAt(0).toUpperCase() +str.slice(1)

}


function randomString(length: number = 10){

  const l = length -4 

  let randString = Math.random().toString(36).slice(2,2+l)

  randString = randString + "$Y2&"

  return randString
  


}


export default function AddStudentsTab() {

  const [newUsers, setNewUsers] = useState<Record<string, User>>({});

  const [submitting, setSubmitting] = useState(false);

  const screenWidth = Dimensions.get('window').width




  async function pickFile(){

    //const selectedFile = await DocumentPicker.getDocumentAsync({
    //  type: ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.csv']
    //})

    try{
      const selectedFile = await DocumentPicker.getDocumentAsync()
      //console.log(selectedFile.assets[0].name)
      let fileName = selectedFile.assets[0].name

      //If not the correct file format, ie. csv or xlsx, return with an error
      fileName = fileName.toLowerCase()
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx')){
        Alert.alert('Error', 'Wrong file format. Please select a .csv or .xlsx file')
        return;
      }




      const file = selectedFile.assets[0]
      const { name, uri } = file;

      //Do this if this is a CSV file
      if(fileName.endsWith('.csv')){


        const fileContents = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        //const rows: string[][] = fileContents.split('\n').map(row => row.split(','));

        //const rows = fileContents.split('\n').map(row => row.split(','));
        const rows = fileContents
          .trim()
          .split(/\r?\n/)
          .map(row => row.split(','));
        
        console.log(rows)
        
        const newUserDictionary: { [key: string]: any } = parseRows(rows);

        setNewUsers(newUserDictionary)

      }
      //do this if it's a xlsx file
      else if (fileName.endsWith('.xlsx')) {
        //console.log("FILE URI:", uri);

        const b64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        //console.log("BASE64 LENGTH:", b64?.length);

        const workbook = XLSX.read(b64, { type: "base64" });

        //console.log("SHEET NAMES:", workbook.SheetNames);

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        //console.log("RAW SHEET:", sheet);

        const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        });


        const newUserDictionary: { [key: string]: any } = parseRows(rows);


        setNewUsers(newUserDictionary)
        
      }
    }
    catch (err){
      Alert.alert('Error', 'Error selecting or processing file. Please make sure your file is formatted correctly.')
      return;


    }




  }

  
  //call this only after you have 
  async function createUsersFromSpreadsheetData(){


    try{

      setSubmitting(true)


      //We must construct the request body with all the users that we now have stored from the spreadsheet
      const requestBody: CreateUsersRequest = {
        NewUsers: [
        ]
      }

      for(const [userEmail, userData] of Object.entries(newUsers) ){

        console.log(userEmail)
        console.log(userData)

        const userToInsert = {Email: userEmail, Password: userData.Password, Role: userData.Role, FirstName: userData.FirstName, LastName: userData.LastName }
      
        requestBody.NewUsers.push(userToInsert)
      }

      //console.log(requestBody)
      const response = await createUsersWithAPICall(requestBody)

      setSubmitting(false)

      if (response && (response.status >= 200 && response.status <= 299 )){

        Alert.alert('Success', 'Accounts created. Please take note of the listed passwords on the table and provide them to your users');
      }
      else if (response){

        Alert.alert('Message', 'message: ' + response.body)

      }
      else{

        Alert.alert('Error', 'An unknown error has occurred, please try again ')

      }



    }
    catch{

      setSubmitting(false)
    }


  

  }


  async function createUserFromIndividualUserCreator(){


    try{

      setSubmitting(true)

      const email = individualCreatorEmail.trim().toLowerCase()
      const password = randomString() 

      const requestBody: CreateUsersRequest = {
        NewUsers: [
          {
            Email: email,
            Password: password,
            Role: individualCreatorRole,
            FirstName: individualCreatorFirstName,
            LastName: individualCreatorLastName
          }
        ]

      }
      
      const response = await createUsersWithAPICall(requestBody)

      if (response && (response.status >= 200 && response.status <= 299 )){

        Alert.alert('Success', 'Please provide this password to the user you just created this account for: '+ password);
        setIndividualCreatorEmail('')
        setIndividualCreatorFirstName('') 
        setIndividualCreatorLastName('')
        setIndividualCreatorRole("Student")
      
      }
      else if (response){

        Alert.alert('Error', 'The following error occured: ' + response.body)

      }
      else{

        Alert.alert('Error', 'An unknown error has occurred, please try again ')

      }
      setSubmitting(false)



    }
    catch{

      setSubmitting(false)




      Alert.alert('Error', 'An unknown error has occurred, please try again ')
    }



  }



  //this variable stores the individual role when using the INDIVIDUAL user creator ONLY. Not when using the CSV creator  
  //These variables are for storing the infor
  const [individualCreatorRole, setIndividualCreatorRole] = useState<'Student' | 'Teacher' | 'Admin'>('Student');
  const [individualCreatorEmail, setIndividualCreatorEmail] = useState("")
  const [individualCreatorFirstName, setIndividualCreatorFirstName] = useState("")
  const [individualCreatorLastName, setIndividualCreatorLastName] = useState("")


  return (

    <ScrollView>
      
      
      <View style = {styles.container}>

        <Header text="Add New Users to SkillTrack" backArrow={false} />


        <AppText style = {{fontWeight: 'bold'}}>Use this page to add new students, teachers, or admins </AppText>

        <AppText>
        INSTRUCTIONS: 
        Please upload either a .csv or .xlsx (excel file) file. Make sure your file follows the exact format seen in this image.
        There should be one row per new user you want to add. The first column is the users email. The second column is their first name. The third column is their last name.
        The last column is the role you want to assign the user. They can be a <AppText style={{fontWeight:'bold'}}>Student</AppText>, a <AppText style={{fontWeight:'bold'}}>Teacher</AppText>, or an <AppText style={{fontWeight:'bold'}}>Admin</AppText>.

        Please be cautious assigning the Admin permission, it is a very powerful role and the user will have the same elevated powers you have.
        </AppText>
        
        <View style = {styles.containerWithImage}>
          <Image   style={{
          width: screenWidth * 0.9,
          aspectRatio: 16 / 9,
          alignItems: 'center', borderWidth :2, borderRadius: 10}}source ={require('../../../assets/images/UserSheetUploadGuideImage.png')} resizeMode="contain"/>
        </View>

        {/*Preview table of accoutns to be created*/}
        <View style= {{marginTop: 15}}>
          <AppText>Preview the accounts that will be created (please save the password information and share with your students):</AppText>
          <View style={{ flexDirection: "row", borderBottomWidth: 1, paddingBottom: 5 }}>
            <Text style={{ flex: 1, fontWeight: "bold" }}>Email</Text>
            <Text style={{ flex: 1, fontWeight: "bold" }}>First</Text>
            <Text style={{ flex: 1, fontWeight: "bold" }}>Last</Text>
            <Text style={{ flex: 1, fontWeight: "bold" }}>Role</Text>
            <Text style={{ flex: 1, fontWeight: "bold" }}>Password</Text>
          </View>

          {Object.entries(newUsers).map(([Email, User],index) =>(
            <View
              key = {Email}
              style = {{ flexDirection: "row", paddingVertical: 6, borderBottomWidth: 0.5 }}
            >
              <Text style={{ flex: 1 }}>{Email}</Text>
              <Text style={{ flex: 1 }}>{User.FirstName}</Text>
              <Text style={{ flex: 1 }}>{User.LastName}</Text>
              <Text style={{ flex: 1 }}>{User.Role}</Text>
                <Text style={{ flex: 1 }}>{User.Password}</Text>
            </View>


          ))}


        </View>


        <Pressable
          style = {styles.generalButton}
          onPress={pickFile}>


          <AppText >
            {"Select a CSV file to upload"}
          </AppText>
        </Pressable>


        <Pressable 
          style = {[styles.templateButton, (Object.keys(newUsers).length > 0 && !submitting) && { opacity: 1 }]}
          disabled = {!(Object.keys(newUsers).length > 0) || submitting}
          onPress = {createUsersFromSpreadsheetData}>

          <AppText >
            {"Create Users"}
          </AppText>
        </Pressable>


        
        <Text>    </Text>

        <AppText style = {{fontSize: 30, textAlign: "center"}}>Prefer to manually create an individual user?</AppText>
        <AppText>If you simply need to create an individual user (rather than many) you can use this editor instead of making a spreadsheet</AppText>

        {/*This is the ButtonSelector for choosing Admin, Teacher, or */}
        <Text> </Text>
        <AppText>Select the role you want this user to have:</AppText>
        <ButtonSelector value={individualCreatorRole} onChange={setIndividualCreatorRole}/>

        <Text> </Text>
        <AppText>Enter this users email:</AppText>
        <TextInput value={individualCreatorEmail} onChangeText={(text) => setIndividualCreatorEmail(text.toLocaleLowerCase())} style={styles.textInput} placeholder='example@email.com'/> 

        <Text></Text>
        <AppText>Enter this users first and last name:</AppText>
        <TextInput value={individualCreatorFirstName} onChangeText={setIndividualCreatorFirstName} style={styles.textInput} placeholder='First Name'/> 
        <TextInput value= {individualCreatorLastName} onChangeText={setIndividualCreatorLastName} style={styles.textInput} placeholder='Last Name'/> 

        
        <Pressable 
          style = {[styles.templateButton, ((individualCreatorEmail && individualCreatorFirstName && individualCreatorLastName && individualCreatorRole && !submitting) ) && { opacity: 1 }]}
          disabled = {!(individualCreatorEmail && individualCreatorFirstName && individualCreatorLastName && individualCreatorRole) || submitting}
          onPress={createUserFromIndividualUserCreator}>

          <AppText >
            {"Create Users"}
          </AppText>
        </Pressable>
        


        
        
        
        
        
        
        <Text>    </Text>




      </View>

    </ScrollView>





  );

}


//////////////////////////////////////////////////////////////////////////////////////
/*This chunk of code is used to make the selectors */
type ButtonSelectorProps = {
  value: UserRole;
  onChange: (v: UserRole) => void;
};

const ButtonSelector = ({ value, onChange }: ButtonSelectorProps) => {
  const options: UserRole[] = ['Student', 'Teacher', 'Admin'];

  return (
    <View style={styles.container}>
      {options.map(option => {
        const selected = value === option;

        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[
              selectableButtonStyles.button,
              selected && selectableButtonStyles.selectedButton,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <AppText
              style={[
                selectableButtonStyles.text,
                selected && selectableButtonStyles.selectedText,
              ]}
            >
              {option}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};


const selectableButtonStyles = StyleSheet.create({
  screen: {
    padding: 20,
  },

  container: {
    flexDirection: 'row',
    gap: 10,
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },

  selectedButton: {
    backgroundColor: '#4972FF',
    borderColor: '#4972FF',
  },

  text: {
    fontSize: 14,
  },

  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
});
//////////////////////////////////////////////////////////////////////////////////////