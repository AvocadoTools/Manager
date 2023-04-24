import AvocadoHBox from "../containers/hbox.js";
import AvocadoVBox from "../containers/vbox.js";

import AvocadoIcon from "./icon.js";
import AvocadoLabel from "./label.js";

export default class AvocadoTextarea extends HTMLElement {
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

        label {
          align-items: center;
          background-color: #f4f4f4;
          border-bottom: solid 1px #8d8d8d;
          box-sizing: border-box;
          display: flex;
          flex-direction: row;
          height: 100%;
          margin: 0;
          outline: solid 2px transparent;
          outline-offset: -2px;
          padding: 0;
          position: relative;
        }

        label:focus-within {
          outline: solid 2px #0f62fe;
        }

        adc-icon {
          position: absolute;
          right: 12px;
          top: 12px;
          --icon-color: #da1e28;
        }     

        adc-icon::part( icon ) {
          min-width: 0;
          opacity: 0;
          transition: 
            min-width 300ms ease-out,
            opacity 300ms ease-out,
            width 300ms ease-out;
          width: 0;
        }

        adc-label[part=error] {
          padding: 4px 0 4px 0;   
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
          flex-basis: 0;
          flex-grow: 1;          
          padding: 0;          
          --label-color: #525252;          
          --label-font-size: 12px;
        }

        textarea {
          background: none;
          border: none;
          box-sizing: border-box;
          flex-basis: 0;
          flex-grow: 1;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          height: 100%;
          margin: 0;
          min-height: 40px;
          outline: none;
          padding: 11px 40px 11px 16px;
          resize: none;
          text-rendering: optimizeLegibility;
        }

        textarea::placeholder {
          color: #a8a8a8;
        }                

        ::slotted( adc-link ) {
          margin: 0 0 2px 0;
          --link-font-size: 12px;
        }

        :host( [error] ) adc-label[part=error] {
          visibility: visible;
        }

        :host( [label] ) adc-label[part=label] {
          display: flex;
        }

        :host( [label]:not( [helper] ) ) adc-label[part=label] {
          padding: 0 0 4px 0;
        }        

        :host( [helper] ) adc-label[part=helper] {
          display: block;
        }

        :host( [light] ) label {
          background-color: #ffffff;
        }

        :host( [read-only] ) label {
          border-bottom: solid 1px transparent;
        }        

        :host( [read-only] ) label:focus-within {        
          outline: solid 2px transparent;
        }

        :host( [read-only] ) textarea {
          cursor: default;
        }                

        :host( [invalid] ) label {
          outline: solid 2px #da1e28;
        }

        :host( [invalid] ) label:focus-within {
          outline: solid 2px #0f62fe;
        }

        :host( [invalid] ) adc-label[part=error] {
          --label-color: #da1e28;
        }

        :host( [invalid] ) adc-icon::part( icon ) {
          min-width: 20px;
          opacity: 1.0;
          width: 20px;
        }

        :host( [disabled] ) label {
          border-bottom: solid 1px transparent;
        }

        :host( [disabled] ) adc-label[part=error],
        :host( [disabled] ) adc-label[part=helper],
        :host( [disabled] ) adc-label[part=label] {
          --label-color: #16161640;
        }

        :host( [disabled] ) textarea {
          color: #c6c6c6;
          cursor: not-allowed;
        }

        :host( [disabled][invalid] ) adc-label[part=error] {
          --label-color: #da1e28;
        }
      </style>
      <adc-hbox>
        <adc-vbox>      
          <adc-label part="label"></adc-label>
          <adc-label part="helper"></adc-label>
        </adc-vbox>
        <slot></slot>        
      </adc-hbox>
      <label part="field">
        <textarea part="input"></textarea>
        <adc-icon filled name="error" part="invalid"></adc-icon>        
      </label>
      <adc-label part="error"></adc-label>
    `;

    // Properties
    this._data = null;

    // Root
    const shadowRoot = this.attachShadow( {mode: 'open'} );
    shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$error = shadowRoot.querySelector( 'adc-label[part=error]' );    
    this.$label = shadowRoot.querySelector( 'adc-label[part=label]' );
    this.$helper = shadowRoot.querySelector( 'adc-label[part=helper]' );
    this.$textarea = shadowRoot.querySelector( 'textarea' );
    this.$textarea.addEventListener( 'input', ( evt ) => {
      this.value = evt.currentTarget.value;
    } );
  }

  blur() {
    this.$textarea.blur();
  }

  clear() {
    this.$textarea.value = '';
    this.value = null;
  }

  focus() {
    this.$textarea.focus();
  }

  // When things change
  _render() {
    this.$error.text = this.error === null ? '&nbsp;' : this.error;
    this.$textarea.disabled = this.disabled;
    this.$textarea.placeholder = this.placeholder === null ? '' : this.placeholder;
    this.$textarea.readOnly = this.readOnly;
    this.$textarea.value = this.value === null ? '' : this.value;
    this.$label.text = this.label;
    this.$helper.text = this.helper;
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
    this._upgrade( 'concealed' );
    this._upgrade( 'data' );
    this._upgrade( 'disabled' );
    this._upgrade( 'error' );
    this._upgrade( 'helper' );
    this._upgrade( 'hidden' );
    this._upgrade( 'invalid' );
    this._upgrade( 'label' );
    this._upgrade( 'light' );
    this._upgrade( 'placeholder' );
    this._upgrade( 'readOnly' );
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
      'placeholder',
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

  get value() {
    let result = null;

    if( this.hasAttribute( 'value' ) ) {
      if( this.getAttribute( 'value').trim().length > 0 ) {
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

window.customElements.define( 'adc-textarea', AvocadoTextarea );
