import AvocadoHBox from "../../../containers/hbox.js";
import AvocadoVBox from "../../../containers/vbox.js";

import AvocadoAvatar from "../../../controls/avatar.js";
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

import RemoteMeetingItemRenderer from "../meeting/meeting-item-renderer.js";

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";

import { db } from "../../db.js";

export default class RemoteConversation extends HTMLElement {
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
          placeholder="Search conversations"
          size="lg"
          type="search">
          <adc-icon name="search" slot="prefix"></adc-icon>
        </adc-input>
        <adc-table selectable sortable>
          <adc-column
            header-text="Conversations"
            item-renderer="arm-meeting-item-renderer"
            sortable>
          </adc-column>
          <adc-vbox slot="empty">
            <adc-label>No conversations added yet.</adc-label>
          </adc-vbox>
        </adc-table>
      </adc-vbox>
      <adc-vbox>
        <adc-hbox>
          <adc-avatar shorten>
            <adc-icon name="person" filled slot="icon"></adc-icon>
          </adc-avatar>
          <adc-select
            id="organizer"
            label="Organizer"
            label-field="fullName"
            placeholder="Organizer"
            style="flex-basis: 0; flex-grow: 4;">
          </adc-select>
          <adc-date-picker
            label="Date"
            placeholder="Date"
            style="width: 182px;">
          </adc-date-picker>
          <adc-input
            id="time"
            label="Time"
            placeholder="Time"
            style="min-width: 182px;">
          </adc-input>
        </adc-hbox>
        <adc-hbox>
          <adc-avatar shorten>
            <adc-icon name="person" filled slot="icon"></adc-icon>
          </adc-avatar>
          <adc-select
            id="participant"
            label="Participant"
            label-field="fullName"
            placeholder="Participant"
            style="flex-basis: 0; flex-grow: 4;">
          </adc-select>
          <adc-select
            id="room"
            label="Room"
            label-field="name"
            placeholder="Room"
            style="width: 380px;">
          </adc-select>
        </adc-hbox>
        <adc-tabs>
          <adc-notes
            description="Is your work/life balance compatible with your mental health?"
            label="Wellness"
            light
            monospace>
          </adc-notes>
          <adc-notes
            description="Do you have what you need to meet your goals?"
            label="Readiness"
            light
            monospace>
          </adc-notes>
          <adc-notes
            description="What is standing in your way?"
            label="Obstacles"
            light
            monospace>
          </adc-notes>
          <adc-notes
            description="Since we last met, what did you accomplish that you feel good about?"
            label="Recognition"
            light
            monospace>
          </adc-notes>
          <adc-notes
            description="How am I doing as your manager?"
            label="Feedback"
            light
            monospace>
          </adc-notes>
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
    this.$avatars = this.shadowRoot.querySelectorAll( 'adc-avatar' );
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
    this.$organizer = this.shadowRoot.querySelector( '#organizer' );
    this.$organizer.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;
    this.$organizer.addEventListener( 'change', ( evt ) => {
      this.$avatars[0].label = evt.detail.selectedItem.fullName;
      this.$avatars[0].value = evt.detail.selectedItem.avatar;      
    } );
    this.$participant = this.shadowRoot.querySelector( '#participant' );
    this.$participant.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;
    this.$participant.addEventListener( 'change', ( evt ) => {
      this.$avatars[1].label = evt.detail.selectedItem.fullName;
      this.$avatars[1].value = evt.detail.selectedItem.avatar;      
    } );
    this.$location = this.shadowRoot.querySelector( '#room' );
    this.$location.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;
    this.$time = this.shadowRoot.querySelector( '#time' );
    this.$wellness = this.shadowRoot.querySelector( 'adc-notes:nth-of-type( 1 )' );
    this.$readiness = this.shadowRoot.querySelector( 'adc-notes:nth-of-type( 2 )' );
    this.$obstacles = this.shadowRoot.querySelector( 'adc-notes:nth-of-type( 3 )' );
    this.$recognition = this.shadowRoot.querySelector( 'adc-notes:nth-of-type( 4 )' );
    this.$feedback = this.shadowRoot.querySelector( 'adc-notes:nth-of-type( 5 )' );
    this.$search = this.shadowRoot.querySelector( '#search' );
    this.$search.addEventListener( 'input', ( evt ) => this.doSearchInput( evt ) );
    this.$search.addEventListener( 'clear', ( evt ) => this.doSearchClear( evt ) );     
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) );
    this.$table.selectedItemsCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;        

    this.doConversationLoad();
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
    window.localStorage.removeItem( 'remote_conversation_id' );

    this.$table.selectedItems = null;
    this.value = null;
    this.readOnly = false;
    this.$organizer.focus();
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;
  }

  doControlsCancel() {
    const id = window.localStorage.getItem( 'remote_conversation_id' );

    this.readOnly = true;

    if( id === null ) {
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;
    } else {
      db.Conversation.where( {id: id} ).first()
      .then( ( item ) => {
        this.value = item;
        this.$controls.mode = AvocadoControls.ADD_EDIT;
      } );
    }
  }

  doControlsDelete() {
    const response = confirm( `Delete conversation?` );

    if( response ) {
      const id = window.localStorage.getItem( 'remote_conversation_id' );

      window.localStorage.removeItem( 'remote_conversation_index' );

      db.Conversation.delete( id )
      .then( () => db.Conversation.orderBy( 'startAt' ).toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Conversations (${results.length})`;
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
    this.$organizer.focus();
    this.$controls.mode = AvocadoControls.DELETE_CANCEL_SAVE;
  }

  doControlsSave() {
    if( this.$organizer.selectedItem === null ) {
      this.$organizer.error = 'Organizer is a required field.';
      this.$organizer.invalid = true;
      return;
    } else {
      this.$organizer.error = null;
      this.$organizer.invalid = false;
    }

    if( this.$date.value === null ) {
      this.$date.error = 'Date is a required field.';
      this.$date.invalid = true;
      return;
    } else {
      this.$date.error = null;
      this.$date.invalid = false;
    }

    if( this.$participant.selectedItem === null ) {
      this.$participant.error = 'Participant is a required field.';
      this.$participant.invalid = true;
      return;
    } else {
      this.$participant.error = null;
      this.$participant.invalid = false;
    }

    const record = Object.assign( {}, this.value );

    let space = this.$participant.selectedItem.fullName.indexOf( ' ' );
    const participant = this.$participant.selectedItem.fullName.substring( 0, space );

    space = this.$organizer.selectedItem.fullName.indexOf( ' ' );
    const organizer = this.$organizer.selectedItem.fullName.substring( 0, space );

    record.subject = participant + '/' + organizer;

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = window.localStorage.getItem( 'remote_conversation_id' );
      record.createdAt = this._created;
      record.updatedAt = this._updated = Date.now();

      db.Conversation.put( record )
      .then( () => db.Conversation.orderBy( 'startAt' ).toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Conversations (${results.length})`;
        this.$table.provider = results;
        this.$table.selectedItems = [{id: record.id}];
      } );
    } else {
      const at = Date.now();
      const id = uuidv4();

      window.localStorage.setItem( 'remote_conversation_id', id );

      record.id = id;
      record.createdAt = this._created = at;
      record.updatedAt = this._updated = at;

      db.Conversation.put( record )
      .then( () => db.Conversation.orderBy( 'startAt' ).toArray() )
      .then( ( results ) => {
        this.$column.hederText = `Conversations (${results.length})`;
        this.$table.provider = results;
        this.$table.selectedItems = [{id: record.id}];
      } );
    }

    this.readOnly = true;
    this.$controls.mode = AvocadoControls.ADD_EDIT;
  }

  doConversationLoad() {
    this.readOnly = true;

    db.Person.orderBy( 'fullName' ).toArray()
    .then( ( people ) => {
      this.$organizer.provider = people;
      this.$participant.provider = people;
      return db.Room.orderBy( 'name' ).toArray();
    } )
    .then( ( rooms ) => {
      this.$location.provider = rooms;
      return db.Conversation.orderBy( 'startAt' ).toArray();
    } )
    .then( ( conversations ) => {
      this.$column.headerText = `Conversations (${conversations.length})`;
      this.$table.provider = conversations;

      const id = window.localStorage.getItem( 'remote_conversation_id' );

      if( id === null ) {
        this.value = null;
        this.$controls.mode = AvocadoControls.ADD_ONLY;
      } else {
        this.$table.selectedItems = [{id: id}];
        db.Conversation.where( {id: id} ).first()
        .then( ( item ) => {
          this.value = item;
          this.$controls.mode = item === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;
        } );
      }
    } );
  }

  doSearchClear() {
    db.Conversation.orderBy( 'startAt' ).toArray()
    .then( ( results ) => {
      this.$column.headerText = `Conversations (${results.length})`;
      this.$table.provider = results;

      const id = window.localStorage.getItem( 'remote_conversation_id' );

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
    window.localStorage.removeItem( 'remote_conversation_id' );

    db.Conversation.orderBy( 'startAt' ).toArray()
    .then( ( results ) => {
      if( this.$search.value === null ) {
        this.doSearchClear();
        return;
      }

      if( results !== null ) {
        this.$table.provider = results.filter( ( value ) => {
          const term = this.$search.value.toLowerCase();

          let wellness = false;
          let readiness = false;
          let obstacles = false;
          let recognition = false;
          let feedback = false;

          if( value.wellness !== null )
            if( value.wellness.toLowerCase().indexOf( term ) >= 0 )
              wellness = true;

          if( value.readiness !== null )
            if( value.radiness.toLowerCase().indexOf( term ) >= 0 )
              readiness = true;

          if( value.obstacles !== null )
            if( value.obstacles.toLowerCase().indexOf( term ) >= 0 )
              obstacles = true;

          if( value.recognition !== null )
            if( value.recognition.toLowerCase().indexOf( term ) >= 0 )
              recognition = true;

          if( value.feedback !== null )
            if( value.feedback.toLowerCase().indexOf( term ) >= 0 )
              feedback = true;

          if( wellness || readiness || obstacles || recognition || feedback )
            return true;

          return false;
        } );
      }

      this.$column.headerText = `Conversations (${this.$table.provider === null ? 0 : this.$table.provider.length})`;
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
      window.localStorage.removeItem( 'remote_conversation_id' );
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;
    } else {
      window.localStorage.setItem( 'remote_conversation_id', evt.detail.selectedItem.id );
      db.Conversation.where( {id: evt.detail.selectedItem.id} ).first()
      .then( ( item ) => {
        this.value = item;
        console.log( item );
      } );
      this.$controls.mode = AvocadoControls.ADD_EDIT;
    }
  }

   // When attributes change
  _render() {
    this.$avatars[0].readOnly = this.readOnly;
    this.$avatars[1].readOnly = this.readOnly;
    this.$organizer.readOnly = this.readOnly;
    this.$date.readOnly = this.readOnly;
    this.$time.readOnly = this.readOnly;
    this.$participant.readOnly = this.readOnly;
    this.$location.readOnly = this.readOnly;
    this.$wellness.readOnly = this.readOnly;
    this.$readiness.readOnly = this.readOnly;
    this.$obstacles.readOnly = this.readOnly;
    this.$recognition.readOnly = this.readOnly;
    this.$feedback.readOnly = this.readOnly;
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
    this._upgrade( 'read-only' );
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
      organizer: this.$organizer.selectedItem === null ? null : this.$organizer.selectedItem.id,
      startAt: start === null ? null : start.getTime(),
      participant: this.$participant.selectedItem === null ? null : this.$participant.selectedItem.id,
      location: this.$location.selectedItem === null ? null : this.$location.selectedItem.id,
      wellness: this.$wellness.value,
      readiness: this.$readiness.value,
      obstacles: this.$obstacles.value,
      recognition: this.$recognition.value,
      feedback: this.$feedback.value
    };
  }

  set value( data ) {
    if( data === null ) {
      this._created = null;
      this._updated = null;
      this.$avatars[0].value = null;
      this.$avatars[0].label = null;
      this.$organizer.selectedItem = null;
      this.$organizer.error = null;
      this.$organizer.invalid = false;
      this.$date.value = null;
      this.$date.error = null;
      this.$date.invalid = false;
      this.$time.value = null;
      this.$avatars[1].value = null;
      this.$avatars[1].label = null;
      this.$participant.selectedItem = null;
      this.$participant.error = null;
      this.$participant.invalid = false;
      this.$location.selectedItem = null;
      this.$wellness.value = null;
      this.$readiness.value = null;
      this.$obstacles.value = null;
      this.$recognition.value = null;
      this.$feedback.value = null;
    } else {
      db.Person.where( {id: data.organizer} ).first()
      .then( ( person ) => {
        this.$avatars[0].value = person.avatar;
        this.$avatars[0].label = person.fullName;
      } );

      db.Person.where( {id: data.participant} ).first()
      .then( ( person ) => {
        this.$avatars[1].value = person.avatar;
        this.$avatars[1].label = person.fullName;
      } );      

      this._created = data.createdAt;
      this._updated = data.updatedAt;
      this.$organizer.selectedItem = data.organizer === null ? null : {id: data.organizer};
      this.$organizer.error = null;
      this.$organizer.invalid = false;
      this.$date.value = data.startAt === null ? null : new Date( data.startAt );
      this.$date.error = null;
      this.$date.invalid = false;
      this.$time.value = data.startAt === null ? null : this.formatTime( new Date( data.startAt ) );
      this.$participant.selectedItem = data.participant === null ? null : {id: data.participant};
      this.$participant.error = null;
      this.$participant.invalid = false;
      this.$location.selectedItem = data.location === null ? null : {id: data.location};
      this.$wellness.value = data.wellness;
      this.$readiness.value = data.readiness;
      this.$obstacles.value = data.obstacles;
      this.$recognition.value = data.recognition;
      this.$feedback.value = data.feedback;
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

window.customElements.define( 'arm-conversation', RemoteConversation );
