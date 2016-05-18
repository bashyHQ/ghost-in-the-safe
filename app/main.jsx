import React from 'react';
import ReactDOM from 'react-dom';
import Appbar from 'muicss/lib/react/appbar';
import Button from 'muicss/lib/react/button';
import Container from 'muicss/lib/react/container';


require('muicss/lib/css/mui.min.css');
require('./styles.css');


class GitS extends React.Component {
  render() {
    return (
      <div>
        <Appbar>Ghost in the Safe</Appbar>
        <Container>
          <Button color="primary">button</Button>
        </Container>
      </div>
    );
  }
}

ReactDOM.render(<GitS />, document.body);
