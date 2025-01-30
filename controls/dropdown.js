import AvocadoIcon from "./icon.js";
import AvocadoLabel from "./label.js";

import AvocadoBox from "../containers/box.js";

export default class AvocadoDropdown extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' )
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }
        
        :host( [hidden] ) {
          display: none;
        }      

        button[part=field] {
          display: flex;
          flex-direction: row;
        }
      </style>
      <adc-label exportparts="label: label-p" part="label"></adc-label>
      <adc-label exportparts="label: helper-p" part="helper"></adc-label>
      <button part="field">
        <adc-label part="placeholder"></adc-label>
        <adc-icon exportparts="font: invalid-icon" filled name="error" part="invalid"></adc-icon>
        <button>
          <adc-icon name="close" part="clear"></adc-icon>
        </button>
        <adc-icon exportparts="font: caret-icon" name="expand_more" part="caret" weight="200"></adc-icon>                  
      </button>
      <adc-label exportparts="label: error-p" part="error"></adc-label>             
    `;

    // Properties
    this._data = null;
    this._label = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$field = this.shadowRoot.querySelector( 'button[part=field]' );
    this.$error = this.shadowRoot.querySelector( 'adc-label[part=error]' );    
    this.$helper = this.shadowRoot.querySelector( 'adc-label[part=helper]' );    
    this.$label = this.shadowRoot.querySelector( 'adc-label[part=label]' );
    this.$placeholder = this.shadowRoot.querySelector( 'adc-label[part=placeholder]' );    
  }

  blur() {
    this.$select.blur();
  }

  focus() {
    this.$select.focus();
  }

  // When things change
  _render() {
    this.$label.text = this.label;
    this.$helper.text = this.helper;
    this.$error.text = this.error;
    this.$placeholder.text = this.placeholder;
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
    this._upgrade( 'clearable' );    
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
    this._upgrade( 'placeholder' );     
    this._upgrade( 'provider' );   
    this._upgrade( 'readOnly' );  
    this._upgrade( 'selectedIndex' );  
    this._upgrade( 'value' );      
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'clearable',
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
      'placeholder',
      'read-only',
      'selected-index'
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
    let result = [];

    for( let c = 0; c < this.$select.children.length; c++ ) {
      const option = this.itemize( this.$select.children[c] );
      result.push( option );
    }

    return result.length === 0 ? null : result;
  }

  set provider( items ) {
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
        if( this.labelField !== null ) {
          if( items[c].hasOwnProperty( this.labelField ) ) {
            this.$select.children[c].innerText = items[c][this.labelField];
          } else if( items[c].hasOwnProperty( 'label' ) ) {
            this.$select.children[c].innerText = items[c].label;
          } else {
            this.$select.children[c].innerText = items[c].value;          
          }
        } else if( this.labelFunction !== null ) {
          this.$select.children[c].innerText = this._label( items[c] );
        } else {
          this.$select.children[c].innerText = items[c].hasOwnProperty( 'label' ) ? items[c].label : items[c].value;
        }

        this.$select.children[c].value = items[c].hasOwnProperty( 'value' ) ? items[c].value : '';        
        this.$select.children[c].selected = items[c].hasOwnProperty( 'selected' ) ? items[c].selected : false;
        this.$select.children[c].disabled = items[c].hasOwnProperty( 'disabled' ) ? items[c].disabled : false;        
      }
    }
  }

  // Reflect attributes
  // Return typed value (Number, Boolean, String, null)
  get clearable() {
    return this.hasAttribute( 'clearable' );
  }

  set clearable( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'clearable' );
      } else {
        this.setAttribute( 'clearable', '' );
      }
    } else {
      this.removeAttribute( 'clearable' );
    }
  }

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

  get placeholder() {
    if( this.hasAttribute( 'placeholder' ) ) {
      return this.getAttribute( 'placeholder' );
    }

    return null;
  }

  set placeholder( value ) {
    if( value !== null ) {
      this.setAttribute( 'placeholder', value );
    } else {
      this.removeAttribute( 'placeholder' );
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

  get selectedIndex() {
    if( this.hasAttribute( 'selected-index' ) ) {
      return parseInt( this.getAttribute( 'selected-index' ) );
    }

    return null;
  }

  set selectedIndex( value ) {
    if( value !== null ) {
      this.setAttribute( 'selected-index', value );
    } else {
      this.removeAttribute( 'selected-index' );
    }
  }  

  get value() {
    let result = null;

    if( this.hasAttribute( 'value' ) ) {
      if( this.getAttribute( 'value').length > 0 ) {
        result = this.getAttribute( 'value' );
      }
    }

    return result;
  }

  set value( content ) {
    if( content !== null ) {
      if( content.trim().length === 0 ) {
        this.removeAttribute( 'value' );
      } else {
        this.setAttribute( 'value', content );
      }
    } else {
      this.removeAttribute( 'value' );
    }
  }            
}

window.customElements.define( 'adc-dropdown', AvocadoDropdown );
