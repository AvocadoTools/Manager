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

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";

import { db } from "../../db.js";
import { store } from "../../store.js";

export default class RemoteOneOnOne extends HTMLElement {
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
    this._changed = false;
    this._data = null;
    this._value = null;

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
    this.$controls.addEventListener( 'add', () => this.doAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doCancel() );
    this.$controls.addEventListener( 'delete', () => this.doDelete() );
    this.$controls.addEventListener( 'edit', () => this.doEdit() );
    this.$controls.addEventListener( 'save', () => this.doSave() );    
    this.$date = this.shadowRoot.querySelector( 'adc-date-picker' );
    this.$organizer = this.shadowRoot.querySelector( '#organizer' );
    this.$organizer.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;    
    this.$organizer.addEventListener( 'change', ( evt ) => {
      const avatar = this.avatar( evt.detail.selectedItem.id );
      this.$avatars[0].label = avatar.label;      
      this.$avatars[0].src = avatar.src;
    } );
    this.$participant = this.shadowRoot.querySelector( '#participant' );
    this.$participant.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;        
    this.$participant.addEventListener( 'change', ( evt ) => {
      const avatar = this.avatar( evt.detail.selectedItem.id );
      this.$avatars[1].label = avatar.label;      
      this.$avatars[1].src = avatar.src;
    } );    
    this.$room = this.shadowRoot.querySelector( '#room' );
    this.$room.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;        
    this.$time = this.shadowRoot.querySelector( '#time' );
    this.$wellness = this.shadowRoot.querySelector( 'adc-notes:nth-of-type( 1 )' );
    this.$readiness = this.shadowRoot.querySelector( 'adc-notes:nth-of-type( 2 )' );    
    this.$obstacles = this.shadowRoot.querySelector( 'adc-notes:nth-of-type( 3 )' );    
    this.$recognition = this.shadowRoot.querySelector( 'adc-notes:nth-of-type( 4 )' );    
    this.$feedback = this.shadowRoot.querySelector( 'adc-notes:nth-of-type( 5 )' );   
    this.$table = this.shadowRoot.querySelector( 'adc-table' ); 
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) );        

    // State
    const index = window.localStorage.getItem( 'remote_conversation_index' ) === null ? null : parseInt( window.localStorage.getItem( 'remote_conversation_index' ) );

    store.person.subscribe( ( data ) => {
      this.$organizer.provider = data      
      this.$participant.provider = data
    } );    
    store.room.subscribe( ( data ) => this.$room.provider = data );    

    // Read
    db.Conversation.orderBy( 'startAt' ).reverse().toArray()
    .then( ( results ) => {
      this.$column.headerText = `Conversations (${results.length})`;      
      this.$table.provider = results;      
      this.$table.selectedIndex = index === null ? null : index;      

      this.readOnly = true;
      this.value = index === null ? null : results[index];      
      this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;      
      
      store.conversation.set( results );
    } );
  }

  avatar( id ) {
    const matches = store.person.value.filter( ( item ) => item.id === id ? true : false );  
    return {
      src: matches[0].avatar,
      label: matches[0].avatar === null ? matches[0].fullName : null
    };
  }

  clear() {
    this.$avatars[0].clear();
    this.$avatars[1].clear();    
    this.$organizer.value = null;
    this.$date.value = null;
    this.$time.value = null;
    this.$participant.value = null;
    this.$room.value = null;
    this.$wellness.value = null;
    this.$readiness.value = null;
    this.$obstacles.value = null;
    this.$recognition.value = null;
    this.$feedback.value = null;
  }  

  doAdd() {
    this.$table.selectedIndex = null;
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;
    this.value = null;
    this.clear();
    this._changed = false;
    this.readOnly = false;
    this.$organizer.focus();
  }

  doCancel() {
    if( this._changed ) {
      const response = confirm( 'Do you want to save changes?' );
      
      if( response ) {
        this.doSave();
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

  doDelete() {
    const id = this._value.id;    
    const response = confirm( `Delete this conversation?` );

    if( response ) {
      this.clear();
      this.value = null;
      this.$table.selectedIndex = null;
      window.localStorage.removeItem( 'remote_conversation_index' );
      this._changed = false;
      this.readOnly = true;
      this.$controls.mode = AvocadoControls.ADD_ONLY;

      db.Conversation.delete( id )
      .then( () => db.Conversation.orderBy( 'startAt' ).reverse().toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Conversations (${results.length})`;      
        this.$table.provider = results;        
        store.conversation.set( results );
      } );          
    }
  }
  
  doEdit() {
    this._changed = false;
    this.readOnly = false;
    this.$controls.mode = this._value === null ? AvocadoControls.ADD_EDIT : AvocadoControls.DELETE_CANCEL_SAVE;
    this.$organizer.focus();
  }

  doSave() {
    if( this.$organizer.value === null ) {
      this.$organizer.error = 'Conversation must have an organizer.';
      this.$organizer.invalid = true;
      return;
    } else {
      this.$organizer.error = null;
      this.$organizer.invalid = false;
    }

    if( this.$participant.value === null ) {
      this.$participant.error = 'Conversation must have an participant.';
      this.$participant.invalid = true;
      return;
    } else {
      this.$participant.error = null;
      this.$participant.invalid = false;
    }    

    if( this.$date.value === null ) {
      this.$date.error = 'Conversation date is a required field.';
      this.$date.invalid = true;
      return;
    } else {
      this.$date.error = null;
      this.$date.invalid = false;
    }        

    const time = this.$time.value === null ? '' : ' '  + this.$time.value;
    const start = new Date( this.$date.value.toDateString() + time );

    let space = this.$participant.selectedItem.fullName.indexOf( ' ' );
    const participant = this.$participant.selectedItem.fullName.substring( 0, space );

    space = this.$organizer.selectedItem.fullName.indexOf( ' ' );
    const organizer = this.$organizer.selectedItem.fullName.substring( 0, space );

    const record = {
      subject: participant + '/' + organizer,
      organizer: this.$organizer.value.id,
      participant: this.$participant.value.id,
      startAt: start.getTime(),
      room: this.$room.value === null ? null : this.$room.value.id,
      wellness: this.$wellness.value,
      readiness: this.$readiness.value,
      obstacles: this.$obstacles.value,
      recognition: this.$recognition.value,
      feedback: this.$feedback.value
    };  

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = this.value.id;
      record.createdAt = this.value.createdAt;
      record.updatedAt = Date.now();
      this.value = record;                

      db.Conversation.put( record )
      .then( () => db.Conversation.orderBy( 'startAt' ).reverse().toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Conversations (${results.length})`;      
        this.$table.provider = results;

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'remote_conversation_index', r );
            break;
          }
        }

        store.conversation.set( results );
      } );
    } else {
      const at = Date.now();

      record.id = uuidv4();
      record.createdAt = at;
      record.updatedAt = at;
      this.value = record;

      db.Conversation.put( record )
      .then( () => db.Conversation.orderBy( 'startAt' ).reverse().toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Conversations (${results.length})`;              
        this.$table.provider = results;     

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'remote_conversation_index', r );
            break;
          }
        }

        store.conversation.set( results );
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
        this.doSave();
      }
    }

    this.readOnly = true;
    this.value = evt.detail.selectedItem === null ? null : evt.detail.selectedItem;      
    this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;

    if( evt.detail.selectedItem === null ) {
      window.localStorage.removeItem( 'remote_conversation_index' );
    } else {
      window.localStorage.setItem( 'remote_conversation_index', evt.detail.selectedIndex );      
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
    this.$room.readOnly = this.readOnly;    
    this.$wellness.readOnly = this.readOnly;
    this.$readiness.readOnly = this.readOnly;
    this.$obstacles.readOnly = this.readOnly;
    this.$recognition.readOnly = this.readOnly;
    this.$feedback.readOnly = this.readOnly;

    if( this.value === null ) {
      this.$avatars[0].src = null;
      this.$avatars[0].label = null;

      this.$avatars[1].src = null;
      this.$avatars[1].label = null;      

      this.$date.value = null;   
      this.$time.value = null;   
    } else {
      let avatar = this.avatar( this.value.organizer );
      this.$avatars[0].label = avatar.label;
      this.$avatars[0].src = avatar.src;

      avatar = this.avatar( this.value.participant );
      this.$avatars[1].label = avatar.label;
      this.$avatars[1].src = avatar.src;            

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
    }    

    this.$organizer.selectedItem = this._value === null ? null : {id: this._value.organizer};        
    this.$participant.selectedItem = this._value === null ? null : {id: this._value.participant};            
    this.$room.selectedItem = this._value === null ? null : {id: this._value.room};        
    this.$wellness.value = this._value === null ? null : this._value.wellness;
    this.$readiness.value = this._value === null ? null : this._value.readiness;
    this.$obstacles.value = this._value === null ? null : this._value.obstacles;
    this.$recognition.value = this._value === null ? null : this._value.recognition;
    this.$feedback.value = this._value === null ? null : this._value.feedback;
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

window.customElements.define( 'arm-one-on-one', RemoteOneOnOne );
