export default class AvocadoDrawerItem extends HTMLElement {
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
          align-items: center;
          background: none;
          border: none;
          border-left: solid 4px transparent;                    
          box-sizing: border-box;
          cursor: pointer;
          display: flex;
          flex-direction: row;
          height: 32px;
          margin: 0;
          min-height: 32px;
          outline: none;
          padding: 0;
          transition: background-color 150ms ease-in-out;
          width: 100%;
        }

        button:hover {
          background-color: #4d4d4d;          
        } 

        p {
          color: var( --drawer-item-color, #f4f4f4 );
          cursor: pointer;
          flex-basis: 0;
          flex-grow: 1;
          font-family: 'IBM Plex Sans', sans-serif;          
          font-size: 14px;
          font-weight: var( --drawer-item-font-weight, 600 );
          margin: 0;
          padding: 0;
          text-align: left;
          text-rendering: optimizeLegibility;
        }

        :host( [selected] ) button {
          background-color: #4c4c4c;
          border-left: solid 4px #0f62fe;          
        }

        ::slotted( adc-icon ) {
          margin: 0 12px 0 12px;
          --icon-color: #f4f4f4;
          --icon-cursor: pointer;
        }

        ::slotted( adc-label ) {
          padding: 0 16px 0 16px;
          --label-color: #f4f4f4;
          --label-cursor: pointer;
        }
      </style>
      <button part="button" type="button">
        <slot name="prefix"></slot>
        <p part="label">
          <slot></slot>
        </p>
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
    this.$label = this.shadowRoot.querySelector( 'p' );
  }

   // When attributes change
  _render() {
    if( this.label !== null )
      this.$label.innerText = this.label;
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
    this._upgrade( 'hidden' );    
    this._upgrade( 'label' );    
    this._upgrade( 'selected' );        
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'hidden',
      'label',
      'selected'
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
}

window.customElements.define( 'adc-drawer-item', AvocadoDrawerItem );
