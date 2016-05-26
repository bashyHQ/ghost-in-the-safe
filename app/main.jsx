require('es6-promise').polyfill()
import React from 'react';
import ReactDOM from 'react-dom';
import Appbar from 'muicss/lib/react/appbar';
import Button from 'muicss/lib/react/button';
import Checkbox from 'muicss/lib/react/checkbox';
import Container from 'muicss/lib/react/container';

import Dropdown from 'muicss/lib/react/dropdown';
import DropdownItem from 'muicss/lib/react/dropdown-item';

import { makeZip, installTheme, initFS, publish } from './files.jsx';
import { DropModal } from 'boron';
import ProgressBar from 'react-progressbar';
import Editor from './editor.jsx';
import render from './ghost.jsx';

require('muicss/lib/css/mui.min.css');
require('./styles.css');
let version = require('../package.json').version;
require('safenet/src/index.js');

let SafeApp = window.SafeApp;
console.log(SafeApp);


SafeApp.log = console.log.bind(console);


let safeInstance = new SafeApp({    // App Info
  'id': 'ghost-in-the-safe',
  'name': 'Ghost In the Safe',
  'vendor': 'Benjamin Kampmann',
  'version': version,
}, ['SAFE_DRIVE_ACCESS']  // Permissions
);

// FIXME: it appears some lib internals expect that to be the case
window.Safe = safeInstance;


class GitS extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      showSidedrawer: true,
      selectedFile: null,
      state: "loading",
      posts: [],
      files: [],
      showPosts: true,
      showFiles: false,
      compileOnSave: true,
    }
  }
  toggleSidedrawer() {
    this.setState({showSidedrawer: !!!this.state.showSidedrawer})
  }

  updateListing(){
    return new Promise((resolve, reject) => {
      this.setState({setup_message: "loading posts and files", loadingProgres: 65});
      var otherDone = false;
      fs.readdir("/posts/", (err, files) => {
        if (err) return reject(err)
        this.setState({posts: files, loadingProgres: 75});
        otherDone ? resolve() : otherDone = true;
      })
      fs.readdir("/files/", (err, files) => {
        if (err) return reject(err)
        this.setState({files: files, loadingProgres: 85});
        otherDone ? resolve() : otherDone = true;
      })
    });
  }

  onEditorUpdate(){
    this.updateListing()
  }

  compile(){
    render();
  }

  publish() {
    this.compile()
    publish(this.props.safe.nfs, '/public'
      ).then(console.log.bind(console)
    ).catch(console.error.bind(console))
  }

  export() {
    makeZip();
  }

  selectPost(filename){
    this.setState({selectedFile: filename})
  }

  componentWillMount(){
    // fs.watch("/posts", ()=> this.updateListing())
    // fs.watch("/files", ()=> this.updateListing())

    this.setState({"state": "authorising"})
    this.props.safe.auth.authorize().then(
      () => this.props.safe.auth.isAuth().then( (is_auth) => {
        console.log(is_auth);
        if (!is_auth)
          throw("Access denied by SAFE launcher (please refresh to try again)")
      })
    ).then(() => {
        this.setState({"state": "setup", "loadingProgress": 30})
        initFS(this.props.safe.nfs, (msg, progress) => {
          this.setState({"setup_message": msg, "loadingProgress": progress})
        }).then(() => this.updateListing().then(() => {
          this.setState({"state": "ready", "loadingProgress": 100});
          this.refs.startupModal.hide()
        })).catch(console.error.bind(console))
      }).catch((err) => {
        this.setState({"state": "failed", "error": err})
    })
  }

  componentDidMount(){
    if (this.state != 'ready'){
      this.refs.startupModal.show()
    }
  }

  onSave(){
    console.log("was saved");
    if (this.state.compileOnSave){
      console.log("compiling");
      this.compile();
    }
  }

  render() {
    let state = this.state.state;

    var startupModalContent = <p>Loading Ghost in the Safe ...</p>,
        progress = 10;

    if (state === 'authorising') {
      startupModalContent = <p>Please authorise 'Ghost in the Safe' in your Safe Launcher!</p>;
      progress = 25;
    } else if (state === 'setup') {
      startupModalContent = <p>{this.state.setup_message || "Reading your files"}</p>
      progress = this.state.loadingProgress || 25;
    } else if (state === 'failed') {
      startupModalContent = <p>Please authorise 'Ghost in the Safe' in your Safe Launcher!</p>;
      progress = 30;
    }

    return (
      <div className={this.state.showSidedrawer ? 'show-sidedrawer' : 'hidden-sidedrawer'}>
      <DropModal ref="startupModal" closeOnClick={false} keyboard={false}>
        <div className="mui-container-fluid">
          <div class="mui-panel">
            <h3>Starting Ghost in the Safe</h3>
            {startupModalContent}
            <ProgressBar completed={progress} />
          </div>
        </div>
      </DropModal>
      <DropModal ref="buildingModal">

      </DropModal>
      <div id="sidedrawer" className={this.state.showSidedrawer ? 'active' : 'hide'}>
        <nav>
          <div>
            <h2><a>Menu</a></h2>
          </div>
          <div className="mui-divider"></div>
          <ul>
            <li>
              <strong><span onClick={()=> this.setState({showPosts : !this.state.showPosts}) }>Posts</span><Button size="small" color="primary" variant="flat" onClick={() => this.addPost()}>+</Button></strong>
              <ul className={this.state.showPosts? 'show' : 'hide' }>{this.state.posts.map((f) =>
                <li className={this.state.selectedFile == f ? 'selected' : ''}>
                  <a onClick={() => this.selectPost(f)}>{f}</a></li>
              )}
              </ul>
            </li>
            <li>
              <strong><span onClick={()=> this.setState({showFiles : !this.state.showFiles}) }>Files</span><Button size="small" color="primary" variant="flat" onClick={() => this.addPost()}>+</Button></strong>
              <ul className={this.state.showFiles? 'show' : 'hide' }>{this.state.files.map((f) =>
                <li><a href="#">{f}</a></li>
              )}
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
            <DropdownItem onClick={() => this.saveEditor()}>Configure</DropdownItem>
            <DropdownItem >
              <Checkbox
                onChange={() => this.setState({compileOnSave: ! this.state.compileOnSave})}
                checked={this.state.compileOnSave}
                label="compile on save"
              />
            </DropdownItem>
            <DropdownItem onClick={() => this.publish()}>Publish</DropdownItem>
            <DropdownItem onClick={() => this.export()}>Export</DropdownItem>
          </Dropdown>
        </Appbar>
      </header>
      <div id="content">
        <Editor onSave={()=> this.onSave()} filename={this.state.selectedFile} />
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

ReactDOM.render(<GitS safe={safeInstance}/>, document.body);
