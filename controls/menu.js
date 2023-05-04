export default class AvocadoMenu extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          background-color: #f4f4f4;
          box-shadow: rgba( 0, 0, 0, 0.30 ) 0px 2px 6px 0px;
          box-sizing: border-box;
          display: inline-block;
          left: -300px;
          opacity: 0;
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

        adc-label-item-renderer {
          --cursor: pointer;
          --height: 40px;
        }

        adc-label-item-renderer:hover {        
          background-color: #e8e8e8;
        }

        adc-label-item-renderer:last-of-type {
          --border-bottom: solid 1px transparent;
        }

        div {
          display: flex;
          flex-direction: column;
          max-height: calc( 5 * 40px );
          overflow: scroll;
        }
      </style>
      <div part="menu"></div>
    `;

    // Private
    this._data = null;
    this._label = null;
    this._provider = [];

    // Events
    this.doItemClick = this.doItemClick.bind( this );

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$menu = this.shadowRoot.querySelector( 'div' );
  }

  doItemClick( evt ) {
    const index = parseInt( evt.currentTarget.getAttribute( 'data-index' ) );

    this.selectedIndex = index;
    this.dispatchEvent( new CustomEvent( 'change', {
      detail: {
        selectedIndex: this.selectedIndex,
        selectedItem: this.selectedItem
      }
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

    // if( this.selectedIndex === null )
    //   this._displayed = new Date();

    const rect = owner.getBoundingClientRect();
    this.style.left = `${rect.left}px`;
    this.style.top = `${rect.bottom + 4}px`;
    this.style.minWidth = `${rect.width}px`;

    this.opened = true;
  }

  // When attributes change
  _render() {
    while( this.$menu.children.length > this._provider.length ) {
      this.$menu.children[0].removeEventListener( 'click', this.doItemClick );
      this.$menu.children[0].remove();
    }

    while( this.$menu.children.length < this._provider.length ) {
      const element = document.createElement( 'adc-label-item-renderer' );
      element.addEventListener( 'click', this.doItemClick );
      this.$menu.appendChild( element );
    }

    for( let p = 0; p < this._provider.length; p++ ) {
      this.$menu.children[p].setAttribute( 'data-index', p );

      if( this.labelField !== null ) {
        this.$menu.children[p].data = this._provider[p][this.labelField];
      } else if( this.labelFunction !== null ) {
        this.$menu.children[p].data = this.labelFunction( this._provider[p] );
      } else {
        this.$menu.children[p].data = this._provider[p];        
      }
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
    this._upgrade( 'labelField' );    
    this._upgrade( 'labelFunction' );        
    this._upgrade( 'multiple' );    
    this._upgrade( 'opened' );
    this._upgrade( 'provider' );    
    this._upgrade( 'selectedIndex' );
    this._upgrade( 'selectedItem' );    
    this._upgrade( 'value' );
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'hidden',
      'label-field',
      'multiple',
      'opened',
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

  get labelFunction() {
    return this._label;
  }

  set labelFunction( value ) {
    this._label = value;
  }

  get provider() {
    return this._provider.length === 0 ? null : this._provider;
  }

  set provider( value ) {
    if( value === null ) {
      this._provider = [];
    } else {
      this._provider = [... value];
    }

    this._render();
  }

  get selectedItem() {
    return this.selectedIndex === null ? null : this._provider[this.selectedIndex];
  }

  set selectedItem( item ) {
    if( item === null ) {
      this.selectedIndex = null;
      return;
    }

    let index = null;

    for( let p = 0; p < this._provider.length; p++ ) {
      if( this._compare === null ) {
        if( this._provider[p] === item ) {
          index = p;
          break;
        }
      } else {
        if( this._compare( this._provider[p], item ) ) {
          index = p;
          break;
        }
      }
    }

    this.selectedIndex = index;    
  }

  get value() {
    return this.selectedItem;
  }

  set value( item ) {
    this.selectedItem = item;
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

  get multiple() {
    return this.hasAttribute( 'multiple' );
  }

  set multiple( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'multiple' );
      } else {
        this.setAttribute( 'multiple', '' );
      }
    } else {
      this.removeAttribute( 'multiple' );
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

window.customElements.define( 'adc-menu', AvocadoMenu );
