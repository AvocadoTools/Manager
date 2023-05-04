import AvocadoTab from "../controls/tab.js";

export default class AvocadoTabs extends HTMLElement {
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
          position: relative;
        }

        button {
          align-items: center;
          background: none;
          border: none;
          color: var( --tabs-zoom-color, #525252 );
          cursor: pointer;
          direction: ltr;
          display: none;
          font-family: 'Material Symbols Outlined';
          font-size: var( --tabs-zoom-font-size, 18px );
          font-style: normal;
          font-weight: normal;
          height: var( --tabs-zoom-size, 20px );
          justify-content: center;
          letter-spacing: normal;
          margin: 0 12px 0 12px;
          min-height: var( --tabs-zoom-size, 20px );
          min-width: var( --tabs-zoom-size, 20px );
          outline: none;
          padding: 0;
          text-transform: none;
          white-space: nowrap;
          width: var( --tabs-zoom-size, 20px );
          word-wrap: normal;
        }

        div[part=header] {
          align-items: center;
          display: flex;
          flex-direction: row;
        }

        div[part=tabs] {
          display: flex;
          flex-basis: 0;
          flex-grow: 1;
          flex-direction: row;
          overflow: hidden;
        }

        div[part=views] {
          background-color: var( --tabs-background-color, #f4f4f4 );
          box-sizing: border-box;
          display: flex;
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-tab:first-of-type::part( button ) {
          border-left: solid 1px transparent;
        }

        adc-tab[selected] + adc-tab::part( button ) {
          border-left: solid 1px transparent;
        }

        :host( [expandable] ) button {
          display: flex;
        }
      </style>
      <div part="header">
        <div part="tabs"></div>
        <button part="zoom">open_in_full</button>
      </div>
      <div part="views">
        <slot></slot>
      </div>
    `;

    // Properties
    this._data = null;
    this._open = false;

    // Removeable events
    this.doTabClick = this.doTabClick.bind( this );

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$tabs = this.shadowRoot.querySelector( 'div[part=tabs]' );
    this.$views = this.shadowRoot.querySelector( 'slot' );
    this.$views.addEventListener( 'slotchange', ( evt ) => this.doSlotChange( evt ) );
    this.$zoom = this.shadowRoot.querySelector( 'button' );
    this.$zoom.addEventListener( 'click', () => this.doZoomClick() );
  }

  // Children added or removed
  doSlotChange() {
    // Remove excess
    while( this.$tabs.children.length > this.children.length ) {
      this.$tabs.children[0].removeEventListener( 'click', this.doTabClick );
      this.$tabs.children[0].remove();
    }

    // Add where needed
    while( this.$tabs.children.length < this.children.length ) {
      const renderer = this.tabRenderer === null ? 'adc-tab' : this.tabRenderer;
      const tab = document.createElement( renderer );
      tab.addEventListener( 'click', this.doTabClick );
      this.$tabs.appendChild( tab );
    }

    const selected = this.selectedIndex === null ? 0 : this.selectedIndex;

    for( let c = 0; c < this.$tabs.children.length; c++ ) {
      this.$tabs.children[c].setAttribute( 'data-index', c );
      this.$tabs.children[c].label = this.children[c].label === null ? '' : this.children[c].label;
      this.$tabs.children[c].helper = this.children[c].helper === null ? null : this.children[c].helper;
      this.$tabs.children[c].icon = this.children[c].icon === null ? null : this.children[c].icon;
      this.$tabs.children[c].disabled = this.children[c].disabled;
      this.$tabs.children[c].selected = c === selected ? true : false;
      this.children[c].hidden = c === selected ? false : true;
    }
  }

  // Tab selection change
  doTabClick( evt ) {
    if( evt.currentTarget.disabled )
      return;

    const index = parseInt( evt.currentTarget.getAttribute( 'data-index' ) );

    if( index === this.selectedIndex )
      return;

    this.dispatchEvent( new CustomEvent( 'change', {
      detail: {
        previousIndex: this.selectedIndex,
        selectedIndex: index
      }
    } ) );

    this.selectedIndex = index;
  }

  doZoomClick() {
    this._open = !this._open;
    this.$zoom.innerText = this._open === true ? 'hide' : 'open_in_full';
    this.dispatchEvent( new CustomEvent(
      this._open === true ? 'collapse' : 'expand'
    ) );
  }

  // When things change
  _render() {
    const index = this.selectedIndex === null ? 0 : this.selectedIndex;

    for( let c = 0; c < this.$tabs.children.length; c++ ) {
      this.$tabs.children[c].selected = c === index ? true : false;
      this.children[c].hidden = c === index ? false : true;
    }
  }

  // Properties set before module loaded
  _upgrade( property ) {
    if( this.hasOwnProperty( property ) ) {
      const value = this[property];
      delete this[property];
      this[property] = value;
    }
  }

  // Default render
  // No attributes set
  connectedCallback() {
    // Check data property before render
    // May be assigned before module is loaded
    this._upgrade( 'concealed' );
    this._upgrade( 'data' );
    this._upgrade( 'expandable' );
    this._upgrade( 'hidden' );
    this._upgrade( 'selectedIndex' );
    this._upgrade( 'tabRenderer' );
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'expandable',
      'hidden',
      'selected-index',
      'tab-renderer'
    ];
  }

  // Observed tag attribute has changed
  // Update render
  attributeChangedCallback( name, old, value ) {
    this._render();
  }

  // Arbitrary storage
  // For your convenience
  // Not used in component
  get data() {
    return this._data;
  }

  set data( value ) {
    this._data = value;
  }

  // Reflect attributes
  // Return typed value (Number, Boolean, String, null)
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

  get expandable() {
    return this.hasAttribute( 'expandable' );
  }

  set expandable( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'expandable' );
      } else {
        this.setAttribute( 'expandable', '' );
      }
    } else {
      this.removeAttribute( 'expandable' );
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

  get selectedIndex() {
    if( this.hasAttribute( 'selected-index' ) ) {
      return parseInt( this.getAttribute( 'selected-index' ) );
    }

    return null;
  }

  set selectedIndex( value ) {
    if( value !== null ) {
      this.setAttribute( 'selected-index', value );
    } else {
      this.removeAttribute( 'selected-index' );
    }
  }

  get tabRenderer() {
    if( this.hasAttribute( 'tab-renderer' ) ) {
      return this.getAttribute( 'tab-renderer' );
    }

    return null;
  }

  set tabRenderer( value ) {
    if( value !== null ) {
      this.setAttribute( 'tab-renderer', value );
    } else {
      this.removeAttribute( 'tab-renderer' );
    }
  }
}

window.customElements.define( 'adc-tabs', AvocadoTabs );
