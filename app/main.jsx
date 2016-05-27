require('es6-promise').polyfill()
import React from 'react';
import ReactDOM from 'react-dom';
import Appbar from 'muicss/lib/react/appbar';
import Button from 'muicss/lib/react/button';
import Checkbox from 'muicss/lib/react/checkbox';
import Container from 'muicss/lib/react/container';

import Dropdown from 'muicss/lib/react/dropdown';
import DropdownItem from 'muicss/lib/react/dropdown-item';

import { makeZip, installTheme, initFS, publish, syncToSafe } from './files.jsx';
import { DropModal } from 'boron';
import ProgressBar from 'react-progressbar';
import Editor from './editor.jsx';
import render from './ghost.jsx';
import ConfigEditor from './configuration.jsx';

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
      route: 'home',
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
        console.log(err, files)
        if (err) return reject(err)
        this.setState({posts: files, loadingProgres: 75});
        otherDone ? resolve() : otherDone = true;
      })
      fs.readdir("/files/", (err, files) => {
        console.log(err, files)
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
    this.refs.modal.show();
    this.setState({'state': 'compiling'})
    this.compile()
    this.setState({'state': 'publishing'})
    publish(this.props.safe.nfs, '/public'
      ).then(() => {
        this.setState({'state': 'published'})
        setTimeout(() => this.refs.modal.hide(), 3)
      }
    ).catch((err) => {
      console.error(err);
      this.setState({'state': 'build_error', 'error': err})
    })
  }

  export() {
    makeZip();
  }

  selectPost(filename){
    this.setState({selectedFile: filename, route: 'editor'})
  }

  componentWillMount(){
    this.restart()
  }

  restart(){

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
          this.refs.modal.hide()
        })).catch(console.error.bind(console))
      }).catch((err) => {
        this.setState({"state": "startupFailed", "error": err})
    })
  }

  componentDidMount(){
    if (this.state != 'ready'){
      this.refs.modal.show()
    }
  }

  uploadFiles(){
    // FileList doesn't have the normal Array-API, I mean, WHY SHOULD IT?
    let fl = this.refs.fileUploader.files.length,
        i = 0,
        files = [];

    while ( i < fl) {
        files.push(this.refs.fileUploader.files[i]);
        i++;
    }
    this.setState({state: 'uploading'})
    this.refs.modal.show()
    return Promise.all(
      files.map( (f) => new Promise((rs, rj) => {
        let reader = new FileReader();
        reader.onload = function(e) {
          fs.writeFile("/files/" + f.name, e.target.result, (err) => {
            err ? rj(err) : rs(f.name)
          });
        }
        reader.readAsBinaryString(f);
      }))
    ).then((files) => {
      console.log(files)
      this.setState({loadingProgress: 75})
      return Promise.all([
        this.updateListing(),
        syncToSafe(this.props.safe.nfs, files, '/files')
      ])
    }).then(() => {
      this.refs.modal.hide()
    }).catch(console.error.bind(console))
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

    var modalContent = <p>Loading Ghost in the Safe ...</p>,
        mainContent = (<div>
            <h1>Welcome</h1>
            <h2>to Ghost in the Safe</h2>
            <p>Please select a file from drawer on the left to edit</p>
          </div>);

    if (this.state.route === 'editor') {
      mainContent = (<Editor
          onSave={()=> this.onSave()}
          filename={this.state.selectedFile} />);
    } else if (this.state.route === 'config') {
      mainContent = <ConfigEditor />;
    }

    if (state === 'authorising') {
      modalContent = (<div>
        <h2>Starting Ghost in the Safe</h2>
        <p>Please authorise 'Ghost in the Safe' in your Safe Launcher!</p>
        <ProgressBar completed={25} />
      </div>);
    } else if (state === 'setup') {
      modalContent = (<div>
        <h2>Starting Ghost in the Safe</h2>
        <p>{this.state.setup_message || "Reading your files"}</p>
        <ProgressBar completed={this.state.loadingProgress || 25} />
      </div>);
    } else if (state === 'startupFailed') {
      modalContent = (<div>
        <h2>Authorisation Failed</h2>
        <p>You've denied access to your Launcher. <br /><Button onClick={() => this.restart()} size="small" color="primary"> Try again </Button></p>
      </div>);
    } else if (state === 'uploading') {
      modalContent = (<div>
        <h2>File upload in progress</h2>
        <p>{this.state.modal_message || "Uploading"}</p>
        <ProgressBar completed={this.state.loadingProgress || 25} />
      </div>);
    }  else if (state === 'build_error') {
      modalContent = (<div>
        <h2>Compiling failed:</h2>
        <p>{this.state.error.toString()}</p>
      </div>);
    } else if (['compiling', 'publishing', 'published'].indexOf(state) > -1) {
      let config = require('statical-ghost/lib/config'),
          url  = config.blog.url,
          content = "All done!",
          progress = 100;

      if (state === 'compiling') {
        content = "Compiling your content";
        progress = 35;
      } else if (state === 'publishing') {
        content = "Transfering files to Safenetwork"
        progress = 70;
      }
      modalContent = (<div>
        <h2>Publishing</h2>
        {content}
        <ProgressBar completed={progress} />
      </div>);
    }

    return (
      <div className={this.state.showSidedrawer ? 'show-sidedrawer' : 'hidden-sidedrawer'}>
      <DropModal ref="modal" closeOnClick={false} keyboard={false}>
        <div className="mui-container-fluid">
          <div class="mui-panel">
            {modalContent}
          </div>
        </div>
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
              <input type="file"
                    style={{"display":"none"}}
                    ref="fileUploader"
                    onChange={()=> this.uploadFiles()} />
              <strong><span onClick={()=> this.setState({showFiles : !this.state.showFiles}) }>Files</span><Button size="small" color="primary" variant="flat" onClick={() => this.refs.fileUploader.click()}>+</Button></strong>
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
            <DropdownItem onClick={() => this.setState({route: "config"})}>Configure</DropdownItem>
            <DropdownItem onClick={() => this.publish()}>Publish</DropdownItem>
            <DropdownItem onClick={() => this.export()}>Export as Zip</DropdownItem>
          </Dropdown>
        </Appbar>
      </header>
      <div id="content">
        {mainContent}
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
