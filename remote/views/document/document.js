import AvocadoHBox from "../../../containers/hbox.js";
import AvocadoVBox from "../../../containers/vbox.js";

import AvocadoColumn from "../../../controls/column.js";
import AvocadoIcon from "../../../controls/icon.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoLabel from "../../../controls/label.js";
import AvocadoTable from "../../../controls/table.js";

import AvocadoControls from "../../../comp/controls.js";
import AvocadoNotes from "../../../comp/notes.js";

import RemoteDocumentItemRenderer from "./document-item-renderer.js";

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";
import { db } from "../../db.js";

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
          id="search"
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
    this._created = false;
    this._data = null;
    this._updated = null;

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
    this.$controls.addEventListener( 'add', () => this.doControlsAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doControlsCancel() );
    this.$controls.addEventListener( 'delete', () => this.doControlsDelete() );
    this.$controls.addEventListener( 'edit', () => this.doControlsEdit() );
    this.$controls.addEventListener( 'save', () => this.doControlsSave() );    
    this.$name = this.shadowRoot.querySelector( '#name' );    
    this.$name.addEventListener( 'input', () => this._changed = true );    
    this.$content = this.shadowRoot.querySelector( 'adc-notes' );
    this.$search = this.shadowRoot.querySelector( '#search' );
    this.$search.addEventListener( 'input', ( evt ) => this.doSearchInput( evt ) );
    this.$search.addEventListener( 'clear', ( evt ) => this.doSearchClear( evt ) );       
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) ); 
    this.$table.selectedItemsCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;        
    this.$tags = this.shadowRoot.querySelector( '#tags' );                   
    
    this.doDocumentLoad();
  }

  doControlsAdd() {
    window.localStorage.removeItem( 'remote_document_id' );

    this.$table.selectedItems = null;
    this.value = null;
    this.readOnly = false;
    this.$name.focus();    
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;    
  }

  doControlsCancel() {
    const id = window.localStorage.getItem( 'remote_document_id' );
    
    this.readOnly = true;    

    if( id === null ) {
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;
    } else {
      db.Document.where( {id: id} ).first()
      .then( ( item ) => {
        this.value = item;
        this.$controls.mode = AvocadoControls.ADD_EDIT;        
      } );
    }
  }  

  doControlsDelete() {
    const response = confirm( `Delete ${this.value.subject}?` );

    if( response ) {
      const id = window.localStorage.getItem( 'remote_document_id' );
      
      window.localStorage.removeItem( 'remote_document_id' );      

      db.Document.delete( id )
      .then( () => db.Document.orderBy( 'name' ).toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Documents (${results.length})`;      
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
      this.$name.error = 'Document name is a required field.';
      this.$name.invalid = true;
      return;
    } else {
      this.$name.error = null;
      this.$name.invalid = false;
    }

    const record = Object.assign( {}, this.value );

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = window.localStorage.getItem( 'remote_document_id' );
      record.createdAt = this._created;
      record.updatedAt = this._updated = Date.now();

      db.Document.put( record )
      .then( () => db.Document.orderBy( 'name' ).toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Documents (${results.length})`;      
        this.$table.provider = results;
        this.$table.selectedItems = [{id: record.id}];
      } );
    } else {
      const at = Date.now();
      const id = uuidv4();

      window.localStorage.setItem( 'remote_document_id', id );

      record.id = id;
      record.createdAt = this._created = at;
      record.updatedAt = this._updated = at;

      db.Document.put( record )
      .then( () => db.Document.orderBy( 'name' ).toArray() )
      .then( ( results ) => {
        this.$column.hederText = `Documents (${results.length})`;              
        this.$table.provider = results;     
        this.$table.selectedItems = [{id: record.id}];
      } );            
    }

    this.readOnly = true;
    this.$controls.mode = AvocadoControls.ADD_EDIT;
  }  

  doDocumentLoad() {
    this.readOnly = true;

    db.Document.orderBy( 'name' ).toArray()
    .then( ( docs ) => {
      this.$column.headerText = `Documents (${docs.length})`;      
      this.$table.provider = docs;  

      const id = window.localStorage.getItem( 'remote_document_id' );

      if( id === null ) {
        this.value = null;
        this.$controls.mode = AvocadoControls.ADD_ONLY;        
      } else {
        this.$table.selectedItems = [{id: id}];      
        db.Document.where( {id: id} ).first()
        .then( ( item ) => {
          this.value = item;
          this.$controls.mode = item === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;
        } );
      }
    } );    
  }  

  doSearchClear() {
    db.Document.orderBy( 'name' ).toArray()
    .then( ( results ) => {
      this.$column.headerText = `Documents (${results.length})`;      
      this.$table.provider = results;    

      const id = window.localStorage.getItem( 'remote_document_id' );

      if( id !== null ) {
        this.$table.selectedItems = [{id: id}];
      } else {
        this.$table.selectedItems = null;
      }
    } );          
  }  

  doSearchInput() {
    if( this.$controls.mode === AvocadoControls.CANCEL_SAVE || this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      const response = confirm( 'Do you want to save changes?' );
    
      if( response ) {
        this.$search.value = null;
        this.doControlsSave();
      }
    }

    this.$table.selectedItems = null;
    window.localStorage.removeItem( 'remote_document_id' );

    db.Document.orderBy( 'name' ).toArray()
    .then( ( results ) => {
      if( this.$search.value === null ) {
        this.doSearchClear();
        return;
      }

      if( results !== null ) {
        this.$table.provider = results.filter( ( value ) => {
          const term = this.$search.value.toLowerCase();          
  
          let name = false;
          let content = false;
  
          if( value.name.toLowerCase().indexOf( term ) >= 0 )
            name = true;
  
          if( value.content !== null )
            if( value.content.toLowerCase().indexOf( term ) >= 0 )
              content = true;
    
          if( name || content )
            return true;
          
          return false;
        } );
      }

      this.$column.headerText = `Documents (${this.$table.provider === null ? 0 : this.$table.provider.length})`;              
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
      window.localStorage.removeItem( 'remote_document_id' );
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;      
    } else {
      window.localStorage.setItem( 'remote_document_id', evt.detail.selectedItem.id );
      db.Document.where( {id: evt.detail.selectedItem.id} ).first()
      .then( ( item ) => {
        this.value = item;
        console.log( item );
      } );
      this.$controls.mode = AvocadoControls.ADD_EDIT;      
    }
  }

  _render() {
    this.$name.readOnly = this.readOnly;
    this.$content.readOnly = this.readOnly;
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
    return {
      createdAt: this._created,
      updatedAt: this._updated,
      name: this.$name.value,
      content: this.$content.value
    };
  }

  set value( data ) {
    if( data === null ) {
      this._created = null;
      this._updated = null;
      this.$name.value = null;
      this.$content.value = null;
    } else {
      this._created = data.createdAt;
      this._updated = data.updatedAt;
      this.$name.value = data.name;
      this.$content.value = data.content;
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
