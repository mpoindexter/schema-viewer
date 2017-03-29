/* @flow */

import React from 'react';

import '../styles/index.scss';

import TreeGraph from 'react-tree-graph';

const makeNodeClass = (onSelectNode) => class TreeNode extends React.PureComponent {
  render () {
    const { onToggleExpand, label, data } = this.props;

    let groupStyle = {};
    if (data.locked) {
      groupStyle.opacity = 0.5;
    }

    let bubbleStyle = {
      fill: 'lightsteelblue',
      stroke: data.expandable ? 'green' : 'grey',
      strokeWidth: '2px'
    };

    let textStyle : any = {cursor: 'pointer'};
    if (data.required) {
      textStyle.fontWeight = 'bold';
    }
    return (
      <g data-schema={JSON.stringify(data)} style={groupStyle}>
        <circle
          r={10}
          onClick={() => { if (!data.locked) { onToggleExpand(); } }}
          style={bubbleStyle} />
        <text x={10} y={-10} style={textStyle} onClick={() => onSelectNode(data)}>
          {label}
        </text>
      </g>
    );
  }
};

type SchemaViewerProps = {
  schema: any,
  containerWidth: number,
  containerHeight: number,
  onSelectNode: (any) => any
};
export default class SchemaViewer extends React.Component {
  props: SchemaViewerProps;
  state: {treeData: ?any};

  constructor (props: SchemaViewerProps) {
    super(props);
    this.state = {
      treeData: this.processSchema(props.schema)
    };
  }

  componentWillReceiveProps (nextProps: SchemaViewerProps) {
    if (nextProps.schema !== this.props.schema) {
      this.setState({treeData: this.processSchema(nextProps.schema)});
    }
  }

  processSchema (schema: any) {
    const label = (name, def) => {
      name = def.title || name;
      let type = def.type;
      if (name && type) {
        if (type === 'array') {
          return `${name}[]`;
        } else if (type === 'object') {
          return `${name}{}`;
        }
        return `${name} : ${type}`;
      } else if (name) {
        return name;
      } else if (type) {
        return type;
      } else if (def.properties) {
        return 'object';
      } else {
        return 'any';
      }
    };

    const shallowProperties = properties => {
      let r = {};
      if (properties) {
        Object.keys(properties).forEach(propName => {
          const def = properties[propName];
          const copy = {...def};
          delete copy.properties;
          delete copy.items;
          r[propName] = copy;
        });
      }
      return r;
    };

    const processDataTypeNode = (def, name) => {
      return {
        label: name,
        data: {
          locked: true
        },
        expanded: true,
        children: def.sort((a, b) => {
          const labelA = label('', a);
          const labelB = label('', b);
          return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
        }).map(e => processSchemaNode(e, null, false))
      };
    };

    const processSchemaNode = (def, name, required, locked) => {
      let children = [];

      const { allOf, oneOf, anyOf, properties, items, definitions, ...defRest } = def; // eslint-disable-line no-unused-vars

      if (properties) {
        let propNames = Object.keys(properties).sort();
        children = [...children, ...propNames.map(name => processSchemaNode(properties[name], name, def.required && def.required.includes(name), false))];
      }

      if (items) {
        if (Array.isArray(items)) {
          children = [...children, ...items.map(e => processSchemaNode(e, null, false, true))];
        } else {
          children.push(processSchemaNode(items, null, false, true));
        }
      }

      if (allOf) {
        children.push(processDataTypeNode(allOf, 'allOf'));
      }
      if (anyOf) {
        children.push(processDataTypeNode(anyOf, 'anyOf'));
      }
      if (oneOf) {
        children.push(processDataTypeNode(oneOf, 'oneOf'));
      }

      return {
        label: label(name, def),
        expanded: locked,
        data: {
          ...defRest,
          name,
          required,
          locked,
          expandable: !!children.length,
          properties: shallowProperties(properties)
        },
        children
      };
    };
    return processSchemaNode(schema, 'schema', true, true);
  }

  render () {
    const { onSelectNode } = this.props;
    const { treeData } = this.state;
    if (!treeData) {
      return <div>Loading...</div>;
    }

    return (
      <div>
        <TreeGraph
          width={this.props.containerWidth}
          height={this.props.containerHeight}
          margin={{
            top: 40,
            left: 40,
            bottom: 40,
            right: 40
          }}
          nodeSize={[300, 60]}
          nodeComponent={makeNodeClass((data) => onSelectNode(data))}
          data={treeData}
        />
      </div>
    );
  }
}
