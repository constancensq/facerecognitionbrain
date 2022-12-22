import './App.css';
import React, {Component} from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';

const particlesOptions = { 
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  // componentDidMount() {
  //   fetch('http://localhost:3000')
  //   .then(response => response.json())
  //   .then(console.log)
  // }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)

    }
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
    // console.log(event.target.value);
  }
  
  onButtonSubmit = () => {

    // Calling setState() in React is asynchronous, 
    // for various reasons (mainly performance). 
    // Under the covers React will batch multiple calls to setState() 
    // into a single call, and then re-render the component a single time, 
    // rather than re-rendering for every state change. 
    // Therefore the imageUrl parameter would have never worked in our example, 
    // because when we called Clarifai with our the predict function, 
    // React wasn't finished updating the state. 

    this.setState({imageUrl: this.state.input});
    fetch('http://smartbrainapi-env-1.eba-nxss2c9h.ap-southeast-1.elasticbeanstalk.com/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
    })
    .then(response => response.json())
    .then(response => {
      fetch('http://smartbrainapi-env-1.eba-nxss2c9h.ap-southeast-1.elasticbeanstalk.com/image', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: this.state.user.id
        })
      })
      .then(response => response.json())
      .then(count => {
        this.setState(Object.assign(this.state.user, {entries: count}))
      })
      .catch(console.log) // error handling for fetch statements
      this.displayFaceBox(this.calculateFaceLocation(response))
     
      })
    .catch((err) => {
      console.log(err);
    });
  };    

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }

    this.setState({route: route});
  }
  
  render() {
    const { isSignedIn, imageUrl, route, box, user} = this.state;
    return (
      <div className="App">
        <Particles className='particles'
              params={particlesOptions}   
            />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home' 
        ? <div>
            <Logo />
            <Rank name={user.name} entries={user.entries}/>
            <ImageLinkForm 
            onInputChange={this.onInputChange} 
            onButtonSubmit={this.onButtonSubmit}/>
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div> 
        : (route === 'signin' 
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>)
      }
      </div>
    );
  }
}

export default App;
