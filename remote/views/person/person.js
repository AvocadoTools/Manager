import AvocadoHBox from "../../../containers/hbox.js";
import AvocadoTabs from "../../../containers/tabs.js";
import AvocadoVBox from "../../../containers/vbox.js";

import AvocadoAvatar from "../../../controls/avatar.js";
import AvocadoColumn from "../../../controls/column.js";
import AvocadoIcon from "../../../controls/icon.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoLabel from "../../../controls/label.js";
import AvocadoLink from "../../../controls/link.js";
import AvocadoSpacer from "../../../controls/spacer.js";
import AvocadoTable from "../../../controls/table.js";

import AvocadoAttachments from "../../../comp/attachments.js";
import AvocadoControls from "../../../comp/controls.js";

import RemotePersonItemRenderer from "./person-item-renderer.js";
import RemotePersonProfile from "./profile.js";

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";

import { db } from "../../db.js";

export default class RemotePerson extends HTMLElement {
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
          --table-row-height: 56px;
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

        adc-vbox adc-hbox {
          gap: 16px;
          padding: 0 16px 0 16px;
        }

        adc-input:not( [type=search] ) {
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-spacer {
          --spacer-width: 61px;
        }

        adc-tabs {
          margin: 0 16px 16px 16px;
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
          size="lg" 
          type="search">
          <adc-icon name="search" slot="prefix"></adc-icon>
        </adc-input>
        <adc-table selectable sortable>
          <adc-column
            header-text="People"
            item-renderer="arm-person-item-renderer" 
            sortable>
          </adc-column>
          <adc-vbox slot="empty">
            <adc-label>No people added yet.</adc-label>
          </adc-vbox>
        </adc-table>
      </adc-vbox>
      <adc-vbox>
        <adc-hbox>
          <adc-avatar shorten>
            <adc-icon filled name="person" slot="icon"></adc-icon>
          </adc-avatar>
          <adc-input
            label="Full name"
            placeholder="Full name">
          </adc-input>
          <adc-input
            label="Email"
            placeholder="Email">
            <adc-link name="send">Send email</adc-link>
          </adc-input>
        </adc-hbox>
        <adc-hbox>
          <adc-spacer></adc-spacer>
          <adc-input
            label="Job title"
            placeholder="Job title">
          </adc-input>
          <adc-input
            label="Location"
            placeholder="Location">
            <adc-link name="weather"></adc-link>
          </adc-input>
        </adc-hbox>
        <adc-tabs>
          <arm-person-profile label="Profile"></arm-person-profile>
          <adc-attachments label="Attachments"></adc-attachments>
        </adc-tabs>
        <adc-controls></adc-controls>
      </adc-vbox>
    `;

    // Private
    this._created = null;
    this._data = null;
    this._updated = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$attach = this.shadowRoot.querySelector( 'adc-attachments' );
    this.$avatar = this.shadowRoot.querySelector( 'adc-avatar' );
    this.$column = this.shadowRoot.querySelector( 'adc-column' );
    this.$column.sortCompareFunction = ( a, b ) => {
      if( a.fullName > b.fullName ) return 1;
      if( a.fullName < b.fullName ) return -1;
      return 0;
    };
    this.$controls = this.shadowRoot.querySelector( 'adc-controls' );
    this.$controls.addEventListener( 'add', () => this.doControlsAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doControlsCancel() );
    this.$controls.addEventListener( 'delete', () => this.doControlsDelete() );
    this.$controls.addEventListener( 'edit', () => this.doControlsEdit() );
    this.$controls.addEventListener( 'save', () => this.doControlsSave() );
    this.$email = this.shadowRoot.querySelector( 'adc-hbox:nth-of-type( 1 ) adc-input:nth-of-type( 2 )' );
    this.$email.addEventListener( 'clear', () => {
      this.$send.concealed = true;
      this.$send.href = null;
    } );
    this.$email.addEventListener( 'input', () => {
      this.$send.concealed = this.$email.value === null ? true : false;
      this.$send.href = this.$email.value === null ? null : `mailto:${this.$email.value}`;
    } );
    this.$location = this.shadowRoot.querySelector( 'adc-hbox:nth-of-type( 2 ) adc-input:nth-of-type( 2 )' );
    this.$name = this.shadowRoot.querySelector( 'adc-hbox:nth-of-type( 1 ) adc-input:nth-of-type( 1 )' );
    this.$name.addEventListener( 'input', () => {
      if( this.$avatar.src === null ) {
        this.$avatar.label = this.$name.value;
      }
    } );
    this.$profile = this.shadowRoot.querySelector( 'arm-person-profile' );
    this.$search = this.shadowRoot.querySelector( '#search' );
    this.$search.addEventListener( 'input', ( evt ) => this.doSearchInput( evt ) );
    this.$search.addEventListener( 'clear', ( evt ) => this.doSearchClear( evt ) );    
    this.$send = this.shadowRoot.querySelector( 'adc-link[name=send]' ); 
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) );    
    this.$table.selectedItemsCompareFunction = ( provider, item ) => { return provider.id === item.id; };
    this.$title = this.shadowRoot.querySelector( 'adc-hbox:nth-of-type( 2 ) adc-input:nth-of-type( 1 )' );
    this.$weather = this.shadowRoot.querySelector( 'adc-link[name=weather]' );   

    this.doPersonLoad();
  }

  doControlsAdd() {
    window.localStorage.removeItem( 'remote_person_id' );

    this.$table.selectedItems = null;
    this.value = null;
    this.readOnly = false;
    this.$name.focus();    
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;    
  }

  doControlsCancel() {
    const id = window.localStorage.getItem( 'remote_person_id' );
    
    this.readOnly = true;    

    if( id === null ) {
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;
    } else {
      db.Person.where( {id: id} ).first()
      .then( ( item ) => {
        this.value = item;
        this.$controls.mode = AvocadoControls.ADD_EDIT;        
      } );
    }
  }

  doControlsDelete() {
    const response = confirm( `Delete ${this.value.fullName}?` );

    if( response ) {
      const id = window.localStorage.getItem( 'remote_person_id' );
      
      window.localStorage.removeItem( 'remote_person_index' );      

      db.Person.delete( id )
      .then( () => db.Person.orderBy( 'fullName' ).toArray() )
      .then( ( results ) => {
        this.$column.headerText = `People (${results.length})`;      
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
      this.$name.error = 'A full name is the only required field.';
      this.$name.invalid = true;
      return;
    } else {
      this.$name.error = null;
      this.$name.invalid = false;
    }

    const record = Object.assign( {}, this.value );

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = window.localStorage.getItem( 'remote_person_id' );
      record.createdAt = this._created;
      record.updatedAt = this._updated = Date.now();

      db.Person.put( record )
      .then( () => db.Person.orderBy( 'fullName' ).toArray() )
      .then( ( results ) => {
        this.$column.headerText = `People (${results.length})`;      
        this.$table.provider = results;
        this.$table.selectedItems = [{id: record.id}];
      } );
    } else {
      const at = Date.now();
      const id = uuidv4();

      window.localStorage.setItem( 'remote_person_id', id );

      record.id = id;
      record.createdAt = this._created = at;
      record.updatedAt = this._updated = at;

      db.Person.put( record )
      .then( () => db.Person.orderBy( 'fullName' ).toArray() )
      .then( ( results ) => {
        this.$column.hederText = `People (${results.length})`;              
        this.$table.provider = results;     
        this.$table.selectedItems = [{id: record.id}];
      } );            
    }

    this.readOnly = true;
    this.$controls.mode = AvocadoControls.ADD_EDIT;
  }

  doPersonLoad() {
    this.readOnly = true;

    db.Person.orderBy( 'fullName' ).toArray()
    .then( ( results ) => {
      this.$column.headerText = `People (${results.length})`;      
      this.$table.provider = results;      

      const id = window.localStorage.getItem( 'remote_person_id' );

      if( id === null ) {
        this.value = null;
        this.$controls.mode = AvocadoControls.ADD_ONLY;        
      } else {
        this.$table.selectedItems = [{id: id}];      
        db.Person.where( {id: id} ).first()
        .then( ( item ) => {
          this.value = item;
          this.$controls.mode = item === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;
        } );
      }
    } );     
  }
  
  doSearchClear() {
    db.Person.orderBy( 'fullName' ).toArray()
    .then( ( results ) => {
      this.$column.headerText = `People (${results.length})`;      
      this.$table.provider = results;    

      const id = window.localStorage.getItem( 'remote_person_id' );

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
    window.localStorage.removeItem( 'remote_meeting_id' );    

    db.Person.orderBy( 'fullName' ).toArray()
    .then( ( results ) => {
      if( this.$search.value === null ) {
        this.doSearchClear();
        return;
      }

      if( results !== null ) {
        this.$table.provider = results.filter( ( value ) => {
          const term = this.$search.value.toLowerCase();          

          let name = false;
          let notes = false;
          let title = false;

          if( value.fullName.toLowerCase().indexOf( term ) >= 0 )
            name = true;

          if( value.jobTitle !== null )
            if( value.jobTitle.toLowerCase().indexOf( term ) >= 0 )
              title = true;

          if( value.profile !== null ) {
            if( value.profile.notes !== null )
              if( value.profile.notes.toLowerCase().indexOf( term ) >= 0 )
                notes = true;             
          }
 
          if( name || title || notes )
            return true;
          
          return false;
        } );
      }

      this.$column.headerText = `People (${this.$table.provider === null ? 0 : this.$table.provider.length})`;
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
      window.localStorage.removeItem( 'remote_person_id' );
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;      
    } else {
      window.localStorage.setItem( 'remote_person_id', evt.detail.selectedItem.id );
      db.Person.where( {id: evt.detail.selectedItem.id} ).first()
      .then( ( item ) => {
        this.value = item;
        console.log( item );
      } );
      this.$controls.mode = AvocadoControls.ADD_EDIT;      
    }
  }

   // When attributes change
  _render() {
    this.$avatar.readOnly = this.readOnly;    
    this.$name.readOnly = this.readOnly;    
    this.$email.readOnly = this.readOnly;
    this.$title.readOnly = this.readOnly;
    this.$location.readOnly = this.readOnly;
    this.$profile.readOnly = this.readOnly;
    this.$attach.readOnly = this.readOnly;
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
      avatar: this.$avatar.value,
      fullName: this.$name.value,
      email: this.$email.value,
      jobTitle: this.$title.value,
      location: this.$location.value,
      profile: this.$profile.value,
      attachments: this.$attach.value
    };
  }

  set value( data ) {
    if( data === null ) {
      this._created = null;
      this._updated = null;
      this.$avatar.value = null;
      this.$avatar.label = null;
      this.$name.value = null;
      this.$email.value = null;
      this.$send.concealed = true;
      this.$send.href = null;
      this.$title.value = null;
      this.$location.value = null;
      this.$profile.value = null;
      this.$attach.value = null;
    } else {
      this._created = data.createdAt;
      this._updated = data.updatedAt;
      this.$avatar.value = data.avatar;
      this.$avatar.label = data.avatar === null ? data.fullName : null;
      this.$name.value = data.fullName;
      this.$email.value = data.email;
      this.$send.concealed = data.email === null ? true : false;
      this.$send.href = data.email === null ? null : `mailto:${data.email}`;    
      this.$title.value = data.jobTitle;
      this.$location.value = data.location;
      this.$profile.value = data.profile;
      this.$attach.value = data.attachments;
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

window.customElements.define( 'arm-person', RemotePerson );
