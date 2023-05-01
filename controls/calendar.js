import AvocadoHBox from "../containers/hbox.js";

import AvocadoIconButton from "./icon-button.js";
import AvocadoLabel from "./label.js";

export default class AvocadoCalendar extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          background-color: #ffffff;
          box-shadow: rgba( 0, 0, 0, 0.30 ) 0px 2px 6px 0px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          opacity: 1.0;
          padding: 4px 4px 8px 4px;
          z-index: 100;
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
          color: #161616;
          cursor: pointer;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          height: 40px;
          margin: 0;
          padding: 0;
          position: relative;
          text-rendering: optimizeLegibility;
          width: 40px;
        }

        button:not( .selected ):hover {
          background-color: #e8e8e8;
        }

        adc-hbox {
          align-items: center;
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-hbox[part=header] {
          justify-content: center;
        }

        adc-hbox > adc-hbox {
          gap: 4px;
          justify-content: center;
        }

        adc-hbox[part=days] adc-label::part( label ) {
          height: 40px;
          line-height: 40px;
          min-width: 40px;
          text-align: center;
          width: 40px;
        }

        adc-icon-button {
          --icon-button-size: 40px;
        }

        adc-label[part=display] {
          --label-font-weight: 600;
        }

        div[part=month] {
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
          grid-template-rows: repeat( auto-fill, 1fr );
          gap: 0px 0px;
          position: relative;
        }

        input {
          appearance: textfield;
          background: none;
          border: none;
          box-sizing: border-box;
          font-weight: 600;
          height: 40px;
          margin: 0;
          outline: solid 2px transparent;
          outline-offset: -2px;          
          padding: 0 0 0 4px;
          width: 4em;
          -moz-appearance: textfield;
          -webkit-appearance: textfield;
        }

        input:hover {
          background-color: #e8e8e8;
          cursor: pointer;
        }

        input:focus {
          background-color: #e8e8e8;          
          cursor: text;
          outline: solid 2px #0f62fe;          
        }

        .outside {
          color: #6f6f6f;
        }

        .selected {
          background-color: #0f62fe;
          color: #ffffff;
        }

        .today {
          color: #0f62fe;
          font-weight: 600;
        }

        .today::after {
          background-color: #0f62fe;
          bottom: 6px;
          content: ' ';
          height: 4px;
          position: absolute;
          left: calc( 50% - 2px );
          width: 4px;
        }

        .selected.today {
          background-color: #0f62fe;
          color: #ffffff;
          font-weight: 600;
        }

        .selected.today::after {
          background-color: #ffffff;
        }
      </style>
      <adc-hbox part="header">
        <adc-icon-button name="chevron_left" part="before"></adc-icon-button>
        <adc-hbox>
          <adc-label part="display"></adc-label>
          <input min="0" part="year" step="1" type="number" />
        </adc-hbox>
        <adc-icon-button name="chevron_right" part="next"></adc-icon-button>        
      </adc-hbox>
      <adc-hbox part="days">
        <adc-label text="S"></adc-label>
        <adc-label text="M"></adc-label>
        <adc-label text="T"></adc-label>
        <adc-label text="W"></adc-label>
        <adc-label text="Th"></adc-label>
        <adc-label text="F"></adc-label>
        <adc-label text="S"></adc-label>                                                
      </adc-hbox>
      <div part="month"></div>
    `;

    // Private
    this._display = new Date();
    this._height = 0;
    this._value = null;    

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$grid = this.shadowRoot.querySelector( 'div[part=month]' );
    this.$display = this.shadowRoot.querySelector( 'adc-label[part=display]' );
    this.$before = this.shadowRoot.querySelector( 'adc-icon-button[part=before]' );
    this.$before.addEventListener( 'click', () => {
      let month = this._display.getMonth();
      let year = this._display.getFullYear();

      // Adjust
      // Watch for edges of the year
      year = ( month === 0 ) ? year - 1 : year;
      month = ( month === 0 ) ? 11 : month - 1;

      this.display = new Date( year, month, this._display.getDate() );
    } );
    this.$input = this.shadowRoot.querySelector( 'input' );
    this.$input.addEventListener( 'change', () => {
      this._display.setFullYear( parseInt( this.$input.value ) );
      this._render();
    } ); 
    this.$next = this.shadowRoot.querySelector( 'adc-icon-button[part=next]' );
    this.$next.addEventListener( 'click', () => {
      let month = this._display.getMonth();
      let year = this._display.getFullYear();
  
      // Adjust
      // Watch for the edges of the year
      year = ( month === 11 ) ? year + 1 : year;
      month = ( month + 1 ) % 12;
  
      this.display = new Date( year, month, this._display.getDate() );
    } );    
  }

  doDateClick( evt ) {
    const date = parseInt( evt.currentTarget.getAttribute( 'data-date' ) );
    const month = parseInt( evt.currentTarget.getAttribute( 'data-month' ) );
    const year = parseInt( evt.currentTarget.getAttribute( 'data-year' ) );
    const value = this.value === null ? new Date() : new Date( this.value );

    const selected = new Date(
      year,
      month,
      date,
      value.getHours(),
      value.getMinutes()
    );

    this._display = new Date( selected.getTime() );
    this.value = new Date( selected.getTime() );

    this.dispatchEvent( new CustomEvent( 'change', {
      detail: this.value
    } ) );
  }

  hide( animate = false ) {
    if( animate ) {

    } else {
      this.style.opacity = 0;
      this.style.transform = 'translateY( 20px )';
    }

    this.opened = false;

    /*
    this.opened = false;

    setTimeout( () => {
      this.style.left = `${0 - this.clientWidth}px`;
      this.style.top = `${0 - this.clientHeight}px`;
      this._owner = null;
    }, 300 );
    */
  }

  show( animate = false ) {
    if( animate ) {

    } else {
      console.log( 'SHOW' );      
      this.style.opacity = 1.0;
      this.style.transform = 'translateY( 0 )';
    }

    this.opened = true;

    /*
    this._owner = owner;

    if( this._displayed === null )
      this._displayed = new Date();

    const rect = owner.getBoundingClientRect();
    this.style.left = `${rect.left}px`;
    this.style.top = `${rect.bottom}px`;

    this.opened = true;
    */
  }

  // When attributes change
  _render() {
    while( this.$grid.children.length < 42 ) {
      const button = document.createElement( 'button' );
      button.type = 'button';
      button.addEventListener( 'click', ( evt ) => this.doDateClick( evt ) );
      this.$grid.appendChild( button );
    }

    const value = this._value === null ? new Date() : new Date( this._value );
    const today = new Date();
    const calendar = new Date(
      this._display.getFullYear(),
      this._display.getMonth(),
      1
    );

    let month = new Intl.DateTimeFormat( navigator.language, {
      month: 'long'
    } ).format( calendar );
    let year = new Intl.DateTimeFormat( navigator.language, {
      year: 'numeric'
    } ).format( calendar );    
    this.$display.text = month;
    this.$input.value = year;

    calendar.setDate( calendar.getDate() - calendar.getDay() );

    for( let b = 0; b < 42; b++ ) {
      this.$grid.children[b].setAttribute( 'data-month', calendar.getMonth() );
      this.$grid.children[b].setAttribute( 'data-year', calendar.getFullYear() );

      if(
        calendar.getFullYear() === this._display.getFullYear() &&
        calendar.getMonth() === this._display.getMonth()
      ) {
        this.$grid.children[b].setAttribute( 'data-date', calendar.getDate() );
        this.$grid.children[b].innerText = calendar.getDate();
        this.$grid.children[b].classList.remove( 'outside' );
      } else {
        this.$grid.children[b].setAttribute( 'data-date', calendar.getDate() );
        this.$grid.children[b].innerText = calendar.getDate();
        this.$grid.children[b].classList.add( 'outside' );
      }

      if(
        calendar.getFullYear() === today.getFullYear() &&
        calendar.getMonth() === today.getMonth() &&
        calendar.getDate() === today.getDate()
      ) {
        this.$grid.children[b].classList.add( 'today' );
      } else {
        this.$grid.children[b].classList.remove( 'today' );
      }

      if(
        calendar.getFullYear() === value.getFullYear() &&
        calendar.getMonth() === value.getMonth() &&
        calendar.getDate() === value.getDate() &&
        calendar.getMonth() === value.getMonth()
      ) {
        this.$grid.children[b].classList.add( 'selected' );
      } else {
        this.$grid.children[b].classList.remove( 'selected' );
      }

      calendar.setDate( calendar.getDate() + 1 );
    }
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
    this._upgrade( 'display' );
    this._upgrade( 'hidden' );
    this._upgrade( 'opened' );    
    this._upgrade( 'value' );
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'hidden',
      'opened'
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

  get display() {
    return this._display;
  }

  set display( value ) {
    this._display = value === null ? new Date() : new Date( value.getTime() );
    this._render();
  }

  get value() {
    return this._value;
  }

  set value( date ) {
    this._value = date === null ? null : new Date( date.getTime() );
    this._render();
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

  get opened() {
    return this.hasAttribute( 'opened' );
  }

  set opened( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'opened' );
      } else {
        this.setAttribute( 'opened', '' );
      }
    } else {
      this.removeAttribute( 'opened' );
    }
  }  
}

window.customElements.define( 'adc-calendar', AvocadoCalendar );
