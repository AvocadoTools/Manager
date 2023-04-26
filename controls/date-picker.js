import AvocadoHBox from "../containers/hbox.js";
import AvocadoVBox from "../containers/vbox.js";

import AvocadoIcon from "./icon.js";
import AvocadoIconButton from "./icon-button.js";
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

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        adc-icon-button {
          --icon-button-color: #525252;
          --icon-button-size: 40px;
        }

        adc-icon-button::part( button ) {
          min-width: 40px;
          opacity: 1.0;          
          transition:
            min-width 300ms ease-out,
            opacity 300ms ease-out,            
            width 300ms ease-out;
          width: 40px;
        }

        adc-hbox[part=header] > adc-vbox {
          flex-basis: 0;
          flex-grow: 1;
        }

        input {
          appearance: none;
          background: none;
          border: none;
          box-sizing: border-box;
          color: #c6c6c6;
          cursor: pointer;
          flex-basis: 0;
          flex-grow: 1;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          height: 40px;
          margin: 0;
          min-height: 40px;
          min-width: 0;
          outline: none;
          padding: 0 16px 0 16px;
          text-align: left;
          text-rendering: optimizeLegibility;
          width: 0;
          -webkit-appearance: none;          
        }

        input::placeholder {
          color: #a8a8a8;
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
          transition: background-color 150ms ease-in-out;
          width: 100%;
        }

        label:focus-within {
          outline: solid 2px #0f62fe;
        }

        adc-icon {
          --icon-color: #da1e28;
        }

        adc-icon::part( icon ) {
          height: 40px;
          min-width: 40px;
          opacity: 1.0;
          transition:
            min-width 300ms ease-out,
            opacity 300ms ease-out,
            width 300ms ease-out;
          width: 40px;
        }

        adc-label[part=error] {
          padding: 4px 0 0 0;
          --label-color: #6f6f6f;
          --label-font-size: 12px;
        }

        adc-label[part=helper] {
          padding: 0 0 4px 0;          
          --label-color: #6f6f6f;
          --label-font-size: 12px;
        }

        adc-label[part=label] {
          flex-basis: 0;
          flex-grow: 1;          
          --label-color: #525252;
          --label-font-size: 12px;
        }

        ::slotted( adc-label ) {
          margin: 0 0 4px 0;
          --label-color: #6f6f6f;
          --label-font-size: 12px;
        }

        ::slotted( adc-link ) {
          margin: 0 0 2px 0;
          --link-font-size: 12px;
        }

        :host( [error] ) adc-label[part=error] {
          visibility: visible;
        }

        :host( [invalid] ) adc-icon[part=invalid]::part( icon ) {
          min-width: 40px;
          opacity: 1.0;
          width: 40px;
        }        

        :host( [invalid] ) label {
          outline: solid 2px #da1e28;
        }

        :host( [invalid] ) adc-label[part=error] {
          --label-color: #da1e28;
        }

        :host( [invalid] ) adc-icon::part( icon ) {
          min-width: 40px;
          opacity: 1.0;
          width: 40px;
        }

        :host( :not( [invalid] ) ) adc-icon[part=invalid]::part( icon ) {
          min-width: 0;
          opacity: 0;
          width: 0;
        }

        :host( [light] ) label {
          background-color: #ffffff;
        }

        :host( [value]:not( [read-only] ) ) label:focus-within adc-icon::part( icon ) {
          min-width: 40px;
          opacity: 1.0;
          width: 40px;
        }

        :host( [value]:not( [read-only] ) ) label:focus-within adc-icon-button[part=clear]::part( button ) {
          min-width: 40px;
          opacity: 1.0;
          width: 40px;
        }

        :host( [read-only] ) adc-icon-button[part=button]::part( button ),
        :host( [read-only] ) adc-icon-button[part=clear]::part( button ) {
          min-width: 0;
          opacity: 0;
          width: 0;                    
        }

        :host( [read-only] ) input {
          cursor: default;
        }        

        :host( [read-only] ) label {
          border-bottom: solid 1px transparent;
          cursor: default;
        }        

        :host( [read-only] ) label:hover {
          background-color: #f4f4f4;
        }                
        
        :host( [read-only][light] ) label:hover {
          background-color: #ffffff;
        }                        

        :host( [read-only] ) label:focus-within {        
          outline: solid 2px transparent;
        }        
      </style>
      <adc-hbox part="header">
        <adc-vbox>
          <adc-label part="label"></adc-label>
          <adc-label part="helper"></adc-label>
        </adc-vbox>
        <slot></slot>
      </adc-hbox>
      <label part="field">
        <input part="input" readonly />
        <adc-icon filled name="error" part="invalid"></adc-icon>
        <adc-icon-button name="close" part="clear"></adc-icon-button>
        <adc-icon-button name="calendar_month" part="button"></adc-icon-button>        
      </label>
      <adc-label part="error"></adc-label>
    `;

    // Private
    this._calendar = null;
    this._data = null;
    this._value = null;

    // Removable events
    this.doCalendarChange = this.doCalendarChange.bind( this );

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$calendar = this.shadowRoot.querySelector( 'adc-icon-button[part=button]' );
    this.$calendar.addEventListener( 'click', () => this.doCalendarClick() );    
    this.$error = this.shadowRoot.querySelector( 'adc-label[part=error]' );
    this.$helper = this.shadowRoot.querySelector( 'adc-label[part=helper]' );
    this.$input = this.shadowRoot.querySelector( 'input[part=input]' );
    this.$input.addEventListener( 'click', () => this.doInputClick() );
    this.$label = this.shadowRoot.querySelector( 'adc-label[part=label]' );
  }

  doCalendarChange( evt ) {
    this._calendar.hide();
    this._calendar.removeEventListener( 'change', this.doCalendarChange );    
    
    this.value = evt.detail;

    this.dispatchEvent( new CustomEvent( 'change', {
      detail: new Date( this.value.getTime() )
    } ) );
  }

  doCalendarClick() {
    if( this._calendar.opened ) {
      this._calendar.hide();
      this._calendar.removeEventListener( 'change', this.doCalendarChange );
    } else {
      this._calendar.addEventListener( 'change', this.doCalendarChange );
      this._calendar.today = true;      
      this._calendar.value = this.value;
      this._calendar.show( this );
    }
  }

  doInputClick() {
    if( this.editable ) return;
    if( this.readOnly ) return;
    this.doCalendarClick();
  }

   // When attributes change
  _render() {
    this.$helper.text = this.helper;
    this.$label.text = this.label;
    this.$input.placeholder = this.placeholder;
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
      'read-only'
    ];
  }

  // Observed attribute has changed
  // Update render
  attributeChangedCallback( name, old, value ) {
    this._render();
  }

  // Properties
  // Not reflected
  // Array, Date, Object, null
  get data() {
    return this._data;
  }

  set data( value ) {
    this._data = value;
  }

  get value() {
    return this._value;
  }

  set value( date ) {
    if( date === null ) {
      this._value = null;
    } else {
      if( date instanceof Date ) {
        this._value = new Date( date.getTime() );
      } else if( typeof( date ) === 'number' ) {
        this._value = new Date( date );
      }
    }

    this._render();
  }

  // Attributes
  // Reflected
  // Boolean, Number, String, null
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
}

window.customElements.define( 'adc-date-picker', AvocadoDatePicker );
