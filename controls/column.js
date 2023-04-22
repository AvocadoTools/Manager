import AvocadoVBox from "../containers/vbox.js";

import AvocadoIcon from "./icon.js";
import AvocadoLabel from "./label.js";

export default class AvocadoColumn extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: inline-block;
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
          box-sizing: border-box;
          cursor: pointer;
          display: flex;
          flex-direction: row;
          height: 48px;
          margin: 0;
          min-width: 100px;
          overflow: hidden;
          padding: 0 16px 0 16px;
          text-align: left;
          width: 100%;
          -webkit-tap-highlight-color: transparent;          
        }

        adc-label {
          --label-cursor: pointer;
        }

        adc-label[part=helper] {
          --label-color: #525252;
          --label-font-size: 12px;
        }

        adc-label[part=label] {
          --label-font-weight: 600;
        }

        adc-vbox {
          flex-basis: 0;
          flex-grow: 1;
        }

        :host( [helper-text] ) adc-label[part=helper] {
          display: block;
        }

        :host( [sortable] ) adc-icon {
          display: inline-block;
          --icon-cursor: pointer;          
        }

        :host( [sortable] ) button {
          cursor: pointer;
        }        

        :host( [sortable] ) button:focus {
          outline: solid 2px #0f62fe;
          outline-offset: -2px;
        }

        :host( [sortable] ) button:hover {
          background-color: #d1d1d1;
        }        

        :host( [sortable]:not( [sort-direction] ) ) adc-icon {
          display: none;
        }

        :host( [sortable][sort-direction] ) button {
          background-color: #d1d1d1;
        }

        :host( [sortable]:not( [sort-direction] ):hover ) adc-icon {
          display: inline-block;
        }
      </style>
      <button part="button" type="button">
        <adc-vbox>
          <adc-label part="label"></adc-label>
          <adc-label part="helper"></adc-label>
        </adc-vbox>
        <adc-icon exportparts="image, font" part="icon"></adc-icon>
      </button>
    `;

    // Private
    this._data = null;
    this._label = null;
    this._sort = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$button = this.shadowRoot.querySelector( 'button' );
    this.$button.addEventListener( 'click', () => this.doButtonClick() );
    this.$label = this.shadowRoot.querySelector( 'adc-label[part=label]' );
    this.$helper = this.shadowRoot.querySelector( 'adc-label[part=helper]' );
    this.$icon = this.shadowRoot.querySelector( 'adc-icon' );
  }

  doButtonClick() {
    if( this.sortable ) {
      if( this.sortDirection === null ) {
        this.sortDirection = 'desc';
      } else if( this.sortDirection === 'desc' ) {
        this.sortDirection = 'asc';
      } else {
        this.sortDirection = null;
      }

      this.dispatchEvent( new CustomEvent( 'sort', {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: {
          column: this,
          sortDirection: this.sortDirection
        }
      } ) );
    }
  }

   // When attributes change
  _render() {
    this.style.flexBasis = this.width === null ? '0' : '';
    this.style.flexGrow = this.width === null ? '1' : '';
    this.style.minWidth = this.width === null ? '' : `${this.width}px`;
    this.style.maxWidth = this.width === null ? '' : `${this.width}px`;

    this.$label.text = this.headerText;
    this.$helper.text = this.helperText;

    if( this.sortable ) {
      if( this.sortDirection === null ) {
        this.$icon.name = 'height';
      } else if( this.sortDirection === 'desc' ) {
        this.$icon.name = 'south';
      } else if( this.sortDirection === 'asc' ) {
        this.$icon.name = 'north';
      }
    } else {
      this.$icon.name = null;
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
    this._upgrade( 'grow' );
    this._upgrade( 'headerText' );
    this._upgrade( 'helperText' );
    this._upgrade( 'hidden' );
    this._upgrade( 'itemRenderer' );
    this._upgrade( 'labelField' );
    this._upgrade( 'labelFunction' );
    this._upgrade( 'sortable' );
    this._upgrade( 'sortCompareFunction' );
    this._upgrade( 'sortDirection' );
    this._upgrade( 'width' );
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'grow',
      'header-text',
      'helper-text',
      'hidden',
      'item-renderer',
      'label-field',
      'sortable',
      'sort-direction',
      'width'
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

  get labelFunction() {
    return this._label;
  }

  set labelFunction( value ) {
    this._label = value;
  }

  get sortCompareFunction() {
    return this._sort;
  }

  set sortCompareFunction( value ) {
    this._sort = value;
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

  get grow() {
    if( this.hasAttribute( 'grow' ) ) {
      return parseInt( this.getAttribute( 'grow' ) );
    }

    return null;
  }

  set grow( value ) {
    if( value !== null ) {
      this.setAttribute( 'grow', value );
    } else {
      this.removeAttribute( 'grow' );
    }
  }

  get headerText() {
    if( this.hasAttribute( 'header-text' ) ) {
      return this.getAttribute( 'header-text' );
    }

    return null;
  }

  set headerText( value ) {
    if( value !== null ) {
      this.setAttribute( 'header-text', value );
    } else {
      this.removeAttribute( 'header-text' );
    }
  }

  get helperText() {
    if( this.hasAttribute( 'helper-text' ) ) {
      return this.getAttribute( 'helper-text' );
    }

    return null;
  }

  set helperText( value ) {
    if( value !== null ) {
      this.setAttribute( 'helper-text', value );
    } else {
      this.removeAttribute( 'helper-text' );
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

  get itemRenderer() {
    if( this.hasAttribute( 'item-renderer' ) ) {
      return this.getAttribute( 'item-renderer' );
    }

    return null;
  }

  set itemRenderer( value ) {
    if( value !== null ) {
      this.setAttribute( 'item-renderer', value );
    } else {
      this.removeAttribute( 'item-renderer' );
    }
  }

  get labelField() {
    if( this.hasAttribute( 'label-field' ) ) {
      return this.getAttribute( 'label-field' );
    }

    return null;
  }

  set labelField( value ) {
    if( value !== null ) {
      this.setAttribute( 'label-field', value );
    } else {
      this.removeAttribute( 'label-field' );
    }
  }

  get sortable() {
    return this.hasAttribute( 'sortable' );
  }

  set sortable( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'sortable' );
      } else {
        this.setAttribute( 'sortable', '' );
      }
    } else {
      this.removeAttribute( 'sortable' );
    }
  }

  get sortDirection() {
    if( this.hasAttribute( 'sort-direction' ) ) {
      return this.getAttribute( 'sort-direction' );
    }

    return null;
  }

  set sortDirection( value ) {
    if( value !== null ) {
      this.setAttribute( 'sort-direction', value );
    } else {
      this.removeAttribute( 'sort-direction' );
    }
  }

  get width() {
    if( this.hasAttribute( 'width' ) ) {
      return parseInt( this.getAttribute( 'width' ) );
    }

    return null;
  }

  set width( value ) {
    if( value !== null ) {
      this.setAttribute( 'width', value );
    } else {
      this.removeAttribute( 'width' );
    }
  }
}

window.customElements.define( 'adc-column', AvocadoColumn );
