import AvocadoHBox from "../../../containers/hbox.js";

import AvocadoColumn from "../../../controls/column.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoLabel from "../../../controls/label.js";
import AvocadoLink from "../../../controls/link.js";
import AvocadoSelect from "../../../controls/select.js";
import AvocadoTable from "../../../controls/table.js";

import AvocadoControls from "../../../comp/controls.js";

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";

import { db } from "../../db.js";
import { store } from "../../store.js";

export default class RemoteLink extends HTMLElement {
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
          height: 100%;
          padding: 16px;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        adc-hbox {
          gap: 16px;
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
          background-color: #f4f4f4;
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-controls {
          margin: 0 0 20px 0;
        }  
        
        adc-vbox[slot=empty] {
          align-items: center;
          flex-basis: 0;
          flex-grow: 1;
          justify-content: center;
        }

        adc-vbox[slot=empty] adc-label {
          --label-color: #525252;
        }        
      </style>
      <adc-hbox>
        <adc-hbox style="flex-basis: 0; flex-grow: 1;">
          <adc-input 
            id="name"
            label="Name" 
            placeholder="Name">
          </adc-input>
          <adc-select 
            id="location" 
            label="Location" 
            label-field="name" 
            style="min-width: 200px"">
          </adc-select>
        </adc-hbox>
        <adc-input 
          id="description"
          label="Description" 
          placeholder="Description">
        </adc-input>
      </adc-hbox>
      <adc-hbox>
        <adc-input 
          id="url"
          label="URL" 
          placeholder="URL">
          <adc-link>Open link</adc-link>
        </adc-input>              
        <adc-input 
          id="tags"
          label="Tags" 
          placeholder="Tags"
          read-only>
        </adc-input>                
      </adc-hbox>
      <adc-controls></adc-controls>
      <adc-input 
        placeholder="Search links" 
        type="search">
        <adc-icon name="search" slot="prefix"></adc-icon>
      </adc-input>
      <adc-table sortable selectable>
        <adc-column
          header-text="Name"
          label-field="name"
          sortable
          width="280">
        </adc-column>
        <adc-column 
          header-text="Last Updated" 
          sortable
          width="250">
        </adc-column>        
        <adc-column 
          header-text="Description"
          label-field="description">
        </adc-column>
        <adc-vbox slot="empty">
          <adc-label>No links saved yet.</adc-label>
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
    this.$column = this.shadowRoot.querySelector( 'adc-table adc-column:nth-of-type( 2 )' );
    this.$column.labelFunction = ( data ) => {
      const update = new Date( data.updatedAt );
      const date = new Intl.DateTimeFormat( navigator.language, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      } ).format( update );    
      const time = new Intl.DateTimeFormat( navigator.language, {
        hour: 'numeric',
        minute: 'numeric'
      } ).format( update );          
      return `${date} @ ${time}`;
    };
    this.$column.sortCompareFunction = ( a, b ) => {
      if( a.updatedAt > b.updatedAt ) return 1;
      if( a.updatedAt < b.updatedAt ) return -1;
      return 0;
    };    
    this.$controls = this.shadowRoot.querySelector( 'adc-controls' );
    this.$controls.addEventListener( 'add', () => this.doLinkAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doLinkCancel() );
    this.$controls.addEventListener( 'delete', () => this.doLinkDelete() );
    this.$controls.addEventListener( 'edit', () => this.doLinkEdit() );
    this.$controls.addEventListener( 'save', () => this.doLinkSave() );    
    this.$description = this.shadowRoot.querySelector( '#description' );            
    this.$location = this.shadowRoot.querySelector( '#location' );
    this.$location.provider = [
      {id: 1, name: 'Internal/protected'},
      {id: 0, name: 'External/public'}
    ];
    this.$name = this.shadowRoot.querySelector( '#name' );    
    this.$name.addEventListener( 'input', () => this._changed = true );    
    this.$open = this.shadowRoot.querySelector( 'adc-link' );
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) ); 
    this.$tags = this.shadowRoot.querySelector( '#tags' );                   
    this.$url = this.shadowRoot.querySelector( '#url' );   
    this.$url.addEventListener( 'input', () => this._changed = true );  
    
    // State
    const link_index = window.localStorage.getItem( 'remote_link_index' ) === null ? null : parseInt( window.localStorage.getItem( 'remote_link_index' ) );

    // Read
    db.Link.orderBy( 'name' ).toArray()
    .then( ( results ) => {
      this.$table.provider = results;      
      this.$table.selectedIndex = link_index === null ? null : link_index;      

      this.readOnly = true;
      this.value = link_index === null ? null : results[link_index];      
      this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;      
      
      store.link.set( results );
    } );    
  }

  clear() {
    this.$name.error = null;
    this.$name.invalid = false;
    this.$name.value = null;
    this.$url.error = null;
    this.$url.invalid = false;
    this.$url.value = null;
    this.$tags.value = null;        
  }

  doLinkAdd() {
    this.$table.selectedIndex = null;
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;
    this.value = null;
    this.clear();
    this._changed = false;
    this.readOnly = false;
    this.$name.focus();
  }  

  doLinkCancel() {
    if( this._changed ) {
      const response = confirm( 'Do you want to save changes?' );
      
      if( response ) {
        this.doLinkSave();
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

  doLinkDelete() {
    const id = this._value.id;    
    const response = confirm( `Delete ${this._value.name}?` );

    if( response ) {
      this.clear();
      this.value = null;
      this.$table.selectedIndex = null;
      window.localStorage.removeItem( 'remote_link_index' );
      this._changed = false;
      this.readOnly = true;
      this.$controls.mode = AvocadoControls.ADD_ONLY;

      db.Link.delete( id )
      .then( () => db.Link.orderBy( 'name' ).toArray() )
      .then( ( results ) => {
        this.$table.provider = results;        
        store.link.set( results );
      } );          
    }
  }

  doLinkEdit() {
    this._changed = false;
    this.readOnly = false;
    this.$controls.mode = this._value === null ? AvocadoControls.ADD_EDIT : AvocadoControls.DELETE_CANCEL_SAVE;
    this.$name.focus();
  }  

  doLinkSave() {
    if( this.$name.value === null ) {
      this.$name.error = 'Link name is a required field.';
      this.$name.invalid = true;
      return;
    } else {
      this.$name.error = null;
      this.$name.invalid = false;
    }

    if( this.$url.value === null ) {
      this.$url.error = 'Link URL is a required field.';
      this.$url.invalid = true;
      return;
    } else {
      this.$url.error = null;
      this.$url.invalid = false;
    }    

    const record = {
      name: this.$name.value,
      description: this.$description.value,
      internal: this.$location.value.id,
      url: this.$url.value,
      tags: this.$tags.value
    };  

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = this.value.id;
      record.createdAt = this.value.createdAt;
      record.updatedAt = Date.now();
      this.value = record;                

      db.Link.put( record )
      .then( () => db.Link.orderBy( 'name' ).toArray() )
      .then( ( results ) => {   
        this.$table.provider = results;

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'remote_link_index', r );
            break;
          }
        }

        store.link.set( results );
      } );
    } else {
      const at = Date.now();

      record.id = uuidv4();
      record.createdAt = at;
      record.updatedAt = at;
      this.value = record;

      db.Link.put( record )
      .then( () => db.Link.orderBy( 'name' ).toArray() )
      .then( ( results ) => {
        this.$table.provider = results;     

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'remote_link_index', r );
            break;
          }
        }

        store.link.set( results );
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
        this.doLinkSave();
      }
    }

    console.log( evt );

    this.readOnly = true;
    this.value = evt.detail.selectedItem === null ? null : evt.detail.selectedItem;      
    this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;

    if( evt.detail.selectedItem === null ) {
      window.localStorage.removeItem( 'remote_link_index' );
    } else {
      window.localStorage.setItem( 'remote_link_index', evt.detail.selectedIndex );      
    }
  }  

   // When attributes change
  _render() {
    this.$name.readOnly = this.readOnly;
    this.$location.readOnly = this.readOnly;
    this.$description.readOnly = this.readOnly;
    this.$open.concealed = this.value === null ? true : false;        
    this.$url.readOnly = this.readOnly;
    // this.$tags.readOnly = this.readOnly;

    this.$name.value = this._value === null ? null : this._value.name;    
    this.$description.value = this._value === null ? null : this._value.description;     
    this.$location.selectedIndex = this._value === null ? 0 : this._value.internal;         
    this.$url.value = this._value === null ? null : this._value.url;   
    this.$open.href = this._value === null ? null : this._value.url;     
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

window.customElements.define( 'arm-link', RemoteLink );
