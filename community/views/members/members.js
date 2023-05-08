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

import AvocadoControls from "../../../comp/controls.js";

import CommunityMembersOverview from "./overview.js";

// import RemotePersonItemRenderer from "./person-item-renderer.js";

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";

import { db } from "../../db.js";
import { store } from "../../store.js";

export default class CommunityMembers extends HTMLElement {
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
          placeholder="Search members" 
          size="lg" 
          type="search">
          <adc-icon name="search" slot="prefix"></adc-icon>
        </adc-input>
        <adc-table selectable sortable>
          <adc-column
            header-text="People"
            item-renderer="acm-members-item-renderer" 
            sortable>
          </adc-column>
          <adc-vbox slot="empty">
            <adc-label>No members added yet.</adc-label>
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
        <adc-tabs>
          <acm-members-overview label="Overview"></acm-members-overview>
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
    this.$name = this.shadowRoot.querySelector( 'adc-hbox:nth-of-type( 1 ) adc-input:nth-of-type( 1 )' );
    this.$name.addEventListener( 'blur', () => this.doNameChange() );    
    this.$name.addEventListener( 'input', () => this._changed = true );
    this.$overview = this.shadowRoot.querySelector( 'acm-members-overview' );
    this.$search = this.shadowRoot.querySelector( '#search' );
    this.$search.addEventListener( 'input', ( evt ) => this.doSearchInput( evt ) );
    this.$search.addEventListener( 'clear', ( evt ) => this.doSearchClear( evt ) );    
    this.$send = this.shadowRoot.querySelector( 'adc-link[name=send]' ); 
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) );    
    this.$table.selectedItemsCompareFunction = ( provider, item ) => { return provider.id === item.id; };

    // State
    const members_index = window.localStorage.getItem( 'community_members_index' ) === null ? null : parseInt( window.localStorage.getItem( 'community_members_index' ) );

    // Read
    db.Members.orderBy( 'fullName' ).toArray()
    .then( ( results ) => {
      this.$column.headerText = `Members (${results.length})`;      
      this.$table.provider = results;      
      this.$table.selectedIndex = members_index === null ? null : members_index;      

      this.readOnly = true;
      this.value = members_index === null ? null : results[members_index];      
      this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;      
      
      store.members.set( results );
    } );
  }

  clear() {
    this.$avatar.clear();
    this.$name.error = null;
    this.$name.invalid = false;
    this.$name.value = null;
    this.$email.value = null;
    this.$send.concealed = true;
    this.$overview.clear();
  }

  doNameChange() {
    if( this.$avatar.src === null ) {
      this.$avatar.label = this.$name.value;
    }
  }

  doMembersAdd() {
    this.$table.selectedIndex = null;
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;
    this.value = null;
    this.clear();
    this._changed = false;
    this.readOnly = false;
    this.$name.focus();
  }

  doMembersCancel() {
    if( this._changed ) {
      const response = confirm( 'Do you want to save changes?' );
      
      if( response ) {
        this.doMembersSave();
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

  doMembersDelete() {
    const id = this._value.id;    
    const response = confirm( `Delete ${this._value.fullName}?` );

    if( response ) {
      this.clear();
      this.value = null;
      this.$table.selectedIndex = null;
      window.localStorage.removeItem( 'community_members_index' );
      this._changed = false;
      this.readOnly = true;
      this.$controls.mode = AvocadoControls.ADD_ONLY;

      db.Members.delete( id )
      .then( () => db.Members.orderBy( 'fullName' ).toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Members (${results.length})`;      
        this.$table.provider = results;        
        store.members.set( results );
      } );          
    }
  }
  
  doMembersEdit() {
    this._changed = false;
    this.readOnly = false;
    this.$controls.mode = this._value === null ? AvocadoControls.ADD_EDIT : AvocadoControls.DELETE_CANCEL_SAVE;
    this.$name.focus();
  }

  doMembersSave() {
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
      jobTitle: this.$overview.title,
      location: this.$overview.location
    };  

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = this.value.id;
      record.createdAt = this.value.createdAt;
      record.updatedAt = Date.now();
      this.value = record;                

      db.Members.put( record )
      .then( () => db.Members.orderBy( 'fullName' ).toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Members (${results.length})`;      
        this.$table.provider = results;

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'community_members_index', r );
            break;
          }
        }

        store.members.set( results );
      } );
    } else {
      const at = Date.now();

      record.id = uuidv4();
      record.createdAt = at;
      record.updatedAt = at;
      this.value = record;

      db.Members.put( record )
      .then( () => db.Members.orderBy( 'fullName' ).toArray() )
      .then( ( results ) => {
        this.$column.hederText = `Members (${results.length})`;              
        this.$table.provider = results;     

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'community_members_index', r );
            break;
          }
        }

        store.members.set( results );
      } );            
    }

    this._changed = false;
    this.readOnly = true;
    this.$controls.mode = AvocadoControls.ADD_EDIT;
  }
  
  doSearchClear() {
    db.Members.orderBy( 'fullName' ).toArray()
    .then( ( results ) => {
      this.$column.headerText = `Members (${results.length})`;      
      this.$table.provider = results;    

      if( this.value !== null ) {
        this.$table.selectedItem = this.value;          
        window.localStorage.setItem( 'community_members_index', this.$table.selectedIndex );
      } else {
        window.localStorage.removeItem( 'community_members_index' );
      }
    } );          
  }

  doSearchInput() {
    if( this._changed && !this.readOnly ) {
      const response = confirm( 'Do you want to save changes?' );
    
      if( response ) {
        this.$search.value = null;
        this.doMembersSave();
      }
    }

    this.$table.selectedIndex = null;

    db.Members.orderBy( 'fullName' ).toArray()
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

        if( name || title )
          return true;
        
        return false;
      } );

      this.$column.headerText = `Members (${this.$table.provider.length})`;
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
      window.localStorage.removeItem( 'community_members_index' );
    } else {
      window.localStorage.setItem( 'community_members_index', evt.detail.selectedIndex );      
    }
  }

   // When attributes change
  _render() {
    this.$avatar.readOnly = this.readOnly;
    this.$email.readOnly = this.readOnly;
    this.$name.readOnly = this.readOnly;
    this.$overview.readOnly = this.readOnly;

    if( this._value === null ) {
      this.$avatar.clear();
      this.$send.concealed = true;
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
    }
    console.log( this._value );
    this.$name.value = this._value === null ? null : this._value.fullName;
    this.$email.value = this._value === null ? null : this._value.email;        
    this.$overview.title = this._value === null ? null : this._value.jobTitle;
    this.$overview.location = this._value === null ? null : this._value.location;       
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

window.customElements.define( 'acm-members', CommunityMembers );
