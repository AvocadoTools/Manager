import AvocadoHBox from "./hbox.js";
import AvocadoStack from "./stack.js";

import AvocadoTab from "../controls/tab.js";

export default class AvocadoTabGroup extends HTMLElement {
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

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        adc-tab:first-of-type::part( button ) {
          border-left: solid 1px transparent;
        }

        adc-tab[active] + adc-tab::part( button ) {
          border-left: solid 1px transparent;
        }

        adc-vbox {
          flex-basis: 0;
          flex-grow: 1;
        }
      </style>
      <adc-hbox part="tabs"></adc-hbox>
      <adc-vbox part="panels">
        <slot></slot>
      </adc-vbox>
    `;

    // Events
    this.doTabClick = this.doTabClick.bind( this );

    // Private
    this._data = null;    

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$panels = this.shadowRoot.querySelector( 'adc-vbox' );
    this.$slot = this.shadowRoot.querySelector( 'slot' );
    this.$slot.addEventListener( 'slotchange', () => {
      while( this.$tabs.children.length > this.children.length ) {
        this.$tabs.removeEventListener( 'click', this.doTabClick );
        this.$tabs.children[0].remove();
      }

      while( this.$tabs.children.length < this.children.length ) {
        const element = document.createElement( 'adc-tab' );
        element.addEventListener( 'click', this.doTabClick );
        this.$tabs.appendChild( element );
      }

      for( let c = 0; c < this.children.length; c++ ) {
        this.$tabs.children[c].setAttribute( 'data-index', c );
        this.$tabs.children[c].label = this.children[c].label;
        this.$tabs.children[c].helper = this.children[c].helper;
      }

      this._render();
    } );
    this.$tabs = this.shadowRoot.querySelector( 'adc-hbox' );
  }

  doTabClick( evt ) {
    const selected = parseInt( evt.currentTarget.getAttribute( 'data-index' ) );

    if( this.selectedIndex !== selected ) {
      this.selectedIndex = selected;
    }
  }

  // When attributes change
  _render() {
    const selected = this.selectedIndex === null ? 0 : this.selectedIndex;

    for( let c = 0; c < this.children.length; c++ ) {
      this.children[c].hidden = c === selected ? false : true;
    }

    for( let t = 0; t < this.$tabs.children.length; t++ ) {
      this.$tabs.children[t].active = t === selected ? true : false;
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
    this._upgrade( 'hidden' );    
    this._upgrade( 'selectedIndex' );    
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'hidden',
      'selected-index'
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
}

window.customElements.define( 'adc-tab-group', AvocadoTabGroup );
