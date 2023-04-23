import AvocadoLabel from "./label.js";

export default class AvocadoButton extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
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

        button {
          align-items: center;
          background: none;
          background-color: #0f62fe;
          border: none;
          border: solid 1px transparent;
          box-sizing: border-box;
          cursor: pointer;
          display: flex;
          flex-direction: row;
          height: 48px;
          justify-content: center;
          margin: 0;
          outline: solid 1px transparent;
          outline-offset: -3px;
          padding: 0 65px 0 15px;
          position: relative;
        }

        button:hover {
          background-color: #0050e6;
        }

        button:active {
          background-color: #002d9c;
        }

        button:focus {
          border-color: #0f62fe;
          box-shadow:
            inset 0 0 0 1px #0f62fe,
            inset 0 0 0 2px #ffffff;
        }

        adc-label {
          --label-color: #ffffff;
          --label-cursor: pointer;
        }

        ::slotted( adc-icon ) {
          pointer-events: none;
          position: absolute;
          top: 15px;
          --icon-color: #ffffff;
          --icon-cursor: pointer;
          --icon-font-size: 18px;
          --icon-size: 18px;
        }

        ::slotted( adc-icon[slot=prefix] ) {
          left: 15px;          
        }

        ::slotted( adc-icon[slot=suffix] ) {
          right: 15px;          
        }

        :host( [size=sm] ) button {
          height: 32px;
          padding: 0 60px 0 12px;
        }
        :host( [size=sm] ) ::slotted( adc-icon ) { top: 7px; }

        :host( [size=md] ) button {
          height: 40px;
          padding: 0 60px 0 12px;
        }

        :host( [size=lg] ) button {
          height: 48px;
          padding: 0 65px 0 15px;
        }

        :host( [size=xl] ) button {
          align-items: flex-start;
          height: 64px;
          padding: 16px 65px 0 16px;
        }

        :host( [size=2xl] ) button {
          align-items: flex-start;
          height: 80px;
          padding: 16px 65px 0 16px;
        }

        :host( [kind=secondary] ) button { background-color: #393939; }
        :host( [kind=secondary] ) button:hover { background-color: #4a4a4a; }
        :host( [kind=secondary] ) button:active { background-color: #6f6f6f; }
        :host( [kind=secondary] ) button:focus {
          border-color: #0f62fe;
          box-shadow:
            inset 0 0 0 1px #0f62fe,
            inset 0 0 0 2px #ffffff;
        }

        :host( [kind=tertiary] ) button {
          background-color: transparent;
          border: solid 1px #0f62fe;
        }
        :host( [kind=tertiary] ) adc-label { 
          --label-color: #0f62fe; 
        }
        :host( [kind=tertiary] ) button:hover {
          background-color: #0353e9;
          border: solid 1px #0353e9;
          color: #ffffff;
        }
        :host( [kind=tertiary] ) button:hover adc-label { --label-color: #ffffff; }
        :host( [kind=tertiary] ) button:focus {
          background-color: #0f62fe;
          border-color: #0f62fe;
          box-shadow:
            inset 0 0 0 1px #0f62fe,
            inset 0 0 0 2px #ffffff;
        }
        :host( [kind=tertiary] ) button:focus adc-label { --label-color: #ffffff; }
        :host( [kind=tertiary] ) button:active { background-color: #002d9c; }
        :host( [kind=tertiary] ) ::slotted( adc-icon ) { --icon-color: #0f62fe; }                
        :host( [kind=tertiary] ) button:hover ::slotted( adc-icon ) { --icon-color: #ffffff; }                        
        :host( [kind=tertiary] ) button:focus ::slotted( adc-icon ) { --icon-color: #ffffff; }                                

        :host( [kind=danger] ) button { background-color: #da1e28; }
        :host( [kind=danger] ) button:hover { background-color: #bc1a22; }
        :host( [kind=danger] ) button:active { background-color: #750e13; }
        :host( [kind=danger] ) button:focus {
          border-color: #0f62fe;
          box-shadow:
            inset 0 0 0 1px #0f62fe,
            inset 0 0 0 2px #ffffff;
        }

        :host( [kind=ghost] ) button { background-color: transparent; }
        :host( [kind=ghost] ) button adc-label { --label-color: #0f62fe; }
        :host( [kind=ghost] ) button:hover { background-color: #e5e5e5e4; }
        :host( [kind=ghost] ) button:active { background-color: #8d8d8d80; }
        :host( [kind=ghost] ) button:focus {
          border-color: #0f62fe;
          box-shadow:
            inset 0 0 0 1px #0f62fe,
            inset 0 0 0 2px #ffffff;
        }
        :host( [kind=ghost] ) ::slotted( adc-icon ) {
          --icon-color: #0f62fe;
        }

        :host( [disabled] ) button,
        :host( [disabled] ) button:hover {
          background-color: #c6c6c6;
          cursor: not-allowed;
        }

        :host( [disabled] ) button adc-label {        
          --label-color: #8d8d8d;
        }
      </style>
      <button type="button">
        <slot name="prefix"></slot>
        <adc-label part="label"></adc-label>
        <slot name="suffix"></slot>
      </button>
    `;

    // Private
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$button = this.shadowRoot.querySelector( 'button' );
    this.$label = this.shadowRoot.querySelector( 'adc-label' );
  }

   // When attributes change
  _render() {
    this.$button.disabled = this.disabled;
    this.$label.text = this.label;
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
    this._upgrade( 'hidden' );
    this._upgrade( 'kind' );
    this._upgrade( 'label' );
    this._upgrade( 'size' );
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'disabled',
      'hidden',
      'kind',
      'label',
      'size'
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

  get kind() {
    if( this.hasAttribute( 'kind' ) ) {
      return this.getAttribute( 'kind' );
    }

    return null;
  }

  set kind( value ) {
    if( value !== null ) {
      this.setAttribute( 'kind', value );
    } else {
      this.removeAttribute( 'kind' );
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

  get size() {
    if( this.hasAttribute( 'size' ) ) {
      return this.getAttribute( 'size' );
    }

    return null;
  }

  set size( value ) {
    if( value !== null ) {
      this.setAttribute( 'size', value );
    } else {
      this.removeAttribute( 'size' );
    }
  }
}

window.customElements.define( 'adc-button', AvocadoButton );
