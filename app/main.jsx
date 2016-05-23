import React from 'react';
import ReactDOM from 'react-dom';
import Appbar from 'muicss/lib/react/appbar';
import Button from 'muicss/lib/react/button';
import Container from 'muicss/lib/react/container';

import Dropdown from 'muicss/lib/react/dropdown';
import DropdownItem from 'muicss/lib/react/dropdown-item';


import { BrowserFS } from './files.jsx';
import Editor from './editor.jsx';
import render from './ghost.jsx';


require('muicss/lib/css/mui.min.css');
require('./styles.css');


class GitS extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      showSidedrawer: true,
      selectedFile: null,
      posts: [],
      files: []
    }
  }
  toggleSidedrawer() {
    this.setState({showSidedrawer: !!!this.state.showSidedrawer})
  }

  updateListing(){
    fs.readdir("/posts/", (err, files)=> {
      this.setState({posts: files})
    })
    fs.readdir("/files/", (err, files)=> {
      this.setState({files: files})
    })
  }

  onEditorUpdate(){
    this.updateListing()
  }

  compile(){
    console.log("soon!")
  }

  selectPost(filename){
    this.setState({selectedFile: filename})
  }

  componentWillMount(){
    // fs.watch("/posts", ()=> this.updateListing())
    // fs.watch("/files", ()=> this.updateListing())
    this.updateListing()
  }

  render() {
    return (
      <div className={this.state.showSidedrawer ? 'show-sidedrawer' : 'hidden-sidedrawer'}>
      <div id="sidedrawer" className={this.state.showSidedrawer ? 'active' : 'hide'}>
        <nav>
          <div>
            <h2><a>Menu</a></h2>
          </div>
          <div className="mui-divider"></div>
          <ul>
            <li><strong><a href="#">Configuration</a></strong>
            </li>
            <li>
              <strong>Posts</strong>
              <ul>{this.state.posts.map((f) =>
                <li className={this.state.selectedFile == f ? 'selected' : ''}>
                  <a onClick={() => this.selectPost(f)}>{f}</a></li>
              )}
                <li><a href="#">Add +</a></li>
              </ul>
            </li>
            <li>
              <strong>Files</strong>
              <ul>{this.state.files.map((f) =>
                <li><a href="#">{f}</a></li>
              )}
                <li><a href="#">Add +</a></li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
      <header id="header">
        <Appbar>
          <span onClick={() => this.toggleSidedrawer()} className="sidedrawer-toggle icon">☰</span>
          <span className="mui--text-title">Ghost in the Safe</span>
          <Dropdown color="primary" label="actions">
            <DropdownItem onClick={() => this.saveEditor()}>Save</DropdownItem>
            <DropdownItem onClick={() => this.compile()}>Publish</DropdownItem>
          </Dropdown>
        </Appbar>
      </header>
      <div id="content">
        <Editor filename={this.state.selectedFile} />
      </div>
      <footer id="footer">
        <Container fluid={true}>
          <br />
          Made with ♥ by Benjamin Kampmann
        </Container>
      </footer>
    </div>
    );
  }
}

ReactDOM.render(<GitS />, document.body);
