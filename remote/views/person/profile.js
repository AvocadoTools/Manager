import AvocadoHBox from "../../../containers/hbox.js";

import AvocadoInput from "../../../controls/input.js";
import AvocadoTextarea from "../../../controls/textarea.js";

export default class RemotePersonProfile extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          background-color: #f4f4f4;
          box-sizing: border-box;
          display: flex;
          flex-basis: 0;
          flex-direction: column;
          flex-grow: 1;
          padding: 16px 16px 0 16px;
          position: relative;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }      

        adc-hbox {
          gap: 16px;
        }

        adc-hbox > *  {
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-textarea {
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-textarea::part( input ) {
          font-family: 'IBM Plex Mono';
        }
      </style>
      <adc-hbox>      
        <adc-input id="hire" label="Hire date" light placeholder="Hire date">
          <adc-label text="7 months"></adc-label>
        </adc-input>
        <adc-input id="last" label="Last time off" light placeholder="Last time off">
          <adc-label text="7 months"></adc-label>
        </adc-input>        
        <adc-input id="birth" label="Birth date" light placeholder="Birth date">
          <adc-label text="7 months"></adc-label>
        </adc-input>
      </adc-hbox>
      <adc-hbox>      
        <adc-input id="partner" label="Spouse/partner" light placeholder="Spouse/partner"></adc-input>
        <adc-input id="anniversary" label="Anniversary date" light placeholder="Anniversary date">
          <adc-label text="7 months"></adc-label>
        </adc-input>        
        <adc-input id="family" label="Family" light placeholder="Family"></adc-input>
      </adc-hbox>      
      <adc-textarea id="notes" label="Notes" light placeholder="Notes"></adc-textarea>
    `;

    // Private
    this._data = null;    

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$hire = this.shadowRoot.querySelector( '#hire' );
    this.$last = this.shadowRoot.querySelector( '#last' );    
    this.$birth = this.shadowRoot.querySelector( '#birth' );    
    this.$partner = this.shadowRoot.querySelector( '#partner' );    
    this.$anniversary = this.shadowRoot.querySelector( '#anniversary' );
    this.$family = this.shadowRoot.querySelector( '#family' );    
    this.$notes = this.shadowRoot.querySelector( '#notes' );        
  }

  // When attributes change
  _render() {
    this.$hire.readOnly = this.readOnly;
    this.$last.readOnly = this.readOnly;
    this.$birth.readOnly = this.readOnly;
    this.$partner.readOnly = this.readOnly;
    this.$anniversary.readOnly = this.readOnly;
    this.$family.readOnly = this.readOnly;
    this.$notes.readOnly = this.readOnly;
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
    this._upgrade( 'readOnly' );            
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',    
      'hidden',
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

window.customElements.define( 'arm-person-profile', RemotePersonProfile );
