import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';

export class App extends Component {
  constructor(){
    super();
    this.state = {
      selectedPlace: {},
      marker: {},
      markerPosition: {},
      weather: {},
      address: ""
    }

    this.address = "";
    this.postal_code = "";
    this.markerRef = React.createRef();
  }

  onMarkerClick = (markerProps, marker, clickEvent) => {
    this.setState({marker: marker});
  }

  onMapClick = (mapProps, map, clickEvent) => {
    fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + clickEvent.latLng.lat() + ',' + clickEvent.latLng.lng() + '&key=' + process.env.REACT_APP_MAP_API)
        .then((response) => response.json())
        .then(
          (responseJson) => {
            this.address = responseJson.results[0].formatted_address;
          
            responseJson.results.forEach(element => {
              if(element.types.includes('postal_code')){
                this.postal_code = element.address_components[0].short_name;
              }
            });
            
            fetch('http://localhost:4000/api/weather?postal_code='+this.postal_code)
                .then((res) => res.text())
                .then(
                  (weatherJson) => {
                    var weatherInfo = JSON.parse(weatherJson).weatherdata;
                    this.setState({weather: {temp: weatherInfo.forecast[0].tabular[0].time[0].temperature[0].$.value, label: weatherInfo.forecast[0].tabular[0].time[0].symbol[0].$.name}, 
                      selectedPlace: mapProps, markerPosition: clickEvent.latLng, address: this.address});
                  },
                  (error) => {
                    console.log(error);
                  }
                )
          },
          (error) => {
            console.log(error);
          }
        );
  }
  
  render() {
    return (
      <div className="App">
        <h2>Weather In Map</h2>
        
        <Map
          google={this.props.google}
          zoom={10}
          initialCenter={{ lat: 59.9419647, lng: 10.6052119}}
          onClick={this.onMapClick}
        >
          <Marker ref={this.markerRef} onClick={this.onMarkerClick}
                position={this.state.markerPosition} />
 
          <InfoWindow marker={this.state.marker} visible={true}>
              <div>
                <h1>{this.state.address}</h1>
                <p>Weather: {this.state.weather.label}</p>
                <p>Temperature: {this.state.weather.temp}&#8451;</p>
              </div>
          </InfoWindow>
        </Map>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_MAP_API
})(App);