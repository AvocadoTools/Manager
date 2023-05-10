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
          background: none;
          background-color: var( --icon-button-background-color, #0f62fe );
          border: none;
          border: solid 1px transparent;          
          box-sizing: border-box;
          color: var( --icon-button-color, #ffffff );
          cursor: var( --icon-button-cursor, pointer );
          direction: ltr;
          display: block;
          font-family: 'Material Symbols Outlined';
          font-size: var( --icon-button-font-size, 18px );
          font-style: normal;
          font-weight: normal;
          height: var( --icon-button-size, 48px );
          letter-spacing: normal;
          line-height: 1.0;
          margin: 0;
          outline: solid 1px transparent;
          outline-offset: -3px;          
          padding: 0;
          text-rendering: optimizeLegibility;
          text-transform: none;
          white-space: nowrap;
          width: var( --icon-button-size, 48px );
          word-wrap: normal;
          -webkit-tap-highlight-color: transparent;
        }

        button:hover {
          background-color: #0050e6;
        }

        button:focus {
          border-color: #0f62fe;
          box-shadow:
            inset 0 0 0 1px #0f62fe,
            inset 0 0 0 2px #ffffff;
        }

        button:active {
          background-color: #002d9c;
        }

        :host( [size=sm] ) button {
          height: 32px;
          width: 32px;
        }

        :host( [size=md] ) button {
          height: 40px;
          width: 40px;
        }                        

        :host( [kind=secondary] ) button { background-color: #393939; }
        :host( [kind=secondary] ) button:hover { background-color: #4a4a4a; }
        :host( [kind=secondary] ) button:active { background-color: #6f6f6f; }

        :host( [kind=tertiary] ) button { 
          background-color: transparent; 
          border: solid 1px #0f62fe;
          color: #0f62fe;                     
        }
        :host( [kind=tertiary] ) button:focus { 
          background-color: #0f62fe;
          color: #ffffff;
        }
        :host( [kind=tertiary] ) button:hover { 
          background-color: #0353e9;
          border: solid 1px #0353e9;
          color: #ffffff;  
        }                
        :host( [kind=tertiary] ) button:active { background-color: #002d9c; }

        :host( [kind=danger] ) button { background-color: #da1e28; }
        :host( [kind=danger] ) button:hover { background-color: #bc1a22; }
        :host( [kind=danger] ) button:active { background-color: #750e13; }

        :host( [kind=ghost] ) button { 
          background-color: transparent; 
          color: var( --icon-button-color, #0f62fe );
        }
        :host( [kind=ghost] ) button:hover { background-color: #e5e5e5e4; }
        :host( [kind=ghost] ) button:active { background-color: #8d8d8d80; }

        :host( [disabled] ) button {
          background-color: #c6c6c6;
          color: #8d8d8d;
          cursor: not-allowed;
        }

        :host( [disabled][kind=tertiary] ) button {        
          background-color: transparent;
          border-color: #c6c6c6;
        }
        :host( [disabled][kind=tertiary] ) button:hover { color: #8d8d8d; }

        :host( [disabled][kind=ghost] ) button { 
          background-color: transparent;
        }
      </style>
      <button part="button">
        <slot></slot>
      </button>
    `;

    // Private
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$button = this.shadowRoot.querySelector( 'button' );
    this.$button.addEventListener( 'click', () => {
      if( this.href !== null )
        window.open( this.href );
    } );        
  }

   // When attributes change
  _render() {
    this.$button.disabled = this.disabled;

    if( this.name !== null )
      this.innerText = this.name;

    const variation = [];

    if( this.filled )
      variation.push( '\'FILL\' 1' );

    if( this.weight !== null ) {
      variation.push( `'wght' ${this.weight}` );
    }

    this.$button.style.fontVariationSettings = variation.toString();
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
    this._upgrade( 'hidden' );
    this._upgrade( 'href' );
    this._upgrade( 'kind' );
    this._upgrade( 'name' );
    this._upgrade( 'size' );
    this._upgrade( 'weight' );
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'disabled',
      'filled',
      'hidden',
      'href',
      'kind',
      'name',
      'size',
      'weight'
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

  get href() {
    if( this.hasAttribute( 'href' ) ) {
      return this.getAttribute( 'href' );
    }

    return null;
  }

  set href( value ) {
    if( value !== null ) {
      this.setAttribute( 'href', value );
    } else {
      this.removeAttribute( 'href' );
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
