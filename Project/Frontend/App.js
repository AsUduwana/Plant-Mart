import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, LogBox } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import Toast from 'react-native-toast-message';


// Redux
import { Provider } from "react-redux";
import store from "./Redux/store";

//Context API
import Auth from './Context/store/Auth';

// Navigate
import Main from "./Navigators/Main";

//screens
import Header from './Shared/Header';
import ProductContainer from './Screens/Products/ProductContainer';


LogBox.ignoreAllLogs(true);

export default function App() {
  return (
    <Auth>
      <Provider store={store}>
        <NavigationContainer>
          <Header />
          <Main/>
          <Toast ref={(ref) => Toast.setRef(ref)} />
        </NavigationContainer>
      </Provider>
    </Auth>


  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
