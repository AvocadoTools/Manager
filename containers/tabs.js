import AvocadoIconButton from "../controls/icon-button.js";
import AvocadoTab from "../controls/tab.js";

import AvocadoHBox from "./hbox.js";
import AvocadoStack from "./stack.js";

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

        adc-hbox[part=header] {
          align-items: center;
        }

        adc-hbox[part=tabs] {
          flex-basis: 0;
          flex-grow: 1;
          overflow: hidden;
        }

        adc-icon-button {
          display: none;
        }

        adc-stack {
          background-color: var( --tabs-background-color, #f4f4f4 );
        }

        adc-tab:first-of-type::part( button ) {
          border-left: solid 1px transparent;
        }

        adc-tab[selected] + adc-tab::part( button ) {
          border-left: solid 1px transparent;
        }

        :host( [expandable] ) adc-icon-button {
          display: inline-block;
        }

        :host( [light] ) adc-stack {
          background-color: #ffffff;
        }        
      </style>
      <adc-hbox part="header">
        <adc-hbox part="tabs"></adc-hbox>
        <adc-icon-button 
          exportparts="icon: icon, font: zoom-p" 
          name="open_in_full" 
          part="zoom" 
          kind="ghost">
        </adc-icon-button>
      </adc-hbox>
      <adc-stack part="views">
        <slot></slot>
      </adc-stack>
    `;

    // Properties
    this._data = null;

    // Removeable events
    this.doTabClick = this.doTabClick.bind( this );

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$tabs = this.shadowRoot.querySelector( 'adc-hbox[part=tabs]' );
    this.$views = this.shadowRoot.querySelector( 'slot' );
    this.$views.addEventListener( 'slotchange', ( evt ) => this.doSlotChange( evt ) );
    this.$zoom = this.shadowRoot.querySelector( 'adc-icon-button' );
    this.$zoom.addEventListener( 'click', () => {
      this.expanded = !this.expanded;
      this.dispatchEvent( new CustomEvent(
        this.expanded ? 'adc-expand' : 'adc-collapse', {
          detail: {
            value: this.expanded
          }
        }
      ) );
    } );
  }

  collapse() {
    this.expanded = false;
  }

  expand() {
    this.expanded = true;
  }

  show( index ) {
    this.selectedIndex = index === null ? 0 : index;
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
      this.$tabs.children[c].label = this.children[c].label;
      this.$tabs.children[c].helper = this.children[c].helper;
      this.$tabs.children[c].icon = this.children[c].icon;
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

    this.dispatchEvent( new CustomEvent( 'adc-change', {
      detail: {
        previousIndex: this.selectedIndex,
        selectedIndex: index
      }
    } ) );

    this.selectedIndex = index;
  }

  // When things change
  _render() {
    this.$zoom.name = this.expanded ? 'hide' : 'open_in_full';

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
    this._upgrade( 'expanded' );
    this._upgrade( 'hidden' );
    this._upgrade( 'light' );    
    this._upgrade( 'selectedIndex' );
    this._upgrade( 'tabRenderer' );
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'expandable',
      'expanded',
      'hidden',
      'light',
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

  get expanded() {
    return this.hasAttribute( 'expanded' );
  }

  set expanded( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'expanded' );
      } else {
        this.setAttribute( 'expanded', '' );
      }
    } else {
      this.removeAttribute( 'expanded' );
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

  get light() {
    return this.hasAttribute( 'light' );
  }

  set light( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'light' );
      } else {
        this.setAttribute( 'light', '' );
      }
    } else {
      this.removeAttribute( 'light' );
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
