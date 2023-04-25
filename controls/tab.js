import AvocadoVBox from "../containers/vbox.js";

import AvocadoIcon from "./icon-button.js";
import AvocadoLabel from "./label.js";

export default class AvocadoTab extends HTMLElement {
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
          appearance: none;
          background: none;
          background-color: #e0e0e0;
          border: none;
          border-left: solid 1px #8d8d8d;          
          border-top: solid 2px transparent;
          /* box-shadow: inset 0 2px 0 0 #0f62fe; */
          box-sizing: border-box;
          cursor: pointer;
          display: flex;
          flex-direction: row;
          height: 48px;
          margin: 0;
          min-width: 145px;
          padding: 0 16px 0 16px;
        }

        button:hover {
          background-color: #cacaca;
        }

        adc-label {
          --label-cursor: pointer;
        }

        adc-label[part=label] {
          --label-font-weight: 400;
        }

        :host( :not( [closable] ) ) adc-icon {
          display: none;
        }

        :host( :not( [helper] ) ) adc-label[part=helper] {
          display: none;
        }

        :host( [active] ) adc-label[part=label] {
          --label-font-weight: 600;
        }

        :host( [active] ) button {
          background-color: #f4f4f4;          
          border-left: solid 1px transparent;  
          border-top: solid 2px #0f62fe;          
        }
      </style>
      <button part="button">
        <adc-vbox>
          <adc-label part="label"></adc-label>
          <adc-label part="helper"></adc-label>
        </adc-vbox>
        <adc-icon name="close" part="close"></adc-icon>
      </button>
    `;

    // Private
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$helper = this.shadowRoot.querySelector( 'adc-label[part=helper]' );    
    this.$label = this.shadowRoot.querySelector( 'adc-label[part=label]' );
  }

  // When things change
  _render() {
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
    this._upgrade( 'active' );    
    this._upgrade( 'closable' );    
    this._upgrade( 'concealed' );
    this._upgrade( 'disabled' );    
    this._upgrade( 'data' );
    this._upgrade( 'helper' );    
    this._upgrade( 'hidden' );
    this._upgrade( 'label' );
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'active',
      'closable',      
      'concealed',
      'disabled',
      'helper',
      'hidden',
      'label'
    ];
  }

  // Observed tag attribute has changed
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
  get active() {
    return this.hasAttribute( 'active' );
  }

  set active( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'active' );
      } else {
        this.setAttribute( 'active', '' );
      }
    } else {
      this.removeAttribute( 'active' );
    }
  }

  get closable() {
    return this.hasAttribute( 'closable' );
  }

  set closable( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'closable' );
      } else {
        this.setAttribute( 'closable', '' );
      }
    } else {
      this.removeAttribute( 'closable' );
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
}

window.customElements.define( 'adc-tab', AvocadoTab );
