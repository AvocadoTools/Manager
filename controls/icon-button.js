import AvocadoIcon from './icon.js'

export default class AvocadoIconButton extends HTMLElement {
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
          border: none;
          box-sizing: border-box;
          cursor: var( --icon-button-cursor, pointer );     
          display: flex;
          height: var( --icon-button-size, 48px );
          justify-content: center;
          margin: 0;
          outline: none;
          overflow: hidden;
          padding: 0;
          width: var( --icon-button-size, 48px );
          -webkit-tap-highlight-color: transparent; 
        }        
        
        adc-icon {
          align-items: center;
          display: flex;
          justify-content: center;
          --icon-color: var( --icon-button-color );
          --icon-cursor: pointer;
        }
      </style>
      <button part="button" type="button">
        <adc-icon part="icon" exportparts="icon: button-icon"></adc-icon>
      </button>
    `;

    // Properties
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$button = this.shadowRoot.querySelector( 'button' );
    this.$icon = this.shadowRoot.querySelector( 'adc-icon' );
  }

  blur() {
    this.$button.blur();
  }

  click() {
    this.$button.click();
  }

  focus() {
    this.$button.focus();
  }

  // When things change
  _render() {
    this.$button.disabled = this.disabled;
    this.$icon.name = this.name;    
    this.$icon.filled = this.filled;
    this.$icon.weight = this.weight;
    this.$icon.grade = this.grade;
    this.$icon.opticalSize = this.opticalSize;
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
    this._upgrade( 'filled' );
    this._upgrade( 'grade' );    
    this._upgrade( 'hidden' );    
    this._upgrade( 'name' );        
    this._upgrade( 'opticalSize' );        
    this._upgrade( 'selected' );        
    this._upgrade( 'weight' );    
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'disabled',
      'filled',
      'grade',
      'hidden',
      'name',
      'opticalSize',
      'selected',
      'weight'
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

  get filled() {
    return this.hasAttribute( 'filled' );
  }

  set filled( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'filled' );
      } else {
        this.setAttribute( 'filled', '' );
      }
    } else {
      this.removeAttribute( 'filled' );
    }
  }

  get grade() {
    if( this.hasAttribute( 'grade' ) ) {
      return parseInt( this.getAttribute( 'grade' ) );
    }

    return null;
  }

  set grade( value ) {
    if( value !== null ) {
      this.setAttribute( 'grade', value );
    } else {
      this.removeAttribute( 'grade' );
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

  get opticalSize() {
    if( this.hasAttribute( 'optical-size' ) ) {
      return parseInt( this.getAttribute( 'optical-size' ) );
    }

    return null;
  }

  set opticalSize( value ) {
    if( value !== null ) {
      this.setAttribute( 'optical-size', value );
    } else {
      this.removeAttribute( 'optical-size' );
    }
  }  

  get selected() {
    return this.hasAttribute( 'selected' );
  }

  set selected( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'selected' );
      } else {
        this.setAttribute( 'selected', '' );
      }
    } else {
      this.removeAttribute( 'selected' );
    }
  }  
  
  get weight() {
    if( this.hasAttribute( 'weight' ) ) {
      return parseInt( this.getAttribute( 'weight' ) );
    }

    return null;
  }

  set weight( value ) {
    if( value !== null ) {
      this.setAttribute( 'weight', value );
    } else {
      this.removeAttribute( 'weight' );
    }
  }    
}

window.customElements.define( 'adc-icon-button', AvocadoIconButton );
