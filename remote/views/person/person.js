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
import { store } from "../../store.js";

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
    this._changed = false;
    this._data = null;
    this._value = null;

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
    this.$controls.addEventListener( 'add', () => this.doPersonAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doPersonCancel() );
    this.$controls.addEventListener( 'delete', () => this.doPersonDelete() );
    this.$controls.addEventListener( 'edit', () => this.doPersonEdit() );
    this.$controls.addEventListener( 'save', () => this.doPersonSave() );
    this.$email = this.shadowRoot.querySelector( 'adc-hbox:nth-of-type( 1 ) adc-input:nth-of-type( 2 )' );
    this.$location = this.shadowRoot.querySelector( 'adc-hbox:nth-of-type( 2 ) adc-input:nth-of-type( 2 )' );
    this.$name = this.shadowRoot.querySelector( 'adc-hbox:nth-of-type( 1 ) adc-input:nth-of-type( 1 )' );
    this.$name.addEventListener( 'blur', () => this.doNameChange() );    
    this.$name.addEventListener( 'input', () => this._changed = true );
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

    // State
    const person_index = window.localStorage.getItem( 'remote_person_index' ) === null ? null : parseInt( window.localStorage.getItem( 'remote_person_index' ) );

    // Read
    db.Person.orderBy( 'fullName' ).toArray()
    .then( ( results ) => {
      this.$column.headerText = `People (${results.length})`;      
      this.$table.provider = results;      
      this.$table.selectedIndex = person_index === null ? null : person_index;      

      this.readOnly = true;
      this.value = person_index === null ? null : results[person_index];      
      this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;      
      
      store.person.set( results );
    } );
  }

  clear() {
    this.$avatar.clear();
    this.$name.error = null;
    this.$name.invalid = false;
    this.$name.value = null;
    this.$email.value = null;
    this.$send.concealed = true;
    this.$title.value = null;
    this.$location.value = null;
    this.$weather.label = null;
    this.$profile.clear();
  }

  doNameChange() {
    if( this.$avatar.src === null ) {
      this.$avatar.label = this.$name.value;
    }
  }

  doPersonAdd() {
    this.$table.selectedIndex = null;
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;
    this.value = null;
    this.clear();
    this._changed = false;
    this.readOnly = false;
    this.$name.focus();
  }

  doPersonCancel() {
    if( this._changed ) {
      const response = confirm( 'Do you want to save changes?' );
      
      if( response ) {
        this.doPersonSave();
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

  doPersonDelete() {
    const id = this._value.id;    
    const response = confirm( `Delete ${this._value.fullName}?` );

    if( response ) {
      this.clear();
      this.value = null;
      this.$table.selectedIndex = null;
      window.localStorage.removeItem( 'remote_person_index' );
      this._changed = false;
      this.readOnly = true;
      this.$controls.mode = AvocadoControls.ADD_ONLY;

      db.Person.delete( id )
      .then( () => db.Person.orderBy( 'fullName' ).toArray() )
      .then( ( results ) => {
        this.$column.headerText = `People (${results.length})`;      
        this.$table.provider = results;        
        store.person.set( results );
      } );          
    }
  }
  
  doPersonEdit() {
    this._changed = false;
    this.readOnly = false;
    this.$controls.mode = this._value === null ? AvocadoControls.ADD_EDIT : AvocadoControls.DELETE_CANCEL_SAVE;
    this.$name.focus();
  }

  doPersonSave() {
    if( this.$name.value === null ) {
      this.$name.error = 'A full name is the only required field.';
      this.$name.invalid = true;
      return;
    } else {
      this.$name.error = null;
      this.$name.invalid = false;
    }

    const record = {
      avatar: this.$avatar.src,
      fullName: this.$name.value,
      email: this.$email.value,
      jobTitle: this.$title.value,
      location: this.$location.value,
      startAt: this.$profile.start === null ? null : this.$profile.start.getTime(),
      ptoAt: this.$profile.pto === null ? null : this.$profile.pto.getTime(),
      bornAt: this.$profile.birth === null ? null : this.$profile.birth.getTime(),
      spouse: this.$profile.spouse,
      anniversaryAt: this.$profile.anniversary === null ? null : this.$profile.anniversary.getTime(),
      family: this.$profile.family,
      notes: this.$profile.notes
    };  

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = this.value.id;
      record.createdAt = this.value.createdAt;
      record.updatedAt = Date.now();
      this.value = record;                

      db.Person.put( record )
      .then( () => db.Person.orderBy( 'fullName' ).toArray() )
      .then( ( results ) => {
        this.$column.headerText = `People (${results.length})`;      
        this.$table.provider = results;

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'remote_person_index', r );
            break;
          }
        }

        store.person.set( results );
      } );
    } else {
      const at = Date.now();

      record.id = uuidv4();
      record.createdAt = at;
      record.updatedAt = at;
      this.value = record;

      db.Person.put( record )
      .then( () => db.Person.orderBy( 'fullName' ).toArray() )
      .then( ( results ) => {
        this.$column.hederText = `People (${results.length})`;              
        this.$table.provider = results;     

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'remote_person_index', r );
            break;
          }
        }

        store.person.set( results );
      } );            
    }

    this._changed = false;
    this.readOnly = true;
    this.$controls.mode = AvocadoControls.ADD_EDIT;
  }
  
  doSearchClear() {
    db.Person.orderBy( 'fullName' ).toArray()
    .then( ( results ) => {
      this.$column.headerText = `People (${results.length})`;      
      this.$table.provider = results;    

      if( this.value !== null ) {
        this.$table.selectedItem = this.value;          
        window.localStorage.setItem( 'remote_person_index', this.$table.selectedIndex );
      } else {
        window.localStorage.removeItem( 'remote_person_index' );
      }
    } );          
  }

  doSearchInput() {
    if( this._changed && !this.readOnly ) {
      const response = confirm( 'Do you want to save changes?' );
    
      if( response ) {
        this.$search.value = null;
        this.doPersonSave();
      }
    }

    this.$table.selectedIndex = null;

    db.Person.orderBy( 'fullName' ).toArray()
    .then( ( results ) => {
      if( this.$search.value === null ) {
        this.doSearchClear();
        return;
      }

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

        if( value.notes !== null )
          if( value.notes.toLowerCase().indexOf( term ) >= 0 )
            notes = true;              

        if( name || title || notes )
          return true;
        
        return false;
      } );

      this.$column.headerText = `People (${this.$table.provider.length})`;
    } );    
  }  

  doTableChange( evt ) {
    if( this._changed && !this.readOnly ) {
      const response = confirm( 'Do you want to save changes?' );
    
      if( response ) {
        this.doPersonSave();
      }
    }

    this.readOnly = true;
    this.value = evt.detail.selectedItem === null ? null : evt.detail.selectedItem;      
    this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;

    if( evt.detail.selectedItem === null ) {
      window.localStorage.removeItem( 'remote_person_index' );
    } else {
      window.localStorage.setItem( 'remote_person_index', evt.detail.selectedIndex );      
    }
  }

   // When attributes change
  _render() {
    this.$attach.readOnly = this.readOnly;
    this.$attach.label = 'Attachments (0)';
    this.$avatar.readOnly = this.readOnly;
    this.$email.readOnly = this.readOnly;
    this.$location.readOnly = this.readOnly;
    this.$name.readOnly = this.readOnly;
    this.$profile.readOnly = this.readOnly;
    this.$title.readOnly = this.readOnly;

    if( this._value === null ) {
      this.$avatar.clear();
      this.$send.concealed = true;
      this.$weather.concealed = true;
    } else {
      if( this._value.avatar === null ) {
        this.$avatar.label = this._value.fullName;
        this.$avatar.src = null;        
      } else {
        this.$avatar.label = null;
        this.$avatar.src = this._value.avatar;
      }

      this.$send.concealed = this._value.email === null ? true : false;
      this.$send.href = this._value.email === null ? null : `mailto:${this._value.email}`;
      
      this.$weather.concealed = this._value.location === null ? true : false;
    }

    console.log( this._value );
    
    this.$name.value = this._value === null ? null : this._value.fullName;
    this.$email.value = this._value === null ? null : this._value.email;        
    this.$title.value = this._value === null ? null : this._value.jobTitle;    
    this.$location.value = this._value === null ? null : this._value.location;    
    this.$profile.start = this._value === null ? null : this._value.startAt;
    this.$profile.pto = this._value === null ? null : this._value.ptoAt;    
    this.$profile.birth = this._value === null ? null : this._value.bornAt;    
    this.$profile.spouse = this._value === null ? null : this._value.spouse;    
    this.$profile.anniversary = this._value === null ? null : this._value.anniversaryAt;    
    this.$profile.family = this._value === null ? null : this._value.family;
    this.$profile.notes = this._value === null ? null : this._value.notes;        
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

window.customElements.define( 'arm-person', RemotePerson );
