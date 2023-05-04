export default class AvocadoTab extends HTMLElement {
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
          background-color: #e0e0e0;
          border: none;
          border-left: solid 1px #8d8d8d;            
          box-sizing: border-box;
          cursor: var( --tab-cursor, pointer );
          display: flex;
          flex-direction: row;
          height: var( --tab-height, 48px );
          margin: 0;
          min-width: var( --tab-min-width, 145px );
          outline: none;
          padding: 0 16px 0 16px;
          transition: background-color 150ms ease-in-out;
        }

        button:hover {
          background-color: #cacaca;
        }

        button > p {
          color: var( --tab-icon-color, #6f6f6f );
          cursor: default;
          direction: ltr;
          display: none;
          font-family: 'Material Symbols Outlined';
          font-size: var( --tab-icon-font-size, 18px );
          font-style: normal;
          font-weight: normal;
          height: var( --tab-icon-size, 20px );
          letter-spacing: normal;
          margin: 0 0 0 -4px;
          min-height: var( --tab-icon-size, 20px );
          min-width: var( --tab-icon-size, 20px );
          padding: 0 12px 0 0;
          text-transform: none;
          white-space: nowrap;
          width: var( --tab-icon-size, 20px );
          word-wrap: normal;
        }

        div {
          display: flex;
          flex-direction: column;
        }

        div p {
          color: var( --tab-color, #393939 );
          cursor: var( --tab-cursor, pointer );
          display: none;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: var( --tab-font-size, 14px );
          font-weight: var( --tab-font-weight, 400 );
          margin: 0;
          padding: 0;
          text-align: left;
          text-rendering: optimizeLegibility;
        }

        p[part=helper] {
          color: #6f6f6f;
          font-size: 12px;
        }

        :host( [icon] ) button > p {
          display: block;
        }

        :host( [label] ) p[part=helper],
        :host( [label] ) p[part=label] {
          display: block;
        }

        :host( [selected] ) button {
          background-color: #f4f4f4;
          border-left: solid 1px transparent;          
          box-shadow: inset 0 2px 0 0 #0f62fe;
        }

        :host( [selected] ) button > p {
          color: #525252;
        }

        :host( [selected] ) div p:first-of-type {
          color: #161616;
          font-weight: 600;
        }

        :host( [selected] ) div p:last-of-type {
          color: #525252;
        }

        :host( [disabled] ) button {
          background-color: #c6c6c6;
          cursor: not-allowed;
        }

        :host( [disabled] ) button p {
          color: #8d8d8d;
          cursor: not-allowed;
        }
      </style>
      <button part="button">
        <p part="icon"></p>
        <div>
          <p part="label"></p>
          <p part="helper"></p>
        </div>
      </button>
    `;

    // Private
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$button = this.shadowRoot.querySelector( 'button' );
    this.$helper = this.shadowRoot.querySelector( 'p[part=helper]' );
    this.$icon = this.shadowRoot.querySelector( 'p[part=icon]' );
    this.$label = this.shadowRoot.querySelector( 'p[part=label]' );
  }

   // When attributes change
  _render() {
    this.$button.disabled = this.disabled;
    this.$helper.innerText = this.helper === null ? '' : this.helper;
    this.$icon.innerText = this.icon === null ? '' : this.icon;
    this.$label.innerText = this.label === null ? '' : this.label;
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
    this._upgrade( 'selected' );
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

window.customElements.define( 'adc-tab', AvocadoTab );
