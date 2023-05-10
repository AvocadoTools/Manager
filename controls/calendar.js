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
          left: -300px;
          opacity: 0;
          padding: 4px 4px 8px 4px;
          position: absolute;
          top: -300;
          transform: translate( 0, 24px );
          transition:
            opacity 300ms ease-in-out,
            transform 300ms ease-in-out;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        :host( [opened] ) {
          opacity: 1.0;
          transform: translate( 0, -24px );
        }

        button {
          background: none;
          border: none;
          box-sizing: border-box;
          color: #161616;
          cursor: pointer;
          font-style: normal;
          font-weight: normal;
          height: 40px;
          margin: 0;
          padding: 0;
          position: relative;
          text-rendering: optimizeLegibility;
          width: 40px;
          -webkit-tap-highlight-color: transparent;
        }

        button:not( .selected ):hover {
          background-color: #e8e8e8;
        }

        button.icon {
          color: #525252;
          direction: ltr;
          font-family: 'Material Symbols Outlined';
          font-size: 18px;
          height: 40px;
          letter-spacing: normal;
          min-height: 40px;
          min-width: 40px;
          text-transform: none;
          white-space: nowrap;
          width: 40px;
          word-wrap: normal;
        }

        button[part=page] {
          flex-basis: 0;
          flex-grow: 1;
          font-weight: 600;
          margin: 0 4px 0 4px;
        }

        div {
          align-items: center;
          display: flex;
          flex-direction: row;
        }

        div > div {
          align-items: center;
          display: flex;
          flex-basis: 0;
          flex-grow: 1;
          gap: 4px;
          justify-content: center;
        }

        div > div p {
          font-weight: 600;
        }

        div[part=calendar] {
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
          -webkit-tap-highlight-color: transparent;
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

        p {
          box-sizing: border-box;
          color: #161616;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          margin: 0;
          padding: 0;
          text-rendering: optimizeLegibility;          
        }

        p.square {
          cursor: default;
          height: 40px;
          line-height: 40px;
          min-height: 40px;
          min-width: 40px;
          text-align: center;
          width: 40px;
        }

        .outside {
          color: var( --calendar-outside-color, #6f6f6f );
        }

        .selected {
          background-color: var( --calendar-selected-color, #0f62fe );
          color: #ffffff;
        }

        .today {
          color: var( --calendar-today-color, #0f62fe );
          font-weight: 600;
        }

        .today::after {
          background-color: var( --calendar-today-color, #0f62fe );
          bottom: 6px;
          content: ' ';
          height: 4px;
          position: absolute;
          left: calc( 50% - 2px );
          width: 4px;
        }

        .selected.today {
          background-color: var( --calendar-selected-color, #0f62fe );
          color: #ffffff;
          font-weight: 600;
        }

        .selected.today::after {
          background-color: #ffffff;
        }

        .weekend,
        :host( [weekends] ) div[part=days] p:first-of-type,
        :host( [weekends] ) div[part=days] p:last-of-type {
          color: var( --calendar-weekend-color, #da1e28 );
        }
      </style>
      <div>
        <button class="icon" part="left">chevron_left</button>
        <div>
          <p part="month"></p>
          <input min="0" part="year" step="1" type="number">
        </div>
        <button class="icon" part="right">chevron_right</button>
      </div>
      <div part="days">
        <p class="square">S</p>
        <p class="square">M</p>
        <p class="square">T</p>
        <p class="square">W</p>
        <p class="square">Th</p>
        <p class="square">F</p>
        <p class="square">S</p>
      </div>
      <div part="calendar"></div>
    `;

    // Private
    this._data = null;
    this._displayed = null;
    this._selected = null;
    this._touch = ( 'ontouchstart' in document.documentElement ) ? 'touchstart' : 'click';        

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$calendar = this.shadowRoot.querySelector( 'div[part=calendar]' );
    this.$left = this.shadowRoot.querySelector( 'button[part=left]' );
    this.$left.addEventListener( this._touch, () => this.doLeftClick() );
    this.$month = this.shadowRoot.querySelector( 'p[part=month]' );
    this.$right = this.shadowRoot.querySelector( 'button[part=right]' );
    this.$right.addEventListener( this._touch, () => this.doRightClick() );
    this.$year = this.shadowRoot.querySelector( 'input' );
    this.$year.addEventListener( 'change', () => {
      this._displayed.setFullYear( this.$year.value );
      this._render();
    } );
  }

  doDateClick( evt ) {
    const selected = new Date(
      parseInt( evt.currentTarget.getAttribute( 'data-year' ) ),
      parseInt( evt.currentTarget.getAttribute( 'data-month' ) ),
      parseInt( evt.currentTarget.getAttribute( 'data-date' ) )
    );

    this.selected = selected;
    this.dispatchEvent( new CustomEvent( 'change', {
      detail: new Date( selected.getTime() )
    } ) );
  }

  doLeftClick() {
    let month = this._displayed.getMonth();
    let year = this._displayed.getFullYear();

    year = ( month === 0 ) ? year - 1 : year;
    month = ( month === 0 ) ? 11 : month - 1;

    this._displayed = new Date(
      year,
      month,
      this._displayed.getDate()
    );
    this._render();

    this.dispatchEvent( new CustomEvent( 'previous', {
      detail: new Date( this._displayed.getTime() )
    } ) );
  }

  doRightClick() {
    let month = this._displayed.getMonth();
    let year = this._displayed.getFullYear();

    year = ( month === 11 ) ? year + 1 : year;
    month = ( month + 1 ) % 12;

    this._displayed = new Date(
      year,
      month,
      this._displayed.getDate()
    );
    this._render();

    this.dispatchEvent( new CustomEvent( 'next', {
      detail: new Date( this._displayed.getTime() )
    } ) );
  }

  hide() {
    this.opened = false;

    setTimeout( () => {
      this.style.left = `${0 - this.clientWidth}px`;
      this.style.top = `${0 - this.clientHeight}px`;
      this._owner = null;
    }, 300 );
  }

  show( owner ) {
    this._owner = owner;

    if( this._displayed === null )
      this._displayed = new Date();

    const rect = owner.getBoundingClientRect();
    this.style.left = `${rect.left}px`;
    this.style.top = `${rect.bottom + 4}px`;

    this.opened = true;
  }

  // When attributes change
  _render() {
    while( this.$calendar.children.length < 42 ) {
      const date = document.createElement( 'button' );
      date.addEventListener( 'click', ( evt ) => this.doDateClick( evt ) );
      this.$calendar.appendChild( date );
    }

    const displayed = this._displayed === null ? new Date() : new Date( this._displayed );
    const selected = this._selected === null ? null : new Date( this._selected );
    const today = new Date();

    const formatted = new Intl.DateTimeFormat( navigator.language, {
      month: 'long'
    } ).format( displayed );    
    this.$month.innerText = formatted;
    this.$year.value = displayed.getFullYear();

    // Calendar used in iteration
    const calendar = new Date(
      displayed.getFullYear(),
      displayed.getMonth(),
      1
    );

    // First day of month may not be first day of week
    // Roll back until first day of week
    calendar.setDate( calendar.getDate() - calendar.getDay() );

    for( let d = 0; d < 42; d++ ) {
      // Date
      this.$calendar.children[d].innerText = calendar.getDate();
      this.$calendar.children[d].setAttribute( 'data-year', calendar.getFullYear() );
      this.$calendar.children[d].setAttribute( 'data-month', calendar.getMonth() );
      this.$calendar.children[d].setAttribute( 'data-date', calendar.getDate() );

      if( this.weekends ) {
        if( calendar.getDay() === 0 || calendar.getDay() === 6 ) {
          this.$calendar.children[d].classList.add( 'weekend' );
        } else {
          this.$calendar.children[d].classList.remove( 'weekend' );
        }
      }

      if(
        calendar.getFullYear() === displayed.getFullYear() &&
        calendar.getMonth() === displayed.getMonth()
      ) {
        this.$calendar.children[d].classList.remove( 'outside' );
      } else {
        this.$calendar.children[d].classList.add( 'outside' );
      }

      // Check for today
      if( this.today ) {
        if(
          calendar.getFullYear() === today.getFullYear() &&
          calendar.getMonth() === today.getMonth() &&
          calendar.getDate() === today.getDate()
        ) {
          this.$calendar.children[d].classList.add( 'today' );
        } else {
          this.$calendar.children[d].classList.remove( 'today' );
        }
      }

      // Check for selection
      if( selected === null ) {
        this.$calendar.children[d].classList.remove( 'selected' );
      } else {
        if(
          calendar.getFullYear() === selected.getFullYear() &&
          calendar.getMonth() === selected.getMonth() &&
          calendar.getDate() === selected.getDate() &&
          calendar.getMonth() === selected.getMonth()
        ) {
          this.$calendar.children[d].classList.add( 'selected' );
        } else {
          this.$calendar.children[d].classList.remove( 'selected' );
        }
      }

      // Keep rolling
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
    this._upgrade( 'data' );
    this._upgrade( 'displayed' );
    this._upgrade( 'hidden' );
    this._upgrade( 'opened' );
    this._upgrade( 'selected' );
    this._upgrade( 'today' );
    this._upgrade( 'value' );
    this._upgrade( 'weekends' );
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'hidden',
      'opened',
      'today'
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

  get displayed() {
    return this._displayed;
  }

  set displayed( date ) {
    this._displayed = date === null ? null : new Date( date.getTime() );
    this._render();
  }

  get selected() {
    return this._selected;
  }

  set selected( date ) {
    this._selected = date === null ? null : new Date( date.getTime() );
    this._render();
  }

  get value() {
    return this._selected;
  }

  set value( date ) {
    this._displayed = date === null ? null : new Date( date.getTime() );
    this._selected = date === null ? null : new Date( date.getTime() );
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

  get today() {
    return this.hasAttribute( 'today' );
  }

  set today( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'today' );
      } else {
        this.setAttribute( 'today', '' );
      }
    } else {
      this.removeAttribute( 'today' );
    }
  }

  get weekends() {
    return this.hasAttribute( 'weekends' );
  }

  set weekends( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'weekends' );
      } else {
        this.setAttribute( 'weekends', '' );
      }
    } else {
      this.removeAttribute( 'weekends' );
    }
  }
}

window.customElements.define( 'adc-calendar', AvocadoCalendar );
