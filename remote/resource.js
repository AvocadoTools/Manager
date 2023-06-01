import AvocadoVBox from "../containers/vbox.js";

import AvocadoColumn from "../controls/column.js";
import AvocadoInput from "../controls/input.js";
import AvocadoLabel from "../controls/label.js";
import AvocadoTable from "../controls/table.js";

import AvocadoControls from "../comp/controls.js";

import { v4 as uuidv4 } from "../lib/uuid-9.0.0.js";
import { db } from "./db.js";

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
          background-color: #f4f4f4;
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
    this._created = false;
    this._data = null;
    this._updated = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$controls = this.shadowRoot.querySelector( 'adc-controls' );
    this.$controls.addEventListener( 'add', () => this.doControlsAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doControlsCancel() );    
    this.$controls.addEventListener( 'delete', () => this.doControlsDelete() );        
    this.$controls.addEventListener( 'edit', () => this.doControlsEdit() );        
    this.$controls.addEventListener( 'save', () => this.doControlsSave() );        
    this.$helper = this.shadowRoot.querySelector( 'adc-label:last-of-type' );    
    this.$label = this.shadowRoot.querySelector( 'adc-label:first-of-type' );
    this.$name = this.shadowRoot.querySelector( 'adc-input' );
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) );  
    this.$table.selectedItemsCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;        

    /*
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
    */

    this.doResourceLoad();
  }

  doControlsAdd() {
    window.localStorage.removeItem( `remote_${this.dataType.toLowerCase()}_id` );

    this.$table.selectedItems = null;
    this.value = null;
    this.readOnly = false;
    this.$name.focus();    
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;    
  }  

  doControlsCancel() {
    const id = window.localStorage.getItem( `remote_${this.dataType.toLowerCase()}_id` );
    
    this.readOnly = true;    

    if( id === null ) {
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;
    } else {
      db[this.dataType].where( {id: id} ).first()
      .then( ( item ) => {
        this.value = item;
        this.$controls.mode = AvocadoControls.ADD_EDIT;        
      } );
    }
  }    

  doControlsDelete() {
    const response = confirm( `Delete ${this.value.name}?` );

    if( response ) {
      const id = window.localStorage.getItem( `remote_${this.dataType.toLowerCase()}_id` );
      
      window.localStorage.removeItem( `remote_${this.dataType.toLowerCase()}_id` );      

      db[this.dataType].delete( id )
      .then( () => db[this.dataType].orderBy( 'name' ).toArray() )
      .then( ( results ) => {
        this.$label.text = `${this.label} (${results.length})`;      
        this.$table.selectedItems = null;        
        this.$table.provider = results;        
      } );          

      this.value = null;
      this.readOnly = true;
      this.$controls.mode = AvocadoControls.ADD_ONLY;            
    }
  }

  doControlsEdit() {
    this.readOnly = false;    
    this.$name.focus();
    this.$controls.mode = AvocadoControls.DELETE_CANCEL_SAVE;    
  }

  doControlsSave() {
    if( this.$name.value === null ) {
      this.$name.error = 'Name is a required field.';
      this.$name.invalid = true;
      return;
    } else {
      this.$name.error = null;
      this.$name.invalid = false;
    }

    const record = Object.assign( {}, this.value );

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = window.localStorage.getItem( `remote_${this.dataType.toLowerCase()}_id` );
      record.createdAt = this._created;
      record.updatedAt = this._updated = Date.now();

      db[this.dataType].put( record )
      .then( () => db[this.dataType].orderBy( 'name' ).toArray() )
      .then( ( results ) => {
        this.$label.text = `${this.label} (${results.length})`;      
        this.$table.provider = results;
        this.$table.selectedItems = [{id: record.id}];
      } );
    } else {
      const at = Date.now();
      const id = uuidv4();

      window.localStorage.setItem( `remote_${this.dataType.toLowerCase()}_id`, id );

      record.id = id;
      record.createdAt = this._created = at;
      record.updatedAt = this._updated = at;

      db[this.dataType].put( record )
      .then( () => db[this.dataType].orderBy( 'name' ).toArray() )
      .then( ( results ) => {
        this.$label.text = `${this.label} (${results.length})`;              
        this.$table.provider = results;     
        this.$table.selectedItems = [{id: record.id}];
      } );            
    }

    this.readOnly = true;
    this.$controls.mode = AvocadoControls.ADD_EDIT;
  }  

  doResourceLoad() {
    // Database not ready
    if( db[this.dataType] === undefined ) return;

    this.readOnly = true;

    db[this.dataType].orderBy( 'name' ).toArray()
    .then( ( resources ) => {
      this.$label.text = `${this.label} (${resources.length})`;      
      this.$table.provider = resources;  

      const id = window.localStorage.getItem( `remote_${this.dataType.toLowerCase()}_id` );

      if( id === null ) {
        this.value = null;
        this.$controls.mode = AvocadoControls.ADD_ONLY;        
      } else {
        this.$table.selectedItems = [{id: id}];      
        db[this.dataType].where( {id: id} ).first()
        .then( ( item ) => {
          this.value = item;
          this.$controls.mode = item === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;
        } );
      }
    } );    
  }

  doTableChange( evt ) {
    if( this.$controls.mode === AvocadoControls.CANCEL_SAVE || this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      const response = confirm( 'Do you want to save changes?' );
    
      if( response ) {
        this.doControlsSave();
      }
    }

    this.readOnly = true;

    if( evt.detail.selectedItem === null ) {
      window.localStorage.removeItem( `remote_${this.dataType.toLowerCase()}_id` );
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;      
    } else {
      window.localStorage.setItem( `remote_${this.dataType.toLowerCase()}_id`, evt.detail.selectedItem.id );
      db[this.dataType].where( {id: evt.detail.selectedItem.id} ).first()
      .then( ( item ) => {
        this.value = item;
        console.log( item );
      } );
      this.$controls.mode = AvocadoControls.ADD_EDIT;      
    }
  }  

  // When attributes change
  _render() {
    this.$name.readOnly = this.readOnly;    
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

  get value() {
    return {
      createdAt: this._created,
      updatedAt: this._updated,
      name: this.$name.value
    };
  }

  set value( data ) {
    if( data === null ) {
      this._created = null;
      this._updated = null;
      this.$name.value = null;
      this.$name.error = null;
      this.$name.invalid = false;
    } else {
      this._created = data.createdAt;
      this._updated = data.updatedAt;
      this.$name.value = data.name;
      this.$name.error = null;
      this.$name.invalid = false;
    }
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
