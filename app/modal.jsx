import React from 'react';
import ReactModal from 'react-modal';

class Modal extends React.Component {
  constructor(props){
    super(props)
    this.state = { modalIsOpen: false };
    this.styles = {
      "width": "80vw",
      "maxWidth": "600px",
      "minWidth": "100px",
      "margin": "10vh auto",
      "backgroundColor": "#fff"
    }
  }

  show(){
    this.setState({'modalIsOpen': true})
  }

  hide(){
    this.setState({'modalIsOpen': false})
  }

  //
  render(){
    if (!this.state.modalIsOpen) return null;
    return (<div id="mui-overlay">
              <div style={this.styles}>
                {this.props.children}
              </div>
            </div>)
  }
}

export default Modal
