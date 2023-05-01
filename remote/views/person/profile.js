import AvocadoHBox from "../../../containers/hbox.js";

import AvocadoDatePicker from "../../../controls/date-picker.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoTextArea from "../../../controls/text-area.js";

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
          overflow: hidden;
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

        adc-text-area {
          flex-basis: 0;
          flex-grow: 1;
          padding-bottom: 4px;
        }

        adc-text-area::part( input ) {
          font-family: 'IBM Plex Mono';
        }
      </style>
      <adc-hbox>      
        <adc-date-picker id="start" label="Hire date" light placeholder="Hire date">
          <adc-label hidden text="7 months"></adc-label>        
        </adc-date-picker>
        <adc-date-picker id="pto" label="Last time off" light placeholder="Last time off">
          <adc-label hidden text="7 months"></adc-label>
        </adc-date-picker>        
        <adc-date-picker id="born" label="Birth date" light placeholder="Birth date">
          <adc-label hidden text="7 months"></adc-label>        
        </adc-date-picker>
      </adc-hbox>
      <adc-hbox>      
        <adc-input id="partner" label="Spouse/partner" light placeholder="Spouse/partner"></adc-input>
        <adc-date-picker id="anniversary" label="Anniversary date" light placeholder="Anniversary date">
          <adc-label hidden text="7 months"></adc-label>
        </adc-date-picker>        
        <adc-input id="family" label="Family" light placeholder="Family"></adc-input>
      </adc-hbox>      
      <adc-text-area id="notes" label="Notes" light placeholder="Notes">
        <adc-label hidden text="Show preview"></adc-label>
      </adc-text-area>
    `;

    // Private
    this._data = null;    

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$start = this.shadowRoot.querySelector( '#start' );
    this.$start.addEventListener( 'clear', () => this.$employed.hidden = true );
    this.$start.addEventListener( 'change', ( evt ) => {
      this.$employed.hidden = evt.detail === null ? true : false;
    } );
    this.$employed = this.shadowRoot.querySelector( '#start adc-label' );
    this.$pto = this.shadowRoot.querySelector( '#pto' );
    this.$pto.addEventListener( 'clear', () => this.$vacation.hidden = true );
    this.$pto.addEventListener( 'change', ( evt ) => {
      this.$vacation.hidden = evt.detail === null ? true : false;
    } );    
    this.$vacation = this.shadowRoot.querySelector( '#pto adc-label' );
    this.$born = this.shadowRoot.querySelector( '#born' );    
    this.$born.addEventListener( 'clear', () => this.$age.hidden = true );
    this.$born.addEventListener( 'change', ( evt ) => {
      this.$age.hidden = evt.detail === null ? true : false;
    } );        
    this.$age = this.shadowRoot.querySelector( '#born adc-label' );
    this.$partner = this.shadowRoot.querySelector( '#partner' );    
    this.$anniversary = this.shadowRoot.querySelector( '#anniversary' );
    this.$anniversary.addEventListener( 'clear', () => this.$together.hidden = true );
    this.$anniversary.addEventListener( 'change', ( evt ) => {
      this.$together.hidden = evt.detail === null ? true : false;
    } );            
    this.$together = this.shadowRoot.querySelector( '#anniversary adc-label' );
    this.$family = this.shadowRoot.querySelector( '#family' );    
    this.$notes = this.shadowRoot.querySelector( '#notes' );        
  }

  // When attributes change
  _render() {
    this.$start.readOnly = this.readOnly;
    this.$pto.readOnly = this.readOnly;
    this.$born.readOnly = this.readOnly;
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
    this._upgrade( 'value' );                
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

  get value() {
    return {
      startAt: this.$start.value,
      ptoAt: this.$pto.value,
      bornAt: this.$born.value,
      partner: this.$partner.value,
      anniversaryAt: null,
      family: this.$family.value,
      notes: this.$notes.value
    };
  }

  set value( data ) {
    this.$start.value = data.startAt;
    this.$employed.hidden = data.startAt === null ? true : false;
    this.$pto.value = data.ptoAt;
    this.$vacation.hidden = data.ptoAt === null ? true : false;    
    this.$born.value = data.bornAt;
    this.$age.hidden = data.bornAt === null ? true : false;    
    this.$partner.value = data.partner;
    this.$anniversary.value = data.anniversaryAt;
    this.$together.hidden = data.anniversaryAt === null ? true : false;    
    this.$family.value = data.family;
    this.$notes.value = data.notes;
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
