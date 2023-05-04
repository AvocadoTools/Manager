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

import AvocadoControls from "../../../comp/controls.js";
import AvocadoNotes from "../../../comp/notes.js";

import RemoteMeetingActions from "./action-items.js";
import RemoteMeetingAttendees from "./attendees.js";
import RemoteMeetingItemRenderer from "./meeting-item-renderer.js";

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";

import { db } from "../../db.js";
import { store } from "../../store.js";

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
            style="min-width: 182px;">
          </adc-date-picker>
          <adc-input
            label="Time"
            name="time"
            placeholder="Time"
            style="max-width: 182px;">
          </adc-input>          
        </adc-hbox>
        <adc-hbox>
          <adc-select
            label="Organizer"
            label-field="fullName"
            name="organizer"
            placeholder="Organizer"
            style="flex-basis: 0; flex-grow: 2;">
          </adc-select>                                        
          <adc-select
            label="Type"
            label-field="name"
            name="type"
            placeholder="Type"
            style="flex-basis: 0; flex-grow: 1; min-width: 200px;">
          </adc-select>                              
          <adc-select
            label="Room"
            label-field="name"
            name="location"
            placeholder="Room"
            style="width: 380px;">
          </adc-select>                                        
        </adc-hbox>
        <adc-tabs>
          <adc-notes label="Agenda" light monospace></adc-notes>
          <arm-meeting-attendees disabled label="Attendees (0)"></arm-meeting-attendees>
          <adc-notes label="Discussion" light monospace></adc-notes>
          <arm-meeting-actions disabled label="Action Items (0)"></arm-meeting-actions>
          <!-- <arm-attachments disabled label="Attachments (0)"></arm-attachments> -->
        </adc-tabs>
        <adc-controls></adc-controls>
      </adc-vbox>
    `;

    // Private
    this._changed = false;
    this._data = null;
    this._scheduled = null;
    this._value = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$actions = this.shadowRoot.querySelector( 'arm-meeting-actions' );
    this.$agenda = this.shadowRoot.querySelector( 'adc-tabs adc-notes:nth-of-type( 1 )' );
    // this.$attachments = this.shadowRoot.querySelector( 'arm-attachments' );
    this.$attendees = this.shadowRoot.querySelector( 'arm-meeting-attendees' );
    this.$column = this.shadowRoot.querySelector( 'adc-column' );
    this.$column.sortCompareFunction = ( a, b ) => {
      if( a.startAt > b.startAt ) return 1;
      if( a.startAt < b.startAt ) return -1;
      return 0;
    };
    this.$controls = this.shadowRoot.querySelector( 'adc-controls' );
    this.$controls.addEventListener( 'add', () => this.doMeetingAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doMeetingCancel() );
    this.$controls.addEventListener( 'delete', () => this.doMeetingDelete() );
    this.$controls.addEventListener( 'edit', () => this.doMeetingEdit() );
    this.$controls.addEventListener( 'save', () => this.doMeetingSave() );    
    this.$date = this.shadowRoot.querySelector( 'adc-date-picker' );
    this.$discussion = this.shadowRoot.querySelector( 'adc-tabs adc-notes:nth-of-type( 2 )' );
    this.$location = this.shadowRoot.querySelector( 'adc-select[name=location]' );
    this.$location.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;    
    this.$organizer = this.shadowRoot.querySelector( 'adc-select[name=organizer]' );    
    this.$organizer.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;    
    this.$subject = this.shadowRoot.querySelector( 'adc-input[name=subject]' );
    this.$tabs = this.shadowRoot.querySelector( 'adc-tabs' );
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) );
    this.$type = this.shadowRoot.querySelector( 'adc-select[name=type]' );
    this.$type.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;
    this.$time = this.shadowRoot.querySelector( 'adc-input[name=time]' );

    // State
    const meeting_index = window.localStorage.getItem( 'meeting_index' ) === null ? null : parseInt( window.localStorage.getItem( 'meeting_index' ) );    

    // Read
    db.Meeting.orderBy( 'startAt' ).reverse().toArray()
    .then( ( results ) => {
      this.$column.headerText = `Meetings (${results.length})`;      
      this.$table.provider = results;  
      this.$table.selectedIndex = meeting_index === null ? null : meeting_index;            
      
      this.readOnly = true;
      this.value = meeting_index === null ? null : results[meeting_index];      
      this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;      

      store.meeting.set( results );
    } );    

    store.person.subscribe( ( data ) => this.$organizer.provider = data );    
    store.room.subscribe( ( data ) => this.$location.provider = data );
    store.type.subscribe( ( data ) => this.$type.provider = data );
  }

  clear() {
    this.$subject.error = null;
    this.$subject.invalid = false;
    this.$subject.value = null;
    this.$date.error = null;
    this.$date.invalid = false;
    this.$date.value = null;    
    this.$time.value = null;
    this.$organizer.value = null;
    this.$type.value = null;
    this.$location.value = null;
    this.$agenda.value = null;    
    this.$discussion.value = null;
  }

  doMeetingAdd() {
    this.$table.selectedIndex = null;
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;
    this.value = null;
    this.clear();
    this._changed = false;
    this.readOnly = false;
    this.$subject.focus();
  }  

  doMeetingCancel() {
    if( this._changed ) {
      const response = confirm( 'Do you want to save changes?' );
      
      if( response ) {
        this.doMeetingSave();
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

  doMeetingDelete() {
    const id = this._value.id;    
    const response = confirm( `Delete ${this._value.subject}?` );

    if( response ) {
      this.clear();
      this.value = null;
      this.$table.selectedIndex = null;
      window.localStorage.removeItem( 'meeting_index' );      
      this._changed = false;
      this.readOnly = true;
      this.$controls.mode = AvocadoControls.ADD_ONLY;

      db.Meeting.delete( id )
      .then( () => db.Meeting.orderBy( 'startAt' ).reverse().toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Meetings (${results.length})`;      
        this.$table.provider = results;        
        store.meeting.set( results );
      } );     
    }
  }  

  doMeetingEdit() {
    this._changed = false;
    this.readOnly = false;
    this.$controls.mode = this._value === null ? AvocadoControls.ADD_EDIT : AvocadoControls.DELETE_CANCEL_SAVE;
    this.$subject.focus();
  }  

  doMeetingSave() {
    if( this.$subject.value === null ) {
      this.$subject.error = 'Meeting subject is a required field.';
      this.$subject.invalid = true;
      this.$subject.focus();
      return;
    } else {
      this.$subject.error = null;
      this.$subject.invalid = false;
    }

    if( this.$date.value === null ) {
      this.$date.error = 'Meeting date is a required field.';
      this.$date.invalid = true;
      return;
    } else {
      this.$date.error = null;
      this.$date.invalid = false;
    }    

    const time = this.$time.value === null ? '' : ' '  + this.$time.value;
    const start = new Date( this.$date.value.toDateString() + time );

    const record = {
      subject: this.$subject.value,
      startAt: start.getTime(),  
      organizer: this.$organizer.value === null ? null : this.$organizer.value.id,
      type: this.$type.value === null ? null : this.$type.value.id,
      location: this.$location.value === null ? null : this.$location.value.id,
      actions: null,
      agenda: this.$agenda.value,
      attachments: null,
      attendees: null,
      discussion: this.$discussion.value
    };  

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = this.value.id;
      record.createdAt = this.value.createdAt;
      record.updatedAt = Date.now();
      this.value = record;                

      db.Meeting.put( record )
      .then( () => db.Meeting.orderBy( 'startAt' ).reverse().toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Meetings (${results.length})`;      
        this.$table.provider = results;

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'meeting_index', r );
            break;
          }
        }

        store.meeting.set( results );
      } );      
    } else {
      const at = Date.now();

      record.id = uuidv4();
      record.createdAt = at;
      record.updatedAt = at;
      this.value = record;

      db.Meeting.put( record )
      .then( () => db.Meeting.orderBy( 'startAt' ).reverse().toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Meetings (${results.length})`;              
        this.$table.provider = results;    
        
        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'meeting_index', r );
            break;
          }
        }        

        store.meeting.set( results );
      } );                  
    }

    this._changed = false;
    this.readOnly = true;
    this.$controls.mode = AvocadoControls.ADD_EDIT;
  }

  doTableChange( evt ) {
    if( this._changed || !this.readOnly ) {
      const response = confirm( 'Do you want to save changes?' );
    
      if( response ) {
        this.doMeetingSave();
      }
    }

    this.readOnly = true;
    this.value = evt.detail.selectedItem === null ? null : evt.detail.selectedItem;      
    this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;

    if( evt.detail.selectedItem === null ) {
      this.$tabs.selectedIndex = 0;
      window.localStorage.removeItem( 'meeting_index' );
    } else {
      window.localStorage.setItem( 'meeting_index', evt.detail.selectedIndex );      
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
    // this.$attachments.readOnly = this.readOnly;

    if( this.value === null ) {
      this.$date.value = null;   
      this.$time.value = null;   
      this.$tabs.selectedIndex = 0;
    } else {
      this.$date.value = this.value.startAt === null ? null : this.value.startAt;

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

    this.$subject.value = this._value === null ? null : this._value.subject;
    this.$organizer.selectedItem = this._value === null ? null : {id: this._value.organizer};
    this.$type.selectedItem = this._value === null ? null : {id: this._value.type};    
    this.$location.selectedItem = this._value === null ? null : {id: this._value.location};        
    this.$agenda.value = this._value === null ? null : this._value.agenda;
    this.$discussion.value = this._value === null ? null : this._value.discussion;
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

window.customElements.define( 'arm-meeting', RemoteMeeting );
