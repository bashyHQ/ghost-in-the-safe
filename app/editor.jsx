require('../lib/pen/src/pen.css');
require('../lib/pen/src/pen.js');
require('../lib/pen/src/markdown.js');


import React from 'react';
import ReactDOM from 'react-dom';
import Appbar from 'muicss/lib/react/appbar';
import Button from 'muicss/lib/react/button';
import Container from 'muicss/lib/react/container';

import Dropdown from 'muicss/lib/react/dropdown';
import DropdownItem from 'muicss/lib/react/dropdown-item';

import './editor.jsx';


require('muicss/lib/css/mui.min.css');
require('./styles.css');

class Editor extends React.Component {
  render(){
    return <div ref="editor">
      {this.props.children}
    </div>
  }
  componentDidMount(){
    this.pen = new Pen({
      editor: this.refs['editor']
    })
    this.pen.focus()
  }
}

export default Editor;
