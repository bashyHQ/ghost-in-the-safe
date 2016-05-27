require('../lib/pen/src/pen.css')
require('../lib/pen/src/pen.js')
require('../lib/pen/src/markdown.js')

let md = require('../lib/statical-ghost/lib/utils/markdownit')
var yaml = require('js-yaml')
let fs = window.require('fs')

import React from 'react'
import Form from 'muicss/lib/react/form'
import Input from 'muicss/lib/react/input'
import Radio from 'muicss/lib/react/radio'
import Button from 'muicss/lib/react/button'
import Panel from 'muicss/lib/react/panel'
import Tabs from 'muicss/lib/react/tabs'
import Tab from 'muicss/lib/react/tab'
import DatePicker from 'react-datepicker'
import moment from 'moment'

require('react-datepicker/dist/react-datepicker.css')

class PenWrap extends React.Component {
  render(){
    return <div ref="editor" dangerouslySetInnerHTML={{__html: this.props.content}} />
  }
  getContent(){
    return this.pen.toMd()
  }
  componentDidMount(){
    this.pen = new Pen({
      editor: this.refs['editor']
    })
    this.pen.focus()
  }
}

class Editor extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      loading: false,
      content: null,
      config: {}
    }
    if (props.filename){
      this.load(filename)
    }
  }

  setContent(content){
    var match = content.match(/^([\w\W]*?)\n\s*\-{3,}\s*/)
    let post = yaml.safeLoad(match[1])
    let markdown = content.substring(match[0].length)
    this.setState({loading: false,
                   content: md.render(markdown),
                   config: post})
  }

  updateConfig(key, value){
    let config = this.state.config
    config[key] = value
    this.setState({config: config})
  }

  render(){
    if (this.state.loading){
      return <div>Loading <em>{this.props.filename}</em></div>
    }
    if (!this.props.filename){
      return <div>Please select the file you want to edit</div>
    }
    return (<Form className="mui-container-fluid" onSubmit={this.save.bind(this)}>
              <div style={{display: "flex"}}>
                <legend><Input
                  ref="title"
                  label={"Title (" + this.props.filename + ")"}
                  required={true}
                  onChange={(evt) => this.updateConfig('title', evt.target.value)}
                  value={this.state.config.title}
                  floatingLabel={true}/></legend>
                <Button variant="raised" onClick={this.save.bind(this)} color="primary">Save Post</Button>
              </div>
              <Tabs initialSelectedIndex={1}>
                <Tab label="Metadata">
                  <Panel>
                    <div style={{display: "flex", 'align-items': 'baseline'}}>
                      <strong>Post Type:</strong>
                      <Radio name="postType" value="post" ref="postType" label="Usual Post" defaultChecked={!this.state.config.page && !this.state.config.top} />
                      <Radio name="postType" value="top" ref="postType" label="Top Post"  defaultChecked={ this.state.config.top} />
                      <Radio name="postType" value="page" ref="postType" label="Static Page" defaultChecked={ this.state.config.page} />
                    </div>

                    <Input
                      ref="slug"
                      label="URL-Slug (no-spaces)"
                      required={true}
                      onChange={(evt) => this.updateConfig('slug', evt.target.value)}
                      value={this.state.config.slug}
                      floatingLabel={true}/>
                    <DatePicker
                      todayButton='today'
                      selected={moment(this.state.config.date)}
                      onChange={(evt) => this.updateConfig('date', evt.toString())} />
                    <Input
                      ref="author"
                      label="Author"
                      onChange={(evt) => this.updateConfig('author', evt.target.value)}
                      value={this.state.config.author}
                      floatingLabel={true}/>

                    <Input
                      ref="tags"
                      label="Tags (comma separated)"
                      onChange={(evt) => this.updateConfig('tags', evt.target.value.split(','))}
                      value={this.state.config.tags ? this.state.config.tags .join(', ') : ''}
                      floatingLabel={true}/>
                  </Panel>
                </Tab>

                <Tab label="Content">
                  <Panel>
                    <PenWrap ref="editor" content={this.state.content} />
                  </Panel>
                </Tab>
              </Tabs>
              <div className="mui--text-right">
                <Button variant="raised" onClick={this.save.bind(this)} color="primary">Save Post</Button>
              </div>
            </Form>)
  }
  componentWillReceiveProps(props){
    if (props.filename != this.props.filename){
      if (props.filename){
        this.load(props.filename)
      } else {
        this.setState({content: null, loading: false})
      }
    }
  }

  save(ev){
    ev.preventDefault()
    let content = yaml.safeDump(this.state.config) + "\n---\n" + this.refs.editor.getContent()

    console.log(content)

    fs.writeFile ('/posts/' + this.props.filename, content, (err) =>
      err ? console.log(err) : (this.props.onSave ? this.props.onSave() : null)
    )
  }

  load(filename){
    this.setState({loading: true})
    fs.readFile('/posts/' + filename, 'utf8',
                (err, content) => this.setContent(content))
  }
}



export default Editor;
