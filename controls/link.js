export default class AvocadoLink extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: block;
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
          border: none;
          box-sizing: border-box;
          color: #0f62fe;
          cursor: pointer;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: var( --link-font-size, 14px );
          font-weight: 400;
          margin: 0;
          outline: none;
          padding: 0;
          text-rendering: optimizeLegibility;
        }

        button:hover {
          text-decoration: underline;
        }

        :host( [inline] ) button {
          text-decoration: underline;          
        }

        :host( [disabled] ) button,
        :host( [disabled] ) button:hover {
          color: #c6c6c6;
          cursor: not-allowed;
        }

        :host( [disabled]:not( [inline] ) ) button:hover {
          text-decoration: none;
        }
      </style>
      <button part="button" type="button">
        <slot></slot>
      </button>
    `;

    // Properties
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$button = shadowRoot.querySelector( 'button' );
    this.$button.addEventListener( 'click', () => this.doButtonClick() );
  }

  doButtonClick() {
    if( this.href !== null ) {
      const ref = window.open( this.href );

      if( this.href.indexOf( 'mailto' ) >= 0 ) {
        ref.close();
      }
    }
  }

  // When things change
  _render() {
    this.$button.disabled = this.disabled;

    if( this.label !== null )
      this.$button.innerText = this.label;
  }

   // Properties set before module loaded
   _upgrade( property ) {
    if( this.hasOwnProperty( property ) ) {
      const value = this[property];
      delete this[property];
      this[property] = value;
    }    
  }     

  // Default render
  // No attributes set
  connectedCallback() {
    // Check data property before render
    // May be assigned before module is loaded    
    this._upgrade( 'concealed' );
    this._upgrade( 'data' );        
    this._upgrade( 'disabled' );    
    this._upgrade( 'hidden' );    
    this._upgrade( 'href' );    
    this._upgrade( 'inline' );    
    this._upgrade( 'label' );    
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'disabled',
      'hidden',
      'href',
      'inline',
      'label'
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

  get inline() {
    return this.hasAttribute( 'inline' );
  }

  set inline( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'inline' );
      } else {
        this.setAttribute( 'inline', '' );
      }
    } else {
      this.removeAttribute( 'inline' );
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

window.customElements.define( 'adc-link', AvocadoLink );
