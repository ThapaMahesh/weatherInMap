import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import { get } from 'https';


export class App extends Component {
  constructor(){
    super();
    this.state = {
      selectedPlace: {},
      marker: {},
      markerPosition: {}
    }

    this.address = "";
    this.postal_code = "";
  }

  onMarkerClick = (mapProps, marker, clickEvent) => {
    console.log(process.env);
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
            console.log(responseJson);
            fetch('https://www.yr.no/sted/Norge/postnummer/'+ this.postal_code +'/varsel.xml',
                {
                  // mode: 'no-cors',
                  method: 'GET',
                  headers: new Headers({
                      'Access-Control-Allow-Origin': '*',
                      'Access-Control-Allow-Methods': 'GET, POST, PUT'
                  })
                }  
            )
                // .then((res) => res.text())
                .then(
                  (responseXML) => {
                    console.log(responseXML)
                    var parser = new DOMParser();
                    console.log(parser.parseFromString(responseXML, 'text/xml'));
                  },
                  (errorXML) => {
                    console.log(errorXML);
                  }
                )
          },
          (error) => {
            console.log(error);
          }
        )
    // console.log(clickEvent);
    // console.log(clickEvent.latLng.lat());
    this.setState({selectedPlace: mapProps, marker: marker, markerPosition: clickEvent.latLng});
  }
  
  render() {
    return (
      <div className="App">
        <h2>Weather In Map</h2>
        <Map
          google={this.props.google}
          zoom={8}
          initialCenter={{ lat: 59.9419647, lng: 10.6052119}}
          onClick={this.onMarkerClick}
        >
          <Marker onClick={this.onMarkerClick}
                position={this.state.markerPosition} />
 
          <InfoWindow visible={true}>
              <div>
                <h1>{'this.state.selectedPlace.name'}</h1>
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