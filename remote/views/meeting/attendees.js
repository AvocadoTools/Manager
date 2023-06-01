import AvocadoHBox from "../../../containers/hbox.js";

import AvocadoAvatar from "../../../controls/avatar.js";
import AvocadoButton from "../../../controls/button.js";
import AvocadoIcon from "../../../controls/icon.js";
import AvocadoColumn from "../../../controls/column.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoTable from "../../../controls/table.js";

import RemoteAttendeeItemRenderer from './attendee-item-renderer.js'

import { db } from "../../db.js";

export default class RemoteMeetingAttendees extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-basis: 0;
          flex-direction: column;
          flex-grow: 1;
          padding: 16px 16px 16px 16px;
          position: relative;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        div[id=divider] {
          align-items: center;
          background-color: #0f62fe;
          display: flex;
          flex-direction: row;
          height: 48px;
        }

        div[id=divider] div {
          background-color: #ffffff;
          height: 15px;
          width: 1px;
        }

        adc-avatar {
          align-self: start;
        }

        adc-button {
          margin: 0 0 20px 0;
        }

        adc-button[kind="secondary"]::part( button ) {
          padding: 0 35px 0 15px;
        }

        adc-button[disabled] adc-icon {
          --icon-color: #8d8d8d;
        }

        adc-hbox {
          align-items: flex-end;
          gap: 16px;
        }        

        adc-input {
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-vbox adc-hbox {
          height: 48px;
          justify-content: flex-end;
          min-height: 48px;
          transition: transform 150ms ease-in-out;
        }

        adc-vbox adc-hbox adc-button {
          margin: 0;
        }

        adc-vbox adc-hbox adc-input::part( error ) {
          display: none;
        }

        adc-vbox adc-hbox adc-input::part( input ) {
          height: 48px;
        }        

        adc-vbox adc-hbox adc-input::part( field ) {
          border-bottom: none;
        }

        adc-table {
          flex-basis: 0;
          flex-grow: 1;
        }        

        adc-vbox[id=header] {
          height: 48px;
          max-height: 48px;          
          min-height: 48px;
          overflow: hidden;
        }        

        adc-vbox[id=header] adc-hbox {
          gap: 0;
        }

        adc-vbox[id=header] adc-hbox:last-of-type {
          align-items: center;          
          background-color: #0f62fe;
          padding: 0 0 0 15px;
        }

        adc-vbox[id=header] adc-label {
          flex-basis: 0;
          flex-grow: 1;
          --label-color: #ffffff;
        }

        adc-vbox.selected adc-hbox:first-of-type {
          transform: translateY( 48px );
        }

        adc-vbox.selected adc-hbox:last-of-type {
          transform: translateY( -48px );
        }                

        adc-vbox[slot=empty] {
          align-items: center;
          background-color: #ffffff;
          flex-basis: 0;
          flex-grow: 1;
          justify-content: center;
        }

        adc-vbox[slot=empty] adc-label {
          --label-color: #525252;
        }                

        #cancel::part( button ) {
          padding: 0 15px 0 15px;
        }        
      </style>
      <adc-hbox>
        <adc-avatar light read-only shorten>
          <adc-icon filled name="person" slot="icon"></adc-icon>        
        </adc-avatar>
        <adc-select
          id="attendee"
          label="Attendee name"
          light
          label-field="fullName"
          placeholder="Attendee name"
          style="flex-basis: 0; flex-grow: 1;">
        </adc-select>        
        <adc-button kind="secondary" label="Add attendee" size="md">
        </adc-button>
      </adc-hbox>
      <adc-vbox id="header">
        <adc-hbox>
          <adc-input 
            placeholder="Filter by attendee name" 
            size="lg" 
            type="search">
            <adc-icon name="search" slot="prefix"></adc-icon>
          </adc-input>
          <adc-button id="all" label="Email all">
            <adc-icon name="mail" slot="suffix"></adc-icon>
          </adc-button>                    
        </adc-hbox>
        <adc-hbox>
          <adc-label>1 attendee selected</adc-label>
          <adc-button id="email" label="Email">
            <adc-icon name="mail" slot="suffix"></adc-icon>
          </adc-button>          
          <adc-button id="delete" label="Delete">
            <adc-icon name="delete" slot="suffix"></adc-icon>
          </adc-button>
          <div id="divider">
            <div></div>
          </div>
          <adc-button id="cancel" label="Cancel"></adc-button>
        </adc-hbox>      
      </adc-vbox>
      <adc-table light selectable sortable>
        <adc-column header-text="Attendee Name" item-renderer="arm-attendee-item-renderer" sortable></adc-column>
        <adc-vbox slot="empty">
          <adc-label>No attendees added yet.</adc-label>
        </adc-vbox>                             
      </adc-table>
    `;

    // Private
    this._data = null;
    this._index = null;
    this._people = [];    

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Element
    this.$all = this.shadowRoot.querySelector( '#all' );
    this.$attendee = this.shadowRoot.querySelector( 'adc-select' );
    this.$attendee.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;    
    this.$attendee.addEventListener( 'change', () => {
      db.Person.where( {id: this.$attendee.selectedItem.id} ).first()
      .then( ( item ) => {
        if( item !== null ) {
          this.$avatar.value = item.avatar;
          this.$avatar.label = item.fullName;
        }
      } );
    } );
    this.$avatar = this.shadowRoot.querySelector( 'adc-avatar' );
    this.$button = this.shadowRoot.querySelector( 'adc-button' );
    this.$button.addEventListener( 'click', () => {
      if( this.$attendee.value === null ) {
        this.$attendee.error = 'An attendee must be selected.';
        this.$attendee.invalid = true;
        return;
      } else {
        this.$attendee.error = null;
        this.$attendee.invalid = false;
      }

      if( this._people.findIndex( ( item ) => item.id === this.$attendee.selectedItem.id ? true : false ) >= 0 ) {
        this.$attendee.error = 'This attendee has already been added.';
        this.$attendee.invalid = true;
        return;
      } else {
        this.$attendee.error = null;
        this.$attendee.invalid = false;
      }      

      this._people.push( {
        id: this.$attendee.selectedItem.id,
        fullName: this.$attendee.selectedItem.fullName
      } );
      this.$avatar.value = null;
      this.$avatar.label = null;
      this.$attendee.selectedItem = null;
      this.label = `Attendees (${this._people.length})`;    
      this.$table.provider = this._people;                    
    } );
    this.$cancel  = this.shadowRoot.querySelector( '#cancel' );
    this.$cancel.addEventListener( 'click', () => {
      this.$table.selectedIndices = null;
      this.$header.classList.remove( 'selected' );
    } );
    this.$column = this.shadowRoot.querySelector( 'adc-column' );
    this.$column.sortCompareFunction = ( a, b ) => {
      if( a.fullName.toLowerCase() > b.fullName.toLowerCase() ) return 1;
      if( a.fullName.toLowerCase() < b.fullName.toLowerCase() ) return -1;
      return 0;
    };    
    this.$delete = this.shadowRoot.querySelector( '#delete' );
    this.$delete.addEventListener( 'click', () => {
      this.$header.classList.remove( 'selected' );
      this._people.splice( this._index, 1 );
      this.label = `Attendees (${this._people.length})`;    
      this._index = null;
      this.$header.classList.remove( 'selected' );  
      this.$table.selectedItems = null;
      this.$table.provider = this._people;
    } );    
    this.$header = this.shadowRoot.querySelector( 'adc-vbox' );
    this.$search = this.shadowRoot.querySelector( 'adc-input[type=search]' );
    this.$search.addEventListener( 'clear', () => {
      this.$table.provider = this._people;
    } );
    this.$search.addEventListener( 'input', ( evt ) => {
      if( evt.currentTarget.value === null ) {
        this.$table.provider = this._people;
      } else {
        this.$table.provider = this._people.filter( ( item ) => {
          return item.fullName.toLowerCase().indexOf( evt.currentTarget.value.toLowerCase() ) >= 0 ? true : false;
        } );
      }
    } );    
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => {
      this._index = evt.detail.selectedIndex;

      if( this.$table.selectedIndices.length > 0 ) {
        this.$header.classList.add( 'selected' );
      } else {
        this.$header.classList.remove( 'selected' );
      }
    } );    

    this.doAttendeeLoad();
  }

  doAttendeeLoad() {
    this.readOnly = true;
    db.Person.orderBy( 'fullName' ).toArray()
    .then( ( data ) => this.$attendee.provider = data );
  }  

  // When attributes change
  _render() {
    this.$all.disabled = this._people.length === 0 ? true : false;
    this.$attendee.readOnly = this.readOnly;
    this.$button.disabled = this.readOnly;
    this.$delete.hidden = this.readOnly;
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
    this._upgrade( 'disabled' );
    this._upgrade( 'helper' );
    this._upgrade( 'hidden' );
    this._upgrade( 'icon' );
    this._upgrade( 'label' );
    this._upgrade( 'readOnly' );
    this._upgrade( 'value' );    
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'disabled',
      'helper',
      'hidden',
      'icon',
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
    return this._people.length === 0 ? null : this._people;
  }

  set value( data ) {
    if( data === null ) {
      this._people = [];
    } else {
      this._people = [... data];
    }

    this.$avatar.label = null;
    this.$avatar.value = null;
    this.$attendee.selectedItem = null;
    this.$attendee.error = null;
    this.$attendee.invalid = false;
    this.$search.value = null;
    this.$header.classList.remove( 'selected' );
    this.$table.selectedItems = null;
    this.$table.provider = this._people;
    this.label = `Attendees (${this._people.length})`;
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

  get disabled() {
    return this.hasAttribute( 'disabled' );
  }

  set disabled( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'disabled' );
      } else {
        this.setAttribute( 'disabled', '' );
      }
    } else {
      this.removeAttribute( 'disabled' );
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

  get icon() {
    if( this.hasAttribute( 'icon' ) ) {
      return this.getAttribute( 'icon' );
    }

    return null;
  }

  set icon( value ) {
    if( value !== null ) {
      this.setAttribute( 'icon', value );
    } else {
      this.removeAttribute( 'icon' );
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

window.customElements.define( 'arm-meeting-attendees', RemoteMeetingAttendees );
