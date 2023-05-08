import AvocadoVBox from "../containers/vbox.js";

import AvocadoColumn from "../controls/column.js";
import AvocadoInput from "../controls/input.js";
import AvocadoLabel from "../controls/label.js";
import AvocadoTable from "../controls/table.js";

import AvocadoControls from "../comp/controls.js";

import { v4 as uuidv4 } from "../lib/uuid-9.0.0.js";

import { db } from "./db.js";
import { store } from "./store.js";

export default class RemoteResource extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          background-color: #ffffff;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;
          height: 100%;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        adc-controls {
          margin: 0 16px 24px 16px;
        }

        adc-input {
          margin: 0 16px 0 16px;
        }

        adc-label:first-of-type {
          margin: 16px 16px 0 16px;
          --label-color: #525252;
          --label-font-size: 20px;
        }

        adc-label:last-of-type {
          margin: 0 16px 16px 16px;
          --label-color: #6f6f6f;
        }        

        adc-table {
          flex-basis: 0;
          flex-grow: 1;
          margin: 0 16px 16px 16px;
        }

        adc-vbox[slot=empty] {
          align-items: center;
          flex-basis: 0;
          flex-grow: 1;
          justify-content: center;
        }

        adc-vbox[slot=empty] adc-label {
          --label-color: #525252;
          --label-font-size: 14px;
        }                

        :host([hide-header] ) {
          padding: 16px 0 0 0;
        }

        :host( [hide-header] ) adc-label {
          display: none;
        }
      </style>
      <adc-label></adc-label>
      <adc-label></adc-label>
      <adc-input
        label="Name"
        placeholder="Name">
      </adc-input>      
      <adc-controls></adc-controls>
      <adc-table selectable sortable>
        <adc-column 
          header-text="Name" 
          label-field="name" 
          sortable>
        </adc-column>
        <adc-vbox slot="empty">
          <adc-label>
            <slot></slot>
          </adc-label>
        </adc-vbox>                                                
      </adc-table>
    `;

    // Private
    this._changed = false;
    this._data = null;
    this._value = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$controls = this.shadowRoot.querySelector( 'adc-controls' );
    this.$controls.addEventListener( 'add', () => this.doResourceAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doResourceCancel() );    
    this.$controls.addEventListener( 'delete', () => this.doResourceDelete() );        
    this.$controls.addEventListener( 'edit', () => this.doResourceEdit() );        
    this.$controls.addEventListener( 'save', () => this.doResourceSave() );        
    this.$helper = this.shadowRoot.querySelector( 'adc-label:last-of-type' );    
    this.$label = this.shadowRoot.querySelector( 'adc-label:first-of-type' );
    this.$name = this.shadowRoot.querySelector( 'adc-input' );
    this.$name.addEventListener( 'input', () => this._changed = true );    
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) );  

    // Read
    if( this.dataType !== null ) {
      const index = 'remote_' + this.dataType.toLocaleLowerCase() + '_index';
      const resource_index = window.localStorage.getItem( index ) === null ? null : parseInt( window.localStorage.getItem( index ) );    

      db[this.dataType].orderBy( 'name' ).toArray()
      .then( ( results ) => {
          this.$table.provider = results 
          this.$table.selectedIndex = resource_index === null ? null : resource_index;              

          this.readOnly = true;
          this.value = resource_index === null ? null : results[resource_index];      
          this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;      
          
          store[this.dataType.toLowerCase()].set( results );          
        }
      );
    }
  }

  clear() {
    this.$name.error = null;
    this.$name.invalid = false;
    this.$name.value = null;
  }  

  doResourceAdd() {
    this.$table.selectedIndex = null;
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;
    this.value = null;
    this.clear();
    this._changed = false;
    this.readOnly = false;
    this.$name.focus();
  }

  doResourceCancel() {
    if( this._changed ) {
      const response = confirm( 'Do you want to save changes?' );
      
      if( response ) {
        this.doResourceSave();
        this._changed = false;
        return;
      }
    }

    if( this._value === null ) {
      this.clear();
      this.$controls.mode = AvocadoControls.ADD_ONLY;
    } else {
      this.value = this._value;
      this.$controls.mode = AvocadoControls.ADD_EDIT;
    }

    this._changed = false;
    this.readOnly = true;    
  }

  doResourceDelete() {
    const id = this._value.id;    
    const response = confirm( `Delete ${this._value.name}?` );

    if( response ) {
      const index = 'remote_' + this.dataType.toLowerCase() + '_index';

      this.clear();
      this.value = null;
      this.$table.selectedIndex = null;
      window.localStorage.removeItem( index );      
      this._changed = false;
      this.readOnly = true;
      this.$controls.mode = AvocadoControls.ADD_ONLY;

      db[this.dataType].delete( id )
      .then( () => db[this.dataType].orderBy( 'name' ).toArray() )
      .then( ( results ) => {
        store[this.dataType.toLowerCase()].set( results );
        this.$table.provider = results;
        store[this.dataType.toLowerCase()].set( results );        
      } );    
    }
  }
  
  doResourceEdit() {
    this._changed = false;
    this.readOnly = false;
    this.$name.focus();
    this.$controls.mode = this._value === null ? AvocadoControls.ADD_EDIT : AvocadoControls.DELETE_CANCEL_SAVE;    
  }

  doResourceSave() {
    if( this.$name.value === null ) {
      this.$name.error = 'A name is the only required field.';
      this.$name.invalid = true;
      return;
    } else {
      this.$name.error = null;
      this.$name.invalid = false;
    }

    const record = {
      name: this.$name.value
    };  

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = this.value.id;
      record.createdAt = this.value.createdAt;
      record.updatedAt = Date.now();
      this.value = record;                

      db[this.dataType].put( record )
      .then( () => db[this.dataType].orderBy( 'name' ).toArray() )
      .then( ( results ) => {
        const index = 'remote_' + this.dataType.toLowerCase() + '_index';

        this.$table.provider = results;

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( index, r );
            break;
          }
        }  
        
        store[this.dataType.toLowerCase()].set( results );        
      } );
    } else {
      const at = Date.now();

      record.id = uuidv4();
      record.createdAt = at;
      record.updatedAt = at;
      this.value = record;

      db[this.dataType].put( record )
      .then( () => db[this.dataType].orderBy( 'name' ).toArray() )
      .then( ( results ) => {
        const index = 'remote_' + this.dataType.toLowerCase() + '_index';

        this.$table.provider = results;

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( index, r );
            break;
          }
        }

        store[this.dataType.toLowerCase()].set( results );
      } );      
    }

    this._changed = false;
    this.readOnly = true;
    this.$controls.mode = AvocadoControls.ADD_EDIT;
  }  

  doTableChange( evt ) {
    if( this._changed ) {
      const response = confirm( 'Do you want to save changes?' );
    
      if( response ) {
        this.doResourceSave();
      }
    }

    this.readOnly = true;
    this.value = evt.detail.selectedItem === null ? null : evt.detail.selectedItem;      
    this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;

    const index = 'remote_' + this.dataType.toLowerCase() + '_index';

    if( evt.detail.selectedItem === null ) {
      window.localStorage.removeItem( index );
    } else {
      window.localStorage.setItem( index, evt.detail.selectedIndex );      
    }    
  }  

   // When attributes change
  _render() {
    const records = this.$table.provider === null ? 0 : this.$table.provider.length;
    this.$label.text = `${this.label === null ? 'Resource' : this.label} (${records})`;
    this.$helper.text = this.helper;    

    this.$name.readOnly = this.readOnly;    
    this.$name.value = this._value === null ? null : this._value.name;
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
    this._upgrade( 'dataType' );      
    this._upgrade( 'helper' );            
    this._upgrade( 'hidden' );    
    this._upgrade( 'hideHeader' );
    this._upgrade( 'label' );        
    this._upgrade( 'provider' );                
    this._upgrade( 'readOnly' );                
    this._upgrade( 'value' );     
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'data-type',
      'helper',
      'hidden',
      'hide-header',
      'label',
      'read-only'
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

  get provider() {
    return this.$table.provider;
  }

  set provider( data ) {
    this.$table.provider = data;
  }

  get value() {
    return this._value;
  }

  set value( data ) {
    this._value = data;
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

  get dataType() {
    if( this.hasAttribute( 'data-type' ) ) {
      return this.getAttribute( 'data-type' );
    }

    return null;
  }

  set dataType( value ) {
    if( value !== null ) {
      this.setAttribute( 'data-type', value );
    } else {
      this.removeAttribute( 'data-type' );
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

  get hideHeader() {
    return this.hasAttribute( 'hide-header' );
  }

  set hideHeader( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'hide-header' );
      } else {
        this.setAttribute( 'hide-header', '' );
      }
    } else {
      this.removeAttribute( 'hide-header' );
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
}

window.customElements.define( 'arm-resource', RemoteResource );
