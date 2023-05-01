import AvocadoHBox from "../containers/hbox.js";
import AvocadoVBox from "../containers/vbox.js";

import AvocadoCalendar from "./calendar.js";
import AvocadoIcon from "./icon.js";
import AvocadoLabel from "./label.js";

export default class AvocadoDatePicker extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        button {
          align-items: center;
          appearance: none;
          background: none;
          background-color: #f4f4f4;
          border: none;
          border-bottom: solid 1px #8d8d8d;          
          box-sizing: border-box;
          cursor: pointer;
          display: flex;
          flex-basis: 0;
          flex-direction: row;
          flex-grow: 1;
          height: 40px;
          margin: 0;
          min-height: 40px;
          outline: solid 2px transparent;
          outline-offset: -2px;
          padding: 0 0 0 16px;
          position: relative;
        }

        button:focus-within {
          outline: solid 2px #0f62fe;
        }

        button adc-label {
          flex-basis: 0;
          flex-grow: 1;
          --label-color: #161616;          
          --label-cursor: pointer;
          --label-font-size: 14px;
        }
        
        adc-calendar {
          position: absolute;
          left: 0;
          top: 41px;          
        }

        adc-icon {
          overflow: hidden;
        }

        adc-icon::part( icon ) {
          color: #161616;
          cursor: pointer;
          height: 40px;
          line-height: 40px;
          min-width: 40px;
          opacity: 1.0;
          text-align: center;
          transition:
            min-width 300ms ease-out,
            opacity 300ms ease-out,
            width 300ms ease-out;
          width: 40px;
        }

        adc-icon-button::part( button ) {
          overflow: hidden;
        }

        adc-icon:nth-of-type( 1 ) {
          --icon-color: #da1e28;
        }        

        adc-icon-button {
          --icon-button-size: auto;
        }

        adc-icon-button::part( button-icon ) {
          color: #161616;
          cursor: pointer;
          height: 40px;
          line-height: 40px;
          min-width: 40px;
          opacity: 1.0;
          text-align: center;
          transition:
            min-width 300ms ease-out,
            opacity 300ms ease-out,
            width 300ms ease-out;
          width: 40px;
        }

        adc-label[part=error] {
          height: 16px;
          margin: 4px 0 0 0;
          min-height: 16px;
          --label-font-size: 12px;
        }

        adc-label[part=helper] {
          padding: 0 0 4px 0;
          --label-color: #6f6f6f;
          --label-font-size: 12px;
        }

        adc-label[part=label] {
          padding: 0 0 4px 0;
          --label-color: #525252;
          --label-font-size: 12px;
        }        

        adc-vbox {
          flex-basis: 0;
          flex-grow: 1;
        }

        :host( [invalid] ) adc-label[part=error] {
          --label-color: #da1e28;
        }

        :host( :not( [helper] ) ) adc-label[part=helper] {
          display: none;
        }

        :host( :not( [helper] ) ) adc-label[part=label] {
          padding: 0 0 4px 0;
        }        

        :host( :not( [invalid] ) ) adc-icon:nth-of-type( 1 ) {
          min-width: 0;
          opacity: 0;
          width: 0;
        }

        :host( :not( [label] ) ) adc-label[part=label] {
          display: none;
        }        

        :host( [light] ) button {
          background-color: #ffffff;
        }

        :host( [read-only] ) button {
          border-bottom: solid 1px transparent;          
          cursor: default;
          outline: none;
        }

        :host( [read-only] ) button adc-icon:nth-of-type( 2 )::part( icon ) {
          min-width: 0;
          opacity: 0;
          width: 0;
        }

        :host( [read-only] ) button adc-label {
          --label-cursor: default;
        }        

        :host( [invalid] ) button:not( :focus-within ) {
          outline: solid 2px #da1e28;
        }

        :host( :not( [error] ) ) adc-label[part=error] {
          visibility: hidden;
        }

        :host( [value]:not( :focus-within ) ) adc-icon-button::part( button-icon ),
        :host( :not( [value] ) ) adc-icon-button::part( button-icon ) {
          min-width: 0;
          opacity: 0;
          width: 0;
        }

        :host( :not( [value] ) ) button adc-label {
          --label-color: #a8a8a8;
        }        

        ::slotted( adc-label ) {
          --label-color: #6f6f6f;
          --label-font-size: 12px;
        }
      </style>
      <adc-hbox>
        <adc-vbox>
          <adc-label part="label"></adc-label>
          <adc-label part="helper"></adc-label>                
        </adc-vbox>
        <slot></slot>        
      </adc-hbox>
      <button part="field">
        <adc-label part="value"></adc-label>
        <adc-icon filled name="error"></adc-icon>
        <adc-icon-button name="close"></adc-icon-button>
        <adc-icon filled name="calendar_month"></adc-icon>
        <adc-calendar></adc-calendar>        
      </button>
      <adc-label part="error"></adc-label>
    `;

    // Properties
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$button = this.shadowRoot.querySelector( 'button' );
    this.$button.addEventListener( 'click', () => {
      if( this.$calendar.opened ) {
        this.$calendar.hide();
      } else {
        const calendar = this.$calendar.getBoundingClientRect();
        if( ( calendar.x + calendar.width + 16 ) > window.innerWidth ) {
          this.$calendar.style.left = `${this.clientWidth - calendar.width}px`;
        }
        // TODO: Shift vertical based on window height

        const now = new Date();
        this.$calendar.display = this.value === null ? now : new Date( this.value );
        this.$calendar.value = this.value === null ? now : new Date( this.value );
        this.$calendar.show();
      }
    } );
    this.$calendar = this.shadowRoot.querySelector( 'adc-calendar' );
    this.$calendar.addEventListener( 'change', ( evt ) => {
      this.value = evt.detail.getTime();
    } );
    this.$calendar.hide();
    this.$clear = this.shadowRoot.querySelector( 'button adc-icon-button' );
    this.$clear.addEventListener( 'click', ( evt ) => {
      evt.stopImmediatePropagation();
      this.clear();
      this.focus();
      this.dispatchEvent( new CustomEvent( 'clear' ) );
    } );    
    this.$error = this.shadowRoot.querySelector( 'adc-label[part=error]' );    
    this.$helper = this.shadowRoot.querySelector( 'adc-label[part=helper]' );        
    this.$label = this.shadowRoot.querySelector( 'adc-label[part=label]' );    
    this.$value = this.shadowRoot.querySelector( 'button adc-label' );
  }

  blur() {
    this.$button.blur();
  }

  clear() {
    this.value = null;
  }

  focus() {
    this.$button.focus();
  }

  // When things change
  _render() {
    this.$label.text = this.label;
    this.$helper.text = this.helper;    
    
    if( this.value !== null ) {
      const formatted = new Intl.DateTimeFormat( navigator.language, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      } ).format( new Date( this.value ) );
      this.$value.text = formatted;
    } else {
      this.$value.text = this.placeholder;      
    }

    this.$button.disabled = this.readOnly;
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
    this._upgrade( 'concealed' );
    this._upgrade( 'data' );
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
    if( this.hasAttribute( 'value' ) ) {
      return parseInt( this.getAttribute( 'value' ) );
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

window.customElements.define( 'adc-date-picker', AvocadoDatePicker );
