import AvocadoHBox from "../containers/hbox.js";
import AvocadoVBox from "../containers/vbox.js";
import AvocadoIcon from "./icon.js";
import AvocadoLabel from "./label.js";

export default class AvocadoInput extends HTMLElement {
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

        adc-icon[part=invalid] {
          align-items: center;
          display: flex;
          height: 40px;
          justify-content: center;
          min-width: 0;
          opacity: 0;
          overflow: hidden;
          transition: 
            opacity 150ms ease-out,
            min-width 150ms ease-out,
            width 150ms ease-out;
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
        
        adc-vbox {
          flex-basis: 0;
          flex-grow: 1;
        }

        button {
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          height: 40px;
          justify-content: center;
          margin: 0;
          min-width: 0;
          opacity: 0;
          overflow: hidden;
          padding: 0;
          transition: 
            opacity 150ms ease-out,
            min-width 150ms ease-out,
            width 150ms ease-out;          
          width: 0;
          -webkit-tap-highlight-color: transparent;
        }

        button adc-icon {
          --icon-color: #525252;
          --icon-cursor: pointer;
        }

        input {
          appearance: none;
          background: none;
          border: none;
          box-sizing: border-box;
          color: #161616;
          flex-basis: 0;
          flex-grow: 1;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          height: 40px;
          margin: 0;
          min-height: 40px;
          outline: none;
          padding: 0 16px 0 16px;
          text-rendering: optimizeLegibility;
          width: 0;
          -webkit-tap-highlight-color: transparent;
        }     
        
        input::placeholder {
          color: #a8a8a8;
          opacity: 1.0;
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
          transition: background-color 150ms ease-in-out;
          -webkit-tap-highlight-color: transparent;
        }

        label:focus-within {
          outline: solid 2px #0f62fe;
        }        

        :host( [label] ) adc-label[part=label] { display: block; }
        :host( [helper] ) adc-label[part=helper] { display: block; }        
        :host( [helper] ) adc-label[part=label] { padding: 0; }
        :host( [error] ) adc-label[part=error] { visibility: visible; }
        :host( [error][invalid] ) adc-label[part=error] { --label-color: #da1e28; }
        :host( [invalid] ) label { outline: solid 2px #da1e28; }        
        :host( [invalid] ) label:focus-within { outline: solid 2px #0f62fe; }                
        :host( [invalid] ) adc-icon[part=invalid] {
          min-width: 40px;
          opacity: 1.0;
          width: 40px;
        }
        :host( [light] ) label { background-color: #ffffff; }
        :host( [value][clearable] ) button[part=clear] {
          min-width: 40px;
          opacity: 1.0;
          width: 40px;
        }
        :host( [type=password][revealable] ) button[part=reveal] {
          min-width: 40px;
          opacity: 1.0;
          width: 40px;
        }        

        ::slotted( adc-label ) {
          align-self: flex-end;
          padding: 0 0 4px 0;
          --label-font-size: 12px;          
        }

        ::slotted( adc-link ) {
          align-self: flex-end;
          padding: 0 0 2px 0;
          --link-font-size: 12px;          
        }
      </style>
      <adc-hbox>
        <adc-vbox>
          <adc-label exportparts="label: label-p" part="label"></adc-label>
          <adc-label exportparts="label: helper-p" part="helper"></adc-label>                
        </adc-vbox>
        <slot></slot>        
      </adc-hbox>
      <label part="field">
        <slot name="prefix"></slot>
        <input part="input" type="text">
        <adc-icon exportparts="font: invalid-icon" filled name="error" part="invalid"></adc-icon>
        <button part="reveal" type="button">
          <adc-icon exportparts="font: reveal-icon" name="visibility" weight="200"></adc-icon>
        </button>
        <button part="clear" type="button">
          <adc-icon exportparts="font: clear-icon" name="close" weight="200"></adc-icon>
        </button>
      </label>
      <adc-label exportparts="label: error-p" part="error"></adc-label>
    `;

    // Properties
    this._data = null;

    // Root
    const shadowRoot = this.attachShadow( {mode: 'open'} );
    shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$clear = shadowRoot.querySelector( 'button[part=clear]' );
    this.$clear.addEventListener( 'click', () => {
      this.clear();
      this.focus();
      this.dispatchEvent( new CustomEvent( 'adc-clear' ) );
    } );
    this.$error = shadowRoot.querySelector( 'adc-label[part=error]' );    
    this.$label = shadowRoot.querySelector( 'adc-label[part=label]' );
    this.$helper = shadowRoot.querySelector( 'adc-label[part=helper]' );
    this.$input = shadowRoot.querySelector( 'input' );
    this.$input.addEventListener( 'focus', () => this.dispatchEvent( new CustomEvent( 'adc-focus' ) ) );
    this.$input.addEventListener( 'blur', () => this.dispatchEvent( new CustomEvent( 'adc-blur' ) ) );     
    this.$input.addEventListener( 'input', ( evt ) => {
      this.value = evt.currentTarget.value;
      this.dispatchEvent( new CustomEvent( 'adc-input', {
        detail: {
          value: evt.currentTarget.value
        }
      } ) );      
    } );
    this.$input.addEventListener( 'keypress', ( evt ) => {
      if( evt.key === 'Enter' ) {
        evt.preventDefault();
        evt.stopImmediatePropagation();

        this.dispatchEvent( new CustomEvent( 'adc-enter', {
          detail: {
            value: evt.currentTarget.value
          }
        } ) );
      }
    } );
    this.$input.addEventListener( 'keyup', ( evt ) => {
      if( evt.key !== 'Enter' ) {
        this.value = evt.currentTarget.value;
        this.dispatchEvent( new CustomEvent( 'adc-change', {
          detail: {
            value: evt.currentTarget.value
          }
        } ) );              
      }
    } );
    this.$reveal = shadowRoot.querySelector( 'button[part=reveal]' );
    this.$reveal.addEventListener( 'click', () => {
      this.$input.type = this.$input.type === 'password' ? 'text' : 'password';
      this.$input.focus();
      this.$reveal.children[0].name = this.$reveal.children[0].name === 'visibility' ? 'visibility_off' : 'visibility';
    } );
  }

  blur() {
    this.$input.blur();
  }

  clear() {
    this.$input.value = '';
    this.value = null;
  }

  focus() {
    this.$input.focus();
  }

  valueAsFloat() {
    return this.value === null ? null : parseFloat( this.value );
  }

  valueAsInt() {
    return this.value === null ? null : parseInt( this.value );
  }

  // When things change
  _render() {
    this.$input.disabled = this.disabled;
    this.$input.inputMode = this.mode === null ? 'text' : this.mode;
    this.$input.placeholder = this.placeholder === null ? '' : this.placeholder;
    this.$input.readOnly = this.readOnly;
    this.$input.value = this.value === null ? '' : this.value;
    this.$input.type = this.type === null ? 'text' : this.type;      

    /*
    if( this.type === 'password' ) {
      this.$input.type = this.$reveal.text === 'visibility' ? 'password' : 'type';      
    } else {
      this.$input.type = this.type === null ? 'text' : this.type;      
    }
    */

    this.$label.text = this.label;
    this.$helper.text = this.helper;
    this.$error.text = this.error;    
  }

  // Promote properties
  // Values may be set before module load
  _upgrade( property ) {
    if( this.hasOwnProperty( property ) ) {
      const value = this[property];
      delete this[property];
      this[property] = value;
    }
  }

  // Setup
  connectedCallback() {
    this._upgrade( 'clearable' );    
    this._upgrade( 'concealed' );
    this._upgrade( 'data' );
    this._upgrade( 'disabled' );
    this._upgrade( 'error' );
    this._upgrade( 'helper' );
    this._upgrade( 'hidden' );
    this._upgrade( 'invalid' );
    this._upgrade( 'label' );
    this._upgrade( 'light' );
    this._upgrade( 'mode' );
    this._upgrade( 'name' );    
    this._upgrade( 'placeholder' );
    this._upgrade( 'readOnly' );
    this._upgrade( 'revealable' );    
    this._upgrade( 'type' );
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
      'light',
      'mode',
      'name',
      'placeholder',
      'read-only',
      'revealable',
      'type',
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

  get mode() {
    if( this.hasAttribute( 'mode' ) ) {
      return this.getAttribute( 'mode' );
    }

    return null;
  }

  set mode( value ) {
    if( value !== null ) {
      this.setAttribute( 'mode', value );
    } else {
      this.removeAttribute( 'mode' );
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

  get revealable() {
    return this.hasAttribute( 'revealable' );
  }

  set revealable( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'revealable' );
      } else {
        this.setAttribute( 'revealable', '' );
      }
    } else {
      this.removeAttribute( 'revealable' );
    }
  }    

  get type() {
    if( this.hasAttribute( 'type' ) ) {
      return this.getAttribute( 'type' );
    }

    return null;
  }

  set type( value ) {
    if( value !== null ) {
      this.setAttribute( 'type', value );
    } else {
      this.removeAttribute( 'type' );
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

window.customElements.define( 'adc-input', AvocadoInput );
