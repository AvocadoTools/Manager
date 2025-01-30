import AvocadoIcon from "./icon.js";
import AvocadoLabel from "./label.js";

import AvocadoBox from "../containers/box.js";

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

        adc-icon[part=caret],
        adc-icon[part=invalid] {
          pointer-events: none;
        }

        adc-icon[part=caret] {      
          opacity: 1.0;
          position: absolute;
          right: 12px;
          --icon-color: #161616;    
          --icon-size: 40px;      
        }

        adc-icon[part=invalid] {
          min-width: 0;        
          opacity: 0;
          position: absolute;
          right: 40px;
          width: 0;         
          --icon-color: #da1e28;
          --icon-size: 20px;                
        }        

        adc-label[part=error] {
          padding: 4px 0 0 0;
          visibility: hidden;
          --label-color: #6f6f6f;          
          --label-font-size: 12px;          
        }

        adc-label[part=helper] {
          display: none;
          padding: 0 0 2px 0;   
          --label-color: #6f6f6f;                                     
          --label-font-size: 12px;          
        }

        adc-label[part=label] {
          display: none;
          padding: 0 0 4px 0;             
          --label-color: #525252;          
          --label-font-size: 12px;
        }             

        label {
          align-items: center;
          background-color: #f4f4f4;
          border-bottom: solid 1px #8d8d8d;
          box-sizing: border-box;
          cursor: pointer;
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
        :host( [clearable] ) button {
          min-width: 40px;
          opacity: 1.0;
          width: 40px;
        }        
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
      <adc-box direction="row">
        <adc-box direction="column">
          <adc-label exportparts="label: label-p" part="label"></adc-label>
          <adc-label exportparts="label: helper-p" part="helper"></adc-label>                
        </adc-box>
        <slot></slot>        
      </adc-box>      
      <adc-label exportparts="label: label-p" part="label"></adc-label>
      <adc-label exportparts="label: helper-p" part="helper"></adc-label>      
      <label part="field">
        <select part="select"></select>
        <adc-icon exportparts="font: invalid-icon" filled name="error" part="invalid"></adc-icon>        
        <adc-icon exportparts="font: caret-icon" name="expand_more" part="caret" weight="200"></adc-icon>                  
      </label>
      <adc-label exportparts="label: error-p" part="error"></adc-label>      
    `;

    // Properties
    this._data = null;
    this._label = null;
    this._provider = [];

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$select = this.shadowRoot.querySelector( 'select' );
    this.$select.addEventListener( 'focus', () => this.dispatchEvent( new CustomEvent( 'adc-focus' ) ) );
    this.$select.addEventListener( 'blur', () => this.dispatchEvent( new CustomEvent( 'adc-blur' ) ) );        
    this.$select.addEventListener( 'change', () => {
      this.selectedIndex = this.$select.selectedIndex;
      this.dispatchEvent( new CustomEvent( 'adc-change', {
        detail: {
          selectedIndex: this.selectedIndex,
          selectedItem: this.selectedItem,
          value: this.value
        }
      } ) );
    } );
    this.$error = this.shadowRoot.querySelector( 'adc-label[part=error]' );    
    this.$helper = this.shadowRoot.querySelector( 'adc-label[part=helper]' );    
    this.$label = this.shadowRoot.querySelector( 'adc-label[part=label]' );
  }

  blur() {
    this.$select.blur();
  }

  focus() {
    this.$select.focus();
  }

  _build( update = false ) {
    while( this.$select.children.length > this._provider.length ) {
      this.$select.children[0].remove();
    }

    while( this.$select.children.length < this._provider.length ) {
      const option = document.createElement( 'option' );
      this.$select.appendChild( option );
    }

    for( let c = 0; c < this.$select.children.length; c++ ) {
      if( typeof this._provider[c] === 'string' || this._provider[c] instanceof String ) {
        this.$select.children[c].innerText = this._provider[c];
        this.$select.children[c].value = this._provider[c];
      } else {
        if( this.labelField !== null ) {
          if( this._provider[c].hasOwnProperty( this.labelField ) ) {
            this.$select.children[c].innerText = this._provider[c][this.labelField];
          } else if( items[c].hasOwnProperty( 'label' ) ) {
            this.$select.children[c].innerText = this._provider[c].label;
          } else {
            this.$select.children[c].innerText = this._provider[c].value;          
          }
        } else if( this.labelFunction !== null ) {
          this.$select.children[c].innerText = this._label( this._provider[c] );
        } else {
          this.$select.children[c].innerText = this._provider[c].hasOwnProperty( 'label' ) ? this._provider[c].label : this._provider[c].value;
        }

        if( update ) {
          this.$select.children[c].value = this._provider[c].hasOwnProperty( 'value' ) ? this._provider[c].value : '';        
          this.$select.children[c].selected = this._provider[c].hasOwnProperty( 'selected' ) ? this._provider[c].selected : false;
          this.$select.children[c].disabled = this._provider[c].hasOwnProperty( 'disabled' ) ? this._provider[c].disabled : false;    
        }    
      }
    }
  }

  // When things change
  _render() {
    this.$label.text = this.label;
    this.$helper.text = this.helper;
    this.$error.text = this.error;
    this.$select.disabled = this.disabled;
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
    this._upgrade( 'labelField' );       
    this._upgrade( 'labelFunction' );       
    this._upgrade( 'light' );    
    this._upgrade( 'name' );     
    this._upgrade( 'provider' );   
    this._upgrade( 'readOnly' );  
    this._upgrade( 'selectedIndex' );  
    this._upgrade( 'selectedItem' );  
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
      'label-field',
      'light',
      'name',
      'read-only'
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

  get labelFunction() {
    return this._label;
  }

  set labelFunction( value ) {
    this._label = value;
  }  

  get provider() {
    return this._provider;
  }

  set provider( items ) {
    if( items === null ) this._provider = [];
    this._provider = items.length === 0 ? [] : [... items];
    this._build( true );
  }

  get selectedIndex() {
    return this.$select.selectedIndex;
  }

  set selectedIndex( index ) {
    this.$select.selectedIndex = index;
  }

  get selectedItem() {
    return this._provider[this.selectedIndex];
  }

  set selectedItem( item ) {
    this._provider[this.selectedIndex] = item;
    this._build();
  }  

  get value() {
    return this.$select.value;
  }

  set value( item ) {
    this.$select.value = item;
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

  get labelField() {
    if( this.hasAttribute( 'label-field' ) ) {
      return this.getAttribute( 'label-field' );
    }

    return null;
  }

  set labelField( value ) {
    if( value !== null ) {
      this.setAttribute( 'label-field', value );
    } else {
      this.removeAttribute( 'label-field' );
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
}

window.customElements.define( 'adc-select', AvocadoSelect );
