import React from 'react';

import '../styles/propspanel.scss';

export const PropsPanel = ({details}) => {
  if (!details) {
    return <div className='props-panel'>Select a node to view properties</div>;
  }

  const {name, title, description, required, default: defaultValue, type, enum: enumValues, properties} = details;
  let propertiesSection = null;
  if (properties && Object.keys(properties).length) {
    propertiesSection = (
      <div className='props-panel__properties-section'>
        <div className='props-panel__properties-title'>Properties:</div>
        <div className='props-panel__properties-container'>
          {Object.keys(properties).map(propName => (
            <div key={propName} className='props-panel__property'>
              <div className='props-panel__property-name'>{propName}</div>
              <div className='props-panel__property-type'>{properties[propName].type}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className='props-panel'>
      <div className='props-panel__header'>
        <div className='props-panel__name'>{name}</div>
        <div className='props-panel__title'>{title}</div>
        <div className='props-panel__typeinfo'>
          <div className='props-panel__type'>{type}</div>
          <div className='props-panel__required'>{required ? 'Required' : 'Optional'}</div>
        </div>
        <div className={`props-panel__description ${!description ? 'props-panel__description--empty' : ''}`}>{description}</div>
        <div className='props-panel__default'>{defaultValue}</div>
        <div className='props-panel__enum'>{enumValues ? enumValues.join(', ') : null}</div>
      </div>
      <div className='props-panel__body'>
        {propertiesSection}
      </div>
    </div>
  );
};

export default PropsPanel;
