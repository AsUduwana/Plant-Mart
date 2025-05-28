import { Platform } from 'react-native'

//let baseURL = ' /api/'

let baseURL = '';

{Platform.OS == 'android' // only developing for anroid
? baseURL = 'http://10.0.2.2:3000/api/' //android base url
: baseURL = 'http://localhost:3000/api/'
}

export default baseURL;