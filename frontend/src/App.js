import React from 'react';
import './App.css';

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      joined: false
    };
  }
  render(){
    return (
      <div className="App">
        kia bakwas hai
      </div>
    );
  }
}

export default App;
