import AvocadoMenu from "./menu.js";

export default class AvocadoSelect extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
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
          border: none;
          box-sizing: border-box;
          color: #525252;
          cursor: pointer;
          direction: ltr;
          display: flex;
          font-family: 'Material Symbols Outlined';
          font-size: 18px;
          font-style: normal;
          font-weight: normal;
          height: 20px;
          justify-content: center;
          letter-spacing: normal;
          margin: 0;
          min-height: 20px;
          min-width: 20px;
          margin: 0;
          overflow: hidden;
          padding: 0;
          text-transform: none;
          text-rendering: optimizeLegibility;
          transition:
            margin 300ms ease-out,
            min-width 300ms ease-out,
            opacity 300ms ease-out,
            width 300ms ease-out;
          white-space: nowrap;
          width: 20px;          
          word-wrap: normal;
          -webkit-tap-highlight-color: transparent;
        }

        button[part=clear] {
          opacity: 0;
          min-width: 0;
          width: 0;
        }

        button[part=button] {
          margin: 0 12px 0 6px;
        }

        div[part=header] {
          align-items: flex-end;
          display: flex;
          flex-basis: 0;
          flex-direction: row;
          flex-grow: 1;
          margin: 0;
          padding: 0;
        }

        div[part=header] > div {
          align-items: flex-start;
          display: flex;
          flex-basis: 0;
          flex-direction: column;
          flex-grow: 1;
        }

        input {
          appearance: none;
          background: none;
          border: none;
          box-sizing: border-box;
          color: #c6c6c6;
          cursor: pointer;
          flex-basis: 0;
          flex-grow: 1;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          height: 40px;
          margin: 0;
          min-height: 40px;
          min-width: 0;
          outline: none;
          padding: 0 0 0 16px;
          text-align: left;
          text-rendering: optimizeLegibility;
          width: 0;
          -webkit-appearance: none;          

          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;          
        }

        input::placeholder {
          color: #a8a8a8;
        }                 

        input.filled {
          color: #161616;
        }

        label {
          align-items: center;
          background-color: #f4f4f4;
          border-bottom: solid 1px #8d8d8d;          
          box-sizing: border-box;
          cursor: pointer;
          display: inline-flex;
          flex-basis: 0;
          flex-direction: row;
          flex-grow: 1;
          margin: 0;
          outline: solid 2px transparent;
          outline-offset: -2px;
          padding: 0;
          transition: background-color 150ms ease-in-out;
          width: 100%;
        }

        label:focus-within {
          outline: solid 2px #0f62fe;
        }

        p {
          box-sizing: border-box;          
          cursor: default;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          margin: 0;
          padding: 0;
          text-rendering: optimizeLegibility;
        }

        p.icon {
          color: #da1e28;
          cursor: default;
          direction: ltr;
          font-family: 'Material Symbols Outlined';
          font-size: 18px;
          font-style: normal;
          font-weight: normal;
          height: 20px;
          letter-spacing: normal;
          line-height: 20px;
          opacity: 0;
          overflow: hidden;
          margin: 0;
          min-height: 20px;
          min-width: 0;
          padding: 0;
          text-rendering: optimizeLegibility;
          text-transform: none;
          transition:
            margin 300ms ease-out,
            opacity 300ms ease-out,
            width 300ms ease-out
          white-space: nowrap;
          width: 0;
          word-wrap: normal;
        }

        p[part=error] {
          color: #6f6f6f;
          font-size: 12px;
          padding: 4px 0 0 0;
          visibility: hidden;
        }

        p[part=helper] {
          color: #6f6f6f;
          font-size: 12px;
          padding: 0 0 4px 0;
        }

        p[part=label] {
          color: #525252;
          flex-basis: 0;
          flex-grow: 1;
          font-size: 12px;
          padding: 0;
        }

        ::slotted( adc-label ) {
          margin: 0 0 4px 0;
          --label-color: #6f6f6f;
          --label-font-size: 12px;
        }

        ::slotted( adc-link ) {
          margin: 0 0 4px 0;
          --link-font-size: 12px;
        }

        :host( [editable] ) input {
          color: #161616;
          cursor: pointer;
        }

        :host( [error] ) p[part=error] {
          visibility: visible;
        }

        :host( [invalid] ) p[part=invalid] {
          min-width: 20px;
          opacity: 1.0;
          margin: 0 12px 0 0;
          width: 20px;
        }        

        :host( [invalid] ) label {
          outline: solid 2px #da1e28;
        }

        :host( [invalid] ) p[part=error] {
          color: #da1e28;
        }

        :host( [invalid] ) p.icon {
          min-width: 20px;
          opacity: 1.0;
          margin: 0 6px 0 0;
          width: 20px;
        }

        :host( [light] ) label {
          background-color: #ffffff;
        }

        :host( [value]:not( [read-only] ) ) label:focus-within p.icon {
          margin: 0 6px 0 0;
        }

        :host( [value]:not( [read-only] ) ) label:focus-within button[part=clear] {
          min-width: 20px;
          opacity: 1.0;
          margin: 0 12px 0 0;
          width: 20px;
        }

        :host( [read-only] ) button[part=button],
        :host( [read-only] ) button[part=clear] {
          min-width: 0;
          opacity: 0;
          margin: 0;
          width: 0;                    
        }

        :host( [read-only] ) input {
          cursor: default;
          padding: 0 16px 0 16px;          
        }        

        :host( [read-only] ) label {
          border-bottom: solid 1px transparent;
          cursor: default;
        }        

        :host( [read-only] ) label:hover {
          background-color: #f4f4f4;
        }                
        
        :host( [read-only][light] ) label:hover {
          background-color: #ffffff;
        }                        

        :host( [read-only] ) label:focus-within {        
          outline: solid 2px transparent;
        }        
      </style>
      <div part="header">
        <div>
          <p class="text" part="label"></p>
          <p class="text" part="helper"></p>
        </div>
        <slot></slot>
      </div>
      <label part="field">
        <input part="input" type="button" />
        <p class="icon" part="invalid">error</p>
        <button part="clear" type="button">close</button>
        <button part="button" type="button">expand_more</button>
      </label>
      <p class="text" part="error"></p>
    `;

    // Private
    this._compare = null;
    this._label = null;
    this._menu = null;
    this._data = null;
    this._provider = [];

    // Removable events
    this.doMenuChange = this.doMenuChange.bind( this );

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$menu = this.shadowRoot.querySelector( 'button[part=button]' );
    this.$menu.addEventListener( 'click', () => this.doMenuClick() );    
    this.$error = this.shadowRoot.querySelector( 'p[part=error]' );
    this.$helper = this.shadowRoot.querySelector( 'p[part=helper]' );
    this.$input = this.shadowRoot.querySelector( 'input[part=input]' );
    this.$input.addEventListener( 'click', () => this.doInputClick() );
    this.$label = this.shadowRoot.querySelector( 'p[part=label]' );

    this.$menu = document.createElement( 'adc-menu' );
    this.$menu.addEventListener( 'change', ( evt ) => this.doMenuChange( evt ) );
    document.body.appendChild( this.$menu );
  }

  doInputClick() {
    if( this.editable ) return;
    if( this.readOnly ) return;
    this.doMenuClick();
  }

  doMenuChange( evt ) {
    this.$menu.hide();
    
    this.selectedIndex = evt.detail.selectedIndex;

    this.dispatchEvent( new CustomEvent( 'change', {
      detail: {
        selectedIndex: evt.detail.selectedIndex,
        selectedItem: evt.detail.selectedItem
      }
    } ) );
  }  

  doMenuClick() {
    if( this.$menu.opened ) {
      this.$menu.hide();
    } else {             
      this.$menu.show( this );
    }
  }

   // When attributes change
  _render() {
    this.$error.innerText = this.error === null ? '&nbsp;' : this.error;
    this.$helper.innerText = this.helper === null ? '' : this.helper;
    this.$label.innerText = this.label === null ? '' : this.label;
    this.$menu.labelField = this.labelField;

    if( this.selectedIndex !== null ) {
      if( this.labelField !== null ) {
        this.$input.value = this._provider[this.selectedIndex][this.labelField];
      } else if( this.labelFunction !== null ) {
        this.$input.value = this.labelFunction( this._provider[this.selectedIndex] );
      } else {
        this.$input.value = this._provider[this.selectedIndex];        
      }        

      this.$input.classList.add( 'filled' );
    } else {
      this.$input.classList.remove( 'filled' );

      if( this.editable ) {
        this.$input.value = null;        
        this.$input.placeholder = this.placeholder;
      } else {
        this.$input.value = this.placeholder === null ? '' : this.placeholder;
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
    /*
    this._menu = document.body.querySelector( 'adc-menu' );

    if( this._menu === null ) {
      this._menu = document.createElement( 'adc-menu' );
      document.body.appendChild( this._menu );
    }
    */

    this._upgrade( 'concealed' );
    this._upgrade( 'data' );
    this._upgrade( 'editable' );    
    this._upgrade( 'error' );
    this._upgrade( 'format' );    
    this._upgrade( 'helper' );
    this._upgrade( 'hidden' );
    this._upgrade( 'invalid' );
    this._upgrade( 'label' );
    this._upgrade( 'labelField' );    
    this._upgrade( 'labelFunction' );     
    this._upgrade( 'light' );
    this._upgrade( 'placeholder' );    
    this._upgrade( 'provider' );    
    this._upgrade( 'readOnly' );
    this._upgrade( 'selectedIndex' );    
    this._upgrade( 'selectedItem' );
    this._upgrade( 'selectedItemCompareFunction' );             
    this._upgrade( 'value' );    

    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'editable',
      'error',
      'format',
      'helper',
      'hidden',
      'invalid',
      'label',
      'label-field',
      'light',
      'placeholder',
      'read-only',
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
    this.$menu.labelFunction = value;
  }  

  get provider() {
    return this._provider.length === 0 ? null : this._provider;
  }

  set provider( items ) {
    if( items === null ) {
      this._provider = [];
    } else {
      this._provider = [... items];
    }

    this.$menu.provider = this._provider;
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

  get selectedItemCompareFunction() {
    return this._compare;
  }

  set selectedItemCompareFunction( value ) {
    this._compare = value;
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

  get editable() {
    return this.hasAttribute( 'editable' );
  }

  set editable( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'editable' );
      } else {
        this.setAttribute( 'editable', '' );
      }
    } else {
      this.removeAttribute( 'editable' );
    }
  }  

  get error() {
    if( this.hasAttribute( 'error' ) ) {
      return this.getAttribute( 'error' );
    }

    return null;
  }

  set error( value ) {
    if( value !== null ) {
      this.setAttribute( 'error', value );
    } else {
      this.removeAttribute( 'error' );
    }
  }

  get format() {
    if( this.hasAttribute( 'format' ) ) {
      return this.getAttribute( 'format' );
    }

    return null;
  }

  set format( value ) {
    if( value !== null ) {
      this.setAttribute( 'format', value );
    } else {
      this.removeAttribute( 'format' );
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

  get invalid() {
    return this.hasAttribute( 'invalid' );
  }

  set invalid( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'invalid' );
      } else {
        this.setAttribute( 'invalid', '' );
      }
    } else {
      this.removeAttribute( 'invalid' );
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

  get placeholder() {
    if( this.hasAttribute( 'placeholder' ) ) {
      return this.getAttribute( 'placeholder' );
    }

    return null;
  }

  set placeholder( value ) {
    if( value !== null ) {
      this.setAttribute( 'placeholder', value );
    } else {
      this.removeAttribute( 'placeholder' );
    }
  }  

  get readOnly() {
    return this.hasAttribute( 'read-only' );
  }

  set readOnly( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'read-only' );
      } else {
        this.setAttribute( 'read-only', '' );
      }
    } else {
      this.removeAttribute( 'read-only' );
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

window.customElements.define( 'adc-select', AvocadoSelect );
