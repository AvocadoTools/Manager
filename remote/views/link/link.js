import AvocadoHBox from "../../../containers/hbox.js";
import AvocadoVBox from "../../../containers/vbox.js";

import AvocadoColumn from "../../../controls/column.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoLabel from "../../../controls/label.js";
import AvocadoLink from "../../../controls/link.js";
import AvocadoSelect from "../../../controls/select.js";
import AvocadoTable from "../../../controls/table.js";

import AvocadoControls from "../../../comp/controls.js";

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";
import { db } from "../../db.js";

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
            style="min-width: 200px;">
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
        id="search"
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
    this.$description = this.shadowRoot.querySelector( '#description' );            
    this.$location = this.shadowRoot.querySelector( 'adc-select' );
    this.$location.provider = [
      {id: 'Internal', name: 'Internal/protected'},
      {id: 'External', name: 'External/public'}
    ];
    this.$location.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;        
    this.$name = this.shadowRoot.querySelector( '#name' );    
    this.$name.addEventListener( 'input', () => this._changed = true );    
    this.$open = this.shadowRoot.querySelector( 'adc-link' );
    this.$search = this.shadowRoot.querySelector( '#search' );
    this.$search.addEventListener( 'input', ( evt ) => this.doSearchInput( evt ) );
    this.$search.addEventListener( 'clear', ( evt ) => this.doSearchClear( evt ) );         
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) ); 
    this.$table.selectedItemsCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;        
    this.$tags = this.shadowRoot.querySelector( '#tags' );                   
    this.$updated = this.shadowRoot.querySelector( 'adc-column:nth-of-type( 2 )' )
    this.$updated.labelFunction = ( item ) => {
      const update = new Date( item.updatedAt );
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
    this.$updated.sortCompareFunction = ( a, b ) => {
      if( a.updatedAt > b.updatedAt ) return 1;
      if( a.updatedAt < b.updatedAt ) return -1;
      return 0;
    };    
    this.$url = this.shadowRoot.querySelector( '#url' );   
    this.$url.addEventListener( 'input', () => this._changed = true );  

    this.doLinkLoad();
  }

  doControlsAdd() {
    window.localStorage.removeItem( 'remote_link_id' );

    this.$table.selectedItems = null;
    this.value = null;
    this.readOnly = false;
    this.$name.focus();    
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;    
  }  

  doControlsCancel() {
    const id = window.localStorage.getItem( 'remote_link_id' );
    
    this.readOnly = true;    

    if( id === null ) {
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;
    } else {
      db.Link.where( {id: id} ).first()
      .then( ( item ) => {
        this.value = item;
        this.$controls.mode = AvocadoControls.ADD_EDIT;        
      } );
    }
  }    

  doControlsDelete() {
    const response = confirm( `Delete ${this.value.name}?` );

    if( response ) {
      const id = window.localStorage.getItem( 'remote_link_id' );
      
      window.localStorage.removeItem( 'remote_link_index' );      

      db.Link.delete( id )
      .then( () => db.Link.orderBy( 'name' ).toArray() )
      .then( ( results ) => {
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

    const record = Object.assign( {}, this.value );

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = window.localStorage.getItem( 'remote_link_id' );
      record.createdAt = this._created;
      record.updatedAt = this._updated = Date.now();

      db.Link.put( record )
      .then( () => db.Link.orderBy( 'name' ).toArray() )
      .then( ( results ) => {
        this.$table.provider = results;
        this.$table.selectedItems = [{id: record.id}];
      } );
    } else {
      const at = Date.now();
      const id = uuidv4();

      window.localStorage.setItem( 'remote_link_id', id );

      record.id = id;
      record.createdAt = this._created = at;
      record.updatedAt = this._updated = at;

      db.Link.put( record )
      .then( () => db.Link.orderBy( 'name' ).toArray() )
      .then( ( results ) => {
        this.$table.provider = results;     
        this.$table.selectedItems = [{id: record.id}];
      } );            
    }

    this.readOnly = true;
    this.$controls.mode = AvocadoControls.ADD_EDIT;
  }  

  doLinkLoad() {
    this.readOnly = true;

    db.Link.orderBy( 'name' ).toArray()
    .then( ( links ) => {
      this.$table.provider = links;  

      const id = window.localStorage.getItem( 'remote_link_id' );

      if( id === null ) {
        this.value = null;
        this.$controls.mode = AvocadoControls.ADD_ONLY;        
      } else {
        this.$table.selectedItems = [{id: id}];      
        db.Link.where( {id: id} ).first()
        .then( ( item ) => {
          this.value = item;
          this.$controls.mode = item === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;
        } );
      }
    } );    
  }  

  doSearchClear() {
    db.Link.orderBy( 'name' ).toArray()
    .then( ( results ) => {
      this.$table.provider = results;    

      const id = window.localStorage.getItem( 'remote_link_id' );

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
    window.localStorage.removeItem( 'remote_link_id' );

    db.Link.orderBy( 'name' ).toArray()
    .then( ( results ) => {
      if( this.$search.value === null ) {
        this.doSearchClear();
        return;
      }

      if( results !== null ) {
        this.$table.provider = results.filter( ( value ) => {
          const term = this.$search.value.toLowerCase();          
  
          let name = false;
          let description = false;
          let url = false;
  
          if( value.name.toLowerCase().indexOf( term ) >= 0 )
            name = true;
  
          if( value.description !== null )
            if( value.description.toLowerCase().indexOf( term ) >= 0 )
              description = true;
  
          if( value.url.toLowerCase().indexOf( term ) >= 0 )
            url = true;              

          if( name || description || url )
            return true;
          
          return false;
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
      window.localStorage.removeItem( 'remote_link_id' );
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;      
    } else {
      window.localStorage.setItem( 'remote_link_id', evt.detail.selectedItem.id );
      db.Link.where( {id: evt.detail.selectedItem.id} ).first()
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
    this.$location.readOnly = this.readOnly;
    this.$description.readOnly = this.readOnly;
    this.$url.readOnly = this.readOnly;
    // this.$tags.readOnly = this.readOnly;
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
      location: this.$location.selectedItem === null ? null : this.$location.selectedItem.id,
      description: this.$description.value,
      url: this.$url.value
    };
  }

  set value( data ) {
    if( data === null ) {
      this._created = null;
      this._updated = null;
      this.$name.value = null;
      this.$location.selectedItem = null;
      this.$description.value = null;
      this.$url.value = null;
      this.$open.concealed = true;      
    } else {
      this._created = data.createdAt;
      this._updated = data.updatedAt;
      this.$name.value = data.name;
      this.$location.selectedItem = data.location === null ? null : {id: data.location};
      this.$description.value = data.description;
      this.$url.value = data.url;
      this.$open.concealed = data.url === null ? true : false;
      this.$open.href = data.url;
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

window.customElements.define( 'arm-link', RemoteLink );
