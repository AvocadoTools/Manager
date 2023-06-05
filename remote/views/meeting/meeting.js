import AvocadoHBox from "../../../containers/hbox.js";
import AvocadoVBox from "../../../containers/vbox.js";

import AvocadoColumn from "../../../controls/column.js";
import AvocadoDatePicker from "../../../controls/date-picker.js";
import AvocadoIcon from "../../../controls/icon.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoLabel from "../../../controls/label.js";
import AvocadoSelect from "../../../controls/select.js";
import AvocadoTable from "../../../controls/table.js";
import AvocadoTabs from "../../../containers/tabs.js";

import AvocadoAttachments from "../../../comp/attachments.js";
import AvocadoControls from "../../../comp/controls.js";
import AvocadoNotes from "../../../comp/notes.js";

import RemoteMeetingActions from "./action-items.js";
import RemoteMeetingAttendees from "./attendees.js";
import RemoteMeetingItemRenderer from "./meeting-item-renderer.js";

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";
import { db } from "../../db.js";

export default class RemoteMeeting extends HTMLElement {
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

        adc-notes {
          padding: 16px;
        }
      </style>
      <adc-vbox>
        <adc-input 
          id="search"
          placeholder="Search meetings" 
          size="lg" 
          type="search">
          <adc-icon name="search" slot="prefix"></adc-icon>
        </adc-input>
        <adc-table selectable sortable>
          <adc-column 
            header-text="Meetings"
            item-renderer="arm-meeting-item-renderer" 
            sortable>
          </adc-column>
          <adc-vbox slot="empty">
            <adc-label>No meetings added yet.</adc-label>
          </adc-vbox>
        </adc-table>
      </adc-vbox>
      <adc-vbox>
        <adc-hbox>
          <adc-input
            label="Subject"
            name="subject"
            placeholder="Subject"
            style="flex-basis: 0; flex-grow: 2;">
          </adc-input>
          <adc-date-picker
            label="Date"
            placeholder="Date"
            style="flex-basis: 0; flex-grow: 1;">
          </adc-date-picker>
          <adc-input
            label="Time"
            name="time"
            placeholder="Time"
            style="flex-basis: 0; flex-grow: 1;">
          </adc-input>          
        </adc-hbox>
        <adc-hbox>
          <adc-select
            label="Organizer"
            label-field="fullName"
            name="organizer"
            placeholder="Organizer"
            style="flex-basis: 0; flex-grow: 1;">
          </adc-select>                                        
          <adc-select
            label="Type"
            label-field="name"
            name="type"
            placeholder="Type"
            style="flex-basis: 0; flex-grow: 1;">
          </adc-select>                              
          <adc-select
            label="Room"
            label-field="name"
            name="location"
            placeholder="Room"
            style="flex-basis: 0; flex-grow: 1;">
          </adc-select>                                        
        </adc-hbox>
        <adc-tabs>
          <adc-notes label="Agenda" light monospace></adc-notes>
          <arm-meeting-attendees label="Attendees (0)"></arm-meeting-attendees>
          <adc-notes label="Discussion" light monospace></adc-notes>
          <arm-meeting-actions label="Actions (0)"></arm-meeting-actions>
          <adc-attachments label="Attachments (0)"></adc-attachments>
        </adc-tabs>
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
    this.$actions = this.shadowRoot.querySelector( 'arm-meeting-actions' );
    this.$agenda = this.shadowRoot.querySelector( 'adc-tabs adc-notes:nth-of-type( 1 )' );
    this.$attachments = this.shadowRoot.querySelector( 'adc-attachments' );
    this.$attendees = this.shadowRoot.querySelector( 'arm-meeting-attendees' );
    this.$column = this.shadowRoot.querySelector( 'adc-column' );
    this.$column.sortCompareFunction = ( a, b ) => {
      if( a.startAt > b.startAt ) return 1;
      if( a.startAt < b.startAt ) return -1;
      return 0;
    };
    this.$controls = this.shadowRoot.querySelector( 'adc-controls' );
    this.$controls.addEventListener( 'add', () => this.doControlsAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doControlsCancel() );
    this.$controls.addEventListener( 'delete', () => this.doControlsDelete() );
    this.$controls.addEventListener( 'edit', () => this.doControlsEdit() );
    this.$controls.addEventListener( 'save', () => this.doControlsSave() );    
    this.$date = this.shadowRoot.querySelector( 'adc-date-picker' );
    this.$discussion = this.shadowRoot.querySelector( 'adc-tabs adc-notes:nth-of-type( 2 )' );
    this.$location = this.shadowRoot.querySelector( 'adc-select[name=location]' );
    this.$location.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;    
    this.$organizer = this.shadowRoot.querySelector( 'adc-select[name=organizer]' );    
    this.$organizer.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;    
    this.$search = this.shadowRoot.querySelector( '#search' );
    this.$search.addEventListener( 'input', ( evt ) => this.doSearchInput( evt ) );
    this.$search.addEventListener( 'clear', ( evt ) => this.doSearchClear( evt ) );     
    this.$subject = this.shadowRoot.querySelector( 'adc-input[name=subject]' );
    this.$tabs = this.shadowRoot.querySelector( 'adc-tabs' );
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) );
    this.$table.selectedItemsCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;    
    this.$type = this.shadowRoot.querySelector( 'adc-select[name=type]' );
    this.$type.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;
    this.$time = this.shadowRoot.querySelector( 'adc-input[name=time]' );

    this.doMeetingLoad();
  }

  formatTime( date ) {
    const formatted = new Intl.DateTimeFormat( navigator.language, {
      hour: 'numeric',
      hour12: false,
      minute: '2-digit'
    } ).format( date );    
    return formatted;    
  }

  doControlsAdd() {
    window.localStorage.removeItem( 'remote_meeting_id' );

    this.$table.selectedItems = null;
    this.value = null;
    this.readOnly = false;
    this.$subject.focus();    
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;    
  }  

  doControlsCancel() {
    const id = window.localStorage.getItem( 'remote_meeting_id' );
    
    this.readOnly = true;    

    if( id === null ) {
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;
    } else {
      db.Meeting.where( {id: id} ).first()
      .then( ( item ) => {
        this.value = item;
        this.$controls.mode = AvocadoControls.ADD_EDIT;        
      } );
    }
  }  

  doControlsDelete() {
    const response = confirm( `Delete ${this.value.subject}?` );

    if( response ) {
      const id = window.localStorage.getItem( 'remote_meeting_id' );
      
      window.localStorage.removeItem( 'remote_meeting_id' );      

      db.Meeting.delete( id )
      .then( () => db.Meeting.orderBy( 'startAt' ).toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Meetings (${results.length})`;      
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
    this.$subject.focus();
    this.$controls.mode = AvocadoControls.DELETE_CANCEL_SAVE;    
  }

  doControlsSave() {
    if( this.$subject.value === null ) {
      this.$subject.error = 'Subject is a required field.';
      this.$subject.invalid = true;
      return;
    } else {
      this.$subject.error = null;
      this.$subject.invalid = false;
    }

    if( this.$date.value === null ) {
      this.$date.error = 'Date is a required field.';
      this.$date.invalid = true;
      return;
    } else {
      this.$date.error = null;
      this.$date.invalid = false;
    }

    const record = Object.assign( {}, this.value );

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = window.localStorage.getItem( 'remote_meeting_id' );
      record.createdAt = this._created;
      record.updatedAt = this._updated = Date.now();

      db.Meeting.put( record )
      .then( () => db.Meeting.orderBy( 'startAt' ).toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Meetings (${results.length})`;      
        this.$table.provider = results;
        this.$table.selectedItems = [{id: record.id}];
      } );
    } else {
      const at = Date.now();
      const id = uuidv4();

      window.localStorage.setItem( 'remote_meeting_id', id );

      record.id = id;
      record.createdAt = this._created = at;
      record.updatedAt = this._updated = at;

      db.Meeting.put( record )
      .then( () => db.Meeting.orderBy( 'startAt' ).toArray() )
      .then( ( results ) => {
        this.$column.hederText = `Meetings (${results.length})`;              
        this.$table.provider = results;     
        this.$table.selectedItems = [{id: record.id}];
      } );            
    }

    this.readOnly = true;
    this.$controls.mode = AvocadoControls.ADD_EDIT;
  }  

  doMeetingLoad() {
    this.readOnly = true;

    db.Person.orderBy( 'fullName' ).toArray()
    .then( ( people ) => {
      this.$organizer.provider = people;
      return db.Type.orderBy( 'name' ).toArray();
    } )
    .then( ( types ) => {
      this.$type.provider = types;
      return db.Room.orderBy( 'name' ).toArray();
    } )
    .then( ( rooms ) => {
      this.$location.provider = rooms;
      return db.Meeting.orderBy( 'startAt' ).reverse().toArray();
    } )
    .then( ( meetings ) => {
      this.$column.headerText = `Meetings (${meetings.length})`;      
      this.$table.provider = meetings;  

      const id = window.localStorage.getItem( 'remote_meeting_id' );

      if( id === null ) {
        this.value = null;
        this.$controls.mode = AvocadoControls.ADD_ONLY;        
      } else {
        this.$table.selectedItems = [{id: id}];      
        db.Meeting.where( {id: id} ).first()
        .then( ( item ) => {
          this.value = item;
          this.$controls.mode = item === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;
        } );
      }
    } );    
  }

  doSearchClear() {
    db.Meeting.orderBy( 'startAt' ).toArray()
    .then( ( results ) => {
      this.$column.headerText = `Meetings (${results.length})`;      
      this.$table.provider = results;    

      const id = window.localStorage.getItem( 'remote_meeting_id' );

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

    db.Meeting.orderBy( 'startAt' ).toArray()
    .then( ( results ) => {
      if( this.$search.value === null ) {
        this.doSearchClear();
        return;
      }

      if( results !== null ) {
        this.$table.provider = results.filter( ( value ) => {
          const term = this.$search.value.toLowerCase();          
  
          let subject = false;
          let agenda = false;
          let discussion = false;
  
          if( value.subject.toLowerCase().indexOf( term ) >= 0 )
            subject = true;
  
          if( value.agenda !== null )
            if( value.agenda.toLowerCase().indexOf( term ) >= 0 )
              agenda = true;
  
          if( value.discussion !== null )
            if( value.discussion.toLowerCase().indexOf( term ) >= 0 )
              discussion = true;              
  
          if( subject || agenda || discussion )
            return true;
          
          return false;
        } );
      }

      this.$column.headerText = `Meetings (${this.$table.provider === null ? 0 : this.$table.provider.length})`;              
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
      window.localStorage.removeItem( 'remote_meeting_id' );
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;      
    } else {
      window.localStorage.setItem( 'remote_meeting_id', evt.detail.selectedItem.id );
      db.Meeting.where( {id: evt.detail.selectedItem.id} ).first()
      .then( ( item ) => {
        this.value = item;
        console.log( item );
      } );
      this.$controls.mode = AvocadoControls.ADD_EDIT;      
    }
  }

   // When attributes change
  _render() {
    this.$subject.readOnly = this.readOnly;
    this.$date.readOnly = this.readOnly;
    this.$time.readOnly = this.readOnly;
    this.$organizer.readOnly = this.readOnly;
    this.$type.readOnly = this.readOnly;
    this.$type.selectedCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;
    this.$location.readOnly = this.readOnly;
    this.$agenda.readOnly = this.readOnly;
    this.$attendees.readOnly = this.readOnly;
    this.$discussion.readOnly = this.readOnly;
    this.$actions.readOnly = this.readOnly;
    this.$attachments.readOnly = this.readOnly;

    /*
    if( this.value === null ) {
      this.$date.value = null;   
      this.$time.value = null;   
      this.$tabs.selectedIndex = 0;
    } else {
      this.$date.value = this.value.startAt === null ? null : new Date( this.value.startAt );

      if( this.value.startAt === null ) {
        this.$time.value = null;
      } else {
        const formatted = new Intl.DateTimeFormat( navigator.language, {
          hour: 'numeric',
          hour12: false,
          minute: '2-digit'
        } ).format( this.value.startAt );    
        this.$time.value = formatted;
      }

      if( this.value.startAt === null ) {
        this.$tabs.selectedIndex = 0;        
      } else {
        this.$tabs.selectedIndex = this.value.startAt > Date.now() ? 0 : 2;
      }
    }
    */
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
    let start = null;

    if( this.$date.value !== null ) {
      start = new Date( this.$date.value.getTime() );

      if( this.$time.value !== null ) {
        start = new Date( start.toDateString() + ' ' + this.$time.value );
      }
    }

    return {
      createdAt: this._created,
      updatedAt: this._updated,
      subject: this.$subject.value,
      startAt: start === null ? null : start.getTime(),
      organizer: this.$organizer.selectedItem === null ? null : this.$organizer.selectedItem.id,
      type: this.$type.selectedItem === null ? null : this.$type.selectedItem.id,
      location: this.$location.selectedItem === null ? null : this.$location.selectedItem.id,
      agenda: this.$agenda.value,
      attendees: this.$attendees.value,
      discussion: this.$discussion.value,            
      actions: this.$actions.value,
      attachments: this.$attachments.value
    };
  }

  set value( data ) {
    if( data === null ) {
      this._created = null;
      this._updated = null;
      this.$subject.value = null;
      this.$subject.error = null;
      this.$subject.invalid = false;
      this.$date.value = null;
      this.$date.error = null;
      this.$date.invalid = false;
      this.$time.value = null;
      this.$organizer.selectedItem = null;
      this.$type.selectedItem = null;
      this.$location.selectedItem = null;
      this.$agenda.value = null;
      this.$attendees.value = null;
      this.$discussion.value = null;
      this.$actions.value = null;
      this.$attachments.value = null;
    } else {
      this._created = data.createdAt;
      this._updated = data.updatedAt;
      this.$subject.value = data.subject;
      this.$date.value = data.startAt === null ? null : new Date( data.startAt );
      this.$date.error = null;
      this.$date.invalid = false;
      this.$time.value = data.startAt === null ? null : this.formatTime( new Date( data.startAt ) );
      this.$organizer.selectedItem = data.organizer === null ? null : {id: data.organizer};
      this.$type.selectedItem = data.type === null ? null : {id: data.type};
      this.$location.selectedItem = data.location === null ? null : {id: data.location};
      this.$agenda.value = data.agenda;
      this.$attendees.value = data.attendees;
      this.$discussion.value = data.discussion;
      this.$actions.value = data.actions;
      this.$attachments.value = data.attachments;
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

window.customElements.define( 'arm-meeting', RemoteMeeting );
