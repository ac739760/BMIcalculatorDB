import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TextInput, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component, useState, useEffect} from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as SQLite from "expo-sqlite";

openDatabase = ()=>{
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("bDB.db");
  return db;
};

db = this.openDatabase();

function Items() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select id, weight, height, BMI, date(itemDate) as itemDate from items;`,
        [],
        (_, { rows: { _array } }) => setItems(_array)
      );
    });
  }, []);



  if (items === null || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeading}>BMI History</Text>
      {items.map(({ id, weight, height, itemDate , BMI}) => (
       
          <Text key = {id}style={{ color:"#000" }}>{itemDate+": "+ BMI + " (W:"+weight+", H:"+ height+")" }</Text>
      ))}
    </View>
  );
}


SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 2000);

export default class App extends Component {
  
 state = {
  weight:'',
  height:'',
  BMI:'',
 };



constructor(props){
  super(props);
  this.onLoad();
  
}
componentDidMount(){
  //this.setTimeout(()=>{},2000)
}
onLoad = async()=>{
 // try{
    db.transaction((tx) => {
      //tx.executeSql(
      //  "drop table items;"
      //);
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, weight text, height text, BMI text, itemDate real);"
      );
    });
  //}catch(error){
   // Alert.alert('Error', 'There was an error while loading the data');
  //}
}
onSave = async () =>{
  const {weight, height} = this.state;
  const BMI = (weight/(height*height)*703).toFixed(1)
  //try {
    db.transaction(
      (tx) => {
        tx.executeSql("insert into items (weight, height, BMI, itemDate) values (?, ?, ? , julianday('now'))", [weight, height, BMI]);
        tx.executeSql("select * from items", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      null,
      null
    );
   
    this.setState({BMI});
  //} catch (error) {
  //  Alert.alert('Error', 'There was an error while saving the data');
  //}
  
}

onHeightChange=(height) => this.setState({height});
onWeightChange = (weight)=> this.setState({weight});

render(){
  const {weight, height, BMI} = this.state;
  let accessing = '';
  if(BMI){
    if(BMI<18.5){
      accessing = "(Underweight)"
    }else if (BMI <24.9){
      accessing = "(Healthy)"
    }else if(BMI< 29.9){
      accessing = "(Overweight)"
    }else{
      accessing = "(Obese)"
    }
  }else{
    accessing = ""
  }

  return (
    <View>
    
      <Text style = {styles.container}>BMI Calculator</Text>
  <View style = {styles.inputcontainer}>
   <TextInput
   style = {styles.input}
   placeholder = "Weight in Pounds"
   value = {weight}
   onChangeText={this.onWeightChange}/>
   <TextInput
   style = {styles.input}
   placeholder = "Height in Inches"
   value = {height}
   onChangeText={this.onHeightChange}/>
 
  <Pressable onPress={this.onSave} style={styles.button}>
            <Text style = {styles.buttonText}>Compute BMI</Text>
  </Pressable>
  
  


    <Text style = {styles.hidden}>{BMI ? "Body Mass Index is "+BMI:''}</Text>
       <Text>{accessing}</Text>
    <Text style = {styles.accessing}>
      {}
      <Items/>
    </Text>
    <StatusBar style="auto" />
    </View>
    </View>
  );
  }


}

const styles = StyleSheet.create({
  container: {
    color:'white',
    backgroundColor: '#f4511e',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight:'bold',
    fontSize:30,
    padding: 30,
    paddingLeft:100,
    marginBottom:10
  },
  inputcontainer:{
    justifyContent:'center',
    alignItems:'center',
  },
  input:{
    fontSize: 24,
    padding:5,
    backgroundColor:'#ddd',
    height:35,
    width: 400,
    marginBottom:10
  },
  button:{
    backgroundColor:'#34495e',
    padding:20,
    paddingLeft:120,
    width:400

  },
  buttonText:{
    color: '#fff',
    fontSize:24
  },
  hidden:{
    height:100,
    paddingTop: 40,
    fontSize: 28,
  },
  accessing:{
      paddingRight:80,
      fontSize:20,
  },
});