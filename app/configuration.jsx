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
      themes: fs.readdirSync('/themes')
    }
  }

  componentDidMount(){
    let config = require('../lib/statical-ghost/lib/config');
    this.setState({
      title: config.blog.title,
      url: config.blog.url,
      description: config.blog.description,
      posts_limit: config.posts.limit,
      permalink: config.posts.permalinks,
      theme: config.theme,
    })
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
    installTheme(theme)
    this.setState({theme: theme})
    syncToSafe(window.Safe.nfs, ['config.yaml'], '')
  }

  render() {
    return (<div>
      <Form>
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

      </Panel>
      </Form>
    </div>)
  }
}

export default Configuration;
