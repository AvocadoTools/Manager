import AvocadoHBox from "../containers/hbox.js";

export default class AvocadoHeader extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          background-color: var( --header-background-color, #161616 );
          box-sizing: border-box;
          display: grid;
          grid-template-columns: repeat( 3, 1fr );
          grid-template-rows: 1fr;
          grid-column-gap: 0px;
          grid-row-gap: 0px;
          padding: 0 4px 0 4px;
          position: relative;          
        }

        adc-hbox {
          align-items: center;
        }

        adc-hbox:nth-of-type( 1 ) {
          grid-area: 1 / 1 / 2 / 2;
        }

        adc-hbox:nth-of-type( 2 ) {
          grid-area: 1 / 2 / 2 / 3;
          justify-content: center;
        }
        
        adc-hbox:nth-of-type( 3 ) {
          grid-area: 1 / 3 / 2 / 4;
          justify-content: flex-end;
        }        
        
        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        ::slotted( adc-label ) {
          --label-color: #ffffff;
        }
      </style>
      <adc-hbox part="left">
        <slot name="left"></slot>
      </adc-hbox>
      <adc-hbox part="center">
        <slot name="center"></slot>
      </adc-hbox>
      <adc-hbox part="right">
        <slot name="right"></slot>
      </adc-hbox>            
    `;

    // Private
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );
  }

  // When attributes change
  _render() {;}

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
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'hidden'
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
}

window.customElements.define( 'adc-header', AvocadoHeader );
