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
    const {joined}  = this.state;
    return (
      <div className="App">
        {!joined ?
        <p>Show join box</p>
        :
        <p>Show message list</p>
        }
      </div>
    );
  }
}

export default App;
