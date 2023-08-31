import AvocadoIcon from "./icon.js";
import AvocadoLabel from "./label.js";

import AvocadoVBox from "../containers/vbox.js";

export default class AvocadoSelect extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' )
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: inline-block;
          position: relative;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }
        
        :host( [hidden] ) {
          display: none;
        }        

        adc-icon {
          pointer-events: none;
          position: absolute;
          top: 50%;
          transform: translate( -50%, -50% );
        }

        adc-icon[part=caret] {        
          right: 2px;          
          --icon-color: #161616;          
        }

        adc-icon[part=invalid] {
          min-width: 0;        
          opacity: 0;
          overflow: hidden;
          right: 26px; 
          width: 0;         
          --icon-color: #da1e28;                    
        }        

        adc-label[part=error] {
          padding: 4px 0 0 0;
          visibility: hidden;
          --label-color: #6f6f6f;          
          --label-font-size: 12px;          
        }

        adc-label[part=helper] {
          display: none;
          padding: 0 0 4px 0;   
          --label-color: #6f6f6f;                                     
          --label-font-size: 12px;          
        }

        adc-label[part=label] {
          display: none;
          padding: 0;             
          --label-color: #525252;          
          --label-font-size: 12px;
        }              

        label {
          align-items: center;
          background-color: #f4f4f4;
          border-bottom: solid 1px #8d8d8d;
          box-sizing: border-box;
          display: flex;
          flex-direction: row;
          margin: 0;
          outline: solid 2px transparent;
          outline-offset: -2px;
          padding: 0;
          position: relative;
          /* transition: background-color 150ms ease-in-out; */
          -webkit-tap-highlight-color: transparent;
        }

        label:focus-within {
          outline: solid 2px #0f62fe;
        }                

        label:hover {
          background-color: #e8e8e8;
        }        

        select {
          appearance: none;
          background: none;
          box-sizing: border-box;
          border: none;
          color: #161616;
          cursor: pointer;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          height: 40px;
          margin: 0;
          outline: solid 1px transparent;
          outline-offset: -3px;          
          padding: 0 68px 0 16px;
          text-rendering: optimizeLegibility;
          -webkit-tap-highlight-color: transparent;                    
        }

        :host( [label] ) adc-label[part=label] { display: block; }
        :host( [light] ) label { background-color: #ffffff; }
        :host( [helper] ) adc-label[part=helper] { display: block; }        
        :host( [helper] ) adc-label[part=label] { padding: 0; }
        :host( [error] ) adc-label[part=error] { visibility: visible; }
        :host( [error][invalid] ) adc-label[part=error] { --label-color: #da1e28; }
        :host( [invalid] ) label { outline: solid 2px #da1e28; }        
        :host( [invalid] ) label:focus-within { outline: solid 2px #0f62fe; }                
        :host( [invalid] ) adc-icon[part=invalid] {
          min-width: 20px;
          opacity: 1.0;
          width: 20px;
        }        

        :host( [read-only] ) adc-icon[part=caret] {
          min-width: 0;
          opacity: 0;
          width: 0;
        }
        :host( [read-only] ) label { border-bottom: solid 1px transparent; }
        :host( [read-only] ) select { cursor: default; }

        :host( [disabled] ) adc-icon[part=caret] { --icon-color: #16161640; }
        :host( [disabled] ) label { border-bottom: solid 1px transparent; }
        :host( [disabled] ) label:hover { background-color: #f4f4f4; }        
        :host( [disabled] ) select { 
          color: #16161640; 
          cursor: not-allowed;
        };
        :host( [disabled] ) select:hover { background-color: red; }        
        :host( [disabled] ) adc-label[part=error],
        :host( [disabled] ) adc-label[part=helper],
        :host( [disabled] ) adc-label[part=label] { --label-color: #16161640; }
        :host( [disabled][invalid] ) adc-label[part=error] { --label-color: #da1e28; }        
      </style>
      <adc-vbox>
        <adc-label exportparts="label: label-p" part="label"></adc-label>
        <adc-label exportparts="label: helper-p" part="helper"></adc-label>      
        <label part="field">
          <select part="select"></select>
          <adc-icon exportparts="font: invalid-icon" filled name="error" part="invalid"></adc-icon>
          <adc-icon exportparts="font: caret-icon" name="expand_more" part="caret" weight="200"></adc-icon>
        </label>
        <adc-label exportparts="label: error-p" part="error"></adc-label>      
      </adc-vbox>
    `;

    // Properties
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$select = this.shadowRoot.querySelector( 'select' );
    this.$select.addEventListener( 'focus', () => this.dispatchEvent( new CustomEvent( 'adc-focus' ) ) );
    this.$select.addEventListener( 'blur', () => this.dispatchEvent( new CustomEvent( 'adc-blur' ) ) );        
    this.$select.addEventListener( 'change', () => {
      this.value = this.$select.children[this.$select.selectedIndex].value;
      this.dispatchEvent( new CustomEvent( 'adc-change', {
        detail: {
          selectedIndex: this.$select.selectedIndex,
          selectedItem: this.itemize( this.$select.children[this.$select.selectedIndex] ),
          value: this.value
        }
      } ) );
    } );
    this.$select.addEventListener( 'input', () => {
      this.value = this.$select.children[this.$select.selectedIndex].value;
      this.dispatchEvent( new CustomEvent( 'adc-input', {
        detail: {
          selectedIndex: this.$select.selectedIndex,
          selectedItem: this.itemize( this.$select.children[this.$select.selectedIndex] ),
          value: this.value
        }
      } ) );
    } );    
    this.$error = this.shadowRoot.querySelector( 'adc-label[part=error]' );    
    this.$helper = this.shadowRoot.querySelector( 'adc-label[part=helper]' );    
    this.$label = this.shadowRoot.querySelector( 'adc-label[part=label]' );
  }

  add( item, before = null ) {
    this.$select.add( item, before );
  }

  blur() {
    this.$select.blur();
  }

  focus() {
    this.$select.focus();
  }

  item( index ) {
    return this.$select.item( index );
  }

  itemize( option ) {
    if( option.hasAttributes() ) {
      const item = {
        label: option.innerText
      };
      for( const attribute of option.attributes ) {
        switch( attribute.name ) {
          case 'disabled':
            item.disabled = attribute.value.length === 0 ? true : attribute.value;
            break;           
          case 'selected':
            item.selected = attribute.value.length === 0 ? true : attribute.value;
            break;                          
          case 'value':
            item.value = attribute.value.length === 0 ? null : attribute.value;
            break;
        }
      }

      item.value = item.value === null ? item.label : item.value;
      return item;
    }    

    return null;
  }

  remove( index ) {
    this.$select.remove( index );
  }

  // When things change
  _render() {
    this.$label.text = this.label;
    this.$helper.text = this.helper;
    this.$error.text = this.error;
    this.$select.disabled = this.disabled;
    this.$select.value = this.value;
  }

   // Properties set before module loaded
   _upgrade( property ) {
    if( this.hasOwnProperty( property ) ) {
      const value = this[property];
      delete this[property];
      this[property] = value;
    }    
  }     

  // Setup
  connectedCallback() {
    // Check data property before render
    // May be assigned before module is loaded    
    this._upgrade( 'concealed' );
    this._upgrade( 'data' );        
    this._upgrade( 'disabled' );            
    this._upgrade( 'error' );        
    this._upgrade( 'helper' );        
    this._upgrade( 'hidden' );    
    this._upgrade( 'invalid' );        
    this._upgrade( 'label' );   
    this._upgrade( 'light' );    
    this._upgrade( 'name' );     
    this._upgrade( 'options' );   
    this._upgrade( 'readOnly' );  
    this._upgrade( 'selectedIndex' );  
    this._upgrade( 'value' );      
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'disabled',
      'error',
      'helper',
      'hidden',
      'invalid',
      'label',
      'light',
      'name',
      'read-only',
      'value'
    ];
  }

  // Observed tag attribute has changed
  // Update render
  attributeChangedCallback( name, old, value ) {
    this._render();
  }

  // Arbitrary storage
  // For your convenience
  // Not used in component  
  get data() {
    return this._data;
  }

  set data( value ) {
    this._data = value;
  }

  get options() {
    let result = [];

    for( let c = 0; c < this.$select.children.length; c++ ) {
      const option = this.itemize( this.$select.children[c] );
      result.push( option );
    }

    return result.length === 0 ? null : result;
  }

  set options( items ) {
    while( this.$select.children.length > items.length ) {
      this.$select.children[0].remove();
    }

    while( this.$select.children.length < items.length ) {
      const option = document.createElement( 'option' );
      this.$select.appendChild( option );
    }

    for( let c = 0; c < this.$select.children.length; c++ ) {
      if( typeof items[c] === 'string' || items[c] instanceof String ) {
        this.$select.children[c].innerText = items[c];
        this.$select.children[c].value = items[c];
      } else {
        this.$select.children[c].innerText = items[c].hasOwnProperty( 'label' ) ? items[c].label : items[c].value;
        this.$select.children[c].value = items[c].hasOwnProperty( 'value' ) ? items[c].value : '';        
        this.$select.children[c].selected = items[c].hasOwnProperty( 'selected' ) ? items[c].selected : false;
        this.$select.children[c].disabled = items[c].hasOwnProperty( 'disabled' ) ? items[c].disabled : false;        
      }
    }

    this.value = this.$select.value;
  }

  // Reflect attributes
  // Return typed value (Number, Boolean, String, null)
  get concealed() {
    return this.hasAttribute( 'concealed' );
  }

  set concealed( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'concealed' );
      } else {
        this.setAttribute( 'concealed', '' );
      }
    } else {
      this.removeAttribute( 'concealed' );
    }
  }

  get disabled() {
    return this.hasAttribute( 'disabled' );
  }

  set disabled( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'disabled' );
      } else {
        this.setAttribute( 'disabled', '' );
      }
    } else {
      this.removeAttribute( 'disabled' );
    }
  }

  get error() {
    if( this.hasAttribute( 'error' ) ) {
      return this.getAttribute( 'error' );
    }

    return null;
  }

  set error( value ) {
    if( value !== null ) {
      this.setAttribute( 'error', value );
    } else {
      this.removeAttribute( 'error' );
    }
  }  

  get helper() {
    if( this.hasAttribute( 'helper' ) ) {
      return this.getAttribute( 'helper' );
    }

    return null;
  }

  set helper( value ) {
    if( value !== null ) {
      this.setAttribute( 'helper', value );
    } else {
      this.removeAttribute( 'helper' );
    }
  }  

  get hidden() {
    return this.hasAttribute( 'hidden' );
  }

  set hidden( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'hidden' );
      } else {
        this.setAttribute( 'hidden', '' );
      }
    } else {
      this.removeAttribute( 'hidden' );
    }
  }  

  get invalid() {
    return this.hasAttribute( 'invalid' );
  }

  set invalid( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'invalid' );
      } else {
        this.setAttribute( 'invalid', '' );
      }
    } else {
      this.removeAttribute( 'invalid' );
    }
  }  

  get label() {
    if( this.hasAttribute( 'label' ) ) {
      return this.getAttribute( 'label' );
    }

    return null;
  }

  set label( value ) {
    if( value !== null ) {
      this.setAttribute( 'label', value );
    } else {
      this.removeAttribute( 'label' );
    }
  }

  get light() {
    return this.hasAttribute( 'light' );
  }

  set light( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'light' );
      } else {
        this.setAttribute( 'light', '' );
      }
    } else {
      this.removeAttribute( 'light' );
    }
  }
  
  get readOnly() {
    return this.hasAttribute( 'read-only' );
  }

  set readOnly( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'read-only' );
      } else {
        this.setAttribute( 'read-only', '' );
      }
    } else {
      this.removeAttribute( 'read-only' );
    }
  }  

  get name() {
    if( this.hasAttribute( 'name' ) ) {
      return this.getAttribute( 'name' );
    }

    return null;
  }

  set name( value ) {
    if( value !== null ) {
      this.setAttribute( 'name', value );
    } else {
      this.removeAttribute( 'name' );
    }
  }
  
  get value() {
    if( this.hasAttribute( 'value' ) ) {
      return this.getAttribute( 'value' );
    }

    return null;
  }

  set value( value ) {
    if( value !== null ) {
      this.setAttribute( 'value', value );
    } else {
      this.removeAttribute( 'value' );
    }
  }  
}

window.customElements.define( 'adc-select', AvocadoSelect );
