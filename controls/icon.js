export default class AvocadoIcon extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          align-items: center;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          position: relative;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        i {
          box-sizing: border-box;
          color: var( --icon-color, #161616 );
          cursor: var( --icon-cursor, default );
          direction: ltr;
          display: inline-block;
          font-family: 'Material Symbols Outlined';
          font-style: normal;
          font-weight: normal;
          font-size: var( --icon-size, 18px );
          height: var( --icon-size, 18px );
          letter-spacing: normal;
          line-height: var( --icon-size, 18px );
          margin: 0;
          padding: 0;
          text-align: center;
          text-rendering: optimizeLegibility;
          text-transform: none;
          white-space: nowrap;
          width: var( --icon-size, 18px );
          word-wrap: normal;
        }
      </style>
      <i part="icon"></i>
    `;

    // Private
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$icon = this.shadowRoot.querySelector( 'i' );
  }

  // When things change
  _render() {
    this.$icon.innerText = this.name === null ? '' : this.name;

    if( this.name !== null ) {
      const variation = [];

      if( this.filled ) {
        variation.push( '\'FILL\' 1' );
      } else {
        variation.push( '\'FILL\' 0' );
      }

      if( this.weight !== null ) {
        variation.push( `'wght' ${this.weight}` );
      } else {
        variation.push( '\'wght\' 400' );
      }

      if( this.grade !== null ) {
        variation.push( `'GRAD' ${this.grade}` );
      } else {
        variation.push( '\'GRAD\' 0' );
      }

      if( this.opticalSize !== null ) {
        variation.push( `'opsz' ${this.opticalSize}` );
      } else {
        variation.push( '\'opsz\' 48' );
      }

      this.$icon.style.fontVariationSettings = variation.toString();
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
    this._upgrade( 'filled' );
    this._upgrade( 'grade' );
    this._upgrade( 'hidden' );
    this._upgrade( 'name' );
    this._upgrade( 'opticalSize' );
    this._upgrade( 'weight' );
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'filled',
      'grade',
      'hidden',
      'name',
      'optical-size',
      'weight'
    ];
  }

  // Observed tag attribute has changed
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

  get filled() {
    return this.hasAttribute( 'filled' );
  }

  set filled( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'filled' );
      } else {
        this.setAttribute( 'filled', '' );
      }
    } else {
      this.removeAttribute( 'filled' );
    }
  }

  get grade() {
    if( this.hasAttribute( 'grade' ) ) {
      return parseInt( this.getAttribute( 'grade' ) );
    }

    return null;
  }

  set grade( value ) {
    if( value !== null ) {
      this.setAttribute( 'grade', value );
    } else {
      this.removeAttribute( 'grade' );
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

  get name() {
    if( this.hasAttribute( 'name' ) ) {
      return this.getAttribute( 'name' );
    }

    return null;
  }

  set name( value ) {
    if( value !== null ) {
      this.setAttribute( 'name', value );
    } else {
      this.removeAttribute( 'name' );
    }
  }

  get opticalSize() {
    if( this.hasAttribute( 'optical-size' ) ) {
      return parseInt( this.getAttribute( 'optical-size' ) );
    }

    return null;
  }

  set opticalSize( value ) {
    if( value !== null ) {
      this.setAttribute( 'optical-size', value );
    } else {
      this.removeAttribute( 'optical-size' );
    }
  }

  get weight() {
    if( this.hasAttribute( 'weight' ) ) {
      return parseInt( this.getAttribute( 'weight' ) );
    }

    return null;
  }

  set weight( value ) {
    if( value !== null ) {
      this.setAttribute( 'weight', value );
    } else {
      this.removeAttribute( 'weight' );
    }
  }
}

window.customElements.define( 'adc-icon', AvocadoIcon );
