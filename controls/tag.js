export default class AvocadoTag extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          align-items: center;
          background-color: var( --tag-background-color, #e0e0e0 );
          border-radius: 24px;
          box-sizing: border-box;
          display: inline-flex;
          flex-direction: row;
          height: 24px;
          padding: 0 8px 0 8px;
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
          background-color: transparent;
          border: none;
          border-radius: 24px;
          box-sizing: border-box;
          color: var( --tag-color, #393939 );
          cursor: pointer;
          direction: ltr;
          display: none;
          font-family: 'Material Symbols Outlined';
          font-size: 14px;
          font-style: normal;
          font-weight: normal;
          height: 24px;
          letter-spacing: normal;
          margin: 0 -8px 0 2px;
          outline: none;
          padding: 0;
          text-rendering: optimizeLegibility;
          text-transform: none;
          white-space: nowrap;
          width: 24px;
          word-wrap: normal;
        }

        button:hover {
          background-color: var( --tag-hover-color, #c6c6c6 );
        }

        p {
          color: var( --tag-color, #393939 );
          cursor: var( --tag-cursor, default );
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: var( --tag-font-size, 12px );
          font-weight: var( --tag-font-weight, 400 );
          margin: 0;
          padding: 0;
          text-rendering: optimizeLegibility;
        }

        :host( [filter] ) button {
          display: block;
        }

        :host( [type=red] ) { background-color: #ffd7d9; }
        :host( [type=red] ) button { color: #750e13; }
        :host( [type=red] ) button:hover { background-color: #ffb3b8; }
        :host( [type=red] ) p { color: #750e13; }

        :host( [type=magenta] ) { background-color: #ffd6e8; }
        :host( [type=magenta] ) button { color: #740937; }
        :host( [type=magenta] ) button:hover { background-color: #ffafd2; }
        :host( [type=magenta] ) p { color: #740937; }

        :host( [type=purple] ) { background-color: #e8daff; }
        :host( [type=purple] ) button { color: #491d8b; }
        :host( [type=purple] ) button:hover { background-color: #d4bbff; }
        :host( [type=purple] ) p { color: #491d8b; }

        :host( [type=blue] ) { background-color: #d0e2ff; }
        :host( [type=blue] ) button { color: #002d9c; }
        :host( [type=blue] ) button:hover { background-color: #a6c8ff; }
        :host( [type=blue] ) p { color: #002d9c; }

        :host( [type=cyan] ) { background-color: #bae6ff; }
        :host( [type=cyan] ) button { color: #003a6d; }
        :host( [type=cyan] ) button:hover { background-color: #82cfff; }
        :host( [type=cyan] ) p { color: #003a6d; }

        :host( [type=teal] ) { background-color: #9ef0f0; }
        :host( [type=teal] ) button { color: #004144; }
        :host( [type=teal] ) button:hover { background-color: #3ddbd9; }
        :host( [type=teal] ) p { color: #004144; }

        :host( [type=green] ) { background-color: #a7f0ba; }
        :host( [type=green] ) button { color: #044317; }
        :host( [type=green] ) button:hover { background-color: #6fdc8c; }
        :host( [type=green] ) p { color: #044317; }

        :host( [type=cool-gray] ) { background-color: #dde1e6; }
        :host( [type=cool-gray] ) button { color: #343a3f; }
        :host( [type=cool-gray] ) button:hover { background-color: #c1c7cd; }
        :host( [type=cool-gray] ) p { color: #343a3f; }

        :host( [type=warm-gray] ) { background-color: #e5e0df; }
        :host( [type=warm-gray] ) button { color: #3c3838; }
        :host( [type=warm-gray] ) button:hover { background-color: #cac5c4; }
        :host( [type=warm-gray] ) p { color: #3c3838; }

        :host( [disabled] ) {
          background-color: #f4f4f4;
          cursor: not-allowed;
        }

        :host( [disabled] ) button {
          background-color: transparent;
          color: #c6c6c6;
          cursor: not-allowed;
        }

        :host( [disabled] ) button:hover {
          background-color: transparent;
          cursor: not-allowed;
        }

        :host( [disabled] ) p {
          color: #c6c6c6;
          cursor: not-allowed;
        }
      </style>
      <p part="label">
        <slot></slot>
      </p>
      <button part="clear" type="button">close</button>
    `;

    // Private
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$button = this.shadowRoot.querySelector( 'button' );
    this.$button.addEventListener( 'click', () => {
      this.dispatchEvent( new CustomEvent( 'clear' ) );
    } );
    this.$label = this.shadowRoot.querySelector( 'p' );
  }

   // When attributes change
  _render() {
    this.$button.disabled = this.disabled;

    if( this.label !== null )
      this.innerText = this.label;
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
    this._upgrade( 'filter' );
    this._upgrade( 'hidden' );
    this._upgrade( 'label' );
    this._upgrade( 'type' );
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'disabled',
      'filter',
      'hidden',
      'label',
      'type'
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

  get filter() {
    return this.hasAttribute( 'filter' );
  }

  set filter( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'filter' );
      } else {
        this.setAttribute( 'filter', '' );
      }
    } else {
      this.removeAttribute( 'filter' );
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

  get type() {
    if( this.hasAttribute( 'type' ) ) {
      return this.getAttribute( 'type' );
    }

    return null;
  }

  set type( value ) {
    if( value !== null ) {
      this.setAttribute( 'type', value );
    } else {
      this.removeAttribute( 'type' );
    }
  }
}

window.customElements.define( 'adc-tag', AvocadoTag );
