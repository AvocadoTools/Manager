import AvocadoHBox from "../../../containers/hbox.js";

import AvocadoDatePicker from "../../../controls/date-picker.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoLabel from "../../../controls/label.js";
import AvocadoLink from "../../../controls/link.js";
import AvocadoSelect from "../../../controls/select.js";

import AvocadoNotes from "../../../comp/notes.js";

export default class RemotePersonProfile extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-basis: 0;
          flex-direction: column;
          flex-grow: 1;
          padding: 16px;
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

        adc-date-picker,
        adc-input,
        adc-select,
        adc-textarea {
          flex-basis: 0;
          flex-grow: 1;
        }
      </style>
      <adc-hbox>
        <adc-date-picker
          id="start"
          label="Hire date"
          light
          placeholder="Hire date">
          <adc-label></adc-label>
        </adc-date-picker>
        <adc-date-picker
          id="pto"
          label="Last time off"
          light
          placeholder="Last time off">
          <adc-label></adc-label>
        </adc-date-picker>        
        <adc-date-picker
          id="birth"
          label="Birth date"
          light
          placeholder="Birth date">
          <adc-link></adc-link>
        </adc-date-picker>                
      </adc-hbox>
      <adc-hbox>
        <adc-input
          id="level"
          label="Job level"
          light
          placeholder="Job level">
        </adc-input>
        <adc-date-picker
          id="promotion"
          label="Last promotion"
          light
          placeholder="Last promotion">
          <adc-label></adc-label>
        </adc-date-picker>
        <adc-input
          id="internal"
          label="Internal ID"
          light
          placeholder="Internal ID">
        </adc-input>        
      </adc-hbox>
      <!--
      <adc-hbox>
        <adc-input
          id="spouse"
          label="Spouse/Partner"
          light
          placeholder="Spouse/Partner">
        </adc-input>
        <adc-date-picker
          id="anniversary"
          label="Anniversary date"
          light
          placeholder="Anniversary date">
          <adc-label></adc-label>
        </adc-date-picker>
        <adc-input
          id="family"
          label="Family"
          light
          placeholder="Family">
        </adc-input>        
      </adc-hbox>
      -->
      <adc-notes 
        label="Notes" 
        light 
        monospace 
        placeholder="Notes">
      </adc-notes>
    `;

    // Private
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    /*
    this.$anniversary = this.shadowRoot.querySelector( '#anniversary' );
    this.$anniversary.formatFunction = this.format;
    this.$anniversary.addEventListener( 'change', ( evt ) => {
      this.$union.concealed = false;
      this.$union.text = this.distance( evt.detail );
    } );    
    */
    this.$birth = this.shadowRoot.querySelector( '#birth' );
    this.$birth.formatFunction = this.format;
    this.$birth.addEventListener( 'change', ( evt ) => {
      this.$zodiac.concealed = false;
      this.$zodiac.label = this.zodiac( evt.detail );
    } );
    // this.$family = this.shadowRoot.querySelector( '#family' );        
    this.$internal = this.shadowRoot.querySelector( '#internal' );
    this.$employed = this.shadowRoot.querySelector( '#start adc-label' );
    this.$last = this.shadowRoot.querySelector( '#pto adc-label' );
    this.$notes = this.shadowRoot.querySelector( 'adc-notes' );
    this.$promotion = this.shadowRoot.querySelector( '#promotion' );
    this.$promotion.formatFunction = this.format;
    this.$promotion.addEventListener( 'change', ( evt ) => {
      // this.$union.concealed = false;
      // this.$union.text = this.distance( evt.detail );
    } );       
    this.$pto = this.shadowRoot.querySelector( '#pto' );    
    this.$pto.formatFunction = this.format;
    this.$pto.addEventListener( 'change', ( evt ) => {
      this.$last.concealed = false;
      this.$last.text = this.distance( evt.detail );
    } );
    // this.$spouse = this.shadowRoot.querySelector( '#spouse' );    
    this.$level = this.shadowRoot.querySelector( '#level' );        
    this.$role = this.shadowRoot.querySelector( '#promotion adc-label' );
    this.$start = this.shadowRoot.querySelector( '#start' );
    this.$start.formatFunction = this.format;
    this.$start.addEventListener( 'change', ( evt ) => {
      this.$employed.concealed = false;
      this.$employed.text = this.distance( evt.detail );
    } );
    this.$union = this.shadowRoot.querySelector( '#anniversary adc-label' );    
    this.$zodiac = this.shadowRoot.querySelector( '#birth adc-link' );
  }

  distance( value ) {
    const formatter = new Intl.RelativeTimeFormat( navigator.language, {
      style: 'short'
    } );
    let distance = ( value - Date.now() ) / 31556736000;
    let unit = 'year'    
    
    if( distance > -1 ) {
      unit = 'month'
      distance = ( value - Date.now() ) / 2629800000;      

      if( distance > -1 ) {
        unit = 'day'
        distance = ( value - Date.now() ) / 86400000;              
      }
    }    

    return formatter.format( Math.round( distance ), unit );
  }

  format( value ) {
    const formatted = new Intl.DateTimeFormat( navigator.language, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    } ).format( value );    
    return formatted;
  }

  zodiac( value ) {
    const day = value.getDate();
    const last = [
      '', 19, 18, 20, 
      20, 21, 21, 22, 
      22, 21, 22, 21, 
      20, 19
    ];      
    const month = value.getMonth();
    const labels = [
      '',            'Capricorn', 'Aquarius', 'Pisces', 
      'Aries',       'Taurus',    'Gemini',   'Cancer', 
      'Leo',         'Virgo',     'Libra',    'Scorpio', 
      'Sagittarius', 'Capricorn'
    ];
    const link = {
      'Aries': 1,
      'Taurus': 2,
      'Gemini': 3,
      'Cancer': 4,
      'Leo': 5,
      'Virgo': 6,
      'Libra': 7,
      'Scorpio': 8,
      'Sagittarius': 9,
      'Capricorn': 10,
      'Aquarius': 11,
      'Pisces': 12
    };

    const sign = ( day > last[month] ) ? labels[month * 1 + 1] : labels[month];
  
    this.$zodiac.href = `https://www.horoscope.com/us/horoscopes/general/horoscope-general-daily-today.aspx?sign=${link[sign]}`;

    const formatter = new Intl.RelativeTimeFormat( navigator.language, {
      style: 'short'
    } );
    let distance = Math.round( ( value - Date.now() ) / 31556736000 );
    let unit = 'year'    

    return formatter.format( distance, unit ) + ', ' + sign;    
  }

   // When attributes change
  _render() {
    this.$start.readOnly = this.readOnly;
    this.$pto.readOnly = this.readOnly;        
    this.$birth.readOnly = this.readOnly;
    // this.$spouse.readOnly = this.readOnly;    
    // this.$anniversary.readOnly = this.readOnly;
    // this.$family.readOnly = this.readOnly;
    this.$level.readOnly = this.readOnly;
    this.$promotion.readOnly = this.readOnly;
    this.$internal.readOnly = this.readOnly;
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
    this._upgrade( 'disabled' );
    this._upgrade( 'helper' );
    this._upgrade( 'hidden' );
    this._upgrade( 'icon' );
    this._upgrade( 'label' );
    this._upgrade( 'readOnly' );
    this._upgrade( 'value' );    
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'disabled',
      'helper',
      'hidden',
      'icon',
      'label',
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
      startAt: this.$start.value === null ? null : this.$start.value.getTime(),
      ptoAt: this.$pto.value === null ? null : this.$pto.value.getTime(),
      bornAt: this.$birth.value === null ? null : this.$birth.value.getTime(),
      level: this.$level.value,
      promotionAt: this.$promotion.value === null ? null : this.$promotion.value.getTime(),
      internal: this.$internal.value,
      notes: this.$notes.value
    };
  }

  set value( data ) {
    if( data === null ) {
      this.$start.value = null;
      this.$employed.concealed = true;
      this.$pto.value = null;
      this.$last.concealed = true;
      this.$birth.value = null;
      this.$zodiac.concealed = true;
      this.$level.value = null;
      this.$promotion.value = null;
      this.$role.concealed = true;
      // this.$union.concealed = true;
      this.$internal.value = null;
      this.$notes.value = null;
    } else {
      this.$start.value = data.startAt === null ? null : new Date( data.startAt );
      this.$employed.concealed = data.startAt === null ? true : false;
      this.$employed.text = data.startAt === null ? null : this.distance( new Date( data.startAt ) );
      this.$pto.value = data.ptoAt === null ? null : new Date( data.ptoAt );
      this.$last.concealed = data.ptoAt === null ? true : false;      
      this.$last.text = data.ptoAt === null ? null : this.distance( new Date( data.ptoAt ) );
      this.$birth.value = data.bornAt === null ? null : new Date( data.bornAt );
      this.$zodiac.concealed = data.bornAt === null ? true : false;
      this.$zodiac.label = data.bornAt === null ? null : this.zodiac( new Date( data.bornAt ) );
      this.$level.value = data.level;
      this.$promotion.value = data.promotionAt === null ? null : new Date( data.promotionAt );
      this.$role.concealed = data.promotionAt === null ? true : false;
      this.$role.text = data.promotionAt === null ? null : this.distance( new Date( data.promotionAt ) );      
      // this.$union.concealed = data.anniversaryAt === null ? true : false;
      // this.$union.text = data.anniversaryAt === null ? null : this.distance( new Date( data.anniversaryAt ) );
      this.$internal.value = data.internal;
      this.$notes.value = data.notes;
    }
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

  get icon() {
    if( this.hasAttribute( 'icon' ) ) {
      return this.getAttribute( 'icon' );
    }

    return null;
  }

  set icon( value ) {
    if( value !== null ) {
      this.setAttribute( 'icon', value );
    } else {
      this.removeAttribute( 'icon' );
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
