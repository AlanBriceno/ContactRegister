import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  ScrollView,
  Text,
  View,
  Button,
  Alert,
  Image,
  ImageStore,
  ImageEditor
} from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import { TextField } from 'react-native-material-textfield';
import ImageResizer from 'react-native-image-resizer';
import ImagePicker from 'react-native-image-picker';
import Axios from './src/axios';
import {
  isNameValid,
  isEmailValid,
  isNumberValid,
} from './src/utils/validators';

var options = {
  title: 'Select Photo',
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};



export default class App extends Component {
  constructor(props) {
    super(props);

    this.onFocus = this.onFocus.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.addContact = this.addContact.bind(this);

    this.companyRef = this.updateRef.bind(this, 'company');
    this.lastnameRef = this.updateRef.bind(this, 'lastname');
    this.nameRef = this.updateRef.bind(this, 'name');
    this.emailRef = this.updateRef.bind(this, 'email');
    this.numberRef = this.updateRef.bind(this, 'number');
    this.countryRef = this.updateRef.bind(this, 'country');

    this.state = {
      Company: '',
      EmailAddress: '',
      LastName: '',
      Name: '',
      Countries: [],
      CountryCode: '',
      CountryName: '',
      Number: '',
      Photo: '',
      avatarSource: '',
      Contacts: [],
    }
  }

