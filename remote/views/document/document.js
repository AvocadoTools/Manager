import AvocadoHBox from "../../../containers/hbox.js";
import AvocadoVBox from "../../../containers/vbox.js";

import AvocadoColumn from "../../../controls/column.js";
import AvocadoIcon from "../../../controls/icon.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoLabel from "../../../controls/label.js";

import AvocadoControls from "../../../comp/controls.js";
import AvocadoNotes from "../../../comp/notes.js";

import RemoteDocumentItemRenderer from "./document-item-renderer.js";

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";

import { db } from "../../db.js";
import { store } from "../../store.js";

export default class RemoteDocument extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-direction: row;
          position: relative;
          height: 100%;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        adc-hbox {
          gap: 16px;
          margin: 0 16px 0 16px;          
        }

        adc-hbox adc-input {
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-input[type=search]::part( error ) {
          display: none;
        }

        adc-input[type=search]::part( input ) {
          height: 48px;
        }        

        adc-input[type=search]::part( field ) {
          border-bottom: none;
        }        

        adc-table {
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-textarea {
          flex-basis: 0;
          flex-grow: 1;
          margin: 0 16px 0 16px;
        }

        adc-vbox:nth-of-type( 1 ) {
          background-color: #f4f4f4;          
          min-width: 300px;
        }

        adc-vbox:nth-of-type( 2 ) {
          flex-basis: 0;
          flex-grow: 1;          
          padding: 16px 0 0 0;
        }        

        adc-notes {
          padding: 0 16px 16px 16px;
        }

        adc-vbox[slot=empty] {
          align-items: center;
          justify-content: center;
        }

        adc-vbox[slot=empty] adc-label {
          --label-color: #525252;
        }        
      </style>
      <adc-vbox>
        <adc-input 
          placeholder="Search people" 
          type="search">
          <adc-icon name="search" slot="prefix"></adc-icon>
        </adc-input>
        <adc-table selectable sortable>
          <adc-column 
            header-text="Documents"
            item-renderer="arm-document-item-renderer" 
            sortable>
          </adc-column>
          <adc-vbox slot="empty">
            <adc-label>No documents made yet.</adc-label>
          </adc-vbox>
        </adc-table>
      </adc-vbox>      
      <adc-vbox>
        <adc-hbox>
          <adc-input 
            id="name"
            label="Name" 
            placeholder="Name">
          </adc-input>
          <adc-input 
            id="tags"
            label="Tags" 
            placeholder="Tags"
            read-only>
          </adc-input>                       
        </adc-hbox> 
        <adc-notes placeholder="Content" monospace></adc-notes>
        <adc-controls></adc-controls>
      </adc-vbox>
    `;

    // Private
    this._changed = false;
    this._data = null;
    this._value = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$column = this.shadowRoot.querySelector( 'adc-column' );
    this.$column.sortCompareFunction = ( a, b ) => {
      if( a.name > b.name ) return 1;
      if( a.name < b.name ) return -1;
      return 0;
    };    
    this.$controls = this.shadowRoot.querySelector( 'adc-controls' );
    this.$controls.addEventListener( 'add', () => this.doDocumentAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doDocumentCancel() );
    this.$controls.addEventListener( 'delete', () => this.doDocumentDelete() );
    this.$controls.addEventListener( 'edit', () => this.doDocumentEdit() );
    this.$controls.addEventListener( 'save', () => this.doDocumentSave() );    
    this.$name = this.shadowRoot.querySelector( '#name' );    
    this.$name.addEventListener( 'input', () => this._changed = true );    
    this.$notes = this.shadowRoot.querySelector( 'adc-notes' );
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) ); 
    this.$tags = this.shadowRoot.querySelector( '#tags' );                   
    
    // State
    const document_index = window.localStorage.getItem( 'remote_document_index' ) === null ? null : parseInt( window.localStorage.getItem( 'remote_document_index' ) );

    // Read
    db.Document.orderBy( 'updatedAt' ).reverse().toArray()
    .then( ( results ) => {
      this.$column.headerText = `Documents (${results.length})`;            
      this.$table.provider = results;      
      this.$table.selectedIndex = document_index === null ? null : document_index;      

      this.readOnly = true;
      this.value = document_index === null ? null : results[document_index];      
      this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;      
      
      store.document.set( results );
    } );    
  }

  clear() {
    this.$name.error = null;
    this.$name.invalid = false;
    this.$name.value = null;
    this.$tags.value = null;
    this.$notes.value = null;        
  }

  doDocumentAdd() {
    this.$table.selectedIndex = null;
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;
    this.value = null;
    this.clear();
    this._changed = false;
    this.readOnly = false;
    this.$name.focus();
  }  

  doDocumentCancel() {
    if( this._changed ) {
      const response = confirm( 'Do you want to save changes?' );
      
      if( response ) {
        this.doDocumentSave();
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

  doDocumentDelete() {
    const id = this._value.id;    
    const response = confirm( `Delete ${this._value.name}?` );

    if( response ) {
      this.clear();
      this.value = null;
      this.$table.selectedIndex = null;
      window.localStorage.removeItem( 'remote_document_index' );
      this._changed = false;
      this.readOnly = true;
      this.$controls.mode = AvocadoControls.ADD_ONLY;

      db.Document.delete( id )
      .then( () => db.Document.orderBy( 'updatedAt' ).reverse().toArray() )
      .then( ( results ) => {
        this.$column.innerText = `Documents (${results.length})`;              
        this.$table.provider = results;        
        store.document.set( results );
      } );          
    }
  }

  doDocumentEdit() {
    this._changed = false;
    this.readOnly = false;
    this.$controls.mode = this._value === null ? AvocadoControls.ADD_EDIT : AvocadoControls.DELETE_CANCEL_SAVE;
    this.$name.focus();
  }  

  doDocumentSave() {
    if( this.$name.value === null ) {
      this.$name.error = 'A name is the only required field.';
      this.$name.invalid = true;
      return;
    } else {
      this.$name.error = null;
      this.$name.invalid = false;
    }

    const record = {
      name: this.$name.value,
      tags: this.$tags.value,
      notes: this.$notes.value
    };  

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = this.value.id;
      record.createdAt = this.value.createdAt;
      record.updatedAt = Date.now();
      this.value = record;                

      db.Document.put( record )
      .then( () => db.Document.orderBy( 'updatedAt' ).reverse().toArray() )
      .then( ( results ) => {   
        this.$table.provider = results;

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$column.innerText = `Documents (${results.length})`;                          
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'remote_document_index', r );
            break;
          }
        }

        store.document.set( results );
      } );
    } else {
      const at = Date.now();

      record.id = uuidv4();
      record.createdAt = at;
      record.updatedAt = at;
      this.value = record;

      db.Document.put( record )
      .then( () => db.Document.orderBy( 'updatedAt' ).reverse().toArray() )
      .then( ( results ) => {
        this.$table.provider = results;     

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$column.innerText = `Documents (${results.length})`;                          
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'remote_document_index', r );
            break;
          }
        }

        store.document.set( results );
      } );            
    }

    this._changed = false;
    this.readOnly = true;
    this.$controls.mode = AvocadoControls.ADD_EDIT;
  }  

  doTableChange( evt ) {
    if( this._changed && !this.readOnly ) {
      const response = confirm( 'Do you want to save changes?' );
    
      if( response ) {
        this.doDocumentSave();
      }
    }

    this.readOnly = true;
    this.value = evt.detail.selectedItem === null ? null : evt.detail.selectedItem;      
    this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;

    if( evt.detail.selectedItem === null ) {
      window.localStorage.removeItem( 'remote_document_index' );
    } else {
      window.localStorage.setItem( 'remote_document_index', evt.detail.selectedIndex );      
    }
  }  

   // When attributes change
  _render() {
    this.$name.readOnly = this.readOnly;
    // this.$tags.readOnly = this.readOnly;    
    this.$notes.readOnly = this.readOnly;

    this.$name.value = this._value === null ? null : this._value.name;
    this.$notes.value = this._value === null ? null : this._value.notes;
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
    this._upgrade( 'readOnly' );    
    this._upgrade( 'value' );        
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'hidden',
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
    return this._value;
  }

  set value( data ) {
    this._value = data === null ? null : Object.assign( {}, data );
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

window.customElements.define( 'arm-document', RemoteDocument );
