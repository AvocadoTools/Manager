import AvocadoHBox from "../../../containers/hbox.js";

import AvocadoDatePicker from "../../../controls/date-picker.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoLabel from "../../../controls/label.js";
import AvocadoLink from "../../../controls/link.js";

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
      <adc-notes 
        label="Notes" 
        light 
        monospace 
        placeholder="Notes">
      </adc-notes>
    `;

    // Private
    this._anniversary = null;
    this._astrology = null;
    this._birth = null;
    this._data = null;
    this._notes = null;
    this._pto = null;
    this._start = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$anniversary = this.shadowRoot.querySelector( '#anniversary' );
    this.$anniversary.formatFunction = this.format;
    this.$anniversary.addEventListener( 'change', ( evt ) => {
      this.$union.text = formatDistanceToNow( evt.detail, {unit: 'year'} );
    } );    
    this.$birth = this.shadowRoot.querySelector( '#birth' );
    this.$birth.formatFunction = this.format;
    this.$birth.addEventListener( 'change', ( evt ) => {
      // this.$zodiac.href = `https://www.horoscope.com/us/horoscopes/general/horoscope-general-daily-today.aspx?sign=${link}`;
      this.$zodiac.label = this.zodiac( evt.detail );
    } );
    this.$family = this.shadowRoot.querySelector( '#family' );        
    this.$employed = this.shadowRoot.querySelector( '#start adc-label' );
    this.$last = this.shadowRoot.querySelector( '#pto adc-label' );
    this.$notes = this.shadowRoot.querySelector( 'adc-notes' );
    this.$pto = this.shadowRoot.querySelector( '#pto' );    
    this.$pto.formatFunction = this.format;
    this.$pto.addEventListener( 'change', ( evt ) => {
      this.$last.text = formatDistanceToNow( evt.detail );
    } );
    this.$spouse = this.shadowRoot.querySelector( '#spouse' );    
    this.$start = this.shadowRoot.querySelector( '#start' );
    this.$start.formatFunction = this.format;
    this.$start.addEventListener( 'change', ( evt ) => {
      console.log( evt );
      const formatter = new Intl.RelativeTimeFormat( navigator.language, {
        style: 'short'
      } );
      
      this.$employed.text = formatter.format( 1, 'month' );
    } );
    this.$spouse = this.shadowRoot.querySelector( '#spouse' );
    this.$union = this.shadowRoot.querySelector( '#anniversary adc-label' );    
    this.$zodiac = this.shadowRoot.querySelector( '#birth adc-link' );
  }

  clear() {
    this.start = null;
    this.pto = null;
    this.birth = null;
    this.spouse = null;
    this.anniversary = null;
    this.family = null;
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

  doNotesChange() {
    this.$preview.concealed = this.$notes.value === null ? true : false;
  }

   // When attributes change
  _render() {
    this.$anniversary.readOnly = this.readOnly;
    this.$birth.readOnly = this.readOnly;
    this.$family.readOnly = this.readOnly;
    this.$notes.readOnly = this.readOnly;
    this.$pto.readOnly = this.readOnly;    
    this.$spouse.readOnly = this.readOnly;
    this.$start.readOnly = this.readOnly;
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
    this._upgrade( 'anniversary' );
    this._upgrade( 'birth' );
    this._upgrade( 'data' );
    this._upgrade( 'disabled' );
    this._upgrade( 'family' );    
    this._upgrade( 'helper' );
    this._upgrade( 'hidden' );
    this._upgrade( 'icon' );
    this._upgrade( 'label' );
    this._upgrade( 'notes' );    
    this._upgrade( 'pto' );    
    this._upgrade( 'readOnly' );
    this._upgrade( 'spouse' );
    this._upgrade( 'start' );
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
  get anniversary() {
    return this.$anniversary.value;
  }

  set anniversary( value ) {
    this.$anniversary.value = value;
    this.$union.concealed = value === null ? true : false;
    this.$union.text = this.distance( value );
  }

  get birth() {
    return this.$birth.value;
  }

  set birth( value ) {
    this.$birth.value = value;
    this.$zodiac.concealed = value === null ? true : false;
    this.$zodiac.label = value === null ? '' : this.zodiac( new Date( value ) );                
  }

  get data() {
    return this._data;
  }

  set data( value ) {
    this._data = value;
  }

  get family() {
    return this.$family.value;
  }

  set family( value ) {
    this.$family.value = value;
  }  

  get notes() {
    return this.$notes.value;
  }

  set notes( value ) {
    this.$notes.value = value;
  }    

  get pto() {
    return this.$pto.value;
  }

  set pto( value ) {
    this.$pto.value = value;
    this.$last.concealed = value === null ? true : false;
    this.$last.text = this.distance( value );
  }

  get spouse() {
    return this.$spouse.value;
  }

  set spouse( value ) {
    this.$spouse.value = value;
  }

  get start() {
    return this.$start.value;
  }

  set start( value ) {    
    this.$start.value = value;
    this.$employed.concealed = value === null ? true : false;
    this.$employed.text = this.distance( value );    
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
