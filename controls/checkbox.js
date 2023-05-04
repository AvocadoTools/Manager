export default class AvocadoCheckbox extends HTMLElement {
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
          border: none;
          box-sizing: border-box;
          color: var( --label-color, #161616 );
          cursor: var( --label-cursor, pointer );
          display: flex;
          flex-direction: row;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: var( --label-font-size, 14px );
          font-weight: var( --label-font-weight, 400 );
          gap: 3px;
          justify-content: center;
          margin: var( --label-margin, 0 );
          outline: none;
          padding: var( --label-padding, 0 );
          text-rendering: optimizeLegibility;
          width: 100%;
        }

        p {
          box-sizing: border-box;
          color: var( --icon-button-color, #161616 );
          cursor: var( --icon-button-cursor, pointer );
          direction: ltr;
          display: inline-block;
          font-family: 'Material Symbols Outlined';
          font-size: var( --icon-button-font-size, 21px );
          font-style: normal;
          font-weight: normal;
          height: 24px;
          letter-spacing: normal;
          line-height: 1.0;
          margin: 0;
          padding: 0;
          text-rendering: optimizeLegibility;
          text-transform: none;
          white-space: nowrap;
          width: 24px;
          word-wrap: normal;          
        }

        :host( [disabled] ) button,
        :host( [disabled] ) p {
          cursor: default;
        }
      </style>
      <button part="button" type="button">
        <p part="icon">check_box_outline_blank</p>
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
      if( !this.disabled )
        this.checked = !this.checked;
    } );
    this.$check = this.shadowRoot.querySelector( 'p' );
  }

   // When attributes change
  _render() {
    this.$button.disabled = this.disabled;
    this.$check.innerText = this.checked ? 'check_box' : 'check_box_outline_blank';

    if( this.text !== null )
      this.innerText = this.text;
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
    this._upgrade( 'checked' );            
    this._upgrade( 'concealed' );        
    this._upgrade( 'data' );             
    this._upgrade( 'disabled' );               
    this._upgrade( 'hidden' );    
    this._upgrade( 'text' );    
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'checked',      
      'concealed',
      'disabled',
      'hidden',
      'text'
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
  get checked() {
    return this.hasAttribute( 'checked' );
  }

  set checked( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'checked' );
      } else {
        this.setAttribute( 'checked', '' );
      }
    } else {
      this.removeAttribute( 'checked' );
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

  get text() {
    if( this.hasAttribute( 'text' ) ) {
      return this.getAttribute( 'text' );
    }

    return null;
  }

  set text( value ) {
    if( value !== null ) {
      this.setAttribute( 'text', value );
    } else {
      this.removeAttribute( 'text' );
    }
  }      
}

window.customElements.define( 'adc-checkbox', AvocadoCheckbox );
