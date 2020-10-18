import React, { Component } from "react";
import "./Create.css";
import "./Map.css"
import API from "../../utils/API";
// import mapboxgl, { GeoJSONSource } from 'mapbox-gl'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from 'mapbox-gl-geocoder'
import DetailsCard from "../DetailsCard"
import NavBar from "../NavBar";
import { Card, Row, Col, Button } from 'react-materialize'


const display = {
    display: 'block'
};
const hide = {
    display: 'none'
};

var userToken = window.localStorage.getItem("token")

class Create extends Component {

    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);

        this.state = {
            toggle: false,
            location: "",
            coordinates: [],
            name: "",
            description: "",
            saved: [],
            selectedFile: "",
            isHidden: false,
            token: "",
            username: "",
            userCitiesData: [],
            loggedAs: ""

        }
    }

    componentWillUnmount() {
        console.log('unmount')
    }

    toggle(event) {
        this.setState(prevState => ({
            toggle: !prevState.toggle
        }));
    }

    handleInputChange = event => {
        let value = event.target.value;
        let name = event.target.name

        this.setState({
            [name]: value
        });
    };

    onChange = (e) => {
        const state = this.state;

        switch (e.target.name) {
            case 'selectedFile':
                state.selectedFile = e.target.files[0];
                break;
            default:
                state[e.target.name] = e.target.value;
        }

        this.setState(state);
    }

    // Select Place Button
    handleFormSubmit = event => {
        //console.log(this.state.location, this.state.coordinates);
        //changes
        // let searchBar = document.getElementsByClassName("mapboxgl-ctrl-geocoder mapboxgl-ctrl");
        // searchBar[0].style.display="none";

        this.setState({
            isHidden: true
        })

        let cityData = {
            location: this.state.location,
            coordinates: this.state.coordinates,
            token: this.state.token
        }

        let cities = this.state.userCitiesData

        let match = false;

        if (cities.length < 1) {
            API.saveCity({
                cityData
            }).then((result) => {

            })
        } 
        else {
            for (let i=0; i < cities.length; i++ ) {
                if (cities[i].location === cityData.location) {
                    console.log("match")
                    match = true;
                    break;
                } 
            }
            if (match === false) {
                API.saveCity({
                    cityData
                }).then((result) => {
                    console.log("saved")
                })
            }
        }
    };

    // Add Details Button
    handleSubmitForm = (e) => {
        e.preventDefault();
        //changes
        // let searchBar = document.getElementsByClassName("mapboxgl-ctrl-geocoder mapboxgl-ctrl");
        // searchBar[0].style.display = "inline";

        this.toggle();
        const { name, description, selectedFile, location, token } = this.state;
        let formData = new FormData();

        formData.append('name', name);
        formData.append('description', description);
        formData.append('selectedFile', selectedFile);
        formData.append('location', location );
        formData.append('token',  token);

        API.saveDetails(formData).then((result) => {

            console.log("save details result:", result)
            this.getUserData();

            this.setState({
                name: "",
                description: "",
                selectedFile: ""
              });

        })
    }

    getUserData() {
        API.getUserData(userToken).then((result) => {
            this.setState({userCitiesData: result.data.cities})
        })
    }

    deletePlace = (citiesId, detailsId) => {

        let id = {
            citiesId: citiesId,
            detailsId: detailsId
        }

        API.deletePlace(id)
          .then(res => this.getUserData())
          .catch(err => console.log(err));
    };

    deleteCity = (userId, citiesId) => {

        let id = {
            userId: userId,
            citiesId: citiesId
        }

        API.deleteCity(id)
          .then(res => this.getUserData())
          .catch(err => console.log(err));
    };

    currentUser() {
        API.getCurrentUser(userToken).then((res) => {

            console.log("userNAME", res)
            this.setState({ loggedAs: res.data.username })
        })
    }

    logOut() {
        window.localStorage.clear();
        window.location = "/"
    }

    componentDidMount() {

        // var userToken = window.localStorage.getItem("token") 

        this.setState({ token: userToken })
        
        this.getUserData()

        this.currentUser()

        console.log('component is mounted')

        mapboxgl.accessToken = 'pk.eyJ1IjoiZW1hY2twaWVycmUiLCJhIjoiY2tnZWlvaW1tMGU0NjJ4cnMzNHFrM3BkeSJ9.YWk0F0ODZa_rsl9S8a2xWg';
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/arheeee/cjgcyypkq00032sqkj85b2any',
            center: [20.107686, 31.863775],
            zoom: 1
        });

        var geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken
        });

        var geojson = {
            type: 'FeatureCollection',
            features: []
        };

        // add markers to map
        // geojson.features.forEach(function (marker) {

        //     // create a HTML element for each feature
        //     var el = document.createElement('div');
        //     el.className = 'marker';

        //     // make a marker for each feature and add to the map
        //     new mapboxgl.Marker(el)
        //         .setLngLat(marker.geometry.coordinates)
        //         .addTo(map);
        // });


        map.addControl(geocoder);

        // After the map style has loaded on the page, add a source layer and default
        // styling for a single point.
        // map.addSource('single-point', {
        //     "type": "geojson",
        //     "data": {
        //         "type": "FeatureCollection",
        //         "features": []
        //     }
        // });

        // map.addLayer({
        //     "id": "point",
        //     "source": "single-point",
        //     "type": "circle",
        //     "paint": {
        //         "circle-radius": 10,
        //         "circle-color": "#007cbf"
        //     }
        // });

        // Listen for the `geocoder.input` event that is triggered when a user
        // makes a selection and add a symbol that matches the result.
        geocoder.on('result', (ev) => {

            console.log("ev result", ev.result);

            geojson.features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: ev.result.geometry.coordinates
                },
                properties: {
                    title: 'Mapbox',
                    description: ev.result.place_name
                }
            })

            this.setState({
                location: ev.result.place_name,
                coordinates: ev.result.geometry.coordinates
            })

            geojson.features.forEach((marker) => {

                // create a HTML element for each feature
                var el = document.createElement('div');
                el.className = 'marker';



                // make a marker for each feature and add to the map
                new mapboxgl.Marker(el)
                    .setLngLat(marker.geometry.coordinates)
                    .addTo(map);
            });
        });

        // var marker = document.getElementsByClassName('marker');

        map.on('click', function (e) {
            console.log("hello")
            var features = map.queryRenderedFeatures(e.point, {
                layers: ['background'] // replace this with the name of the layer
            });

            if (!features.length) {
                return;
            }

            // var feature = features[0];

            // var popup = new mapboxgl.Popup({ offset: [0, -15] })
            //     .setLngLat(feature.geometry.coordinates)
            //     .setHTML('<h3>' + feature.properties.title + '</h3><p>' + feature.properties.description + '</p>')
            //     .setLngLat(feature.geometry.coordinates)
            //     .addTo(map);
        });
    }

    render() {

        var modal = [];
        modal.push(
            <div id="body2">
            <div className="modal" style={this.state.toggle ? display : hide} key="modal">
                <div className="modal-content">
                    <Button type="button" class="close" onClick={()=> this.toggle()} floating className='closeBtn' icon='close'/>
                    <h4>{this.state.location}</h4>
                    <p>Enter Details</p>
                    <div className="row">
                        <form className="col s12">
                            <div className="row">
                                <div className="input-field col s12">
                                    <input
                                        onChange={this.handleInputChange}
                                        name="name"
                                        id="name"
                                        type="text"
                                        className="validate"
                                        value={this.state.name}
                                    />
                                    <label htmlFor="name">Name</label>
                                </div>
                            </div>
                            <div className="row">
                                <div className="input-field col s12">
                                    <input
                                        onChange={this.handleInputChange}
                                        name="description"
                                        id="=description"
                                        type="text"
                                        className="validate"
                                        value={this.state.description}
                                    />
                                    <label htmlFor="description">Description</label>
                                </div>
                            </div>
                            <div className="file-field input-field">
                                <div className="btn">
                                    <span>File</span>
                                    <input
                                        type="file"
                                        onChange={this.onChange}
                                        name="selectedFile"
                                    />
                                </div>
                                <div className="file-path-wrapper">
                                    <input
                                        type="text"
                                        className="file-path validate"
                                        id="file"
                                        value={this.state.selectedFile}
                                    />
                                    <label htmlFor="file">Upload Image</label>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="modal-footer">
                    <a className="btn" onClick={this.handleSubmitForm}>Save</a>
                </div>
            </div></div>
        );

        return (
            <div>
                <NavBar logOut={this.logOut} username={this.state.loggedAs}/>
                <div className='mapContainer'>
                    <div id='map'></div>
                    {modal}
                </div>
                <Row>
                    <Col s={3}></Col>
                    <Col s={6}>
                        {!this.state.isHidden ? "" : <Card id="select-card"><h5 id="select-header">SELECTED CITY</h5><h5 id="select-place">{this.state.location}</h5></Card>}
                    </Col>
                </Row>
                <div className="buttons">
                    
                    {(this.state.location === "") ? null : <a className="btn addBtn" onClick={this.handleFormSubmit}>Select City</a>}
                    {!this.state.isHidden ? "" : <a className="btn addBtn" onClick={this.toggle}>Add Place</a>  }
                </div>

                <DetailsCard data={this.state.userCitiesData} token={this.state.token} onClick={this.deletePlace} deleteCity={this.deleteCity} username={this.state.loggedAs}/>
            </div>
            
        )
    }
};


export default Create;