  componentDidMount() {
    Axios.get(`countries`)
      .then((response) => {
        const { data } = response;
        data.map((countryData) => {
          this.state.Countries.push({
            "Code": countryData.Code,
            "value": countryData.Name,
          });
        });
      })
      .catch((error) => {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              Alert.alert('Error', 'Invalid client request');
              break;
            case 401:
              Alert.alert('Error', 'Not authenticated');
              break;
            case 404:
              Alert.alert('Error', 'Information not found');
              break;
            case 500:
              Alert.alert('Error', 'Internal server error');
              break;
            case 503:
              Alert.alert('Error', 'Server dead');
              break;
            default:
              Alert.alert('Error', 'Unkwon error');
              break;
          }
        } else if (error.request) {
          Alert.alert('Error', 'request could not be donde');
        } else {
          Alert.alert('Error', error.message);
        }
      });
  }

  onFocus() {
    let { errors = {} } = this.state;

    for (let name in errors) {
      let ref = this[name];

      if (ref && ref.isFocused()) {
        delete errors[name];
      }
    }

    this.setState({ errors });
  }

  updateRef(name, ref) {
    this[name] = ref;
  }

  addContact(){
    let errors = {};
    ['company', 'name','lastname', 'email', 'number', 'country']
      .forEach((name) => {
        let value = this[name].value();

        if (!value) {
          errors[name] = 'Should not be empty';
        } else {
          if ('email' === name && !isEmailValid(value)) {
            errors[name] = 'invalid email';
          }
          if ('name' === name && !isNameValid(value)) {
            errors[name] = 'only letters';
          }
          if ('lastname' === name && !isNameValid(value)) {
            errors[name] = 'only letters';
          }
          if ('number' === name && !isNumberValid(value)) {
            errors[name] = 'invalid number';
          }
        }
      });

    this.setState({
        errors
    }, () => {
      if (this.state.avatarSource === '') {
        Alert.alert(
          'Photo required',
          'You should choose a photo',
          [
            {text: 'OK'},
          ],
          { cancelable: false }
        )
      }
      if (this.state.errors != '') {
        this.state.Contacts.push({
          "Company" : this.state.Company,
          "EmailsAddress" : [
            this.state.EmailAddress
          ],
          "LastName" : this.state.LastName,
          "Name" : this.state.Name,
          "PhoneNumbers" : [
            {
              "Country" : {
                "Code" : this.state.CountryCode,
                "Name" : this.state.CountryName
              },
              "Number" : this.state.Number
            } 
          ],
          "Photo" : this.state.Photo
        })
        this.setState({
          Company: '',
          Name: '',
          LastName: '',
          Number: '',
          EmailAddress: '',
          avatarSource: '',
        });
      }
    });
  }

  onSubmit() {
    this.addContact();
    let finalValue = {
      "Contacts": this.state.Contacts,
      "Location" : {
        "Latitude" : 15.0,
        "Longitude" : 15.0
      },
      "RegisteredBy": {"Name": "Alan Alexis Briceño Brito"},
      "Type" : 1
    };

    
    Axios.post('ContactRegister/', finalValue)
    .then(function (response) {
      if (response.status === 200) {
        Alert.alert(
          'Good job!',
          'The data is on the server',
          [
            {text: 'OK'},
          ],
          { cancelable: false }
        )
      }
    })
    .catch(function (error) {
      console.log(error);
    });

  }

  _selectPhoto = () => {
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else {
        let source = { uri: 'data:image/jpeg;base64,' + response.data };
        let data = response.uri
    
        ImageResizer.createResizedImage(data, 800, 600, 'JPEG', 80).then((response) => {
          let uri = response.path

          Image.getSize(uri, (width, height) => {
            let imageSettings = {
              size: { width: width, height: height }
            };
            ImageEditor.cropImage(uri, imageSettings, (uri) => {
              ImageStore.getBase64ForTag(uri, (data) => {
                this.setState({
                  Photo: data,
                });
              }, e => console.log("getBase64ForTag: ", e))
            }, e => console.log("cropImage: ", e))
          })
            
        }).catch((err) => {
          Alert.alert(
            'Oops',
            'Something went wrong rezise',
            [
              {text: 'OK'},
            ],
            { cancelable: false }
          )
        });
    
        this.setState({
          avatarSource: source,
        });
      }
    });


  }

  _getCountry = (value) => {
    for(var i = 0; i < this.state.Countries.length; i++)
      {
        if(this.state.Countries[i].value == value)
        {
          this.setState({CountryCode: this.state.Countries[i].Code});
          this.setState({CountryName: value});
        }
      }
  };

  render() {
    let {
      errors = {},
      Company,
      EmailAddress,
      LastName,
      Name,
      Number,
    } = this.state;
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.container}>
        
          <TextField
            label='Company'
            ref={this.companyRef}
            onFocus={this.onFocus}
            value={Company}
            onChangeText={(Company) => this.setState({ Company })}
            autoCorrect={false}
            onFocus={this.onFocus}
            error={errors.company}
          />
          <TextField
            ref={this.emailRef}
            onFocus={this.onFocus}
            error={errors.email}
            autoCapitalize="none"
            label='Email Address'
            value={EmailAddress}
            onChangeText={(EmailAddress) => this.setState({ EmailAddress })}
          />
          <TextField
            ref={this.lastnameRef}
            onFocus={this.onFocus}
            error={errors.lastname}
            label='Last Name'
            value={LastName}
            onChangeText={(LastName) => this.setState({ LastName })}
          />
          <TextField
            ref={this.nameRef}
            onFocus={this.onFocus}
            error={errors.name}
            label='Name'
            value={Name}
            onChangeText={(Name) => this.setState({ Name })}
          />
          <Dropdown
            ref={this.countryRef}
            onFocus={this.onFocus}
            error={errors.country}
            //containerStyle={styles.dropdown}
            label='Country'
            data={this.state.Countries}
            onChangeText={this._getCountry}
            //onChangeText={ this._getTipoId/*(data) => this.setState({ telefono: data.id })} 
          />
          <TextField
            ref={this.numberRef}
            onFocus={this.onFocus}
            error={errors.number}
            label='Number'
            value={Number}
            keyboardType='numeric'
            onChangeText={(Number) => this.setState({ Number })}
          />
          <View style={styles.photoContainer}>
            <Button
              onPress={this._selectPhoto}
              title="Select Photo"
              color='green'
            />
            <View style={styles.photoPreview}>
              <Text>Photo Preview</Text>
              <Image source={this.state.avatarSource} style={{width: 100, height: 100}}/>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              onPress={this.onSubmit}
              title="Register Contact"
              color="#841584"
            />
            <Button
              onPress={this.addContact}
              title="Add More Contacts"
              color="#841584"
            />
          </View>
        </View>
      </ScrollView>
    )
  }
};

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#E8EAF6',
  },
  container: {
    margin: 8,
    marginTop: 24,
  },
  contentContainer: {
    padding: 8,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoPreview: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
