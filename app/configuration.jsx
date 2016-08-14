import React from 'react'
import Form from 'muicss/lib/react/form'
import Input from 'muicss/lib/react/input'
import Radio from 'muicss/lib/react/radio'
import Button from 'muicss/lib/react/button'
import Dropdown from 'muicss/lib/react/dropdown'
import DropdownItem from 'muicss/lib/react/dropdown-item'
import Panel from 'muicss/lib/react/panel'
import Tabs from 'muicss/lib/react/tabs'
import Tab from 'muicss/lib/react/tab'

import { installTheme, syncToSafe } from './files.jsx'
import Modal from './modal.jsx';

class Configuration extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      loading: false,
      content: null,
      title: '',
      url: '',
      description: '',
      posts_limit: '',
      theme: '',
      permalink: '',
      dns_names: [],
      newDns: '',
      serializedUrl: [],
      themes: fs.readdirSync('/themes')
    }
  }

  componentDidMount(){
    let config = require('../lib/statical-ghost/lib/config'),
        url = config.blog.url,
        serializedUrl = url ? url.split('.') : [];
    this.setState({
      title: config.blog.title,
      url: config.blog.url,
      serializedUrl: serializedUrl,
      description: config.blog.description,
      posts_limit: config.posts.limit,
      permalink: config.posts.permalinks,
      theme: config.theme,
    })
    window.Safe.dns.listNames().then((names) => {
      this.setState({dns_names: names})
    }).catch(console.error.bind(console))
  }

  save(){
    let config = require('../lib/statical-ghost/lib/config');
    config.blog.title = this.state.title;
    config.blog.url = this.state.url;
    config.blog.description = this.state.description;
    config.posts.limit = this.state.posts_limit;
    config.posts.permalinks = this.state.permalink;
    config.writeConfigToFile({})
    syncToSafe(window.Safe.nfs, ['config.yaml'], '')
  }

  installTheme(theme){
    let config = require('../lib/statical-ghost/lib/config');
    config.writeConfigToFile({theme: theme})
    config.loadConfig()
    installTheme(theme)
    this.setState({theme: theme})
    syncToSafe(window.Safe.nfs, ['config.yaml'], '')
  }

  registerDns(){
    let newDns = this.state.newDns.trim();
    if (!newDns) return
    window.Safe.dns.createName(newDns).then(() => {
      let names = this.state.dns_names;
      names.push(newDns);
      this.setState({dns_names: names, newDns: '', selectedDns: newDns});
    }).catch(console.error.bind(console))
  }

  publish(){
    let service = this.state.selectedService.trim(),
        dns = this.state.selectedDns || (this.state.serializedUrl.length ? this.state.serializedUrl[1] : null);

    if (!service || !dns){
      alert("You need to select DNS and the service!")
      return
    }

    window.Safe.dns.createServiceForName({
      longName: dns,
      serviceName: service,
      serviceHomeDirPath: '/public',
      isPathShared: false
    }).then(() =>{
      let url = service + '.' + dns + '.safenet';
      let config = require('../lib/statical-ghost/lib/config');
      config.writeConfigToFile({blog: {url: url}})
      syncToSafe(window.Safe.nfs, ['config.yaml'], '')
      this.setState({
        url: url,
        serializedUrl: url.split('.'),
        selectedDns: null
      });
      this.refs.modal.hide()
    }).catch(console.error.bind(console))
  }

  render() {
    return (<div>
      <Modal ref="modal">

          <Input label="Service"
                ref="service"
                onChange={(e) => this.setState({"selectedService": e.target.value})}
                defaultValue={this.state.serializedUrl.length ? this.state.serializedUrl[0] : '' } /> .
          <Dropdown label={this.state.selectedDns ? this.state.selectedDns : (this.state.serializedUrl.length ? this.state.serializedUrl[1] : '') }>
            {this.state.dns_names.map((t) =>
              <DropdownItem onClick={()=> this.setState({selectedDns: t})}>
                {t}</DropdownItem>
            )}

              <Input label="New DNS name" ref='newDns'
              onChange={(e) => this.setState({"newDns": e.target.value})} /><Button onClick={() => this.registerDns()}>+</Button>

          </Dropdown>
          .safenet
          <Button onClick={() => this.publish()} >publish</Button>

      </Modal>

        <Panel>
          <Button variant="raised" onClick={this.save.bind(this)} color="primary">Save </Button>
          <Input
            ref="title"
            label="Blog title"
            required={true}
            onChange={(evt) => this.setState({'title': evt.target.value})}
            value={this.state.title}
            floatingLabel={true}/>
          <Input
            ref="description"
            label="Description"
            onChange={(evt) => this.setState({'description': evt.target.value})}
            value={this.state.description}
            floatingLabel={true}/>
          <Input
            ref="posts_limit"
            label="Posts Limits (per page)"
            onChange={(evt) => this.setState({'posts_limit': evt.target.value})}
            value={this.state.posts_limit}
            floatingLabel={true}/>
          <Input
            ref="permalink"
            label="Permalink"
            onChange={(evt) => this.setState({'permalink': evt.target.value})}
            value={this.state.permalink}
            floatingLabel={true}/>

        <Dropdown
          label={"Theme: " + this.state.theme}>
          {this.state.themes.map((t) =>
            <DropdownItem onClick={()=> this.installTheme(t)}>
              Install: {t}</DropdownItem>
          )}
        </Dropdown>

        <label>{this.state.url ? "Currently published under " + this.state.url : 'Currently not public'} <Button onClick={() => this.refs.modal.show()}>edit</Button></label>
      </Panel>

    </div>)
  }
}

export default Configuration;
