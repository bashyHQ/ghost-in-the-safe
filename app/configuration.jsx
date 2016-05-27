import React from 'react'
import Form from 'muicss/lib/react/form'
import Input from 'muicss/lib/react/input'
import Radio from 'muicss/lib/react/radio'
import Button from 'muicss/lib/react/button'
import Panel from 'muicss/lib/react/panel'
import Tabs from 'muicss/lib/react/tabs'
import Tab from 'muicss/lib/react/tab'

class Configuration extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      loading: false,
      content: null,
      config: {}
    }
  }
  render() {
    return <h1>Soon...</h1>
  }
}

export default Configuration;
