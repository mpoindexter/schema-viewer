/* @flow */

import React from 'react';
import Dimensions from 'react-dimensions';
import SchemaViewer from './SchemaViewer';
import PropsPanel from './PropsPanel';
import queryString from 'query-string';
import refParser from 'json-schema-ref-parser/dist/ref-parser.js';

import '../styles/index.scss';

const MeasuredSchemaViewer = Dimensions()(SchemaViewer);

export default class App extends React.Component {
  state: any;
  constructor (props: any) {
    super(props);
    this.state = {
      schemaUrl: '',
      selectedNodeProps: null,
      schema: null,
      loading: false,
      error: false
    };
  }

  componentDidMount () {
    const parsed = queryString.parse(window.location.search);
    if (parsed.schemaUrl) {
      this.loadSchema(parsed.schemaUrl);
    }
  }

  loadSchema (schemaUrl: string) {
    this.setState({
      schemaUrl,
      loading: true,
      error: false
    });
    refParser.dereference(schemaUrl).then(schema => {
      this.setState({
        schema,
        loading: false,
        error: false
      });
    }).catch(err => {
      console.error(err);
      this.setState({
        loading: false,
        error: true
      });
    });
  }

  render () {
    const { schemaUrl, selectedNodeProps, loading, error, schema } = this.state;
    return (
      <div>
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, height: '30px'}}>
          <input type='text' style={{width: '50%'}} value={schemaUrl} onChange={(e) => { this.setState({schemaUrl: e.target.value}); }} />
          <button onClick={() => { this.loadSchema(schemaUrl); }} disabled={loading}>Load</button>
        </div>
        <div style={{position: 'fixed', top: '30px', left: 0, right: '480px', bottom: 0}}>
          {
            loading ? <div>Loading...</div>
            : error ? <div>Failed to load schema</div>
            : schema ? <MeasuredSchemaViewer schema={schema} onSelectNode={nodeProps => { this.setState({selectedNodeProps: nodeProps}); }} />
            : 'Select a schema to view'
          }
        </div>
        <div style={{position: 'fixed', top: '30px', right: 0, bottom: 0, width: '400px'}}>
          <PropsPanel details={selectedNodeProps} />
        </div>
      </div>
    );
  }
}
